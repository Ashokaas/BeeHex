import React from 'react';
import styles from './button.module.css';
import 'material-symbols';

export default function BeautifulButton(props: { text: string, icon: string, link: string}) {
  return (
    <button className={styles.beautiful_button}>
      {props.icon && (
        <span className="material-symbols-rounded">{props.icon}</span>
      )}
      <span>{props.text}</span>
    </button>
  );
}