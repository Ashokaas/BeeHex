"use client";

import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import BeautifulButton from '@/components/button/button';
import styles from './home.module.css';
import CustomAlert from '@/components/custom_alert/custom_alert';
import { use } from 'react';
import { useState } from 'react';
import LoadingPage from '@/components/loading_page/loading_page';

export default function Home() {
	const [showAlert, setShowAlert] = useState(false);

	const handleButtonClick = () => {
		setShowAlert(true);
	};

	const handleCloseAlert = () => {
		setShowAlert(false);
	};

	return (
		<>
			<div className={styles.home_content}>
				<h1>Bienvenue sur BeeHex</h1>
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
				<br /><br />

				<div id="buttons">
					<BeautifulButton text="Joueur contre grosse patate bleue" icon="people" link="" />
				</div>

				<img src="../src/svgs/logo.svg" alt="Logo" />

				{showAlert && (
					<CustomAlert
						text1="Alerte"
						text2="Ceci est une alerte"
						type="neutral"
						onClick={handleCloseAlert}
					/>
				)}
				<BeautifulButton text="Afficher une alerte" onClick={handleButtonClick} />

			</div>

		</>
	);
}
