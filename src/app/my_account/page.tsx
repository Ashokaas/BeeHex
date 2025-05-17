"use client";

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import getEnv from '@/env/env';
import Title_h1 from '@/components/title_h1/title_h1';
import BeautifulButton from '@/components/button/button';
import * as echarts from 'echarts';
import styles from './account.module.css'
import Spacer from '@/components/spacer/spacer';
import CustomAlert from '@/components/custom_alert/custom_alert';
import { useRouter } from 'next/navigation'

// LineChart component to display a line chart using ECharts
const LineChart = ({ games }: { games: { mmrAfterGame: number, gameDate: number }[] }) => {
  const chartRef = useRef(null);
  const classements = [
    [200, "Faux-bourdon I"],
    [400, "Faux-bourdon II"],
    [600, "Faux-bourdon III"],
    [800, "Ouvrière I"],
    [1000, "Ouvrière II"],
    [1200, "Ouvrière III"],
    [1400, "Reine I"],
    [1600, "Reine II"],
    [1800, "Reine III"]
  ];

  // Function to get rank based on MMR value
  const getRank = (mmr: number) => {
    for (let i = classements.length - 1; i >= 0; i--) {
      if (mmr >= Number(classements[i][0])) {
        return classements[i][1];
      }
    }
    return "Unranked";
  };

  // L'axe X est maintenant l'ordre des parties
  const data = games.map((game, i) => [
    `Partie ${i + 1}`, // Affiche "Game 1", "Game 2", ...
    game.mmrAfterGame,
    getRank(game.mmrAfterGame)
  ]);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const data = params[0].data;
          return `MMR: ${data[1]}<br>Rank: ${data[2]}`;
        },
      },
      xAxis: { type: "category", name: "Partie" },
      yAxis: {
        type: "value",
        name: "MMR",
        min: (value: { min: number }) => value.min - 50,
        max: (value: { max: number }) => value.max + 50,
      },
      series: [
        {
          type: "line",
          smooth: true,
          data: data,
        },
      ],
    };

    chart.setOption(option);

    return () => chart.dispose();
  }, [games]); // Met à jour le graphique si games change

  return <div ref={chartRef} style={{ width: "600px", height: "400px" }} />;
};

// Main Page component
export default function Page() {
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [games, setGames] = useState<{ mmrAfterGame: number, gameDate: number }[]>([]);

  const [passwordEditSuccess, setPasswordEditSuccess] = useState(false);
  const [passwordEditError, setPasswordEditError] = useState(false);
  const router = useRouter()

  // Function to fetch user data
  const fetchUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      window.location.href = '/login_register';
      return;
    }

    try {
      const user = await axios.post(`http://${getEnv()['IP_HOST']}:3001/me`, {}, {
        headers: { 'Authorization': token }
      });
      setUsername(user.data.username);
      setUserId(user.data.id);

      const gamesRes = await axios.get(`http://${getEnv()['IP_HOST']}:3001/get_games_by_user/${user.data.id}`);
      setGames(gamesRes.data);


    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };



  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      {passwordEditSuccess && (
        <CustomAlert
          icon='check'
          text1="Password updated"
          text2="Your password has been successfully updated"
          type="good"
          onClick={async (e) => { setPasswordEditSuccess(false)}}
        />
      )}

      {passwordEditError && (
        <CustomAlert
          icon='close'
          text1="Failed to update password"
          text2="Please check your current password"
          type="bad"
          onClick={async (e) => { setPasswordEditError(false)}}
        />
      )}

      <Title_h1 text="My Account" icon='person' />
      <div className={styles.container}>
        <p>{username ? `Welcome, ${username} !` : 'Loading...'}</p>
        <LineChart games={games} />

        <form className={styles.form}
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const current_password = formData.get('current_password');
            const new_password = formData.get('new_password');

            try {
              const token = Cookies.get('token');
              await axios.post(
                `http://${getEnv()['IP_HOST']}:3001/edit_password`,
                { current_password, new_password },
                { headers: { 'Authorization': token } }
              );
              setPasswordEditSuccess(true);
            } catch (error) {
              console.error('Error updating password:', error);
              setPasswordEditError(true);
            }
          }}
        >
          <div className={styles.form_inputs}>
            <div>
              <label htmlFor="current_password">Current password:</label>
              <input type="password" id="current_password" name="current_password" required />
            </div>
            <div>
              <label htmlFor="new_password">New password:</label>
              <input type="password" id="new_password" name="new_password" required />
            </div>
          </div>
          <BeautifulButton
            text="Update Password"
            icon="lock"
            type="submit"
          />
        </form>

        <Spacer direction="H" spacing={3} />

        <BeautifulButton
          text="Se déconnecter"
          icon="logout"
          onClick={async (e) => {
            e.preventDefault();
            Cookies.remove('token');
            window.dispatchEvent(new Event('cookieChange'));
            router.push('/home')
          }}
        />
      </div>
    </>
  );
}