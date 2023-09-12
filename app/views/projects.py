from flask import Blueprint, render_template, session, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from app.models.auth_model import User
from app.models.project_model import Project

projects = Blueprint('projects', __name__)


@projects.route('/projects', methods=('GET', 'POST'))
@login_required
def index():
    if request.method == 'POST':
        if request.is_json:
            project_name = request.json.get('projectName')
            project_id = User.get_project_id_by_its_name(current_user.id, project_name)
            if not project_id:
                return jsonify(success=False, message="Unauthorized or invalid project name")
            session['project_id'] = project_id
            session['project_name'] = Project.get_project_name(project_id)
            return jsonify(success=True)

        project_name = request.form['project_name']
        description = request.form['description']
        if not User.uses_project_name(current_user.id, project_name):
            project = Project.add_new_project(current_user.id, project_name, description)
            User.connect_project_with_user(current_user.id, project.id)
            session['project_id'] = project.id
            session['project_name'] = project.project_name
            return redirect(url_for('tasks.index'))

        flash("Project's name already in use", 'warning')

    projects_ids_list = User.get_associated_projects_ids(current_user.id)
    projects_names_list = Project.get_project_name_list(projects_ids_list)
    return render_template('projects.html', username = User.get_username(current_user.id), projects_names_list=projects_names_list)
