"use client";

import Image from "next/image";
import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./hex.module.css";

import io from 'socket.io-client';
import axios from "axios";

import Cookies from 'js-cookie';

import React, { useState, useEffect, use } from 'react';

function PlayerStats(props: { name: string, timer: string }) {
  return (
    <div className={styles.player_status}>
      <h1 className={styles.player_name}>{props.name}</h1>
      <h1 className={styles.player_timer}>{props.timer}</h1>
    </div>
  );
}

function VictoryScreen(props: { winner: string }) {
  return (
    <div className={styles.victory_screen}>
      <h1 className={styles.victory_text}>Victoire de <span>{props.winner}</span></h1>
      <button>Rejouer</button>
    </div>
  );
}

function RevertButton() {
  return (
    <div className={styles.revert}>
      <button>⬅ Annuler</button>
    </div>
  );
}

function GenerateGrid(props: { sizeStr: string, socket: any }) {
  const size = parseInt(props.sizeStr);
  const rows = [];
  for (let i = 0; i < size; i++) {
    const spacers = [];
    for (let k = 0; k < i; k++) {
      spacers.push(<div key={`spacer-${k}`} className={styles.spacer} />);
    }
    const hexagons = [];
    for (let j = 0; j < size; j++) {
      const firstBorder = (
        <div
          className={styles.hexagon_border}
          style={{ transform: "scale(1.2)", backgroundColor: "rgb(27, 27, 27)" }}
          key={`first-border-${j}`}
        />
      );
      const greenHex = <div key={`green-hex-${j}`} className={styles.hexagon_border} />;
      /*if (j === 0 && i > 0 && i < size - 1) {
        greenHex.props.className += " hexagon_w_border";
      } else if (i === 0 && j > 0 && j < size - 1) {
        greenHex.props.className += " hexagon_n_border";
      } else if (j === size - 1 && i > 0 && i < size - 1) {
        greenHex.props.className += " hexagon_e_border";
      } else if (i === size - 1 && j > 0 && j < size - 1) {
        greenHex.props.className += " hexagon_s_border";
      } else if (i === 0 && j === 0) {
        greenHex.props.className += " hexagon_nw_border";
      } else if (i === 0 && j === size - 1) {
        greenHex.props.className += " hexagon_ne_border";
      } else if (i === size - 1 && j === 0) {
        greenHex.props.className += " hexagon_sw_border";
      } else if (i === size - 1 && j === size - 1) {
        greenHex.props.className += " hexagon_se_border";
      }*/
      /*classname {`hexagon ${j}-${i}`}*/
      const handleClick = () => {
        console.log(`Hexagon clicked: ${j}-${i}`);
        props.socket.emit('hexagonClicked', { x: j, y: i });
      }
      const hex = (
        <div
          className={styles.hexagon}
          onClick={handleClick}
          key={`hex-${j}`}
        />
      );
      hexagons.push(firstBorder, greenHex, hex);
    }
    const row = (
      <section key={`row-${i}`} className={styles.hexagon_row}>
        {spacers}
        {hexagons}
      </section>
    );
    rows.push(row);
  }
  return rows;
}

export default function Home() {
  const [players, setPlayers] = useState({
    player1: { name: "En attente...", timer: "X:XX" },
    player2: { name: "En attente...", timer: "X:XX" }
  });


  const socket = io('ws://localhost:3002');

  const fetchUser = async () => {
    try {
      const user = await axios.post('http://localhost:3001/me', {}, {
        headers: { 'Authorization': Cookies.get('token') }
      });
      return user.data.username;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  
  useEffect(() => {
    const initializeSocket = async () => {
      const username = await fetchUser();
      console.log(username);
      if (username) {
        socket.emit('searchGame', username);
      }

      socket.on('mise_en_relation', (data) => {
        console.log(data.message);
        console.log(data.room);
        console.log(data.clients);
      });
    };

    initializeSocket();

    
  }, []);
  return (
    <>
      <div className={styles.game_interface}>
        <div className={styles.hex_parent}>
          <section className={styles.hexagon_grid}>
            <GenerateGrid sizeStr="9" socket={socket} />
          </section>
        </div>

        <div className={styles.players}>

          <div className={styles.game_status}>
            <PlayerStats name={players.player1.name} timer={players.player1.timer} />
            <PlayerStats name={players.player2.name} timer={players.player2.timer} />
          </div>



          <div className={styles.highlightMove}>
            <div>
              <div>
                <span className="material-symbols-rounded">search</span>
                <p>Indice</p>
              </div>
            </div>
          </div>


        </div>

      </div>

    </>
  );
}
