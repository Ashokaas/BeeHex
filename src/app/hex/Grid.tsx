import React, { Component } from 'react';
import styles from './hex.module.css';
import { Socket } from 'socket.io-client';

interface GridProps {
  grid_array: Array<Array<number>>;
  updateGrid: (newGrid: Array<Array<number>>) => void;
  socket: any;
  room: string;
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
    this.props.socket.emit("hexagonClicked", { x: i, y: j, room: this.props.room });

    const newGrid = this.state.grid_array.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
        rowIndex === i && cellIndex === j ? 1 : cell
      )
    );
    this.setState({ grid_array: newGrid });
    this.props.updateGrid(newGrid);
    console.log(newGrid);
  }

  render() {
    this.props.socket.on('refreshGameState', (data: { currentGame: Array<Array<number>> }) => {
      const newGrid = data.currentGame;
      this.setState({ grid_array: newGrid });
      this.props.updateGrid(newGrid);
      console.log(newGrid);
    });
    return (
      <div className={styles.grid_container}>
        {this.state.grid_array.map((row, i) => {
          return (
            <div key={i} className={styles.row}>
              {row.map((cell, j) => {
                return (
                  <div
                    key={j}
                    className={styles.hexagon}
                    onClick={() => this.handleHexagonClick(i, j)}
                    style={{ backgroundColor: cell === 1 ? "red" : "blue" }}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}
