"use client";

import Image from "next/image";
import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./hex.module.css";

import io from 'socket.io-client';
import axios from "axios";

import Cookies from 'js-cookie';

import React, { useState, useEffect } from 'react';

import ShowGrid from "./Grid";
import Game from "./Game";

import getEnv from "@/env/env";
import { get } from "http";

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


export default function Home() {
  const token = Cookies.get('token');
  if (!token) {
    window.location.href = '/login_register';
  }
  const [players, setPlayers] = useState({
    player1: { name: "En attente...", timer: "X:XX" },
    player2: { name: "En attente...", timer: "X:XX" }
  });

  const socket = io(`ws://${getEnv()['IP_HOST']}:3002`);

  const fetchUser = async () => {
    try {
      const user = await axios.post(`http://${getEnv()['IP_HOST']}:3001/me`, {}, {
        headers: { 'Authorization': token }
      });
      return user.data.username;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const [game, setGame] = useState(new Game(5));
  const [grid, setGrid] = useState(game.getGridArray());
  
  const [room, setRoom] = useState("");

  const updateGrid = (newGrid: Array<Array<number>>) => {
    setGrid(newGrid);
    game.setGridArray(newGrid);
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
        setRoom(data.room);
        setPlayers({
          player1: { name: data.clients[0], timer: "X:XX" },
          player2: { name: data.clients[1], timer: "X:XX" }
        });
        game.setPlayers(data.clients[0], data.clients[1]);
        game.setMe(username);
      });
    };

    initializeSocket();
  }, []);

  return (
    <>
      <div className={styles.game_interface}>
        <div className={styles.hex_parent}>
          <section className={styles.hexagon_grid}>
            <ShowGrid grid_array={grid} updateGrid={updateGrid} socket={socket} room={room} game={game} />
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
