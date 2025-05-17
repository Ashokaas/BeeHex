"use client";

import React, { useState } from 'react';
import styles from './custom_alert.module.css';
import 'material-symbols';
import BeautifulButton from '../button/button';
import Spacer from '../spacer/spacer';

export default function CustomAlert(
  props: {
    icon?: string,
    text1: string,
    text2: string,
    type?: "good" | "bad" | "neutral",
    onClick?: (e: { preventDefault: () => void; }) => Promise<void>
  }) {
  const [isVisible, setIsVisible] = useState(true);

  const iconColor = props.type === "good"
    ? "green"
    : props.type === "bad"
      ? "red"
      : "gray";

  return (
    <div className={styles.container}>
      <div className={styles.custom_alert}>
        {props.icon && (
          <span
            className="material-symbols-rounded"
            style={{ color: iconColor }}
          >
            {props.icon}
          </span>
        )}
        <p className={styles.t1}>{props.text1}</p>
        <p className={styles.t2}>{props.text2}</p>
        <Spacer direction='H' spacing={2} />
        <BeautifulButton text="OK" type="button" onClick={async (e) => {
          e.preventDefault();
          if (props.onClick) { await props.onClick(e); }
          setIsVisible(false);
        }}
        />
        <Spacer direction='H' spacing={1} />
      </div>
    </div>
  );
}