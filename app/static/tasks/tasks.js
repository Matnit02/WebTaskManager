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
    $(".panel-body").sortable({
        connectWith: ".panel-body",
        start: function (event, ui) {
            ui.item.startPanelId = ui.item.closest('.panel-body').attr('data-panel-id');
        },
        stop: function (event, ui) {
            var itemId = ui.item.attr('id');
            var newPanelId = ui.item.closest('.panel-body').attr('data-panel-id');
            var deferred = $.Deferred();

            if (ui.item.startPanelId !== newPanelId) {
                $.post('/update-task-panel', {
                    task_id: itemId,
                    panel_id: newPanelId
                }).done(function () {
                    deferred.resolve();
                });
            } else {
                deferred.resolve();
            }

            deferred.done(function () {
                var taskOrder = $(ui.item).parent().sortable('toArray');
                var panelId = $(ui.item).parent().attr('data-panel-id');
                $.post('/update-order', {
                    order: taskOrder,
                    panel_id: panelId
                });
            });
        }
    });
});

$(document).ready(function () {
    $(".subtask-list").sortable({
        connectWith: ".subtask-list",
        update: function (event, ui) {
            var subtaskOrder = $(this).sortable('toArray');
            $.post('/update-order', {order: subtaskOrder, subtask: true});
        }
    });
});

$(document).ready(function () {
    $('#addSubtaskBtn').click(function () {
        var content = `
      <hr>
      <div class="form-floating">
        <input type="text" id="subtask_title" class="form-control required-input" name="subtask_title"
          placeholder="Subtask title" required>
        <label for="task_title">Subtask title</label>
      </div>
      <textarea class="form-control" id="subtask_description" rows="4" name="subtask_description"
        placeholder="Describe your subtask (optional)"></textarea>
      <div class="form-floating">
        <input type="datetime-local" class="form-control required-input" id="subtask_deadline"
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
});


$(document).ready(function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

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
});

$(document).ready(function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('new_task_added', function (data) {
        var $task = $('<div>').addClass('task').attr({'draggable': true, 'id': data.task_id});
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
        var $subtasksForm = $('<form>').appendTo($('<div>').addClass('subtasks').attr('id', 'subtasks').appendTo($taskContent));
        var $subtaskList = $('<ul>').addClass('subtask-list').attr('id', 'subtask-list-' + data.task_id).appendTo($subtasksForm);

        $('#' + data.panel_id).append($task);

        data.children.forEach(function (subtask) {
            var $subtaskItem = $('<li>').addClass('subtask-list-item').attr({
                'draggable': true,
                'id': subtask.id
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
            $('<div>').addClass('collapse').attr('id', 'subtask-' + subtask.id + '-text')
                .html('<p class="subtask-text text">' + subtask.description + '</p>')
                .appendTo($subtaskDiv);
        });
    });
});

$(document).ready(function () {
    $('#rm-button-toggled').change(function () {
        if ($(this).is(':checked')) {
            $('.task').on('click', function (e) {
                var collapseBtn = $(this).find('.collapse-btn');
                if (collapseBtn.attr('aria-expanded') === "false") {
                    var taskId = $(this).attr('data-task-id');
                    $.post("/delete_task", {task_id: taskId}, function (data) {
                        toastr[data.status](data.message);
                        if (data.status == 'success') {
                            $(this).remove();
                        }
                    }.bind(this));
                }
            });

            $('.subtask-list-item').on('click', function (e) {
                var parentCollapseBtn = $(this).closest('.task').find('.collapse-btn');
                if (parentCollapseBtn.attr('aria-expanded') === "true") {
                    var taskId = $(this).attr('data-task-id');
                    $.post("/delete_task", {task_id: taskId}, function (data) {
                        toastr[data.status](data.message);
                        if (data.status == 'success') {
                            $(this).remove();
                        }
                    }.bind(this));
                    e.stopPropagation();
                }
            });
        } else {
            $('.task').off('click');
            $('.subtask-list-item').off('click');
        }
    });
});

$(document).ready(function () {
    let userToDelete;

    window.showDeleteModal = function (username) {
        userToDelete = username;
        $('#userToDelete').text(username);
        var modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    $('#confirmDeleteBtn').click(function () {
        if (userToDelete) {
            $.ajax({
                url: "/delete_user_from_project",
                type: "POST",
                data: {
                    username: userToDelete
                },
                success: function (response) {
                    if (response.status === "success") {
                        toastr[response.status](response.message);
                        $('#' + userToDelete).remove();
                    } else {
                        toastr[response.status](response.message);
                    }
                },
                error: function (xhr, status, error) {
                    toastr.error("An unexpected error occurred.");
                }
            });
        }
        var modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
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

                    let addedUsername = response.username;

                    let newUserHTML = `
                        <li>
                            <div class="dropdown-item dropdown-user" onclick="showDeleteModal('${addedUsername}')" id="${addedUsername}">
                                ${addedUsername}
                            </div>
                        </li>`;

                    $("#users_list").append(newUserHTML);
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

$(document).ready(function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('delete_task', function (data) {
        var taskElement = $('[data-task-id="' + data.task_id + '"]');
        if (taskElement.length) {
            taskElement.remove();
        }
    });
});

$(document).ready(function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('user_added', function (data) {
        let addedUsername = data.username;
        let newUserHTML = `
        <li>
            <div class="dropdown-item dropdown-user" onclick="showDeleteModal('${addedUsername}')" id="${addedUsername}">
                ${addedUsername}
            </div>
        </li>`;
        $("#users_list").append(newUserHTML);
    });
});

$(document).ready(function () {
    var socket = io.connect('http://' + document.domain + ':' + location.port);

    socket.on('user_removed', function (data) {
        let removedUsername = data.username;
        $('#' + removedUsername).remove();
        checkUserStatus();
    });
});

function checkUserStatus() {
    $.ajax({
        url: '/check_user_status',
        type: 'GET',
        success: function(response) {
            if (response.status === 'removed') {
                window.location.href = '/projects';
            }
        }
    });
}