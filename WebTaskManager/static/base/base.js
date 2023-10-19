// // $(document).ready(function() {
// //     $('.nav-link-collapse').on('click', function () {
// //         $(this).children().toggleClass('Projects-up Projects-down');
// //     });
// // });
//
// $(document).ready(function () {
//     const navItemIcon = $('#nav-item-icon');
//     const navLink = $('.nav-link');
//     let isListProjectsVisible = false;
//
//     navLink.on('click', function (e) {
//         e.preventDefault();
//
//         if (isListProjectsVisible) {
//             // List projects is shown, change the SVG icon when the nav-item is expanded
//             navItemIcon.find('use').attr('xlink:href', '#Projects-up');
//         } else {
//             // List projects is hidden, restore the original SVG icon when the nav-item is collapsed
//             navItemIcon.find('use').attr('xlink:href', '#Projects-down');
//         }
//
//         // Toggle the visibility of list-projects
//         isListProjectsVisible = !isListProjectsVisible;
//     });
// });