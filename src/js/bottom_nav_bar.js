var path = window.location.pathname;
var page = path.split("/").pop();

/* Utilisation de https://codepen.io/sosuke/pen/Pjoqqp pour convertir le hex afin de l'appliquer sur un filter */

if (page == "index.html") {
    let imgElement = document.querySelector('#bottom_nav_bar a:nth-child(1) img');
    imgElement.style.filter = "invert(82%) sepia(27%) saturate(7392%) hue-rotate(17deg) brightness(103%) contrast(91%)";
} else if (page == "hex.html") {
    let imgElement = document.querySelector('#bottom_nav_bar a:nth-child(2) img');
    imgElement.style.filter = "invert(76%) sepia(8%) saturate(3065%) hue-rotate(41deg) brightness(89%) contrast(87%)";
} else if (page == "settings.html") {
    let imgElement = document.querySelector('#bottom_nav_bar a:nth-child(3) img');
    imgElement.style.filter = "invert(53%) sepia(50%) saturate(1509%) hue-rotate(201deg) brightness(102%) contrast(119%)";
} else if (page == "about.html") {
    let imgElement = document.querySelector('#bottom_nav_bar a:nth-child(4) img');
    imgElement.style.filter = "invert(40%) sepia(14%) saturate(0%) hue-rotate(160deg) brightness(89%) contrast(95%)";
}