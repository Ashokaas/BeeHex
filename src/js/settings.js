/* En cas de clic sur le bouton "start", on vérifie la validité du formulaire.
Si le formulaire est valide, on appelle la fonction startGameWithSettings.*/
document.getElementById("start").addEventListener("click", function () {
    /* Empêche le rechargement de la page */
    event.preventDefault();

    /* Vérification de la validité du formulaire */
    if (document.getElementById("startGameWithSettings").checkValidity()) {
        startGameWithSettings();
    } else {
        alert("Erreur dans le formulaire");
    }
});

/* Fonction qui récupère les informations du formulaire et les stocke dans localStorage
avant de rediriger l'utilisateur vers la page de jeu */
function startGameWithSettings() {
    
    const form = document.forms.startGameWithSettings
    let formData = {};

    /* Récupération des informations du formulaire en les mettant dans un element JSON (clef/valeur) */
    for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];

        /* Si l'élément a un attribut name */
        if (element.name) {
            /* Si l'élément est un radio et qu'il n'est pas coché, on passe à l'élément suivant */
            if (element.type === "radio" && !element.checked) {
                continue;
            } else if (element.type === "checkbox") {
                formData[element.name] = element.checked;
            } else {
                formData[element.name] = element.value;
            }
        }
    }

    // Conversion de l'objet en chaîne JSON et stockage dans localStorage
    localStorage.setItem("data", JSON.stringify(formData));

    // Redirection vers la page de destination
    window.location.href = "../../public/hex.html";

}