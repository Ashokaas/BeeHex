import React, { Component } from 'react';
import styles from './hex.module.css';
import Game from './Game';

interface GridProps {
  grid_array: Array<Array<number>>;
  updateGrid: (newGrid: Array<Array<number>>) => void;
  socket: any;
  room: string;
  game: Game;
}

interface GridState {
  grid_array: Array<Array<number>>;
}

export default class ShowGrid extends Component<GridProps, GridState> {
  constructor(props: GridProps) {
    super(props);
    this.state = {
      grid_array: props.grid_array
    };
  }

  handleHexagonClick(i: number, j: number) {
    console.log("hexagon clicked");
    
    

    this.props.socket.emit("hexagonClicked", { x: i, y: j, room: this.props.room, playerWhoClicked:this.props.game.getMe() });

    const newGrid = this.state.grid_array.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        rowIndex === i && cellIndex === j ? 1 : cell
      )
    );
    this.setState({ grid_array: newGrid });
    this.props.updateGrid(newGrid);
    console.log(newGrid);
  }

  generateGrid(n: number) {
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
        if (this.state.grid_array[i][j] === 1) {
          newBackgroundColor = 'red';
        } else if (this.state.grid_array[i][j] === 2) {
          newBackgroundColor = 'blue';
        }

        const hex = (
          <div
            key={`hex-${i}-${j}`}
            className={`${styles.hexagon} ${j}-${i}`}
            onClick={() => this.handleHexagonClick(i, j)}
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

  componentDidMount() {
    this.props.socket.on('refreshGameState', (data: { currentGame: Array<Array<number>> }) => {
      const newGrid = data.currentGame;
      this.setState({ grid_array: newGrid });
      this.props.updateGrid(newGrid);
      console.log(newGrid);
    });
  }

  render() {
    return (
      <div className={styles.grid_container}>
        {this.generateGrid(this.state.grid_array.length)}
      </div>
    );
  }
}