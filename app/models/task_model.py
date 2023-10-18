from app.extensions import db
from datetime import datetime
import pytz


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_owner = db.Column(db.Integer, nullable=False)
    id_panel = db.Column(db.String(255))
    task_title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp(), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    deadline = db.Column(db.DateTime, default=datetime.utcnow)
    position = db.Column(db.Integer, nullable=False)
    finished = db.Column(db.Boolean, default=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('task.id'))
    children = db.relationship('Task', backref=db.backref('parent', remote_side=[id]), order_by='Task.position')

    def __init__(self, *args, **kwargs):
        super(Task, self).__init__(*args, **kwargs)
        current_panel = kwargs.get('id_panel')
        if current_panel:
            max_position = db.session.query(db.func.max(Task.position)).filter_by(id_panel=current_panel).scalar()
            self.position = (max_position or 0) + 1
        elif self.parent_id:
            max_position = db.session.query(db.func.max(Task.position)).filter_by(parent_id=self.parent_id).scalar()
            self.position = (max_position or 0) + 1
        else:
            raise ValueError("Either id_panel or parent_id must be provided when creating a Task")

    @property
    def time_left(self):
        local_tz = pytz.timezone('Europe/Warsaw')
        local_time = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(local_tz).replace(tzinfo=None)
        delta = self.deadline - local_time

        if delta.total_seconds() < 0:
            delta = abs(delta)

        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, _ = divmod(remainder, 60)

        return days, hours, minutes

    @property
    def deadline_progress(self):
        local_tz = pytz.timezone('Europe/Warsaw')
        local_time = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(local_tz).replace(tzinfo=None)
        total_duration = self.deadline - self.created_at
        time_elapsed = local_time - self.created_at
        progress_percentage = (time_elapsed / total_duration) * 100

        if time_elapsed.total_seconds() >= total_duration.total_seconds():
            return 100

        return max(0, min(100, progress_percentage))

    @staticmethod
    def get_main_tasks_list(project_id):
        tasks = Task.query.filter_by(project_id=project_id).filter(Task.id_panel != None).order_by(Task.position).all()
        return tasks

    @staticmethod
    def count_tasks_and_subtasks_by_panel(project_id):
        counts_by_panel = {}

        main_tasks = Task.query.filter(Task.project_id == project_id, Task.parent_id == None).all()

        for task in main_tasks:
            if task.id_panel not in counts_by_panel:
                counts_by_panel[task.id_panel] = {"main_tasks": 0, "subtasks": 0}

            counts_by_panel[task.id_panel]["main_tasks"] += 1
            subtasks_count = Task.query.filter(Task.parent_id == task.id).count()
            counts_by_panel[task.id_panel]["subtasks"] += subtasks_count

        return counts_by_panel

    @staticmethod
    def get_all_panel_ids(project_id):
        panel_ids_query = db.session.query(Task.id_panel).filter(
            Task.project_id == project_id,
            Task.id_panel.isnot(None)
        ).distinct()

        panel_ids = [item[0] for item in panel_ids_query.all()]

        return panel_ids

    @staticmethod
    def get_delayed_tasks(project_id):
        delayed_count_by_panels = {}

        main_tasks = Task.query.filter(Task.project_id == project_id, Task.parent_id == None).all()
        for task in main_tasks:
            if task.id_panel not in delayed_count_by_panels:
                delayed_count_by_panels[task.id_panel] = {"main_tasks": 0, "subtasks": 0}

            if task.deadline_progress == 100:
                delayed_count_by_panels[task.id_panel]["main_tasks"] += 1

            for subtask in task.children:
                if subtask.deadline_progress == 100:
                    delayed_count_by_panels[task.id_panel]["subtasks"] += 1

        return delayed_count_by_panels
