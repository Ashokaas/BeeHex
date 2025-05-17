"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import styles from './bottom_navbar.module.css';
import 'material-symbols';

import Cookies from 'js-cookie';

// en fait pour régler mon problème il faut créer un élément pour chaque bouton mais là je vais me coucher

function MyAccountButton() {
  return (
    <Link className={styles.a} href="/my_account">
      <p>Mon compte</p>
      <span className="material-symbols-rounded">account_circle</span>
    </Link>
  );
}

function LoginRegisterButton() {
  return (
    <Link className={styles.a} href="/login_register">
      <p>Se connecter</p>
      <span className="material-symbols-rounded">login</span>
    </Link>
  );
}


function ShowLoginOrMyAccount() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkLogin = () => setLoggedIn(!!Cookies.get('token'));
    checkLogin();

    window.addEventListener('cookieChange', checkLogin);
    return () => window.removeEventListener('cookieChange', checkLogin);
  }, []);

  if (!isMounted) return null; // Empêche le rendu côté serveur

  return loggedIn ? <MyAccountButton /> : <LoginRegisterButton />;
}




const BottomNavBar = () => {
  return (
    <div id={styles.bottom_nav_bar}>
    <Link className={styles.a} href="/">
      <p>Accueil</p>
      <span className="material-symbols-rounded">home</span>
    </Link>
    <Link className={styles.a} href="/game_mode">
      <p>Jouer</p>
      <span className="material-symbols-rounded">swords</span>
    </Link>
    <Link className={styles.a} href="/rank">
      <p>Classement</p>
      <span className="material-symbols-rounded">leaderboard</span>
    </Link>
    <Link className={styles.a} href="#">
      <p>Historique</p>
      <span className="material-symbols-rounded">replay</span>
    </Link>
    <ShowLoginOrMyAccount />
  </div>
  );
};

export default BottomNavBar;
