"use client";

import React, { useState } from "react";
import styles from "./stepped_slider.module.css";
import Spacer from "../spacer/spacer";

export default function SteppedSlider(props : { size: number, sliderValue: number, setSliderValue: (value: number) => void }) {
  const steps = Array.from({ length: props.size }, (_, i) => i + 1);

  return (
    <>
    <div className={styles.container}>
      <input
        type="range"
        min="1"
        max={props.size}
        step="1"
        value={props.sliderValue}
        onChange={(e) => props.setSliderValue(Number(e.target.value))}
      />
      <div className={styles.steps}>
        {steps.map((step) => (
          <div key={step} className={styles.step}>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}