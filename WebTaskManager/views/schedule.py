from flask import Blueprint, render_template, session

schedule = Blueprint('schedule', __name__)

@schedule.route('/schedule')
def index():
    return render_template('schedule.html', project_name=session.get('project_name'))