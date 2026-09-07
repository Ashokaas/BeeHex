import React from 'react';
import styles from './input_text.module.css';
import Spacer from '../spacer/spacer';


/**
 * InputText component renders a text input field with a description and spacer.
 *
 * @param {string} props.description - The description text displayed above the input field.
 * @param {string} props.placeholder - The placeholder text for the input field.
 * @param {string} props.autoComplete - The autocomplete attribute for the input field (on/off).
 * @param {string} props.value - The variable to bind the input value to.
 * @param {function} props.onChange - The function to call when the input value changes.
 *
 * @returns {JSX.Element} The rendered InputText component.
 */
export default function InputText(
  props: {
    description: string,
    placeholder: string,
    autoComplete: string,
    value: string,
    type?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  }) {

  return (
    <div className={styles.container}>
      <p>{props.description} :</p>
      <Spacer direction='H' spacing={1} />
      <div className={styles.input_parent}>
        <div>
          <input
            type={props.type}
            className="input"
            placeholder={props.placeholder}
            autoComplete={props.autoComplete}
            value={props.value}
            onChange={props.onChange}
          />
        </div>
      </div>
    </div>
  );
}

