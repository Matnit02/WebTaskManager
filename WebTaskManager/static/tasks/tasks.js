$(document).ready(function () {
    $('#not-started').on('click', '.collapse-btn', function () {
        $(this).children().toggleClass('fa-minus fa-arrow-down');
    });
    $('#in-progress').on('click', '.collapse-btn', function () {
        $(this).children().toggleClass('fa-minus fa-arrow-down');
    });
    $('#re-opened').on('click', '.collapse-btn', function () {
        $(this).children().toggleClass('fa-minus fa-arrow-down');
    });
    $('#in-review').on('click', '.collapse-btn', function () {
        $(this).children().toggleClass('fa-minus fa-arrow-down');
    });
    $('#completed').on('click', '.collapse-btn', function () {
        $(this).children().toggleClass('fa-minus fa-arrow-down');
    });
});

$(document).ready(function () {
    initializeTaskSorting();
    initializeSubtaskSorting();
});

function initializeTaskSorting() {
    $(".panel-body").sortable({
        items: ".task",
        connectWith: ".panel-body",
        start: function (event, ui) {
            ui.item.startPanelId = ui.item.closest('.panel-body').attr('data-panel-id');
        },
        stop: function (event, ui) {
            var itemId = ui.item.attr('id');
            var newPanelId = ui.item.closest('.panel-body').attr('data-panel-id');
            var deferred = $.Deferred();

            if (ui.item.startPanelId !== newPanelId) {
                $.ajax({
                    url: '/update-task-panel',
                    method: 'PATCH',
                    data: {
                        task_id: itemId,
                        panel_id: newPanelId
                    },
                    success: function () {
                        deferred.resolve();
                    }
                });
            } else {
                deferred.resolve();
            }

            deferred.done(function () {
                var taskOrder = $(ui.item).parent().sortable('toArray');
                var panelId = $(ui.item).parent().attr('data-panel-id');
                $.ajax({
                    url: '/update-order',
                    method: 'PATCH',
                    data: {
                        order: taskOrder,
                        panel_id: panelId
                    }
                });
            });

            if (ui.item.startPanelId !== "completed" && newPanelId === "completed") {
                markTaskAndSubtasksAsCompleted(itemId);
            }

            if (ui.item.startPanelId === "completed" && newPanelId !== "completed") {
                markTaskAsUnfinished(itemId);
            }
        }
    });
}

function initializeSubtaskSorting() {
    $(".subtask-list").sortable({
        connectWith: ".subtask-list",
        update: function (event, ui) {
            var subtaskOrder = $(this).sortable('toArray');
            $.ajax({
                    url: '/update-order',
                    method: 'PATCH',
                    data: {
                        order: subtaskOrder,
                        subtask: true
                    }
                });

        }
    });
}

function markTaskAndSubtasksAsCompleted(taskId) {
    $.ajax({
        url: '/mark-all-completed',
        method: 'PATCH',
        data: {task_id: taskId},
        success: function (response) {
            if (response.status == 'success') {
                toastr.success("Task and subtasks marked as completed.");
            } else {
                toastr.error("Failed to mark tasks as completed.");
            }
        }
    });
}

function markTaskAsUnfinished(taskId) {
    $.ajax({
        url: '/mark-task-unfinished',
        method: 'PATCH',
        data: {task_id: taskId},
        success: function (response) {
            if (response.status == 'success') {
                toastr.success("Task marked as unfinished.");
            } else {
                toastr.error("Failed to mark task as unfinished.");
            }
        }
    });
}

$(document).ready(function () {
    $('#addSubtaskBtn').click(function () {
        var content = `
      <hr>
      <div class="form-floating">
        <input type="text" class="form-control required-input" name="subtask_title"
          placeholder="Subtask title" required>
        <label for="task_title">Subtask title</label>
      </div>
      <textarea class="form-control" rows="4" name="subtask_description"
        placeholder="Describe your subtask (optional)"></textarea>
      <div class="form-floating">
        <input type="datetime-local" class="form-control required-input"
          name="subtask_deadline" required>
        <label for="deadline">Subtask deadline</label>
      </div>
    `;
        $('#dynamicFieldsContainer').append(content);
    });
    $('#new-task').on('hidden.bs.modal', function () {
        $('#dynamicFieldsContainer').empty();
        $('#myModalForm').trigger('reset');
    });
});

$(document).ready(function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('task_moved', function (data) {
        var taskElement = $('#' + data.task_id);
        var newPanel = $('[data-panel-id="' + data.panel_id + '"]');

        if (taskElement.length && newPanel.length) {
            taskElement.detach().appendTo(newPanel);
        }
    });


    socket.on('task_reordered', function (data) {
        var $panel;

        if (data.is_subtask_update === false) {
            $panel = $('#' + data.panel_id);
        } else {
            $panel = $('#subtask-list-' + data.panel_id);
        }

        var children = $panel.children().detach();

        $.each(data.order, function (index, id) {
            var $element = children.filter('#' + id);
            if ($element.length) {
                $panel.append($element);
            }
        });
    });


    socket.on('new_task_added', function (data) {
        var $task = $('<div>').addClass('task');
        if (data.deadline_progress == 100) {
            $task.addClass('task-color-danger');
        } else if (data.deadline_progress < 50) {
            $task.addClass('task-color-primary');
        } else {
            $task.addClass('task-color-warning');
        }
        $task.attr({
            'draggable': true,
            'id': data.task_id,
            'data-task-id': data.task_id
        });
        $('<div>').addClass('btn btn-sm pull-right collapse-btn')
            .attr({
                'data-bs-toggle': 'collapse',
                'data-bs-target': '#task-' + data.task_id + '-content',
                'role': 'button',
                'aria-expanded': 'false',
                'aria-controls': 'task-' + data.task_id + '-content'
            })
            .html('<i class="fa fa-arrow-down"></i>')
            .appendTo($task);
        $('<h4>').addClass('title text-left').text(data.task_title).appendTo($task);
        var $taskContent = $('<div>').addClass('collapse').attr('id', 'task-' + data.task_id + '-content').appendTo($task);
        $('<p>').addClass('text').text(data.description).appendTo($taskContent);

        var $progressContainer = $('<div>').addClass('progress-container').appendTo($taskContent);
        var $progressText;
        if (data.deadline_progress == 100) {
            $progressText = $('<div>').addClass('progress-text-behind-deadline');
        } else if (data.deadline_progress < 50) {
            $progressText = $('<div>').addClass('progress-text-primary');
        } else {
            $progressText = $('<div>').addClass('progress-text-warning-deadline');
        }

        var progressTextContent;
        if (data.deadline_progress == 100) {
            progressTextContent = data.time_left[0] + ' days, ' + data.time_left[1] + ' h, ' + data.time_left[2] + ' min late';
        } else {
            progressTextContent = data.time_left[0] + ' days, ' + data.time_left[1] + ' h, ' + data.time_left[2] + ' min';
        }

        $progressText.text(progressTextContent).appendTo($progressContainer);

        var $progress = $('<div>').addClass('progress').attr({
            'role': 'progressbar',
            'aria-label': 'Task Progress',
            'aria-valuenow': data.deadline_progress,
            'aria-valuemin': 0,
            'aria-valuemax': 100
        }).appendTo($progressContainer);

        var $progressBar;
        if (data.deadline_progress < 50) {
            $progressBar = $('<div>').addClass('progress-bar bg-success');
        } else if (data.deadline_progress < 100) {
            $progressBar = $('<div>').addClass('progress-bar bg-warning');
        } else {
            $progressBar = $('<div>').addClass('progress-bar bg-danger');
        }
        $progressBar.css('width', data.deadline_progress + '%').appendTo($progress);

        var deadlineClass = 'task-deadline ';
        if (data.deadline_progress == 100) {
            deadlineClass += 'progress-text-behind-deadline';
        } else if (data.deadline_progress < 50) {
            deadlineClass += 'progress-text-primary';
        } else {
            deadlineClass += 'progress-text-warning-deadline';
        }

        $('<div>').addClass(deadlineClass).text('DL: ' + data.deadline).appendTo($progressContainer);

        var $subtasksForm = $('<form>').appendTo($('<div>').addClass('subtasks').attr('id', 'subtasks').appendTo($taskContent));
        var $subtaskList = $('<ul>').addClass('subtask-list').attr('id', 'subtask-list-' + data.task_id).appendTo($subtasksForm);

        $('#' + data.panel_id).append($task);

        data.children.forEach(function (subtask) {
            var subtaskClass = 'subtask-list-item';
            if (subtask.deadline_progress === 100) {
                subtaskClass += ' subtask-list-item-danger';
            } else if (subtask.deadline_progress < 50) {
                subtaskClass += 'subtask-list-item-primary';
            } else {
                subtaskClass += ' subtask-list-item-warning';
            }

            var $subtaskItem = $('<li>').addClass(subtaskClass).attr({
                'draggable': true,
                'id': subtask.id,
                'data-task-id': subtask.id
            }).appendTo($subtaskList);
            var $subtaskDiv = $('<div>').addClass('subtask').appendTo($subtaskItem);
            $('<input>').addClass('form-check-input').attr({
                'type': 'checkbox',
                'id': 'subtask-' + subtask.id + '-checkbox'
            }).appendTo($subtaskDiv);
            $('<label>').addClass('form-check-label').attr('for', 'subtask-' + subtask.id + '-checkbox').text(subtask.title).appendTo($subtaskDiv);
            $('<div>').addClass('btn btn-sm pull-right collapse-btn')
                .attr({
                    'data-bs-toggle': 'collapse',
                    'data-bs-target': '#subtask-' + subtask.id + '-text',
                    'role': 'button',
                    'aria-expanded': 'false',
                    'aria-controls': 'subtask-' + subtask.id + '-text'
                })
                .html('<i class="fa fa-arrow-down"></i>')
                .appendTo($subtaskDiv);
            var $subTaskContent = $('<div>').addClass('collapse').attr('id', 'subtask-' + subtask.id + '-text')
                .html('<p class="subtask-text text">' + subtask.description + '</p>')
                .appendTo($subtaskDiv);

            var $subtaskProgressContainer = $('<div>').addClass('subtask-progress-container').appendTo($subTaskContent);
            var $subtaskProgressText;
            if (subtask.deadline_progress == 100) {
                $subtaskProgressText = $('<div>').addClass('progress-text-behind-deadline');
            } else if (subtask.deadline_progress < 50) {
                $subtaskProgressText = $('<div>').addClass('progress-text-primary');
            } else {
                $subtaskProgressText = $('<div>').addClass('progress-text-warning-deadline');
            }
            var subtaskProgressTextContent;
            if (subtask.deadline_progress == 100) {
                subtaskProgressTextContent = subtask.time_left[0] + ' days, ' + subtask.time_left[1] + ' h, ' + subtask.time_left[2] + ' min late';
            } else {
                subtaskProgressTextContent = subtask.time_left[0] + ' days, ' + subtask.time_left[1] + ' h, ' + subtask.time_left[2] + ' min';
            }

            $subtaskProgressText.text(subtaskProgressTextContent).appendTo($subtaskProgressContainer);

            var $subtaskProgress = $('<div>').addClass('progress').attr({
                'role': 'progressbar',
                'aria-label': 'Subtask Progress',
                'aria-valuenow': subtask.deadline_progress,
                'aria-valuemin': 0,
                'aria-valuemax': 100
            }).appendTo($subtaskProgressContainer);

            var $subtaskProgressBar;
            if (subtask.deadline_progress < 50) {
                $subtaskProgressBar = $('<div>').addClass('progress-bar bg-success');
            } else if (subtask.deadline_progress < 100) {
                $subtaskProgressBar = $('<div>').addClass('progress-bar bg-warning');
            } else {
                $subtaskProgressBar = $('<div>').addClass('progress-bar bg-danger');
            }
            $subtaskProgressBar.css('width', subtask.deadline_progress + '%').appendTo($subtaskProgress);

            var subtaskDeadlineClass = 'subtask-deadline ';
            if (subtask.deadline_progress == 100) {
                subtaskDeadlineClass += 'progress-text-behind-deadline';
            } else if (subtask.deadline_progress < 50) {
                subtaskDeadlineClass += 'progress-text-primary';
            } else {
                subtaskDeadlineClass += 'progress-text-warning-deadline';
            }

            $('<div>').addClass(subtaskDeadlineClass).text('DL: ' + subtask.deadline).appendTo($subtaskProgressContainer);
        });
        if (data.panel_id == "completed") {
            markTaskAndSubtasksAsCompleted(data.task_id);
        }

        initializeTaskSorting();
        initializeSubtaskSorting();
    });


    socket.on('delete_task', function (data) {
        var taskElement = $('[data-task-id="' + data.task_id + '"]');
        if (taskElement.length) {
            taskElement.remove();
        }
    });


    socket.on('user_added', function (data) {
        let addedUsername = data.username;
        let newUserHTML = `
        <li>
            <div class="dropdown-item dropdown-user" onclick="showDeleteUserModal('${addedUsername}')" id="${addedUsername}">
                ${addedUsername}
            </div>
        </li>`;
        $("#users_list").append(newUserHTML);
    });


    socket.on('user_removed', function (data) {
        let removedUsername = data.username;
        $('#' + removedUsername).remove();
        checkUserStatus();
    });


    socket.on('task_status_updated', function (data) {
        var checkbox = document.getElementById('subtask-' + data.task_id + '-checkbox');
        if (checkbox) {
            checkbox.checked = data.finished;
        }
    });


    socket.on('task_moved_to_completed', function (data) {
        var taskId = data.task_id;

        $(`div[data-task-id=${taskId}]`).find('input[type="checkbox"]').prop('checked', true);

        var divTask = document.getElementById(taskId);
        divTask.className = '';
        divTask.classList.add("task", "task-color-success");

        var divProgressContainer = divTask.querySelector('.progress-container');
        var deadline = divProgressContainer.querySelector('.task-deadline').innerHTML;
        divProgressContainer.innerHTML = '';
        divProgressContainer.innerHTML = '<div class="task-deadline progress-text-success">' + deadline + '</div>';

        var subtasks = divTask.querySelectorAll('.subtask-list-item');
        subtasks.forEach(function (div) {
            div.className = '';
            div.classList.add("subtask-list-item", "subtask-list-item-success")
            var divSubtaskProgressContainer = div.querySelector('.subtask-progress-container');
            var subtaskDeadline = divSubtaskProgressContainer.querySelector('.subtask-deadline').innerHTML;
            divSubtaskProgressContainer.innerHTML = '';
            divSubtaskProgressContainer.innerHTML = '<div class="subtask-deadline progress-text-success">' + subtaskDeadline + '</div>';
        });
    });

    socket.on('task_moved_from_completed', function (data) {
        moveTaskFromCompleted(data.task_id)
    });
});

$(document).ready(function () {

        $(document).on('click', '.collapse-btn', function (e) {
            e.stopPropagation();
        });
        var elementToDelete = null;

        $('#rm-button-toggled').change(function () {
            if ($(this).is(':checked')) {
                $(document).on('click', '.task', function (e) {
                    var collapseBtn = $(this).find('.collapse-btn');
                    if (collapseBtn.attr('aria-expanded') === "false") {
                        elementToDelete = $(this);
                        var taskTitle = $(this).find('.title').text();
                        $('#deleteItemTitle').text(taskTitle);
                        $('#deleteTaskModal').modal('show');
                        e.stopPropagation();
                    }
                });

                $(document).on('click', '.subtask-list-item', function (e) {
                    if ($(e.target).hasClass('form-check-label')) {
                        var parentCollapseBtn = $(this).closest('.task').find('.collapse-btn');
                        if (parentCollapseBtn.attr('aria-expanded') === "true") {
                            elementToDelete = $(this);
                            var subtaskTitle = $(e.target).text().trim();
                            $('#deleteItemTitle').text(subtaskTitle);
                            $('#deleteTaskModal').modal('show');
                            e.stopPropagation();
                        }
                    } else if ($(e.target).hasClass('form-check-input')) {
                        e.preventDefault();
                    }
                });

            } else {
                $(document).off('click', '.task');
                $(document).off('click', '.subtask-list-item');
            }
        });

        $('#confirmDeleteTaskBtn').click(function () {
            if (elementToDelete) {
                var taskId = elementToDelete.attr('data-task-id');
                $.ajax({
                    url: "/delete_task",
                    type: "DELETE",
                    data: {
                        task_id: taskId
                    },
                    success: function (data) {
                        toastr[data.status](data.message);
                        if (data.status == 'success') {
                            elementToDelete.remove();
                        }
                    },
                    error: function (error) {
                        toastr.error(error.message);
                    }
                });

                elementToDelete = null;
                $('#deleteTaskModal').modal('hide');
            }
        });
    }
);

$(document).ready(function () {
    let userToDelete;

    window.showDeleteUserModal = function (username) {
        userToDelete = username;
        $('#userToDelete').text(username);
        $('#deleteUserModal').modal('show');
    }

    $('#confirmDeleteUserBtn').click(function () {
        if (userToDelete) {
            $.ajax({
                url: "/delete_user_from_project",
                type: "DELETE",
                data: {
                    username: userToDelete
                },
                success: function (response) {
                    if (response.status === "success") {
                        toastr[response.status](response.message);
                    } else {
                        toastr[response.status](response.message);
                    }
                },
                error: function (error) {
                    toastr.error(error.data);
                }
            });
        }
        $('#deleteUserModal').modal('hide');
    });
});

$(document).ready(function () {
    $("#addUserForm").on("submit", function (e) {
        e.preventDefault();

        let email = $("#user_email").val();

        $.ajax({
            url: "/add_user_to_project",
            type: "POST",
            data: {email: email},
            success: function (response) {
                if (response.status === "success") {
                    toastr[response.status](response.message);
                    $("#user_email").val('');

                } else {
                    toastr[response.status](response.message);
                }
            },
            error: function (jqXHR) {
                let response;
                try {
                    response = JSON.parse(jqXHR.responseText);
                    toastr[response.status](response.message);
                } catch (e) {
                    toastr["error"]("Server error. Try again later.");
                }

                $("#user_email").val('');
            }
        });
    });

    $("#addUserButton").click(function () {
        $("#addUserForm").submit();
    });
});

function checkUserStatus() {
    $.ajax({
        url: '/check_user_status',
        type: 'GET',
        success: function (response) {
            if (response.status === 'removed') {
                window.location.href = '/projects';
            }
        }
    });
}

$(document).ready(function () {
    $("#myModalForm").submit(function (event) {
        event.preventDefault();

        let formData = $(this).serialize();

        $.ajax({
            url: '/add_task',
            type: 'POST',
            data: formData,
            success: function (response) {
                if (response.status === "success") {
                    $('#new-task').modal('hide');
                    toastr[response.status](response.message);
                } else {
                    toastr[response.status](response.message);
                }
            },
            error: function (error) {
                toastr.error(error.message);
            }
        });
    });
});

$(document).ready(function () {
    $('body').on('change', '.form-check-input', function () {
        var taskId = $(this).closest('.subtask-list-item').attr('data-task-id');
        var finished = $(this).prop('checked');
        $.ajax({
            url: '/update-task-status',
            method: 'PATCH',
            data: {
                task_id: taskId,
                finished: finished,
            }
        });
    });
});

function moveTaskFromCompleted(itemId) {
    var divTask = document.getElementById(itemId);
    getTaskData(itemId)
        .then(([time_left, deadline_progress]) => {
            divTask.className = '';
            if (deadline_progress == 100) {
                divTask.classList.add("task", "task-color-danger");
            } else if (deadline_progress < 50) {
                divTask.classList.add("task", "task-color-primary");
            } else {
                divTask.classList.add("task", "task-color-warning");
            }

            var divProgressContainer = divTask.querySelector('.progress-container');

            var $progress = $('<div>').addClass('progress').attr({
                'role': 'progressbar',
                'aria-label': 'Task Progress',
                'aria-valuenow': deadline_progress,
                'aria-valuemin': 0,
                'aria-valuemax': 100
            });

            divProgressContainer.insertAdjacentHTML('afterbegin', $progress.prop('outerHTML'));
            var addedProgress = divProgressContainer.querySelector('.progress');

            var $progressBar;
            if (deadline_progress < 50) {
                $progressBar = $('<div>').addClass('progress-bar bg-success');
            } else if (deadline_progress < 100) {
                $progressBar = $('<div>').addClass('progress-bar bg-warning');
            } else {
                $progressBar = $('<div>').addClass('progress-bar bg-danger');
            }
            $progressBar.css('width', deadline_progress + '%').appendTo(addedProgress);

            var $progressText;
            if (deadline_progress == 100) {
                $progressText = $('<div>').addClass('progress-text-behind-deadline');
            } else if (deadline_progress < 50) {
                $progressText = $('<div>').addClass('progress-text-primary');
            } else {
                $progressText = $('<div>').addClass('progress-text-warning-deadline');
            }

            var progressTextContent;
            if (deadline_progress == 100) {
                progressTextContent = time_left[0] + ' days, ' + time_left[1] + ' h, ' + time_left[2] + ' min late';
            } else {
                progressTextContent = time_left[0] + ' days, ' + time_left[1] + ' h, ' + time_left[2] + ' min';
            }

            divProgressContainer.insertAdjacentHTML('afterbegin', $progressText.text(progressTextContent).prop('outerHTML'));

            var divTaskDeadline = divProgressContainer.querySelector('.task-deadline');
            divTaskDeadline.className = '';
            if (deadline_progress == 100) {
                divTaskDeadline.classList.add('task-deadline', 'progress-text-behind-deadline');
            } else if (deadline_progress < 50) {
                divTaskDeadline.classList.add('task-deadline', 'progress-text-primary');
            } else {
                divTaskDeadline.classList.add('task-deadline', 'progress-text-warning-deadline');
            }
        })
        .catch(error => {
            toastr.error(error.message);
        });

    var subtasks = divTask.querySelectorAll('.subtask-list-item');
    subtasks.forEach(function (div) {
        getTaskData(div.id)
            .then(([subtask_time_left, subtask_deadline_progress]) => {
                div.className = '';
                if (subtask_deadline_progress === 100) {
                    div.classList.add('subtask-list-item', 'subtask-list-item-danger');
                } else if (subtask_deadline_progress < 50) {
                    div.classList.add('subtask-list-item', 'subtask-list-item-primary');
                } else {
                    div.classList.add('subtask-list-item', 'subtask-list-item-warning');
                }
                var subtaskDivProgressContainer = div.querySelector('.subtask-progress-container');

                var $subtaskProgress = $('<div>').addClass('progress').attr({
                    'role': 'progressbar',
                    'aria-label': 'Task Progress',
                    'aria-valuenow': subtask_deadline_progress,
                    'aria-valuemin': 0,
                    'aria-valuemax': 100
                });

                subtaskDivProgressContainer.insertAdjacentHTML('afterbegin', $subtaskProgress.prop('outerHTML'));
                var subtaskAddedProgress = subtaskDivProgressContainer.querySelector('.progress');

                var $subtaskProgressBar;
                if (subtask_deadline_progress < 50) {
                    $subtaskProgressBar = $('<div>').addClass('progress-bar bg-success');
                } else if (subtask_deadline_progress < 100) {
                    $subtaskProgressBar = $('<div>').addClass('progress-bar bg-warning');
                } else {
                    $subtaskProgressBar = $('<div>').addClass('progress-bar bg-danger');
                }
                $subtaskProgressBar.css('width', subtask_deadline_progress + '%').appendTo(subtaskAddedProgress);

                var $subtaskProgressText;
                if (subtask_deadline_progress == 100) {
                    $subtaskProgressText = $('<div>').addClass('progress-text-behind-deadline');
                } else if (subtask_deadline_progress < 50) {
                    $subtaskProgressText = $('<div>').addClass('progress-text-primary');
                } else {
                    $subtaskProgressText = $('<div>').addClass('progress-text-warning-deadline');
                }

                var subtaskProgressTextContent;
                if (subtask_deadline_progress == 100) {
                    subtaskProgressTextContent = subtask_time_left[0] + ' days, ' + subtask_time_left[1] + ' h, ' + subtask_time_left[2] + ' min late';
                } else {
                    subtaskProgressTextContent = subtask_time_left[0] + ' days, ' + subtask_time_left[1] + ' h, ' + subtask_time_left[2] + ' min';
                }

                subtaskDivProgressContainer.insertAdjacentHTML('afterbegin', $subtaskProgressText.text(subtaskProgressTextContent).prop('outerHTML'));

                var divSubtaskDeadline = subtaskDivProgressContainer.querySelector('.subtask-deadline');
                divSubtaskDeadline.className = '';
                if (subtask_deadline_progress == 100) {
                    divSubtaskDeadline.classList.add('subtask-deadline', 'progress-text-behind-deadline');
                } else if (subtask_deadline_progress < 50) {
                    divSubtaskDeadline.classList.add('subtask-deadline', 'progress-text-primary');
                } else {
                    divSubtaskDeadline.classList.add('subtask-deadline', 'progress-text-warning-deadline');
                }
            })
            .catch(error => {
                toastr.error(error.message);
            });
    });
}

function getTaskData(itemId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/get-task-data',
            method: 'GET',
            data: {
                task_id: itemId,
            },
            dataType: 'json',
            success: function (response) {
                resolve([response.time_left, response.deadline_progress]);
            },
            error: function (error) {
                reject(error);
            }
        });
    });
}