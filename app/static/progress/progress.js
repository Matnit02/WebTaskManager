$(document).ready(function () {
    let completedTasks = 0;
    let otherTasks = 0;

    if (dataFromPython['completed']) {
        completedTasks += dataFromPython['completed'].main_tasks + dataFromPython['completed'].subtasks;
    }

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            otherTasks += dataFromPython[panelId].main_tasks + dataFromPython[panelId].subtasks;
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
        bindto: "#donut-chart-1",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        totalTasks += dataFromPython[panelId].main_tasks + dataFromPython[panelId].subtasks;
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds.map(function (panelId) {
        return [panelId, dataFromPython[panelId].main_tasks + dataFromPython[panelId].subtasks];
    });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "donut",
        },
        donut: {
            title: "Total tasks: " + totalTasksString,
        },
        bindto: "#donut-chart-2",
    });
});

$(document).ready(function () {
    let completedTasks = 0;
    let otherTasks = 0;

    if (dataFromPython['completed']) {
        completedTasks += dataFromPython['completed'].main_tasks;
    }

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            otherTasks += dataFromPython[panelId].main_tasks;
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
        bindto: "#donut-chart-3",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        totalTasks += dataFromPython[panelId].main_tasks;
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds.map(function (panelId) {
        return [panelId, dataFromPython[panelId].main_tasks];
    });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "donut",
        },
        donut: {
            title: "Total main tasks: " + totalTasksString,
        },
        bindto: "#donut-chart-4",
    });
});

$(document).ready(function () {
    let completedTasks = 0;
    let otherTasks = 0;

    if (dataFromPython['completed']) {
        completedTasks += dataFromPython['completed'].subtasks;
    }

    $.each(panelIds, function (index, panelId) {
        if (panelId !== 'completed') {
            otherTasks += dataFromPython[panelId].subtasks;
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
        bindto: "#donut-chart-5",
    });
});

$(document).ready(function () {
    let totalTasks = 0;
    $.each(panelIds, function (index, panelId) {
        totalTasks += dataFromPython[panelId].subtasks;
    });
    let totalTasksString = totalTasks.toString();

    let columns = panelIds.map(function (panelId) {
        return [panelId, dataFromPython[panelId].subtasks];
    });

    let chart = bb.generate({
        data: {
            columns: columns,
            type: "donut",
        },
        donut: {
            title: "Total subtasks: " + totalTasksString,
        },
        bindto: "#donut-chart-6",
    });
});