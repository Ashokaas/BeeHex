
/**
 * Chargement de la bar de navigation en bas de page
 */
function loadBottomNavBar() {
    $(document).ready(function() {
        $('#bottom_nav_bar_parent').load('bottom_nav_bar.html');
    });
}

loadBottomNavBar();