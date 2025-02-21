import React, { Component, useEffect, useState } from 'react';
import styles from './hex.module.css';
import GameInstance from './GameInstance';

interface GridProps {
  grid_array: Array<Array<number>>;
  clickCallback: (i: number, j: number) => void;
  hoverCallback: (i: number, j: number) => void;
}

interface GridState {
  grid_array: Array<Array<number>>;
}

export default function ShowGrid (props: GridProps) {
  const [gridArray, setGridArray] = useState(props.grid_array);
  const [clickCallback, setClickCallback] = useState<(i: number, j: number) => void>(() => () => {});
  const [hoverCallback, setHoverCallback] = useState<(i: number, j: number) => void>(() => () => {});
  useEffect(() => {
    console.log(props);
    setGridArray(props.grid_array);
    setClickCallback(() => props.clickCallback);
    setHoverCallback(() => props.hoverCallback);
  }, [props.grid_array, props.clickCallback, props.hoverCallback]);
  

  function handleHexagonClick(i: number, j: number) {
    console.log(`Clicked on hexagon ${i}-${j}`);
    console.log(clickCallback)
    clickCallback(i, j);
  }

  function handleHexagonHover(i: number, j: number) { // Non utilisé pour l'instant, boilerplate pour plus tard peut-être
    console.log(`Hovered on hexagon ${i}-${j}`);
    hoverCallback(i, j);
  }

  function generateGrid(n: number) {
    const grid = [];
    for (let i = 0; i < n; i++) {
      const row = [];
      for (let k = 0; k < i; k++) {
        row.push(<div key={`spacer-${i}-${k}`} className={styles.spacer}></div>);
      }
      for (let j = 0; j < n; j++) {
        const first_border = (
          <div
            key={`border-${i}-${j}`}
            className={styles.hexagon_border}
            style={{ transform: "scale(1.2)", backgroundColor: "rgb(27, 27, 27)", zIndex: 1 }}
          ></div>
        );

        const greenHexClasses = [styles.hexagon_border];
        if (j === 0 && (i > 0 && i < n - 1)) {
          greenHexClasses.push(styles.hexagon_w_border);
        } else if (i === 0 && (j > 0 && j < n - 1)) {
          greenHexClasses.push(styles.hexagon_n_border);
        } else if (j === n - 1 && (i > 0 && i < n - 1)) {
          greenHexClasses.push(styles.hexagon_e_border);
        } else if (i === n - 1 && (j > 0 && j < n - 1)) {
          greenHexClasses.push(styles.hexagon_s_border);
        } else if (i === 0 && j === 0) {
          greenHexClasses.push(styles.hexagon_nw_border);
        } else if (i === 0 && j === n - 1) {
          greenHexClasses.push(styles.hexagon_ne_border);
        } else if (i === n - 1 && j === 0) {
          greenHexClasses.push(styles.hexagon_sw_border);
        } else if (i === n - 1 && j === n - 1) {
          greenHexClasses.push(styles.hexagon_se_border);
        }

        const greenHex = (
          <div
            key={`greenHex-${i}-${j}`}
            className={greenHexClasses.join(' ')}
          ></div>
        );

        let newBackgroundColor = '';
        if (gridArray[i][j] === 1) {
          newBackgroundColor = 'red';
        } else if (gridArray[i][j] === 2) {
          newBackgroundColor = 'blue';
        }

        const hex = (
          <div
            key={`hex-${i}-${j}`}
            className={`${styles.hexagon} ${j}-${i}`}
            onClick={() => handleHexagonClick(i, j)}
            style={{ backgroundColor: newBackgroundColor }}
          ></div>
        );

        row.push(greenHex,first_border, hex);
      }
      grid.push(
        <section key={`row-${i}`} className={styles.hexagon_row}>
          {row}
        </section>
      );
    }
    return grid;
  }


  return (
    <div className={styles.grid_container}>
      {generateGrid(gridArray.length)}
    </div>
  );
  
}