CREATE DEFINER=`root`@`localhost` PROCEDURE `contact-os`.`sp_reports`(
	IN reportName VARCHAR(15),
	IN startDate VARCHAR(10),
	IN endDate VARCHAR(10)
)
BEGIN
	-- VARIABLE DECLARES
	DECLARE eDate VARCHAR(10) DEFAULT CURDATE();
	DECLARE sDate VARCHAR(10) DEFAULT CURDATE();
	DECLARE c_h_finished INT DEFAULT FALSE;
	DECLARE c_v_act_date DATE;
	DECLARE c_v_act_json JSON;
	DECLARE c_v_act_json_row JSON;
	DECLARE json_len INT DEFAULT 0;

	-- CURSOR DECLARES
	DECLARE c_anon_users CURSOR FOR
		SELECT DISTINCT
			DATE_FORMAT(rou.id , "%Y-%m-%d") as 'date',
			JSON_EXTRACT(rou.userlist, '$.rtc_online_users.anon_users') as 'anon_users'
		FROM rtc_online_users rou
		WHERE rou.id BETWEEN sDate AND eDate
		AND JSON_EXTRACT(rou.userlist, '$.rtc_online_users.anon_users') IS NOT NULL
		AND JSON_EXTRACT(rou.userlist, '$.rtc_online_users.anon_users') NOT LIKE '%[]%';
	
	DECLARE c_reg_users CURSOR FOR
		SELECT DISTINCT 
			DATE_FORMAT(rou.id , "%Y-%m-%d") as 'date',
			JSON_EXTRACT(rou.userlist, '$.rtc_online_users.reg_users') as 'reg_users'
		FROM rtc_online_users rou
		WHERE rou.id BETWEEN sDate AND eDate
		AND JSON_EXTRACT(rou.userlist, '$.rtc_online_users.reg_users') IS NOT NULL
		AND JSON_EXTRACT(rou.userlist, '$.rtc_online_users.reg_users') NOT LIKE '%[]%';
	
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET c_h_finished = TRUE;

	-- CREATE TEMP TABLES
	DROP TEMPORARY TABLE IF EXISTS atnXFun;
	CREATE TEMPORARY TABLE atnXFun(
		atnDate DATE NOT NULL,
		funId INT NOT NULL,
		funName VARCHAR(300) NOT NULL,
		funEmail VARCHAR(255) NOT NULL,
		funIP VARCHAR(15) NOT NULL,
		atnQty INTEGER DEFAULT 0
	);

	DROP TEMPORARY TABLE IF EXISTS atnXChat;
	CREATE TEMPORARY TABLE atnXChat(
		atnDate DATE NOT NULL,
		chtType CHAR(1) NOT NULL,
		funId INT NOT NULL,
		atnQty INTEGER DEFAULT 0
	);

	DROP TEMPORARY TABLE IF EXISTS chatDetail;
	CREATE TEMPORARY TABLE chatDetail(
		chtDate DATE NOT NULL,
		chtType CHAR(1) NOT NULL,
		chtUID INT NOT NULL,
		chtSID VARCHAR(35),
		chtUIP VARCHAR(15)
	);

	DROP TEMPORARY TABLE IF EXISTS chatActvt;
	CREATE TEMPORARY TABLE chatActvt(
		chtDate DATE NOT NULL,
		chtType CHAR(1) NOT NULL,
		chtUID INT NOT NULL,
		chtSID VARCHAR(35),
		chtUIP VARCHAR(15),
		chtEID INT NOT NULL
	);
	
	
	-- REPORT: Atenciones X Funcionarias X Dia
	IF reportName = 'atnxfunxdia' OR reportName = 'atnxfunxmes' THEN
		
		IF startDate IS NOT NULL AND startDate != '' THEN
			SET sDate = startDate;
		END IF;
	
		IF endDate IS NOT NULL AND endDate != '' THEN
			SET eDate = endDate;
		END IF;
	
		INSERT INTO atnXFun(atnDate, funId, funName, funEmail, funIP)
		SELECT DISTINCT 
			DATE_FORMAT(luc.id, "%Y-%m-%d") as 'date',
			u.id,
			u.name,
			u.email,
			''
		FROM
			log_user_connections luc, `user` u,
			user_x_role uxr,
			catalog_user_roles cur 
		WHERE luc.id BETWEEN sDate AND eDate
		AND luc.ip_address != ""
		AND luc.user_id = u.id
		AND u.id = uxr.user_id 
		AND uxr.user_role_id = cur.id
		AND cur.id > 2
		ORDER BY DATE_FORMAT(luc.id, "%Y-%m-%d"), u.id;
	
		INSERT INTO chatDetail(chtDate, chtType, chtUID, chtSID, chtUIP)
		(
			SELECT DISTINCT
				DATE_FORMAT(ca.`date`, "%Y-%m-%d") as 'date',
				'A',
				1,
				ca.sid,
				ca.ip_address
			FROM chats_anonymous ca
			WHERE ca.`date` BETWEEN sDate AND eDate
			ORDER BY DATE_FORMAT(ca.`date`, "%Y-%m-%d"), ca.sid
		)
		UNION ALL
		(
			SELECT DISTINCT
				DATE_FORMAT(cr.`date`, "%Y-%m-%d") as 'date',
				'R',
				cr.user_id,
				cr.sid,
				cr.ip_address
			FROM chats_registered cr
			WHERE cr.`date` BETWEEN sDate AND eDate
			ORDER BY DATE_FORMAT(cr.`date`, "%Y-%m-%d"), cr.sid
		);
	
		-- NAVIGATE ANONYMOUS USER CHAT DETAIL
		OPEN c_anon_users;
	
		getAnonUsersAtn: LOOP
			FETCH c_anon_users INTO c_v_act_date, c_v_act_json;
			
			IF c_h_finished = TRUE THEN 
				LEAVE getAnonUsersAtn;
			END IF;

			WHILE json_len < JSON_LENGTH(c_v_act_json) DO
				SET c_v_act_json_row = JSON_EXTRACT(c_v_act_json, CONCAT('$[',json_len,']'));
				IF
					JSON_EXTRACT(c_v_act_json_row, '$.userInfo.status') LIKE '%Atendido%'
					AND JSON_EXTRACT(c_v_act_json_row, '$.userInfo.assignedTo') IS NOT NULL
					AND JSON_EXTRACT(c_v_act_json_row, '$.userInfo.assignedTo') NOT LIKE '%null%'
				THEN
					INSERT INTO chatActvt(chtDate, chtType, chtUID, chtSID, chtUIP, chtEID)
					SELECT c_v_act_date, 'A', 1, 
						JSON_UNQUOTE(JSON_EXTRACT(c_v_act_json_row, '$.r_id')),
						JSON_UNQUOTE(JSON_EXTRACT(c_v_act_json_row, '$.userInfo.ip')),
						JSON_EXTRACT(c_v_act_json_row, '$.userInfo.assignedTo');
				END IF;
				
				SELECT json_len + 1 INTO json_len;
			END WHILE;
		
			SET json_len = 0;

		END LOOP getAnonUsersAtn;
	
		CLOSE c_anon_users;
	
		SET c_h_finished = FALSE;
		SET json_len = 0;
	
		-- NAVIGATE REGISTERED USER CHAT DETAIL
		OPEN c_reg_users;
	
		getRegUsersAtn: LOOP
			FETCH c_reg_users INTO c_v_act_date, c_v_act_json;
			
			IF c_h_finished = TRUE THEN 
				LEAVE getRegUsersAtn;
			END IF;

			WHILE json_len < JSON_LENGTH(c_v_act_json) DO
				SET c_v_act_json_row = JSON_EXTRACT(c_v_act_json, CONCAT('$[',json_len,']'));
				IF
					JSON_EXTRACT(c_v_act_json_row, '$.userInfo.status') LIKE '%Atendido%'
					AND JSON_EXTRACT(c_v_act_json_row, '$.userInfo.assignedTo') IS NOT NULL
					AND JSON_EXTRACT(c_v_act_json_row, '$.userInfo.assignedTo') NOT LIKE '%null%'
				THEN
					INSERT INTO chatActvt(chtDate, chtType, chtUID, chtSID, chtUIP, chtEID)
					SELECT c_v_act_date, 'R',
						JSON_EXTRACT(c_v_act_json_row, '$.id'), 
						JSON_UNQUOTE(JSON_EXTRACT(c_v_act_json_row, '$.r_id')),
						JSON_UNQUOTE(JSON_EXTRACT(c_v_act_json_row, '$.userInfo.ip')),
						JSON_EXTRACT(c_v_act_json_row, '$.userInfo.assignedTo');
				END IF;
				
				SELECT json_len + 1 INTO json_len;
			END WHILE;
		
			SET json_len = 0;

		END LOOP getRegUsersAtn;
	
		CLOSE c_reg_users;
	
		INSERT INTO atnXChat(atnDate, chtType, funID, atnQty)
		SELECT cd.chtDate, cd.chtType, ca.chtEID, COUNT(DISTINCT ca.chtSID)
		FROM chatActvt ca, chatDetail cd
		WHERE ca.chtType = 'A'
		AND ca.chtType = cd.chtType
		AND ca.chtDate = cd.chtDate
		AND ca.chtSID = cd.chtSID
		GROUP BY cd.chtDate, cd.chtType, ca.chtEID
		ORDER BY cd.chtDate, cd.chtType, ca.chtEID;
	
		INSERT INTO atnXChat(atnDate, chtType, funID, atnQty)
		SELECT cd.chtDate, cd.chtType, ca.chtEID, COUNT(DISTINCT ca.chtUID)
		FROM chatActvt ca, chatDetail cd
		WHERE ca.chtType = 'R'
		AND ca.chtType = cd.chtType
		AND ca.chtDate = cd.chtDate
		AND ca.chtUID = cd.chtUID
		GROUP BY cd.chtDate, cd.chtType, ca.chtEID
		ORDER BY cd.chtDate, cd.chtType, ca.chtEID;
	
		UPDATE atnXFun axf
		SET axf.atnQty = (
			SELECT SUM(axc.atnQty)
			FROM atnXChat axc
			WHERE axc.funID = axf.funID
			AND axc.atnDate = axf.atnDate
			GROUP BY axc.atnDate, axc.funID
		);
		
		UPDATE atnXFun axf
		SET axf.atnQty = 0
		WHERE axf.atnQty IS NULL;
		
		IF reportName = 'atnxfunxdia' THEN
			SELECT *
			FROM atnXFun axf
			ORDER BY axf.atnDate;
		ELSEIF reportName = 'atnxfunxmes' THEN
			SELECT DATE_FORMAT(axf.atnDate, "%Y-%m") as 'axfDate', axf.funID, axf.funName, axf.funEmail, SUM(axf.atnQty)
			FROM atnXFun axf
			GROUP BY DATE_FORMAT(axf.atnDate, "%Y-%m"), axf.funID, axf.funName, axf.funEmail
			ORDER BY DATE_FORMAT(axf.atnDate, "%Y-%m");
		END IF;
	
	END IF;

	-- DROP TEMP TABLES
	DROP TEMPORARY TABLE IF EXISTS chatActvt;
	DROP TEMPORARY TABLE IF EXISTS chatDetail;
	DROP TEMPORARY TABLE IF EXISTS atnXChat;
	DROP TEMPORARY TABLE IF EXISTS atnXFun;

END