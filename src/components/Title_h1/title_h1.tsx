import React, { useEffect, useState } from 'react';
import styles from './title_h1.module.css';
import 'material-symbols';

export default function Title_h1(props: {title: string, icon: string}) {
  return (
    <div className={styles.title_h1}>
      <h1><span className="material-symbols-rounded">{props.icon}</span>{props.title}</h1>
    </div>
  );
}
