"use client";
import { useParams } from 'next/navigation'
import Image from "next/image";
import BottomNavBar from '../../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./hex.module.css";
import axios from "axios";

import Cookies from 'js-cookie';

import React, { useState, useEffect } from 'react';

import ShowGrid from "./Grid";
import GameInstance from "./GameInstance";

import getEnv from "@/env/env";
import { get } from "http";
import { WebsocketHandler } from "./WebsocketHandler";
import { DatabaseGame, Game, GameStatus, ServerBoundJoinGamePacket, ServerBoundPacketType, ServerBoundPlayMovePacket, UserId, LocalGameParameters } from "./definitions";
import { time } from 'console';
import { OfflineHandler } from './OfflineHandler';

enum GameState {
  LOADING,
  PLAYING,
  REVIEWING,
  RECONNECTING
}

type moveArray = number[][];

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

async function fetchGame(gameId: string) {
  try {
    const game = await axios.post(`http://${getEnv()['IP_HOST']}:3001/get_game/${gameId}`);
    return game.data;
  } catch (error) {
    console.error('Error fetching game:', error);
  }
}

function showGrid() {
  document.getElementsByClassName(styles.hexagon_grid)[0].classList.remove(styles.hidden);
  document.getElementsByClassName(styles.loading_spinner)[0].classList.add(styles.hidden);
}

function parseGameParameters(gameId: string) : LocalGameParameters | null {
  const parameters = gameId.split('_');
  if (parameters.length != 2) {
    return null;
  }
  const raw_time_limit = parameters[0];
  const time_limit = parseInt(raw_time_limit);
  const raw_board_size = parameters[1];
  const board_size = parseInt(raw_board_size);
  return { time_limit, board_size };
}

function parseGameParametersAndMoves(gameId: string) : [ LocalGameParameters, moveArray ] | null {
  const mixed = gameId.split('_');
  if (mixed.length != 3) {
    return null;
  }
  const raw_time_limit = mixed[0];
  const time_limit = parseInt(raw_time_limit);
  const raw_board_size = mixed[1];
  const board_size = parseInt(raw_board_size);
  const raw_moves = mixed[2].split('-');
  const game_parameters = { time_limit, board_size };
  const moves = raw_moves.map((move) => {
    const move_int = parseInt(move);
    const y = Math.floor(move_int / board_size);
    const x = move_int % board_size;
    return [x, y];
  });
  return [game_parameters, moves];


  
}

export default function Home() {
  const token = Cookies.get('token');
  const rawGameId = useParams<{gameId: string}>().gameId;
  if (rawGameId === undefined || rawGameId === null || rawGameId === '' || rawGameId.length < 3) {
    window.location.href = '/';
  }
  let gameType: "online" | "local" | "moves";
  let gameParameters: { time_limit: number, board_size: number } | undefined | null;
  let moves: moveArray | undefined | null;
  const gameId = rawGameId.substring(2);
  if (rawGameId.startsWith("o_")) {
    //Online
    gameType = "online";
    
  }
  else if (rawGameId.startsWith("l_")) {
    //Local
    gameType = "local";
    gameParameters = parseGameParameters(gameId);
    if (!gameParameters) {
      window.location.href = '/';
    }
    
  }
  else if (rawGameId.startsWith("m_")) {
    //From moves
    gameType = "moves";
    const gameParametersAndMoves = parseGameParametersAndMoves(gameId);
    if (!gameParametersAndMoves) {
      window.location.href = '/';
      
    } else {
      [gameParameters, moves] = gameParametersAndMoves;
    }
  }
  else {
    //Error
    window.location.href = '/';
  }
  const [gameState, setGameState] = useState(GameState.LOADING);
  let workingGameState: GameState = GameState.LOADING;
  let game: GameInstance|undefined = undefined;
  const [grid, setGrid] = useState([[0, 0], [0, 0]]);

  const [clickCallback, setClickCallback] = useState<(i: number, j: number) => void>(() => () => {});
  const [hoverCallback, setHoverCallback] = useState<(i: number, j: number) => void>(() => () => {});
  const fetchUser = async (userId: UserId) => {
    try {
      const user = await axios.get(`http://${getEnv()['IP_HOST']}:3001/get_user/${userId}`, {});
      return [user.data.id, user.data.username, user.data.mmr, user.data.registration_date];
    } catch (error) {
      console.error('Error fetching user:', error);
      return [null, null, null, null];
    }
  };

  const fetchSelf = async () => {
    try {
      const user = await axios.post(`http://${getEnv()['IP_HOST']}:3001/me`, {}, {
        headers: {'Authorization': token }
      });
      return [user.data.id, user.data.username, user.data.mmr, user.data.registration_date];
    } catch (error) {
      console.error('Error fetching self:', error);
      return [null, null, null, null];
    }
  }
  const [players, setPlayers] = useState({
    player1: { name: "En attente...", timer: "X:XX" },
    player2: { name: "En attente...", timer: "X:XX" }
  });

  
  
  

  
  useEffect(() => {
    
    async function initialize() {
      async function onlineGamePreInitialize() {
        
        async function onlineGameInitialize() {
          
          function errorCallback(message: string) {
            console.error(message);
          }
          
          function gameSearchCallback(game_parameters: any, player_count: number, elo_range: [number, number]) { // Inutilisé ici, destiné à la page de recherche de jeu
            console.log(game_parameters, player_count, elo_range);
          }
          
          function gameFoundCallback(game_id: any) { 
            // Inutilisé ici, destiné à la page de recherche de jeu
          }
          
          function joinGameCallback(game_details: Game) {
            setGameState(GameState.PLAYING);
            workingGameState = GameState.PLAYING;
            game = GameInstance.fromGame(game_details, ownId);
            setGrid(game_details.grid);
            showGrid();
          }
          
          function movePlayedCallback(x: number, y: number, turn: number, grid_array: Array<Array<number>>) {
            if (game) {
              game.updateGameState(grid_array, turn);
              setGrid(grid_array);
            }
          }

          function gameEndCallback(status: GameStatus, moves: string) {
            console.log('Game ended', status, moves);
            setGameState(GameState.REVIEWING);
            workingGameState = GameState.REVIEWING;
          }
        
          function connectionEndedCallback() {
            console.log('Connection ended');
            if (workingGameState === GameState.PLAYING) {
              setGameState(GameState.RECONNECTING);
              workingGameState = GameState.RECONNECTING;
              onlineGameInitialize();
            }
          }

          function onlineClickCallback(i: number, j: number) {
            if (workingGameState === GameState.PLAYING && game && game.isTurnOf(ownId) && game.isValidMove(i, j)) {
              websocketHandler.sendPacket({
                type: ServerBoundPacketType.PLAY_MOVE,
                x: i,
                y: j
              } as ServerBoundPlayMovePacket);
            }
          }

          function onlineHoverCallback(i: number, j: number) {}

          let websocketHandler = await new WebsocketHandler({
            errorCallback,
            gameSearchCallback,
            gameFoundCallback,
            joinGameCallback,
            movePlayedCallback,
            gameEndCallback,
            connectionEndedCallback
          }).awaitConnection();
          
          websocketHandler.sendPacket({
            type: ServerBoundPacketType.JOIN_GAME,
            game_id: gameId
          } as ServerBoundJoinGamePacket);

          setClickCallback(() => onlineClickCallback);
          setHoverCallback(() => onlineHoverCallback);
        }
        const [ownId, ownUsername, ownMMR, ownRegistrationDate] = token ? await fetchSelf() : [null, null, null, null] ; // non enfait
        const gameData: DatabaseGame = await fetchGame(gameId);
        if (!gameData) {
          console.error('Game not found');
          window.location.href = '/';
        }

        const [player1Id, player1Username, player1MMR, player1RegistrationDate] = await fetchUser(gameData.firstPlayerId);
        const [player2Id, player2Username, player2MMR, player2RegistrationDate] = await fetchUser(gameData.secondPlayerId);

        setPlayers({
          player1: { name: player1Username, timer: "X:XX" },
          player2: { name: player2Username, timer: "X:XX" }
        });
        if (gameData.status === GameStatus.IN_PROGRESS) {
          onlineGameInitialize();
          return;
        }
        setGameState(GameState.REVIEWING);
        workingGameState = GameState.REVIEWING;
        console.error('NOT IMPLEMENTED');
        return;
      };

      async function localInitialize() {
        const ownId = "1";
        function errorCallback(message: string) {
          console.error(message);
        }
        
        function gameSearchCallback(game_parameters: any, player_count: number, elo_range: [number, number]) { // Inutilisé ici, destiné à la page de recherche de jeu
          console.log(game_parameters, player_count, elo_range);
        }
        
        function gameFoundCallback(game_id: any) { 
          // Inutilisé ici, destiné à la page de recherche de jeu
        }
        
        function joinGameCallback(game_details: Game) {
          setGameState(GameState.PLAYING);
          workingGameState = GameState.PLAYING;
          game = GameInstance.fromGame(game_details, ownId);
          setGrid(game_details.grid);
          showGrid();
        }
        
        function movePlayedCallback(x: number, y: number, turn: number, grid_array: Array<Array<number>>) {
          if (game) {
            game.updateGameState(grid_array, turn);
            setGrid(grid_array);
          }
        }

        function gameEndCallback(status: GameStatus, moves: string) {
          console.log('Game ended', status, moves);
          setGameState(GameState.REVIEWING);
          workingGameState = GameState.REVIEWING;
        }
      
        function connectionEndedCallback() {
          // Inutilisé
        }
        
        function localClickCallback(i: number, j: number) {
          if (workingGameState === GameState.PLAYING && game && game.isValidMove(i, j)) {
            offlineHandler.sendPacket({
              type: ServerBoundPacketType.PLAY_MOVE,
              x: i,
              y: j
            } as ServerBoundPlayMovePacket);
          }
        }

        function localHoverCallback(i: number, j: number) {}
        
        let offlineHandler = await new OfflineHandler({
          errorCallback,
          gameSearchCallback,
          gameFoundCallback,
          joinGameCallback,
          movePlayedCallback,
          gameEndCallback,
          connectionEndedCallback
        }, gameParameters!!).awaitConnection();

        offlineHandler.sendPacket({
          type: ServerBoundPacketType.JOIN_GAME,
          game_id: "offline"
        } as ServerBoundJoinGamePacket);
        setClickCallback(() => localClickCallback);
        setHoverCallback(() => localHoverCallback);
        setPlayers({
          player1: { name: "Joueur 1", timer: "X:XX" },
          player2: { name: "Joueur 2", timer: "X:XX" }
        });
      }


      if (gameType === "online") {
        onlineGamePreInitialize();
      }
      else if (gameType === "local") {
        localInitialize();
      }

    };

    initialize();
  }, []); // L'array vide signifie que cette fonction ne s'exécute qu'une seule fois

  return (
    <>
      <div className={styles.game_interface}>
        <div className={styles.hex_parent}>
          <section className={`${styles.hexagon_grid} ${styles.hidden}`}>
            <ShowGrid grid_array={grid} clickCallback={clickCallback} hoverCallback={hoverCallback} />
          </section>
          <div className={styles.loading_spinner}></div>
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
