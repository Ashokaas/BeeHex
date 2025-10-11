"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import styles from './bottom_navbar.module.css';
import 'material-symbols';

import Cookies from 'js-cookie';

// en fait pour régler mon problème il faut créer un élément pour chaque bouton mais là je vais me coucher

function MyAccountButton() {
  return (
    <Link className={styles.a} href="/new/my_account.html">
      <p>Mon compte</p>
      <span className="material-symbols-rounded">account_circle</span>
    </Link>
  );
}

function LoginRegisterButton() {
  return (
    <Link className={styles.a} href="/new/login_register.html">
      <p>Se connecter</p>
      <span className="material-symbols-rounded">login</span>
    </Link>
  );
}

function LoginWaitButton() {
  return (
    <div className={styles.a} style={{ cursor: 'wait' }}>
      <p>Chargement</p>
      <span className="material-symbols-rounded">progress_activity</span>
    </div>
  );
}


function ShowLoginOrMyAccount() {
  const [loggedIn, setLoggedIn] = useState(!!Cookies.get('userId'));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkLogin = () => setLoggedIn(!!Cookies.get('userId'));
    checkLogin();

    if (typeof window !== "undefined") {
      window?.addEventListener('cookieChange', checkLogin);
      return () =>  window?.removeEventListener('cookieChange', checkLogin);
    }
    return () => {};
    
  }, []);

  if (!isMounted) return <LoginWaitButton />; // Empêche le rendu côté serveur

  return loggedIn ? <MyAccountButton /> : <LoginRegisterButton />;
}




const BottomNavBar = () => {
  return (
    <div id={styles.bottom_nav_bar}>
    <Link className={styles.a} href="/new/home.html">
      <p>Accueil</p>
      <span className="material-symbols-rounded">home</span>
    </Link>
    <Link className={styles.a} href="/new/game_mode.html">
      <p>Jouer</p>
      <span className="material-symbols-rounded">swords</span>
    </Link>
    <Link className={styles.a} href="/new/rank.html">
      <p>Classement</p>
      <span className="material-symbols-rounded">leaderboard</span>
    </Link>
    <Link className={styles.a} href="/new/history.html">
      <p>Historique</p>
      <span className="material-symbols-rounded">replay</span>
    </Link>
    <ShowLoginOrMyAccount />
  </div>
  );
};

export default BottomNavBar;
