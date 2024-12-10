import React from 'react';
import styles from './button.module.css';
import 'material-symbols';


/**
 * Show a beautiful button 
 *
 * @param props.text - Text to display
 * @param props.icon - Optional. material 3 icon name
 * @param props.link - Optional. link to navigate to
 * @param props.onClick - Optional. handler for click event
 *
 * @returns The BeautifulButton button
 */
export default function BeautifulButton(
  props: { 
    text: string, 
    icon?: string, 
    link?: string, 
    onClick?: (e: { preventDefault: () => void; }) => Promise<void> 
  }) {

  return (
    <button className={styles.beautiful_button} onClick={props.onClick}>
      {props.icon && (
        <span className="material-symbols-rounded">{props.icon}</span>
      )}
      <span>{props.text}</span>
    </button>
  );
}