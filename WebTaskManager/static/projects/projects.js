document.addEventListener('DOMContentLoaded', function () {
    const projectDivs = document.querySelectorAll('.project');
    projectDivs.forEach(div => {
        div.addEventListener('click', function (event) {
            const projectName = event.currentTarget.getAttribute('project-name');
            fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectName: projectName
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        window.location.href = '/tasks';
                    } else {
                        console.error('Server returned an error:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        });
    });
});

$(document).ready(function() {
    // Event listener for the 'Go back' button
    $('.btn-secondary').on('click', function() {
        // Clear the input fields in the form
        $('#project_name').val('');
        $('#description').val('');
    });
});