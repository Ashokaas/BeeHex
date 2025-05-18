"use client";

import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import BeautifulButton from '@/components/button/button';
import styles from './home.module.css';
import CustomAlert from '@/components/custom_alert/custom_alert';
import { use } from 'react';
import { useState } from 'react';
import LoadingPage from '@/components/loading_page/loading_page';
import SteppedSlider from '@/components/stepped_slider/stepped_slider';
import Spacer from '@/components/spacer/spacer';

import Link from 'next/link';

export default function Home() {
	const [showAlert, setShowAlert] = useState(false);

	const handleButtonClick = () => {
		setShowAlert(true);
	};

	const handleCloseAlert = () => {
		setShowAlert(false);
	};

	const [sliderValue, setSliderValue] = useState(1);

	return (
		<>
			<div className={styles.home_content}>
				<h1>Bienvenue sur BeeHex</h1>
				<p>
					Vous pouvez ici jouer au Jeu de Hex ! Cliquez sur les boutons ci-dessous pour commencer une partie.
				</p>

				<ul>
					<li>Il est possible de jouer en local contre un ami ainsi que contre un ordinateur.</li>
					<li>Vous pouvez aussi jouer en ligne, pour cela il faut simplement créer un compte.</li>
					<li>L'analyse de partie est aussi disponible, elle permet de vous aider à progresser dans le jeu.</li>
				</ul>

				<Spacer direction='H' spacing={2} />

				<div className={styles.rules}>
					<div>
						<h2>Règles du jeu :</h2>
						<ul>
							<li>Deux joueurs s'affrontent sur un tablier hexagonal.
							</li>
							<li>Chaque joueur possède un camp/couleur (rouge ou bleu).
							</li>
							<li>Les joueurs placent chacun leur tour une pièce de leur couleur sur une case grise du tablier.
							</li>
							<li>Le but est de relier les deux cotés de sa couleur avec une chaine ininterrompu (pas necessairement droite) de pièces de sa couleur
							</li>
							<li>Le premier joueur à relier les deux cotés de sa couleur gagne la partie.
							</li>
						</ul>
					</div>

					<div className={styles.try_now}>
						<h2>Essayer maintenant !</h2>
						<Link href='/hex/l_0_5'><img src="/exemple.gif" alt="BeeHex demo" /></Link>

					</div>
				</div>




			</div>

		</>
	);
}
