import React from 'react';
import styles from './loading_page.module.css';
import BeautifulButton from '../button/button';

export default function LoadingPage(props: { onCancel: () => void }) {
  return (
    <div className={styles.loader_container}>
      <div className={styles.loader}></div>
      <p className={styles.loading_text}>Recherche d&apos;une partie...</p>
      <BeautifulButton
        text="Annuler la recherche"
        icon="close"
        type="button"
        variant="red"
        onClick={async () => props.onCancel()}
      />
    </div>
  );
}