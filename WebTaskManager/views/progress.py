from flask import Blueprint, session, render_template
from flask_login import login_required
from WebTaskManager.models.task_model import Task

progress = Blueprint('progress', __name__)


@progress.route('/progress', methods=('GET', 'POST'))
@login_required
def index():
    all_panel_ids = Task.get_all_panel_ids(session.get('project_id'))
    counts_by_panel = Task.count_tasks_and_subtasks_by_panel(session.get('project_id'))
    delayed_count_by_panels = Task.get_delayed_tasks(session.get('project_id'))

    return render_template('progress.html', project_name=session.get('project_name'), all_panel_ids=all_panel_ids,
                           counts_by_panel=counts_by_panel, delayed_count_by_panels=delayed_count_by_panels)
