/**
 * Démarre le jeu à partir de la page d'accueil.
 * 
 * @param {number} grid_size_in - La taille de la grille.
 * @param {string} j1_name - Le nom du joueur 1.
 * @param {string} j1_type - Le type du joueur 1.
 * @param {string} j2_name - Le nom du joueur 2.
 * @param {string} j2_type - Le type du joueur 2.
 * @param {string} timer - La valeur du minuteur.
 */
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