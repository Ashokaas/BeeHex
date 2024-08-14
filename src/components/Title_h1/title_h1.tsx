import React, { useEffect, useState } from 'react';
import styles from './bottom_navbar.module.css';
import 'material-symbols';






export default function Title_h1() {
  return (
    <div id={styles.title_h1}>
      <span className="material-symbols-rounded">home</span>
      <h1>Classement</h1>
    </div>
  );
}
