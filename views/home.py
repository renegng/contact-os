import datetime

from . import auth, createCookieSession, createLoginSession, createJsonResponse, db
from . import isFirebaseCookieSessionValid, verifyFirebaseCookieCreateSession
from flask import Blueprint, redirect, render_template, request, url_for, jsonify, make_response
from flask import current_app as app
from flask_login import logout_user, current_user, login_required
from models.models import UserInfo, UserRole, UserXRole

home = Blueprint('home', __name__, template_folder='templates', static_folder='static')

@home.route('/')
def _index():
    app.logger.debug('** SWING_CMS ** - Index')
    return redirect(url_for('home._welcome'))


@home.route('/acercade/')
def _acercade():
    app.logger.debug('** SWING_CMS ** - AcercaDe')
    return render_template('acercade.html')


@home.route('/chat/')
def _chat():
    app.logger.debug('** SWING_CMS ** - Try Chat')
    return render_template('chat.html')


@home.route('/chat/admin/')
def _chat_admin():
    app.logger.debug('** SWING_CMS ** - Chat Admin')
    return render_template('chat_admin.html')


@home.route('/chat/home/')
def _chat_home():
    app.logger.debug('** SWING_CMS ** - Chat Home')
    return render_template('chat_home.html')


@home.route('/components/')
def _components():
    app.logger.debug('** SWING_CMS ** - Welcome')
    return render_template('components.html')


@home.route('/home/')
# @login_required
def _home():
    app.logger.debug('** SWING_CMS ** - Home')
    return render_template('acercade.html')


@home.route('/login/')
def _login():
    app.logger.debug('** SWING_CMS ** - Login')
    return render_template('login.html')


@home.route('/loginuser/', methods=['POST'])
def _loginuser():
    app.logger.debug('** SWING_CMS ** - Login')
    try:
        # Validate if the user has a Valid Session
        if current_user.is_authenticated:
            # If it has a valid Session, verifies the Firebase Cookie Session
            if isFirebaseCookieSessionValid():
                # Set URL depending on role
                url = '/chat/admin/' if current_user.email == 'renegng@gmail.com' else '/chat/home/'

                return createJsonResponse('success', 'redirectURL', url)
            else:
                # If the Firebase Cookie Session is invalid, user is logged out and Login Process continues
                logout_user()
        else:
            # If user doesnt have a Valid Session, validate if it has a Firebase Cookie Session
            if verifyFirebaseCookieCreateSession():
                # Set URL depending on role
                url = '/chat/admin/' if current_user.email == 'renegng@gmail.com' else '/chat/home/'
                return createJsonResponse('success', 'redirectURL', url)
        
        # Login Process
        # Retrieve the uid from the JWT idToken
        idToken = request.json['idToken']
        decoded_token = auth.verify_id_token(idToken)
        uid = decoded_token['uid']

        # Search for the user in the DB.
        user = UserInfo.query.filter_by(uid = uid).first()
        if user is None:
            # Retrieve Firebase's User info
            fbUser = auth.get_user(uid)

            # User is not registered on DB. Insert user in DB.
            user = UserInfo()
            user.uid = uid
            user.email = fbUser.email
            user.name = fbUser.display_name
            user.datecreated = datetime.datetime.utcnow()
            user.cmuserid = 'CTOS-' + user.name.strip().upper()[0:1] + user.datecreated.strftime('-%y%m%d-%H%M%S')
            
            db.session.add(user)
            db.session.commit()
            app.logger.info('** SWING_CMS ** - LoginUser added: {}'.format(user.id))
        
        # Create User Session
        createLoginSession(user)
        
        # Return Session Cookie
        # Set URL depending on role
        url = '/chat/admin/' if user.email == 'renegng@gmail.com' else '/chat/home/'
        
        response = createCookieSession(idToken, 'redirectURL', url)
        return response

    except Exception as e:
        app.logger.error('** SWING_CMS ** - LoginUser Error: {}'.format(e))
        return jsonify({ 'status': 'error' })


@home.route('/logoutuser/')
# @login_required
def _logoutuser():
    app.logger.debug('** SWING_CMS ** - Logout')
    try:
        # First, user is logged out from Flask Login Session
        logout_user()

        response = make_response(redirect(url_for('home._welcome')))

        # Second, user is logged out from Firebase Cookie Session
        # The Firebase Cookie is cleared
        response.set_cookie(app.config['FIREBASE_COOKIE_NAME'], expires=0)

        return response
    except Exception as e:
        app.logger.error('** SWING_CMS ** - LogoutUser Error: {}'.format(e))
        return jsonify({ 'status': 'error' })


@home.route('/politicaprivacidad/')
def _politicaprivacidad():
    app.logger.debug('** SWING_CMS ** - PoliticaPrivacidad')
    return render_template('politicaprivacidad.html')


@home.route('/terminosdelservicio/')
def _terminosdelservicio():
    app.logger.debug('** SWING_CMS ** - TerminosDelServicio')
    return render_template('terminosdelservicio.html')


@home.route('/welcome/')
def _welcome():
    app.logger.debug('** SWING_CMS ** - Welcome')
    return render_template('welcome.html')
