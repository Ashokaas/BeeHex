import React from "react";
import Head from 'next/head';

export default function DefaultHead() {
  return (
    <Head>
      <meta charSet="utf-8" />
      <title>Beehex</title>
      <link rel="canonical" href="https://beehex.fr" />

      <meta name="description" content="Jouez au jeu de Hex en ligne !" />
      <meta name="keywords" content="hex, jeu, strategie, plateau, hexagone, jeu de hex" />
      <meta name="author" content="Beehex" />

      <meta property="og:title" content="Beehex" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://beehex.fr" />
      <meta property="og:description" content="Jouez au jeu de Hex en ligne !" />

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    </Head>
  );
};

