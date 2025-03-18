import React from 'react';
import styles from './loading_page.module.css';
import Spacer from '../spacer/spacer';

export default function LoadingPage() {
  return (
    <div className={styles.loader_container}>
    <div className={styles.loader}></div>
    <p className={styles.loading_text}>Recherche d'une partie...</p>
    </div>
  );
}