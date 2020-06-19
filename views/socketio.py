import datetime

from . import createJsonResponse, db
from flask import current_app as app
from flask import Blueprint
from flask_socketio import SocketIO

sio = Blueprint('sio', __name__, template_folder='templates', static_folder='static')

# Instantiate SocketIO
socketio = SocketIO()

@socketio.on('connect')
def _connect():
    socketio.emit('userIsConnected', {'data': 'Connected'})


@socketio.on('disconnect')
def _disconnect():
    socketio.emit('removeUserSocketID')


@socketio.on('receiveSocketID')
def _receiveSocketID(json):
    app.logger.info('** SWING_CMS ** - SocketIO SocketID: {}'.format(json))


@socketio.on('sendOfferToUser')
def _sendOfferToUser(json):
    socketio.emit('receiveInitiatorOffer', json)


@socketio.on('sendAnswerToUser')
def _sendAnswerToUser(json):
    socketio.emit('receiveReceiverAnswer', json)


@socketio.on_error()
def error_handler(e):
    app.logger.error('** SWING_CMS ** - SocketIO Error: {}'.format(e))

