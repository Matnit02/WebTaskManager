from flask import Blueprint, render_template, request, flash, redirect, url_for
from flask_login import logout_user, login_user, current_user
from re import match
from WebTaskManager.extensions import db, bcrypt, login_manager
from WebTaskManager.models.auth_model import User

auth = Blueprint('auth', __name__)

@login_manager.user_loader
def loader_user(user_id):
    return User.query.get(user_id)

@auth.route('/register', methods=('GET', 'POST'))
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email'].lower()
        password1 = request.form['password1']
        password2 = request.form['password2']

        username_exist = User.query.filter_by(username=username).first()
        email_in_use = User.query.filter_by(email=email).first()

        if username_exist:
            flash('Username taken. Try another one!', 'warning')
        elif email_in_use:
            flash('E-mail already in use', 'warning')
        elif len(username) > 20:
            flash('Username is too long', 'warning')
        elif len(password1) > 80:
            flash('Password is too long', 'warning')
        elif password1 != password2:
            flash('Passwords vary', 'warning')
        elif password1 != password2:
            flash('Passwords vary', 'warning')
        elif len(password1) < 8:
            flash('Password is too short. It needs to be at least 8 characters long', 'warning')
        elif not match(r'^(?=.*[A-Z])(?=.*\d).+$', password1):
            flash('Password has to consist of 1 capital letter and 1 number', 'warning')
        else:
            hashed_password = bcrypt.generate_password_hash(password1).decode('utf-8')
            new_user = User(username=username, password=hashed_password, email=email)
            db.session.add(new_user)
            db.session.commit()
            flash('Registration successful!', 'success')
            return redirect(url_for('auth.login'))


    return render_template('auth/register.html', project_name="TEST PROJECT")


@auth.route('/login', methods=('GET', 'POST'))
def login():
    if current_user.is_authenticated:
        return redirect(url_for('projects.index'))

    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        remember_me = request.form.get('remember_me')
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user, fresh=True, remember = (remember_me == 'on'))
            next_page = request.args.get('next')
            flash('Login successful', 'success')
            return redirect(next_page) if next_page else redirect(url_for('projects.index'))
        else:
            flash('Please check your username and password', 'danger')

    return render_template('auth/login.html')

@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('auth.login'))