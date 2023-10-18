$(document).ready(function () {
    let completedTasks = 0;
    let otherTasks = 0;

    if (taskCountByPanel['completed']) {
        completedTasks += taskCountByPanel['completed'].main_tasks + taskCountByPanel['completed'].subtasks;
    }

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            otherTasks += taskCountByPanel[panelId].main_tasks + taskCountByPanel[panelId].subtasks;
        }
    });

    let allTasks = completedTasks + otherTasks
    let chart = bb.generate({
        data: {
            columns: [
                ["Completed", completedTasks * 100 / allTasks],
            ],
            type: "gauge",
        },
        gauge: {},
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#chart-1",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        totalTasks += taskCountByPanel[panelId].main_tasks + taskCountByPanel[panelId].subtasks;
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds.map(function (panelId) {
        return [panelId, taskCountByPanel[panelId].main_tasks + taskCountByPanel[panelId].subtasks];
    });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "donut",
        },
        donut: {
            title: "Total tasks: " + totalTasksString,
            label: {
                format: (value, ratio, id) => {
                    return value;
                }
            }
        },
        bindto: "#chart-2",
    });
});

$(document).ready(function () {
    let completedTasks = 0;
    let otherTasks = 0;

    if (taskCountByPanel['completed']) {
        completedTasks += taskCountByPanel['completed'].main_tasks;
    }

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            otherTasks += taskCountByPanel[panelId].main_tasks;
        }
    });

    let allTasks = completedTasks + otherTasks
    let chart = bb.generate({
        data: {
            columns: [
                ["Completed", completedTasks * 100 / allTasks],
            ],
            type: "gauge",
        },
        gauge: {},
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#chart-3",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        totalTasks += taskCountByPanel[panelId].main_tasks;
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds.map(function (panelId) {
        return [panelId, taskCountByPanel[panelId].main_tasks];
    });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "donut",
        },
        donut: {
            title: "Total main tasks: " + totalTasksString,
            label: {
                format: (value, ratio, id) => {
                    return value;
                }
            }
        },
        bindto: "#chart-4",
    });
});

$(document).ready(function () {
    let completedTasks = 0;
    let otherTasks = 0;

    if (taskCountByPanel['completed']) {
        completedTasks += taskCountByPanel['completed'].subtasks;
    }

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            otherTasks += taskCountByPanel[panelId].subtasks;
        }
    });

    let allTasks = completedTasks + otherTasks
    let chart = bb.generate({
        data: {
            columns: [
                ["Completed", completedTasks * 100 / allTasks],
            ],
            type: "gauge",
        },
        gauge: {},
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#chart-5",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        totalTasks += taskCountByPanel[panelId].subtasks;
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds.map(function (panelId) {
        return [panelId, taskCountByPanel[panelId].subtasks];
    });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "donut",
        },
        donut: {
            title: "Total subtasks: " + totalTasksString,
            label: {
                format: (value, ratio, id) => {
                    return value;
                }
            }
        },
        bindto: "#chart-6",
    });
});

$(document).ready(function () {
    let delayedTasks = 0;
    let allTasks = 0;

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            delayedTasks += delayedTasksByPanel[panelId].main_tasks + delayedTasksByPanel[panelId].subtasks;
            allTasks += delayedTasksByPanel[panelId].main_tasks + delayedTasksByPanel[panelId].subtasks;
        } else {
            allTasks += delayedTasksByPanel[panelId].main_tasks + delayedTasksByPanel[panelId].subtasks;
        }
    });

    let chart = bb.generate({
        data: {
            columns: [
                ["On time", (allTasks - delayedTasks) * 100 / allTasks],
            ],
            type: "gauge",
        },
        gauge: {},
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#chart-7",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            totalTasks += delayedTasksByPanel[panelId].main_tasks + delayedTasksByPanel[panelId].subtasks;
        }
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds
        .filter(function (panelId) {
            return panelId !== 'completed';
        })
        .map(function (panelId) {
            return [panelId, delayedTasksByPanel[panelId].main_tasks + delayedTasksByPanel[panelId].subtasks];
        });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "pie"
        },
        pie: {
            label: {
                format: (value, ratio, id) => {
                    return value;
                }
            }
        },
        bindto: "#chart-8",
    });
});

$(document).ready(function () {
    let delayedTasks = 0;
    let allTasks = 0;

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            delayedTasks += delayedTasksByPanel[panelId].main_tasks;
            allTasks += delayedTasksByPanel[panelId].main_tasks;
        } else {
            allTasks += delayedTasksByPanel[panelId].main_tasks;
        }
    });

    let chart = bb.generate({
        data: {
            columns: [
                ["On time", (allTasks - delayedTasks) * 100 / allTasks],
            ],
            type: "gauge",
        },
        gauge: {},
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#chart-9",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            totalTasks += delayedTasksByPanel[panelId].main_tasks;
        }
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds
        .filter(function (panelId) {
            return panelId !== 'completed';
        })
        .map(function (panelId) {
            return [panelId, delayedTasksByPanel[panelId].main_tasks];
        });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "pie"
        },
        pie: {
            label: {
                format: (value, ratio, id) => {
                    return value;
                }
            }
        },
        bindto: "#chart-10",
    });
});

$(document).ready(function () {
    let delayedTasks = 0;
    let allTasks = 0;

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            delayedTasks += delayedTasksByPanel[panelId].subtasks;
            allTasks += delayedTasksByPanel[panelId].subtasks;
        } else {
            allTasks += delayedTasksByPanel[panelId].subtasks;
        }
    });

    let chart = bb.generate({
        data: {
            columns: [
                ["On time", (allTasks - delayedTasks) * 100 / allTasks],
            ],
            type: "gauge",
        },
        gauge: {},
        color: {
            pattern: [
                "#FF0000",
                "#F97600",
                "#F6C600",
                "#60B044"
            ],
            threshold: {
                values: [
                    30,
                    60,
                    90,
                    100
                ]
            }
        },
        size: {
            height: 180
        },
        bindto: "#chart-11",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            totalTasks += delayedTasksByPanel[panelId].subtasks;
        }
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds
        .filter(function (panelId) {
            return panelId !== 'completed';
        })
        .map(function (panelId) {
            return [panelId, delayedTasksByPanel[panelId].subtasks];
        });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "pie"
        },
        pie: {
            label: {
                format: (value, ratio, id) => {
                    return value;
                }
            }
        },
        bindto: "#chart-12",
    });
});