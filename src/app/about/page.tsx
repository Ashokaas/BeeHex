import Title_h1 from "@/components/title_h1/title_h1";
import Image from "next/image";
import logo_polytech from "@/app/assets/images/logo_polytech.png";

import styles from "./about.module.css";
import Spacer from "@/components/spacer/spacer";

export default function About() {
  return (
    <div className={styles.about_container}>
      <Title_h1 text="À propos" icon='info' />
      <p>
        La <a href="https://old.beehex.fr">première version</a> de ce projet a été réalisée par Théo BERGERAULT--ROTUREAU et Antonin MOREAU,
        et encadrée par M. Emmanuel NÉRON,
        lors du deuxième semestre de PeiP1 à Polytech Tours.
        La deuxième version a été développée par les mêmes étudiants au cours du deuxième semestre de PeiP2,
        encadrée cette fois par M. Nicolas MONMARCHÉ.
        <br /><br />
        Le code du projet est disponible sur <a href="https://github.com/Ashokaas/BeeHex">Github</a>.
        Le code de la première version est dans la branche <a href="https://github.com/Ashokaas/BeeHex/tree/beehex_v1">beehex_v1</a>
      </p>

      <div id="logos">
        <a href="https://beehex.fr" target="_blank" rel="noopener noreferrer">
          <Image src="/favicon.svg" alt="Logo BeeHex" width={900} height={900} />
        </a>
        <a href="https://polytech.univ-tours.fr/" target="_blank">
          <Image src="/logo_polytech.png" alt="Logo Polytech Tours" width={900} height={900} />
        </a>
      </div>

      <h2>Mentions légales</h2>
      <div className={styles.legal_section}>
        <div>
          <h3>Editeur du site</h3>
          <p>Université de Tours<br />
            60 rue du Plat d'Etain<br />
            BP 12050<br />
            37020 Tours Cedex 1<br />
            France</p>
        </div>

        <div>
          <h3>Hébergement</h3>
          <p>Le site est hébergé par la société OVH<br />
            2 rue Kellermann<br />
            59100 Roubaix<br />
            France</p>
          <br />
        </div>

        <div>
          <h3>Propriété intellectuelle</h3>
          <p>Certaines icônes sont issues de <a href="https://fonts.google.com/icons" target="_blank" rel="noopener noreferrer">Google Fonts</a>.</p>
        </div>
      </div>

      <Spacer direction="H" spacing={4} />
    </div>
  );
}
