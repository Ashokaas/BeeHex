import React from 'react';
import styles from './spacer.module.css';


/**
 * Create a horizontal or vertical space of a given size
 *
 * @param props - The properties for the Spacer component.
 * @param {string} props.type - The type of space to create. Can be H||horizontal or V||vertical.
 * @param {number} props.spacing - The size of the space to create.
 *
 * @returns The Spacer component.
 */
export default function Spacer(props: { direction: string, spacing: number }) {
  if (props.direction === "H" || props.direction === "horizontal") {
    return (
      <>
        {Array.from({ length: props.spacing }).map((_, i) => (
          <div key={i} className={styles.H_spacer}></div>
        ))}
      </>
    );
  }

  if (props.direction === "V" || props.direction === "vertical") {
    return (
      <>
        {Array.from({ length: props.spacing }).map((_, i) => (
          <div key={i} className={styles.V_spacer}></div>
        ))}
      </>
    );
  }

  return null;
}