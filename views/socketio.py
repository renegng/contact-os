import datetime, json

from . import db, removeItemFromList
from flask import current_app as app
from flask import Blueprint, request, jsonify
from flask_login import current_user
from flask_socketio import SocketIO, join_room, leave_room
from models.models import CatalogOperations, CatalogUserRoles, LogUserConnections, RTCOnlineUsers, User

sio = Blueprint('sio', __name__, template_folder='templates', static_folder='static')

# Instantiate SocketIO
socketio = SocketIO()

@socketio.on('connect')
def _connect():
    app.logger.debug('** SWING_CMS ** - SocketIO User Connected')
    try:
        # Retrieve User
        user = current_user if current_user.is_authenticated else User.query.filter_by(uid='CTOS-Anonim@').first()

        # Retrieve User IP Address
        ip = request.remote_addr

        # Add User to RTC Online Users List
        cur_oul = RTCOnlineUsers.query.with_for_update().order_by(RTCOnlineUsers.id.desc()).first()
        dt_now = datetime.datetime.utcnow()
        rtc_user = {
            'id': user.id,
            'r_id': str(request.sid),
            'userInfo': {
                'activity': int(int(dt_now.strftime('%s%f'))/1000),
                'assignedTo': None,
                'ip': str(ip),
                'name': user.name,
                'photoURL': request.args.get('photoURL'),
                'roles': user.get_user_roles(),
                'status': 'Online'
            }
        }
        
        # Retrieve the user list depending on the user's role and Append User into the list
        new_oul = cur_oul
        if current_user.is_authenticated:
            if current_user.is_user_role(['adm', 'emp']):
                new_oul.userlist.get('rtc_online_users', {}).get('emp_users').append(rtc_user)
            else:
                new_oul.userlist.get('rtc_online_users', {}).get('reg_users').append(rtc_user)
        else:
            new_oul.userlist.get('rtc_online_users', {}).get('anon_users').append(rtc_user)

        new_userlist = new_oul.userlist
        
        oper = CatalogOperations.query.filter_by(name_short='ins').first()
        new_oul.userlist.get('rtc_online_users', {})['id'] = str(dt_now)
        new_rtc_oul = RTCOnlineUsers()
        new_rtc_oul.id = dt_now
        new_rtc_oul.operation_id = oper.id
        new_rtc_oul.userlist = new_userlist
        db.session.add(new_rtc_oul)

        cur_oul.enabled = False
        db.session.add(cur_oul)

        # Log User Connection
        oper = CatalogOperations.query.filter_by(name_short='con').first()
        log_uc = LogUserConnections()
        log_uc.id = dt_now
        log_uc.sid = request.sid
        log_uc.user_id = user.id
        log_uc.operation_id = oper.id
        log_uc.ip_address = ip
        db.session.add(log_uc)

        db.session.commit()

        # Add Employee to Room and Send User List
        if current_user.is_authenticated:
            if current_user.is_user_role(['adm', 'emp']):
                join_room('CTOS-EMPS')
        
        socketio.emit('userIsConnected', { 'status': 'success', 'id': user.id }, room=request.sid)
        socketio.emit('RTCUserList', new_userlist, room='CTOS-EMPS')
    except Exception as e:
        app.logger.error('** SWING_CMS ** - SocketIO User Connected Error: {}'.format(e))
        return jsonify({ 'status': 'error' })


@socketio.on('disconnect')
def _disconnect():
    app.logger.debug('** SWING_CMS ** - SocketIO User Disconnected')
    try:
        # Retrieve User
        user = current_user if current_user.is_authenticated else User.query.filter_by(uid='CTOS-Anonim@').first()

        # Retrieve User IP Address
        ip = request.remote_addr

        # Remove User to RTC Online Users List
        cur_oul = RTCOnlineUsers.query.with_for_update().order_by(RTCOnlineUsers.id.desc()).first()
        dt_now = datetime.datetime.utcnow()
        
        # Retrieve the user list depending on the user's role and Remove User from List
        new_oul = cur_oul
        if current_user.is_authenticated:
            if current_user.is_user_role(['adm', 'emp']):
                removeItemFromList(new_oul.userlist.get('rtc_online_users', {}).get('emp_users'), 'id', user.id)
            else:
                removeItemFromList(new_oul.userlist.get('rtc_online_users', {}).get('reg_users'), 'id', user.id)
        else:
            removeItemFromList(new_oul.userlist.get('rtc_online_users', {}).get('anon_users'), 'r_id', str(request.sid))
        
        new_userlist = new_oul.userlist

        oper = CatalogOperations.query.filter_by(name_short='del').first()
        new_oul.userlist.get('rtc_online_users', {})['id'] = str(dt_now)
        new_rtc_oul = RTCOnlineUsers()
        new_rtc_oul.id = dt_now
        new_rtc_oul.operation_id = oper.id
        new_rtc_oul.userlist = new_userlist
        db.session.add(new_rtc_oul)

        cur_oul.enabled = False
        db.session.add(cur_oul)

        # Log User Disconnection
        oper = CatalogOperations.query.filter_by(name_short='dcon').first()
        log_ud = LogUserConnections()
        log_ud.id = dt_now
        log_ud.sid = request.sid
        log_ud.user_id = user.id
        log_ud.operation_id = oper.id
        log_ud.ip_address = ip
        db.session.add(log_ud)

        db.session.commit()

        # Remove Employee to Room
        if current_user.is_authenticated:
            if current_user.is_user_role(['adm', 'emp']):
                leave_room('CTOS-EMPS')
        
        socketio.emit('RTCUserList', new_userlist, room='CTOS-EMPS')
    except Exception as e:
        app.logger.error('** SWING_CMS ** - SocketIO User Disconnected Error: {}'.format(e))
        return jsonify({ 'status': 'error' })


@socketio.on('receiveSocketID')
def _receiveSocketID(json):
    app.logger.debug('** SWING_CMS ** - SocketIO User Connected SocketID: {}'.format(json))


@socketio.on('sendOfferToUser')
def _sendOfferToUser(js):
    app.logger.debug('** SWING_CMS ** - SocketIO Send Offer To User: {}'.format(js))
    j = json.loads(js)
    data = j['data']
    r_id = j['r_id']
    socketio.emit('receiveInitiatorOffer', { 'r_id' : request.sid, 'data' : data }, room=r_id)


@socketio.on('sendAnswerToUser')
def _sendAnswerToUser(js):
    app.logger.debug('** SWING_CMS ** - SocketIO Send Answer To User: {}'.format(js))
    j = json.loads(js)
    data = j['data']
    r_id = j['r_id']
    socketio.emit('receiveReceiverAnswer', { 'r_id' : request.sid, 'data' : data }, room=r_id)

@socketio.on_error()
def error_handler(e):
    app.logger.error('** SWING_CMS ** - SocketIO Error: {}'.format(e))
    db.session.rollback()

