"use client"

import React, { useEffect, useState } from 'react';
import styles from './bottom_navbar.module.css';
import 'material-symbols';

import Cookies from 'js-cookie';

// en fait pour régler mon provlème il faut créer un élément pour chaque bouton mais la je vais me coucher
function MyAccountButton() {
  return (
    <a href="/my_account">
      <p>Mon compte</p>
      <span className="material-symbols-rounded">account_circle</span>
    </a>
  );
}

function LoginRegisterButton() {
  return (
    <a href="/login_register">
      <p>Se connecter</p>
      <span className="material-symbols-rounded">login</span>
    </a>
  );
}


function ShowLoginOrMyAccount() {
  const [loggedIn, setLoggedIn] = useState(false);
  

  useEffect(() => {
    if (Cookies.get('token')) {
      setLoggedIn(true);
    }
    const handleCookieChange = () => {
      setLoggedIn(Cookies.get('token') ? true : false);
    };

    window.addEventListener('cookieChange', handleCookieChange);

    
  }, []);

  return (
    <>
      {loggedIn ? <MyAccountButton /> : <LoginRegisterButton />}
    </>
  );
}




const BottomNavBar = () => {
  return (
    <div id={styles.bottom_nav_bar}>
    <a href="/">
      <p>Accueil</p>
      <span className="material-symbols-rounded">home</span>
    </a>
    <a href="/hex">
      <p>Jouer</p>
      <span className="material-symbols-rounded">swords</span>
    </a>
    <a href="/rank">
      <p>Classement</p>
      <span className="material-symbols-rounded">leaderboard</span>
    </a>
    <a href="#">
      <p>Historique</p>
      <span className="material-symbols-rounded">replay</span>
    </a>
    <ShowLoginOrMyAccount />
    <a href="#">
      <span className="material-symbols-rounded">keyboard_backspace</span>
    </a>
  </div>
  );
};

export default BottomNavBar;
