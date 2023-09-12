from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_socketio import SocketIO
from flask import flash, redirect, url_for

db = SQLAlchemy()
bcrypt = Bcrypt()
socketio = SocketIO()

login_manager = LoginManager()
login_manager.login_view = 'auth.login'

@login_manager.unauthorized_handler
def unauthorized_callback():
    flash('Please log in to access this page.', 'danger')
    return redirect(url_for('auth.login'))