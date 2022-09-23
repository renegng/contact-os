import base64, json

from . import crypto_key, db, removeItemFromList, updateItemFromList
from babel.dates import format_date
from datetime import datetime as dt
from datetime import timezone as tz
from flask import current_app as app
from flask import Blueprint, request, jsonify
from flask_login import current_user
from flask_socketio import SocketIO, close_room, join_room, leave_room, rooms
from models.models import CatalogOperations, CatalogUserRoles, LogUserConnections, RTCOnlineUsers, User
from models.models import ChatsAnonymous, ChatsEmployees, ChatsRegistered
from sqlalchemy.orm.attributes import flag_modified

siortc = Blueprint('siortc', __name__, template_folder='templates', static_folder='static')

# Instantiate SocketIO
socketio = SocketIO()

@socketio.on('connect')
def _connect():
    app.logger.debug('** SWING_CMS ** - SocketIO User Connected')
    try:
        # Get Chat Information
        chat_id = request.args.get('c_id')
        room_id = request.args.get('r_id')
        photoURL = request.args.get('p_url')

        # Retrieve User
        user = current_user if current_user.is_authenticated else User.query.filter_by(uid='CTOS-Anonim@').first()

        # Retrieve User IP Address
        ip = request.environ.get('HTTP_X_FORWARDED_FOR')
        ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr) if ip is None else str(ip).split(',')[0].strip()

        # Add User to RTC Online Users List
        cur_oul = RTCOnlineUsers.query.with_for_update().order_by(RTCOnlineUsers.id.desc()).first()
        dt_now = dt.now(tz.utc)
        rtc_user = {
            'id': user.id,
            'r_id': str(request.sid),
            'userInfo': {
                'activity': int(int(dt_now.strftime('%s%f'))/1000),
                'assignedTo': None,
                'ip': str(ip),
                'name': user.name,
                'photoURL': photoURL,
                'roles': user.get_user_roles(),
                'status': 'Disponible'
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
        
        socketio.emit('userIsConnected', { 'status' : 'success', 'id' : user.id, 'roles' : user.get_user_roles() }, room=request.sid)
        socketio.emit('RTCUserList', new_userlist, room='CTOS-EMPS')
    except Exception as e:
        app.logger.error('** SWING_CMS ** - SocketIO User Connected Error: {}'.format(e))
        return jsonify({ 'status': 'error' })
