"use client";
import Image from "next/image";
import BottomNavBar from '../../../components/bottom_navbar/bottom_navbar';
import Head from 'next/head';
import Title_h1 from "@/components/title_h1/title_h1";
import BeautifulButton from "@/components/button/button";
import React, { use, useEffect, useState } from 'react';
import InputText from "@/components/input_text/input_text";
import styles from './game_mode.module.css'
import Spacer from "@/components/spacer/spacer";
import { BOARD_SIZES, Game, ServerBoundGameSearchPacket, ServerBoundJoinRoomPacket, ServerBoundPacketType, TIME_LIMITS } from "../../definitions";
import { WebsocketHandler } from "./WebsocketHandler";
import LoadingPage from "@/components/loading_page/loading_page";
import { redirect, RedirectType, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import getEnv from "@/env/env";


type GameArr = {
  gameId: string;
  firstPlayerId: string;
  EloChangeFirstPlayer: number;
  EloChangeSecondPlayer: number;
  mmrAfterGame: number;
  opponentUsername: string;
  gameDate: string;
  moves: string;
};
/*
  * Create a radio button group
  *
  * @param props - The properties for the RadioButton component.
  * @param {string} props.title - The title of the radio button group.
  * @param {string} props.varName - The name of the variable to set.
  * @param {string[]} props.values - The values for the radio buttons.
  * @param {function} props.setVar - The function to set the variable.
  *
  * @returns The RadioButton component.
  */

function RadioButton(props:
  {
    title: string,
    varName: string,
    values: string[],
    setVar: (value: string) => void
  }) {
  return (
    <div>
      <p>{props.title} : </p>
      <Spacer direction="H" spacing={2} />
      <div className={styles.radio_buttons}>
        {props.values.map((value) => {
          return (
            <label key={value}>
              <input
                type="radio"
                value={value}
                checked={props.varName === value}
                onChange={(e) => { props.setVar(e.target.value); }}
              />
              {value}
            </label>
          )
        })}
      </div>
    </div>
  )
}




export default function Home() {
  const time_limits_str = TIME_LIMITS.map((time) => { return time.toString() });
  const board_sizes_str = BOARD_SIZES.map((size) => { return size.toString() });
  const [gameType, setGameType] = useState("Normal");
  const [gameMode, setGameMode] = useState("Normal");
  const [timeLimit, setTimeLimit] = useState(time_limits_str[0]);
  const [boardSize, setBoardSize] = useState(board_sizes_str[0]);
  const [gameF, setGameF] = useState("Chercher une partie");
  const [gameCode, setGameCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const [isSearchingGame, setIsSearchingGame] = useState(false);

  const [gamesArr, setGamesArr] = useState<GameArr[]>([]);
  const router = useRouter();

  const fetchUserLastGames = async () => {
    const userId = Cookies.get('userId');
    if (!userId) {
      
      return;
    }
    try {
      const gamesRes = await axios.get(`https://${getEnv()['API_IP']}/get_games_by_user/${userId}`);
      setGamesArr(gamesRes.data);
      
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };



  useEffect(() => {
    fetchUserLastGames();
  }, []);





  /* convert letters to numbers */
  const numbers = { "&": 1, "é": 2, "\"": 3, "'": 4, "(": 5, "-": 6, "è": 7, "_": 8, "ç": 9, "à": 0 };
  useEffect(() => {
    if (gameCode[gameCode.length - 1] in numbers) {
      const lastChar = gameCode[gameCode.length - 1] as keyof typeof numbers;
      if (lastChar in numbers) {
        setGameCode(gameCode.slice(0, -1) + numbers[lastChar]);
      }
    }
  }, [gameCode]);

  /* if game type is ranked, then the user can't play with a friend */
  useEffect(() => {
    if (gameType === "Classé" || gameType === "Hors-Ligne") {
      setGameF("Chercher une partie");
    }
  }, [gameType]);

  /* if the user wants to play with a friend, then he can't play in ranked */
  useEffect(() => {
    if (gameF === "Partie privée") {
      setGameType("Normal");
    }
    if (gameF === "Partie privée") {
      setShowCodeInput(true);

    } else {
      setShowCodeInput(false);
    }
  }, [gameF]);

  const handleValidationButton = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    
    
    
    
    

    if (gameType === "Hors-Ligne") {
      router.push(`/new/hex.html?id=l_${timeLimit.toString()}_${boardSize.toString()}`);
    }
    async function onlineSearchInitialize() {

      function errorCallback(message: string) {
        console.error(message);
        setIsSearchingGame(false);
      }

      function gameSearchCallback(game_parameters: any, player_count: number, elo_range: [number, number]) {
        
      }

      function gameFoundCallback(game_id: any) {
        router.push(`/new/hex.html?id=o_${game_id}`);
      }

      function joinGameCallback(game_details: Game) { }

      function movePlayedCallback(x: number, y: number, turn: number, grid_array: Array<Array<number>>) { }

      function connectionEndedCallback() {
        console.error('Connection ended');
        setIsSearchingGame(false);
      }

      function clickCallback(i: number, j: number) { }

      function hoverCallback(i: number, j: number) { }

      let websocketHandler = await new WebsocketHandler({
        errorCallback,
        gameSearchCallback,
        gameFoundCallback,
        joinGameCallback,
        movePlayedCallback,
        connectionEndedCallback
      }).awaitConnection();
      if (gameF === "Partie privée") {
        websocketHandler.sendPacket({
          type: ServerBoundPacketType.JOIN_ROOM,
          room_id: gameCode,
          game_parameters: {
            time_limit: parseInt(timeLimit),
            board_size: parseInt(boardSize),
            ranked: false
          }
        } as ServerBoundJoinRoomPacket);
      } else {
      websocketHandler.sendPacket({
        type: ServerBoundPacketType.GAME_SEARCH,
        game_parameters: {
          time_limit: parseInt(timeLimit),
          board_size: parseInt(boardSize),
          ranked: gameType === "Classé",
        }
      } as ServerBoundGameSearchPacket);
    }

      // cherche une game
      setIsSearchingGame(true);
    }
    onlineSearchInitialize();
  }

  return (
    <div className={styles.main_container}>
      {isSearchingGame && <LoadingPage />}
      <div className={styles.left_container}>
        <Title_h1 text="Mode de jeu" icon="joystick" />
        <div>
          <RadioButton
            title="Choisir le type de partie"
            varName={gameType}
            values={["Normal", "Classé", "Hors-Ligne"]}
            setVar={setGameType}
          />
          <Spacer direction="H" spacing={3} />

          <RadioButton
            title="Temps limite (en secondes)"
            varName={timeLimit}
            values={time_limits_str}
            setVar={setTimeLimit}
          />

          <Spacer direction="H" spacing={3} />

          <RadioButton
            title="Taille du plateau"
            varName={boardSize}
            values={board_sizes_str}
            setVar={setBoardSize}
          />

          {/* <RadioButton
            title="Mode de jeu"
            varName={gameMode}
            values={["Normal", "Bombe", "-1", "Invisible"]}
            setVar={setGameMode}
          /> */}

          <Spacer direction="H" spacing={3} />
          <RadioButton
            title="Avec qui jouer ?"
            varName={gameF}
            values={["Chercher une partie", "Partie privée"]}
            setVar={setGameF}
          />
          <Spacer direction="H" spacing={3} />
          {showCodeInput && (
            <>
              <InputText
                description="Code de la partie"
                placeholder="Code de la partie"
                autoComplete="off"
                value={gameCode}
                onChange={(e) => { setGameCode(e.target.value) }}
              />
              <Spacer direction="H" spacing={3} />
            </>
          )}
          <BeautifulButton text="Jouer" onClick={handleValidationButton} />
        </div>
      </div>

      <div className={styles.right_container}>
        <Title_h1 text="Dernières parties" />
        <div className={styles.history_content}>
          {gamesArr.length === 0 ? (
            <div className={styles.current_mmr}>
                <b>Aucune partie récente/Vous n'êtes pas connecté</b>
                
            </div>
          ) : (
            <>
              <div className={styles.current_mmr}>
                <b>MMR actuel : {gamesArr[0].mmrAfterGame}</b>
              </div>
              {gamesArr.slice(0, 5).map((game) => {
                const userId = Cookies.get('userId');
                const isFirstPlayer = game.firstPlayerId === userId;
                const victory = (isFirstPlayer && game.EloChangeFirstPlayer > 0) || (!isFirstPlayer && game.EloChangeSecondPlayer > 0);
                const mmrChange = isFirstPlayer ? game.EloChangeFirstPlayer : game.EloChangeSecondPlayer;
                const opponentUsername = game.opponentUsername || "Unknown";
                return (
                  <div className={styles.history_item} key={game.gameId}>
                    <div className={styles.history_item_title}>
                      <span className={victory ? styles.title_win : styles.title_lose}>
                        {victory ? "Victoire" : "Défaite"}
                      </span>
                      &nbsp;VS&nbsp;
                      <span>{opponentUsername}</span>
                    </div>
                    <div className={styles.history_item_content_text}>
                      <span className={victory ? styles.mmr_win : styles.mmr_lose}>
                        {mmrChange > 0 ? "+" : ""}{mmrChange} MMR
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

    </div>
  )
}
