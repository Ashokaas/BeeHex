import Image from "next/image";
import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import Head from 'next/head';

export default function Home() {
  return (
    <>
        <h1>Page de about</h1>
        <p>
            Vous pouvez ici jouer au Jeu de Hex ! Cliquez sur les boutons ci-dessous pour commencer une partie.
        </p>

        <div id="rules">
            <h2>Règles du jeu :</h2>
            <ul>
                <li>Deux joueurs s affrontent sur un tablier hexagonal.
                </li>
                <li>Chaque joueur possède un camp/couleur (rouge ou bleu).
                </li>
                <li>Les joueurs placent chacun leur tour une pièce de leur couleur sur une case grise du tablier.
                </li>
                <li>Le but est de relier les deux cotés de sa couleur avec une chaine ininterrompu (pas necessairement droite) de pièces de sa couleur
                </li>.
                <li>Le premier joueur à relier les deux cotés de sa couleur gagne la partie.
                </li>
            </ul>
        </div>
        <br/><br/>
        
        <div id="buttons">
            <button>Joueur contre Joueur<br/>Timer : 1min 30<br/>Grille : 9x9</button>
            <button>Joueur contre Ordinateur<br/>Pas de temps<br/>Grille : 5x5</button>
            <button>Joueur contre Joueur<br/>Pas de temps<br/>Grille : 7x7</button>
        </div>

        <img src="../src/svgs/logo.svg" alt="Logo"/>

        
    </>
  );
}
