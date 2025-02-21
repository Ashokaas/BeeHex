"use client";
import Image from "next/image";
import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import Head from 'next/head';
import Title_h1 from "@/components/title_h1/title_h1";
import BeautifulButton from "@/components/button/button";
import React, { use, useEffect, useState } from 'react';
import InputText from "@/components/input_text/input_text";
import styles from './game_mode.module.css'
import Spacer from "@/components/spacer/spacer";
import { Game, ServerBoundGameSearchPacket, ServerBoundPacketType } from "./definitions";
import { WebsocketHandler } from "./WebsocketHandler";
import { on } from "events";


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
  const [gameType, setGameType] = useState("Normal");
  const [gameMode, setGameMode] = useState("Normal");
  const [gameF, setGameF] = useState("Chercher une partie");
  const [gameCode, setGameCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  /* convert letters to numbers */
  const numbers = {"&": 1, "é": 2, "\"": 3, "'": 4, "(": 5, "-": 6, "è": 7, "_": 8, "ç": 9, "à": 0};
  useEffect(() => {
    if (gameCode[gameCode.length-1] in numbers) {
      const lastChar = gameCode[gameCode.length - 1] as keyof typeof numbers;
      if (lastChar in numbers) {
        setGameCode(gameCode.slice(0, -1) + numbers[lastChar]);
      }
    }
  }, [gameCode]);

  /* if game type is ranked, then the user can't play with a friend */
  useEffect(() => {
    if (gameType === "Classé") {
      setGameF("Chercher une partie");
    }
  }, [gameType]);

  /* if the user wants to play with a friend, then he can't play in ranked */
  useEffect(() => {
    if (gameF === "Créer une partie (avec un ami)" || gameF === "Rejoindre un ami") {
      setGameType("Normal");
    }
    if (gameF === "Rejoindre un ami") {
      setShowCodeInput(true);
      
    } else {
      setShowCodeInput(false);
    }
  }, [gameF]);

  const handleValidationButton = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Game type : " + gameType);
    console.log("Game mode : " + gameMode);
    console.log("Game with : " + gameF);
    console.log("Game code : " + gameCode);

    async function onlineSearchInitialize() {
      
      function errorCallback(message: string) {
        console.error(message);
      }
      
      function gameSearchCallback(game_parameters: any, player_count: number, elo_range: [number, number]) {
        console.log(game_parameters, player_count, elo_range);
      }
      
      function gameFoundCallback(game_id: any) {
        window.location.href = `/hex/${game_id}`;
      }
      
      function joinGameCallback(game_details: Game) {}
      
      function movePlayedCallback(x: number, y: number, turn: number, grid_array: Array<Array<number>>) {}
    
      function connectionEndedCallback() {
        console.error('Connection ended');
        onlineSearchInitialize();
      }

      function clickCallback(i: number, j: number) {}

      function hoverCallback(i: number, j: number) {}

      let websocketHandler = await new WebsocketHandler({
        errorCallback,
        gameSearchCallback,
        gameFoundCallback,
        joinGameCallback,
        movePlayedCallback,
        connectionEndedCallback
      }).awaitConnection();
      
      websocketHandler.sendPacket({
        type: ServerBoundPacketType.GAME_SEARCH,
        game_parameters: {
          time_limit: 0,
          board_size: 7,
          ranked: gameType === "Classé",
        }} as ServerBoundGameSearchPacket);
    }
    onlineSearchInitialize();
}

  return (
    <div className={styles.main_container}>
      <div className={styles.left_container}>
        <Title_h1 text="Mode de jeu" icon="joystick" />
        <div>
          <RadioButton
            title="Choisir le type de partie"
            varName={gameType}
            values={["Normal", "Classé"]}
            setVar={setGameType}
          />
          <Spacer direction="H" spacing={3} />
          <RadioButton
            title="Mode de jeu"
            varName={gameMode}
            values={["Normal", "Bombe", "-1", "Invisible"]}
            setVar={setGameMode}
          />
          <Spacer direction="H" spacing={3} />
          <RadioButton
            title="Avec qui jouer ?"
            varName={gameF}
            values={["Chercher une partie", "Créer une partie (avec un ami)", "Rejoindre un ami"]}
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
              onChange={(e) => {setGameCode(e.target.value)}}
            />
            <Spacer direction="H" spacing={3} />
            </>
          )}
          <BeautifulButton text="Jouer" onClick={handleValidationButton} />
        </div>
      </div>

      <div className={styles.right_container}>
        <Title_h1 text="Dernières parties" />
      </div>

    </div>
  )
}
