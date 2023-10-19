from flask import Blueprint, render_template, flash, session, request, jsonify, redirect, url_for, current_app
from flask_login import login_required, current_user
from flask_socketio import join_room, leave_room
from WebTaskManager.models.task_model import Task
from WebTaskManager.models.auth_model import User
from WebTaskManager.models.project_model import Project
from WebTaskManager.extensions import db, socketio
from datetime import datetime
import pytz

tasks = Blueprint('tasks', __name__)


@tasks.route('/tasks', methods=['GET'])
@login_required
def index():
    usernames = User.get_usernames_by_project_id(session.get('project_id'))
    tasks_list = Task.get_main_tasks_list(session.get('project_id'))

    if User.can_access_project(current_user.id, session.get('project_id')):
        return render_template('tasks.html', usernames=usernames, project_name=session.get('project_name'),
                               tasks=tasks_list)

    return redirect(url_for('projects.index'))


@tasks.route('/add_task', methods=['POST'])
def add_task():
    task_title = request.form.get('task_title')
    id_panel = request.form.get('panel_id')
    description = request.form.get('task_description')
    deadline = datetime.strptime(request.form.get('deadline'), '%Y-%m-%dT%H:%M')

    local_tz = pytz.timezone('Europe/Warsaw')
    local_time = datetime.utcnow().replace(tzinfo=pytz.utc).astimezone(local_tz).replace(tzinfo=None)

    new_task = Task(task_title=task_title, id_owner=current_user.id, id_panel=id_panel, description=description,
                    project_id=session.get('project_id'), deadline=deadline, created_at=local_time)

    db.session.add(new_task)
    db.session.flush()

    subtask_titles = request.form.getlist('subtask_title')
    subtask_descriptions = request.form.getlist('subtask_description')
    subtask_deadlines = request.form.getlist('subtask_deadline')

    for i in range(len(subtask_titles)):
        subtask = Task(
            id_owner=new_task.id_owner,
            task_title=subtask_titles[i],
            description=subtask_descriptions[i],
            project_id=session.get('project_id'),
            deadline=datetime.strptime(subtask_deadlines[i], '%Y-%m-%dT%H:%M'),
            parent_id=new_task.id,
            created_at=local_time
        )

        if subtask.deadline > new_task.deadline:
            db.session.rollback()
            return jsonify(
                {'status': 'warning', 'message': 'Subtask deadline cannot be later than the main task deadline'})

        db.session.add(subtask)

    db.session.commit()
    socketio.emit('new_task_added', {
        'task_id': new_task.id,
        'task_title': new_task.task_title,
        'description': new_task.description,
        'deadline': new_task.deadline.strftime('%Y-%m-%d %H:%M:%S'),
        'panel_id': new_task.id_panel,
        'deadline_progress': new_task.deadline_progress,
        'time_left': new_task.time_left,
        'children': [
            {
                'id': subtask.id,
                'title': subtask.task_title,
                'description': subtask.description,
                'deadline': subtask.deadline.strftime('%Y-%m-%d %H:%M:%S'),
                'deadline_progress': subtask.deadline_progress,
                'time_left': subtask.time_left
            } for subtask in new_task.children
        ]
    }, to='tasks_' + str(session.get('project_id')))

    return jsonify({'status': 'success', 'message': 'Task added successfully'})


@tasks.route('/update-order', methods=['PATCH'])
def update_order():
    order = request.form.getlist('order[]')
    panel_id = request.form.get('panel_id')
    order = [item for item in order if item != ""]

    is_subtask_update = 'subtask' in request.form

    for index, item_id in enumerate(order):
        task = Task.query.get(item_id)
        if (is_subtask_update and not task.parent_id) or (not is_subtask_update and task.parent_id):
            return jsonify({"error": "Mismatch between task type and update type"}), 400

        task.position = index
        db.session.commit()

    if panel_id == None:
        panel_id = Task.query.get(order[0]).parent_id

    socketio.emit('task_reordered', {'order': order, 'panel_id': panel_id, 'is_subtask_update': is_subtask_update},
                  to='tasks_' + str(session.get('project_id')))

    return jsonify({"message": "Success"}), 200


@tasks.route('/update-task-panel', methods=['PATCH'])
def update_task_panel():
    task_id = request.form.get('task_id')
    panel_id = request.form.get('panel_id')

    task = Task.query.get(task_id)
    if task:
        task.id_panel = panel_id
        db.session.commit()
        socketio.emit('task_moved', {'task_id': task_id, 'panel_id': panel_id},
                      to='tasks_' + str(session.get('project_id')))

    return "Success", 200


@tasks.route('/delete_task', methods=['DELETE'])
def delete_task():
    task_id = request.form.get('task_id')
    if not task_id:
        return jsonify({"status": "error", "message": "No task ID provided."}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({"status": "error", "message": "Task not found."}), 404

    for child in task.children:
        db.session.delete(child)

    db.session.delete(task)
    db.session.commit()
    socketio.emit('delete_task', {'task_id': task_id}, to='tasks_' + str(session.get('project_id')))
    return jsonify({"status": "success", "message": "Task deleted successfully."}), 200


@tasks.route('/delete_user_from_project', methods=['DELETE'])
def delete_user_from_project():
    username = request.form.get('username')
    project_id = session.get('project_id')

    if not project_id:
        return jsonify({"status": "error", "message": "Project ID not found in session."})

    user = User.get_user(username)
    project = Project.query.get(project_id)

    if not user or not project:
        return jsonify({"status": "error", "message": "User or Project not found"})

    if current_user.id == project.id_owner == user.id:
        return jsonify({"status": "error", "message": "You cannot delete yourself from a project that you own"})

    if user.id == current_user.id:
        return jsonify({"status": "error", "message": "You cannot delete yourself from a project."})

    if project.id_owner == user.id:
        return jsonify({"status": "error", "message": "You cannot delete owner of the project"})

    if project in user.projects:
        user.projects.remove(project)
        db.session.commit()
        socketio.emit('user_removed', {'username': username}, to='tasks_' + str(session.get('project_id')))
        socketio.emit('removed_from_project', room=user.id, to='tasks_' + str(session.get('project_id')))
        return jsonify({"status": "success", "message": "User removed from project"})

    return jsonify({"status": "error", "message": "Project was not associated with user"})


@tasks.route('/add_user_to_project', methods=['POST'])
def add_user_to_project():
    email = request.form.get('email').lower()
    project_id = session.get('project_id')

    if not email:
        return jsonify({"status": "error", "message": "Please state user's email"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"status": "error", "message": "User not found"}), 404

    project = Project.query.get(project_id)
    if not project:
        return jsonify({"status": "error", "message": "Project not found."}), 404

    if project in user.projects:
        return jsonify({"status": "error", "message": "User is already in this project."}), 400

    user.projects.append(project)
    db.session.commit()

    socketio.emit('user_added', {'username': user.username}, to='tasks_' + str(session.get('project_id')))
    return jsonify({"status": "success", "message": "User added successfully", "username": user.username})


@tasks.route('/check_user_status', methods=['GET'])
def check_user_validity():
    project_id = session.get('project_id')
    if not project_id:
        return {"status": "error", "message": "No project specified."}

    user = User.query.get(current_user.id)
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'})

    user_has_project = any(project.id == project_id for project in user.projects)
    return jsonify({"status": "active" if user_has_project else "removed"})


@tasks.route('/update-task-status', methods=['PATCH'])
def update_task_status():
    task_id = request.form.get('task_id')
    finished = request.form.get('finished') == 'true'

    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify(status='error', message='Task not found!'), 404

        task.finished = finished
        db.session.commit()
        socketio.emit('task_status_updated', {'task_id': task_id, 'finished': finished},
                      to='tasks_' + str(session.get('project_id')))
        return jsonify(status='success', message='Task updated successfully!')

    except Exception as e:
        return jsonify(status='error', message='Error updating task: ' + str(e)), 500


@tasks.route('/mark-all-completed', methods=['PATCH'])
def mark_all_completed():
    task_id = request.form.get('task_id')

    if not task_id:
        return jsonify({'status': 'error', 'message': 'Task ID not provided'}), 400

    task = Task.query.get(task_id)
    if not task:
        return jsonify({'status': 'error', 'message': 'Task not found'}), 404

    task.finished = True

    for subtask in task.children:
        subtask.finished = True

    db.session.commit()
    socketio.emit('task_moved_to_completed', {'task_id': task_id}, to='tasks_' + str(session.get('project_id')))

    return jsonify({'status': 'success', 'message': 'Task and subtasks marked as finished'}), 200


@tasks.route('/mark-task-unfinished', methods=['PATCH'])
def mark_task_unfinished():
    task_id = request.form.get('task_id')

    if not task_id:
        return jsonify(status='error', message='Task ID is required')

    task = Task.query.get(task_id)

    if not task:
        return jsonify(status='error', message='Task not found')

    task.finished = False
    db.session.commit()

    socketio.emit('task_moved_from_completed', {'task_id': task_id}, to='tasks_' + str(session.get('project_id')))
    return jsonify(status='success', message='Task marked as unfinished')


@tasks.route('/get-task-data', methods=['GET'])
def get_task_data():
    task_id = request.args.get('task_id')
    task = Task.query.get(task_id)

    if not task:
        return jsonify({"status": "error", "message": "task not found"}), 404

    time_left_tuple = task.time_left
    time_left = list(time_left_tuple)

    deadline_progress = task.deadline_progress
    return jsonify({"time_left": time_left, "deadline_progress": deadline_progress}), 200


@socketio.on('connect')
@login_required
def on_join(data):
    room = 'tasks_' + str(session.get('project_id'))
    if room:
        join_room(room)
        current_app.logger.info("Successfully joined room: " + room)
    else:
        current_app.logger.error("Failed to join room: " + room + ".No project_id in session.")


@socketio.on('disconnect')
def on_disconnect():
    room = 'tasks_' + str(session.get('project_id'))
    if room:
        leave_room(room)
        current_app.logger.info("Successfully left room: " + room)
    else:
        current_app.logger.error("Failed to leave room: " + room + ".No project_id in session.")
