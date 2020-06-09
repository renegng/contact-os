from datetime import datetime
from flask import jsonify
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# **************************************************************************
# Database models
# **************************************************************************

# User Information Class
class UserInfo(UserMixin, db.Model):
    __tablename__ = 'user_info'
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=False, nullable=False)
    name = db.Column(db.String(300), unique=False, nullable=False)
    cmuserid = db.Column(db.String(20), unique=False, nullable=False)
    avatar = db.Column(db.String(16), unique=False, nullable=True)
    phonenumber = db.Column(db.String(20), unique=False, nullable=True)
    notifications = db.Column(db.Boolean, unique=False, nullable=True)
    enabled = db.Column(db.Boolean, unique=False, nullable=True, default=True)
    datecreated = db.Column(db.DateTime, unique=False, nullable=False, index=True, default=datetime.utcnow)
    roles = db.relationship('UserXRole', lazy='subquery', back_populates='user_info')

    # UserClass properties and methods
    def __init__(self):
        # Properties required by Flask-Login
        self._is_active = False
        self._is_authenticated = False

    @property
    def is_active(self):
        return self._is_active

    @is_active.setter
    def is_active(self, val):
        self._is_active = val

    @property
    def is_authenticated(self):
        return self._is_authenticated

    @is_authenticated.setter
    def is_authenticated(self, val):
        self._is_authenticated = val

    def __repr__(self):
        return jsonify(
            id = self.id,
            uid = self.uid,
            email = self.email,
            name = self.name,
            cmuserid = self.cmuserid,
            phonenumber = self.phonenumber,
            notifications = self.notifications,
            enabled = self.enabled,
            roles = self.roles
        )
    
    # Method required by Flask-Login
    def get_id(self):
        return self.uid


# Role Class
class UserRole(db.Model):
    __tablename__ = 'user_role'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), unique=True, nullable=False)
    enabled = db.Column(db.Boolean, unique=False, nullable=True, default=True)
    users = db.relationship('UserXRole', lazy='subquery', back_populates='user_role')

    def __repr__(self):
        return jsonify(
            id = self.id,
            name = self.name,
            enabled = self.enabled,
            users = self.users
        )


# User Roles Class
class UserXRole(db.Model):
    __tablename__ = 'user_x_role'
    user_id = db.Column(db.Integer, db.ForeignKey('user_info.id'), primary_key=True)
    user_role_id = db.Column(db.Integer, db.ForeignKey('user_role.id'), primary_key=True)
    datecreated = db.Column(db.DateTime, unique=False, nullable=False, index=True, default=datetime.utcnow)
    user_info = db.relationship('UserInfo', back_populates='roles')
    user_role = db.relationship('UserRole', back_populates='users')
