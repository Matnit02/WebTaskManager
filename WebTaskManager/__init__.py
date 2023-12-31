from flask import Flask, redirect, url_for
from os import makedirs, path
from .extensions import db, bcrypt, login_manager, socketio
from .logging_config import init_app_logging
import eventlet

def create_app(conf):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(SECRET_KEY='dev', DATABASE=path.join(app.instance_path, 'app.sqlite'))

    if conf is None:
        app.logger.debug('Loading instance config.')
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.logger.debug('Loading passed config.')
        app.config.from_mapping(conf)

    try:
        makedirs(app.instance_path)
    except OSError:
        pass

    init_app_logging(app)
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    socketio.init_app(app)

    from .models.auth_model import User
    from .models.task_model import Task
    from .models.project_model import Project
    with app.app_context():
        db.create_all()

    @app.route('/')
    def hello_world():
        return redirect(url_for('auth.login'))

    from .views.base import base
    app.register_blueprint(base)
    from .views.tasks import tasks
    app.register_blueprint(tasks)
    from .views.schedule import schedule
    app.register_blueprint(schedule)
    from .views.auth import auth
    app.register_blueprint(auth)
    from .views.projects import projects
    app.register_blueprint(projects)
    from .views.progress import progress
    app.register_blueprint(progress)

    return app
