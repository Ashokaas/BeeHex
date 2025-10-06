"use client";
import { useParams } from 'next/navigation'
import Image from "next/image";
import BottomNavBar from '../../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./hex.module.css";
import axios from "axios";

import Cookies from 'js-cookie';

import React, { useState, useEffect, use } from 'react';

import ShowGrid from "./Grid";
import GameInstance from "./GameInstance";

import getEnv from "@/env/env";
import { WebsocketHandler } from "./WebsocketHandler";
import { DatabaseGame, Game, GameStatus, ServerBoundJoinGamePacket, ServerBoundPacketType, ServerBoundPlayMovePacket, UserId, LocalGameParameters, Coordinate } from "../../definitions";
import { OfflineHandler } from './OfflineHandler';
import CustomAlert from '@/components/custom_alert/custom_alert';
import { attributeScore, basicHeuristic, Explorer, RecommendedMove, Score, SimpleGameInstance } from './Algorithm';
import SteppedSlider from '@/components/stepped_slider/stepped_slider';
import { MoveEvaluation } from '@/components/analysis_board/move_evaluation/move_evaluation';
import Title_h1 from '@/components/title_h1/title_h1';
import Spacer from '@/components/spacer/spacer';


enum GameState {
  LOADING,
  PLAYING,
  REVIEWING,
  RECONNECTING
}

type moveArray = number[][];
const explorer = new Explorer([[1, 1], [1, 1]], 5, basicHeuristic, () => {})

export function PlayerStats(props: { name: string, timer: string }) {
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
    const game = await axios.post(`https://${getEnv()['API_IP']}/get_game/${gameId}`);
    return game.data;
  } catch (error) {
    console.error('Error fetching game:', error);
  }
}

function showGrid() {
  document.getElementsByClassName(styles.hexagon_grid)[0].classList.remove(styles.hidden);
  document.getElementsByClassName(styles.loading_spinner)[0].classList.add(styles.hidden);
}

function parseGameParameters(gameId: string): LocalGameParameters | null {
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

function parseGameParametersAndMoves(gameId: string): [LocalGameParameters, moveArray] | null {
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
  const userId = Cookies.get('userId');
  const rawGameId = useParams<{ gameId: string }>().gameId;
  if (rawGameId === undefined || rawGameId === null || rawGameId === '' || rawGameId.length < 3) {
    window.location.href = '/';
  }
  let gameType: "online" | "local" | "moves";
  let gameParameters: { time_limit: number, board_size: number } | undefined | null;
  let moves: moveArray = [];
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
  const [storedMoves, setStoredMoves] = useState(moves);
  const [gameParametersState, setGameParametersState] = useState(gameParameters);
  let workingGameState: GameState = GameState.LOADING;
  let game: GameInstance | undefined = undefined;
  const [grid, setGrid] = useState([[0, 0], [0, 0]]);
  const [turn , setTurn] = useState(1);
  const [clickCallback, setClickCallback] = useState<(i: number, j: number) => void>(() => () => { });
  const [hoverCallback, setHoverCallback] = useState<(i: number, j: number) => void>(() => () => { });
  const fetchUser = async (userId: UserId) => {
    try {
      const user = await axios.get(`https://${getEnv()['API_IP']}/get_user/${userId}`, {});
      return [user.data.id, user.data.username, user.data.mmr, user.data.registration_date];
    } catch (error) {
      console.error('Error fetching user:', error);
      return [null, null, null, null];
    }
  };

  const fetchSelf = async () => {
    try {
      const user = await axios.post(`https://${getEnv()['API_IP']}/me`, {}, {
        withCredentials: true,
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

  const [showEndGameAlert, setShowEndGameAlert] = useState(false);
  const [endGameT1, setT1] = useState("Défaite/Victoire");
  const [endGameT2, setT2] = useState("Vous avez gagné");
  const [currentMoves, setCurrentMoves] = useState(moves);
  const [nextCurrentMove, setNextCurrentMove] = useState([0, 0] as Coordinate);
  const [sliderValue, setSliderValue] = useState(1);

  const [moveEvaluationScore1, setMoveEvaluationScore1] = useState(new Score(0, false));
  const [moveEvaluationScore2, setMoveEvaluationScore2] = useState(new Score(0, false));
  const [moveEvaluationScore3, setMoveEvaluationScore3] = useState(new Score(0, false));
  const [moveEvaluationScore4, setMoveEvaluationScore4] = useState(new Score(0, false));
  const [moveEvaluationMoves1, setMoveEvaluationMoves1] = useState([] as Coordinate[]);
  const [moveEvaluationMoves2, setMoveEvaluationMoves2] = useState([] as Coordinate[]);
  const [moveEvaluationMoves3, setMoveEvaluationMoves3] = useState([] as Coordinate[]);
  const [moveEvaluationMoves4, setMoveEvaluationMoves4] = useState([] as Coordinate[]);
  const [recommendedMoves, setRecommendedMoves] = useState([] as Coordinate[]);


  function reviewClickCallback(i: number, j: number) {
    setNextCurrentMove([i, j]);
  }

  function explorerCallback(moves: RecommendedMove[]) {
    if (moves.length === 1 && moves[0].coordinate[0] === -1) {
      setMoveEvaluationScore1(new Score(0, false));
      setMoveEvaluationMoves1([]);
      setMoveEvaluationScore2(new Score(0, false));
      setMoveEvaluationMoves2([]);
      setMoveEvaluationScore3(new Score(0, false));
      setMoveEvaluationMoves3([]);
      setMoveEvaluationScore4(new Score(0, false));
      setMoveEvaluationMoves4([]);
      setRecommendedMoves([]);
      return;
    }
    for (let i = 0; i < moves.length; i++) {
      
      const move = moves[i];
      if (i === 0) {
        setMoveEvaluationScore1(move.score);
        setMoveEvaluationMoves1(move.optimalRoute.slice(0, 6));
      } else if (i === 1) {
        setMoveEvaluationScore2(move.score);
        setMoveEvaluationMoves2(move.optimalRoute.slice(0, 6));
      } else if (i === 2) {
        setMoveEvaluationScore3(move.score);
        setMoveEvaluationMoves3(move.optimalRoute.slice(0, 6));
      } else if (i === 3) {
        setMoveEvaluationScore4(move.score);
        setMoveEvaluationMoves4(move.optimalRoute.slice(0, 6));
      }
    }
    setRecommendedMoves(moves.map((move) => move.optimalRoute[0])); //Crash si route vide
  }



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
            setGameParametersState(game_details.game_parameters);
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
            setStoredMoves(moves.split(' ').map((move) => {
              const move_int = parseInt(move);
              const y = Math.floor(move_int / game!!.getGridArray().length);
              const x = move_int % game!!.getGridArray().length;
              return [x, y];
            }));
            setClickCallback(() => reviewClickCallback);
            setGameState(GameState.REVIEWING);
            workingGameState = GameState.REVIEWING;
            
            if ((ownId === player1Id && status === GameStatus.FIRST_PLAYER_WIN) || (ownId === player2Id && status === GameStatus.SECOND_PLAYER_WIN)) {
              console.log('Victoire');
              setT1("Victoire");
              setT2("Vous avez gagné");
              setShowEndGameAlert(true);
            } else if ((ownId === player1Id && status === GameStatus.SECOND_PLAYER_WIN) || (ownId === player2Id && status === GameStatus.FIRST_PLAYER_WIN)) {
              console.log('Défaite');
              setT1("Défaite");
              setT2("Vous avez perdu");
              setShowEndGameAlert(true);
            } else {
              console.log('Erreur');
            }
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

          function onlineHoverCallback(i: number, j: number) { }

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
        const [ownId, ownUsername, ownMMR, ownRegistrationDate] = userId ? await fetchSelf() : [null, null, null, null]; // non enfait
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
        } else {
          setGameParametersState(gameData.gameParameters);
          setStoredMoves(gameData.moves!!.split(' ').map((move) => {
            const move_int = parseInt(move);
            const y = Math.floor(move_int / gameData.gameParameters.board_size);
            const x = move_int % gameData.gameParameters.board_size;
            return [x, y];
          }));
          setClickCallback(() => reviewClickCallback);
          setGameState(GameState.REVIEWING);
          workingGameState = GameState.REVIEWING;
        }
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
          setGameParametersState(game_details.game_parameters);
          setGrid(game_details.grid);
          showGrid();
        }

        function movePlayedCallback(x: number, y: number, turn: number, grid_array: Array<Array<number>>) {
          if (game) {
            game.updateGameState(grid_array, turn);
            setGrid(grid_array);
          }
        }

        function gameEndCallback(status: GameStatus, moves: string, winningHexagons: Array<[number, number]>) {
          console.log('Game ended', status, moves);
          setStoredMoves(moves.split(' ').map((move) => {
              const move_int = parseInt(move);
              const y = Math.floor(move_int / game!!.getGridArray().length);
              const x = move_int % game!!.getGridArray().length;
              return [x, y];
            }));
            /*
          console.log('winningHexagons', winningHexagons);
          winningHexagons.reverse();
            winningHexagons.forEach((hexagon, i) => {
            setTimeout(() => {
              const el = document.getElementsByClassName(`${hexagon[1]}-${hexagon[0]}`)[0];
              if (el) {
              el.classList.add(styles.winningHexagons);
              }
            }, 250 * (i + 1));
            });
            */
          setClickCallback(() => reviewClickCallback);
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

        function localHoverCallback(i: number, j: number) { }

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

  useEffect(() => {
    if (gameState === GameState.REVIEWING) {
      setCurrentMoves(storedMoves!!.slice(0, sliderValue - 1));
    }
  }, [sliderValue, gameState]);

  useEffect(() => {
    if (gameState === GameState.REVIEWING) {
      const ggrid = new Array(gameParametersState?.board_size).fill(0).map(() => new Array(gameParametersState?.board_size).fill(0));
      for (let i = 0; i < currentMoves.length; i++) {
        const move = currentMoves[i];
        ggrid[move[0]][move[1]] = i % 2 === 0 ? 1 : 2;
      }
      setGrid(ggrid);
      console.log(ggrid, currentMoves);
      explorer.setGame(ggrid, currentMoves.length + 1, basicHeuristic, explorerCallback)
    }
  }, [gameState, currentMoves]);

  useEffect(() => {
    setTurn(grid.join("").replaceAll("0", "").length + 1);
  }, [grid]);

  useEffect(() => {
    if (gameState === GameState.REVIEWING) {
      if (grid[nextCurrentMove[0]][nextCurrentMove[1]] === 0) {
          setCurrentMoves(currentMoves.concat([nextCurrentMove]));
      }
    }
  }, [nextCurrentMove]);

  return (
    <>
      {showEndGameAlert
        &&
        <CustomAlert
          text1={endGameT1}
          text2={endGameT2}
          icon={endGameT1 === "Victoire" ? "trophy" : "close"}
          type={endGameT1 === "Victoire" ? "good" : "bad"}
          onClick={() => setShowEndGameAlert(false)}
        />}
      {gameState != GameState.REVIEWING &&
      <div className={styles.game_interface}>
        <div className={styles.hex_parent}>
          <section className={`${styles.hexagon_grid} ${styles.hidden}`}>
            <ShowGrid grid_array={grid} turn={turn} recommendedMoves={recommendedMoves}  clickCallback={clickCallback} hoverCallback={hoverCallback} />
          </section>
          <div className={styles.loading_spinner}></div>
        </div>

        <div className={styles.players}>
          <div className={styles.game_status}>
            <PlayerStats name={players.player1.name} timer={players.player1.timer} />
            <PlayerStats name={players.player2.name} timer={players.player2.timer} />
          </div>

          
        </div>
      </div>
      }

      {gameState === GameState.REVIEWING &&
      <div className={styles.game_interface}>
        <div className={styles.hex_parent}>
          <section className={`${styles.hexagon_grid} ${styles.hidden}`}>
            <ShowGrid grid_array={grid} turn={turn} recommendedMoves={recommendedMoves} clickCallback={clickCallback} hoverCallback={hoverCallback} />
          </section>
          <div className={styles.loading_spinner}></div>
          <div className={styles.stepped_slider_container}>
            <SteppedSlider size={storedMoves.length + 1} sliderValue={sliderValue} setSliderValue={setSliderValue} />
          </div>
        </div>
        <div className={styles.players}>
          <Spacer spacing={2} direction='H' />
          <h2>Ordinateur</h2>
          <Spacer spacing={2} direction='H' />
          <MoveEvaluation index={0} turn={turn} Evaluation={moveEvaluationScore1} nextMoves={moveEvaluationMoves1} onClick={oui} onHover={oui} onLeave={oui}/>
          <MoveEvaluation index={1} turn={turn} Evaluation={moveEvaluationScore2} nextMoves={moveEvaluationMoves2} onClick={oui} onHover={oui} onLeave={oui}/>
          <MoveEvaluation index={2} turn={turn} Evaluation={moveEvaluationScore3} nextMoves={moveEvaluationMoves3} onClick={oui} onHover={oui} onLeave={oui}/>
          <MoveEvaluation index={3} turn={turn} Evaluation={moveEvaluationScore4} nextMoves={moveEvaluationMoves4} onClick={oui} onHover={oui} onLeave={oui}/>
          <Spacer spacing={2} direction='H' />
          
        </div>
      </div>}
    </>
  );
}
function oui(i:number) {
  console.log("oui");
  }