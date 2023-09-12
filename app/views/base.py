from flask import Blueprint, render_template, session

base = Blueprint('base', __name__)


@base.route('/base')
def index():
    # return '<h1>Welcome to the home page!</h1>'
    return render_template('base.html', project_name=session.get('project_name'))
