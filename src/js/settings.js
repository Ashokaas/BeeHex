var grid_size_in = document.getElementById('grid_size_in');
var grid_size_out = document.getElementById('grid_size_out');

// Transforme automatiquement la valeur de l'output en la valeur de l'input
// (l'utilisateur peut taper '11' au lieu de taper '11x11)
grid_size_in.addEventListener('input', function () {
    if (grid_size_in.value != '') {
        grid_size_out.innerText = grid_size_in.value;
    } else {
        grid_size_out.innerText = '11';
    }
});


document.getElementById("start").addEventListener("click", function (event) {
    console.log("start");
    const form = document.forms.startGameWithSettings
    const formData = {};

    for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];

        if (element.name) {
            if (element.type === "radio" && !element.checked) {
                continue;
            } else if (element.type === "checkbox") {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    }

    // Création d'un objet JSON pour stocker les informations
    var dataToSend = {};

    // Ajout de chaque clé du formData à dataToSend
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            dataToSend[key] = formData[key];
        }
    }

    // Conversion de l'objet en chaîne JSON et stockage dans localStorage
    localStorage.setItem("data", JSON.stringify(dataToSend));

    // Redirection vers la page de destination
    window.location.href = "../../public/hex.html";



}
);