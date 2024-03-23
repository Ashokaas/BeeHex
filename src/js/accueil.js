function startGameFromIndexPage(grid_size_in, j1_name, j1_type, j2_name, j2_type, timer) {
    // Création d'un objet JSON pour stocker les informations
    var formData = {grid_size_in, j1_name, j1_type, j2_name, j2_type, timer};
    var dataToSend = {};

    // Ajout de chaque clé du formData à dataToSend
    for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
            dataToSend[key] = formData[key];
        }
    }

    console.log(dataToSend);

    // Conversion de l'objet en chaîne JSON et stockage dans localStorage
    localStorage.setItem("data", JSON.stringify(dataToSend));

    // Redirection vers la page de destination
    window.location.href = "../../public/hex.html";
}