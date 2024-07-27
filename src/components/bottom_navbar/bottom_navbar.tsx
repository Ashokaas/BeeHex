import React from 'react';
import styles from './bottom_navbar.module.css';
import 'material-symbols';


const BottomNavBar = () => {
  return (
    <div id={styles.bottom_nav_bar}>
    <a href="/">
      <p>Accueil</p>
      <span className="material-symbols-rounded">home</span>
    </a>
    <a href="/hex">
      <p>Jouer (local)</p>
      <span className="material-symbols-rounded">sports_esports</span>
    </a>
    <a href="#">
      <p>Partie avancée</p>
      <span className="material-symbols-rounded">settings</span>
    </a>
    <a href="/about">
      <p>À propos</p>
      <span className="material-symbols-rounded">info</span>
    </a>
    <a href="/login_register">
      <p>Se connecter / S'inscrire</p>
      <span className="material-symbols-rounded">login</span>
    </a>
  </div>
  );
};

export default BottomNavBar;
