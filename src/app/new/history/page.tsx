"use client";

import React from "react";
import styles from "./history.module.css";
import BeautifulButton from "@/components/button/button";
import Title_h1 from "@/components/title_h1/title_h1";
import axios from "axios";
import getEnv from "@/env/env";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import 'material-symbols';
import Cookies from "js-cookie";

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

function GameResult({ game }: { game: GameArr }) {
  const router = useRouter();
  const userId = Cookies.get('userId');
  const gameid = game.gameId;
  const isFirstPlayer = game.firstPlayerId === userId;
  const victory = (isFirstPlayer && game.EloChangeFirstPlayer > 0) || (!isFirstPlayer && game.EloChangeSecondPlayer > 0);
  const mmrChange = isFirstPlayer ? game.EloChangeFirstPlayer : game.EloChangeSecondPlayer;
  const mmrAfter = game.mmrAfterGame;
  const opponentUsername = game.opponentUsername || "Unknown";
  const dateObj = new Date(game.gameDate);
  const date = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

  return (
    <>
      <div className={styles.history_item} key={game.gameId}>

        <div className={styles.history_item_title}>
          <span className={victory ? styles.title_win : styles.title_lose}>
            {victory ? "Victoire" : "Défaite"}
          </span>&nbsp;&nbsp;
          <span>VS</span>&nbsp;&nbsp;
          <span>{opponentUsername}</span>
        </div>

        <div className={styles.history_item_content_text}>
          <span className={victory ? styles.mmr_win : styles.mmr_lose}>
            {mmrChange > 0 ? "+" : ""}{mmrChange}
          </span>
          <span className="material-symbols-rounded">east</span>
          <span className={victory ? styles.mmr_win : styles.mmr_lose}>{mmrAfter}</span><small>MMR</small>
        </div>

        <div className={styles.history_item_footer}>
          le {date} en {game.moves.split(' ').length} coups
        </div>

        <div className={styles.history_item_content}>
          <BeautifulButton text="Analyse" icon="analytics" onClick={async (e) => router.push(`/new/hex.html?id=o_${gameid}`)} />
        </div>

      </div>
      <hr />

    </>
  );
}

export default function Page() {
  const [gamesArr, setGamesArr] = useState<GameArr[]>([]);
  const router = useRouter();

  const fetchUser = async () => {
    const userId = Cookies.get('userId');
    
    if (!userId) { router.push('/new/login_register.html'); return; }
    try {
      const url = `https://${getEnv()['API_IP']}/get_games_by_user/${userId}`;
      
      const gamesRes = await axios.get(url);
      
      setGamesArr(gamesRes.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);


  return (
    <div className={styles.history_container}>
      <Title_h1 text="Historique" icon="menu_book" />
      <div className={styles.history_content}>
        {gamesArr.length === 0 ? (
          <div className={styles.history_item}>
            <div className={styles.history_item_title}>Historique</div>
            <div className={styles.history_item_content}>
              <div className={styles.history_item_content_text}>Pas d&apos;historique disponible</div>
            </div>
          </div>
        ) : (
          gamesArr.map((game) => (
            <GameResult game={game} />
            
          ))
        )}
      </div>
    </div>
  );
}