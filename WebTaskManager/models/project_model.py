from WebTaskManager.extensions import db


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_owner = db.Column(db.Integer, nullable=False)
    project_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    tasks = db.relationship('Task', backref='project', lazy=True)

    @staticmethod
    def get_project_name_list(project_ids):
        projects = Project.query.filter(Project.id.in_(project_ids)).all()
        return [project.project_name for project in projects]

    @staticmethod
    def add_new_project(id_owner, project_name, description=None):
        new_project = Project(id_owner=id_owner, project_name=project_name, description=description)
        db.session.add(new_project)
        db.session.commit()
        return new_project

    @staticmethod
    def get_project_name(project_id):
        project = Project.query.get(project_id)
        return project.project_name if project else None
