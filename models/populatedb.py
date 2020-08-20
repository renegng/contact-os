from datetime import datetime
from flask import current_app as app
from flask import jsonify
from models import UserInfo, UserRole, UserXRole, db

# -----------------------------------------------------------------------------------------------------
# DATABASE MINIMUM REQUIRED DATA
# POPULATION FUNCTIONS
# -----------------------------------------------------------------------------------------------------

# Initialize Database Populate Function
def initPopulateDB():
    # Add User Roles
    populateUserRoles()

    # Add Default Users
    populateDefaultUsers()


# Populate Default Users
def populateDefaultUsers():
    try:
        app.logger.debug('** SWING_CMS ** - Populate Default Users')

        # Add Admin User
        admin_user = UserInfo()
        admin_user.uid = 'CTOS-Administrator'
        admin_user.email = 'admusr@contact-os.com'
        admin_user.name = 'Contact-Os Administrador'
        admin_user.cmuserid = 'CTOS-ADM-200000-0001'
        db.session.add(admin_user)
        db.session.flush()
        # Add Admin Role
        admin_role = UserRole.query.filter_by(name_short='adm').first()
        admin_userxrole = UserXRole()
        admin_userxrole.user_id = admin_user.id
        admin_userxrole.user_role_id = admin_role.id
        db.session.add(admin_userxrole)

        db.session.commit()

        return jsonify({ 'status': 'success' })
    except Exception as e:
        app.logger.error('** SWING_CMS ** - Populate Default Users Error: {}'.format(e))
        return jsonify({ 'status': 'error' })


# Populate UserRole Data
def populateUserRoles():
    try:
        app.logger.debug('** SWING_CMS ** - Populate User Roles')

        # Add User Roles
        user_role = UserRole(name='Usuario', name_short='usr')
        db.session.add(user_role)

        admin_role = UserRole(name='Administrador', name_short='adm')
        db.session.add(admin_role)
        
        staff_role = UserRole(name='Empleado', name_short='emp')
        db.session.add(staff_role)

        db.session.commit()

        return jsonify({ 'status': 'success' })
    except Exception as e:
        app.logger.error('** SWING_CMS ** - Populate User Roles Error: {}'.format(e))
        return jsonify({ 'status': 'error' })

