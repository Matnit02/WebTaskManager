from app.extensions import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)

    projects = db.relationship(
        'Project',
        secondary='project_users',
        backref=db.backref('users', lazy='dynamic')
    )

    @staticmethod
    def get_associated_projects_ids(user_id):
        user = User.query.get(user_id)
        if not user:
            return []
        return [project.id for project in user.projects]

    @staticmethod
    def get_project_id_by_its_name(user_id, project_name):
        user = User.query.get(user_id)
        if not user:
            return None
        project = next((p for p in user.projects if p.project_name == project_name), None)
        return project.id if project else None

    @staticmethod
    def uses_project_name(user_id, project_name):
        user = User.query.get(user_id)
        if not user:
            return False
        return any(project.project_name == project_name for project in user.projects)

    @staticmethod
    def connect_project_with_user(user_id, project_id):
        insert_stmt = project_users.insert().values(project_id=project_id, user_id=user_id)
        db.session.execute(insert_stmt)
        db.session.commit()

    @staticmethod
    def get_username(user_id):
        user = User.query.get(user_id)
        return user.username if user else None

    @staticmethod
    def get_user(username):
        user = User.query.filter_by(username=username).first()
        return user if user else None

    @staticmethod
    def get_usernames_by_project_id(project_id):
        users = User.query.join(project_users).filter_by(project_id=project_id).all()
        usernames = [user.username for user in users]
        return usernames

    @staticmethod
    def can_access_project(user_id, project_id):
        user = User.query.get(user_id)
        if not user:
            return False
        return any(project.id == project_id for project in user.projects)


project_users = db.Table('project_users',
                         db.Column('project_id', db.Integer, db.ForeignKey('project.id')),
                         db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
                         )
