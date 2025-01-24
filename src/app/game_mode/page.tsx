import Image from "next/image";
import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import Head from 'next/head';
import Title_h1 from "@/components/title_h1/title_h1";

import styles from './game_mode.module.css'

export default function Home() {
  return (
    <div className={styles.main_container}>
      <div>
        <Title_h1 text="Mode de jeu" icon="joystick" />
        <div>
          <div>
            <p>Type : </p>
            <div className={styles.radio_buttons}>
              <div>Normal</div>
              <div>Classé</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right_container}>
        <Title_h1 text="Dernières parties" />
      </div>

    </div>
  )
}