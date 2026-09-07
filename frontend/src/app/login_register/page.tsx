"use client"

import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./login_register.module.css";

import React, { useState } from 'react';
import axios from 'axios';

import BeautifulButton from '@/components/button/button';
import Spacer from '@/components/spacer/spacer';
import InputText from '@/components/input_text/input_text';
import Title_h1 from '@/components/title_h1/title_h1';
import getEnv from '@/env/env';
import CustomAlert from '@/components/custom_alert/custom_alert';
import { useRouter } from 'next/navigation';

function StatusText(props: { text: string }) {
  const style = {
    color: 'red',
    display: 'flex',
    justifyContent: 'center',
  };
  return (
    <div style={style}>
      <p style={style}>{props.text}</p>
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter()

  const [logginError, setLogginError] = useState<string | null>(null);


  const handleSubmit = async (e: { preventDefault: () => void; }, type: 'login' | 'register') => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const { API_URL } = await getEnv();
    const url = `${API_URL}/${type}`;

    try {
      await axios.post(url, { username, password }, { withCredentials: true });
      await axios.post(`${API_URL}/me`, {}, { withCredentials: true });

      window.dispatchEvent(new Event('cookieChange'));
      router.push('/home');
    } catch (error) {
      const message = axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
        ? error.response.data.message
        : 'Impossible de contacter le serveur';
      console.error('Authentication failed:', message);
      setLogginError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = (e: { preventDefault: () => void; }) => handleSubmit(e, 'login');
  const handleRegisterSubmit = (e: { preventDefault: () => void; }) => handleSubmit(e, 'register');

  return (
    <div className={styles.container}>
      {logginError &&
        <CustomAlert
          icon="close"
          text1='Error'
          text2={logginError}
          type='bad'
          onClick={async () => { setLogginError(null) }}
        />}
      


      <Title_h1 text="Se connecter / S'inscrire" icon="login" />
      <form onSubmit={handleLoginSubmit}>
        <InputText
          type="text"
          description="Nom d'utilisateur"
          placeholder='Jean Michel'
          autoComplete='off'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Spacer direction="H" spacing={2} />

        <InputText
          type='password'
          description='Mot de passe'
          placeholder=''
          autoComplete='off'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Spacer direction="H" spacing={3} />

        <div className={styles.buttons_parent}>
          <BeautifulButton text={isSubmitting ? 'Connexion...' : 'Connexion'} icon="login" type="submit" />
          <Spacer direction="V" spacing={2} />
          <BeautifulButton text={isSubmitting ? 'Inscription...' : 'Inscription'} icon="app_registration" type="button" onClick={handleRegisterSubmit} />
        </div>
      </form>

      <Spacer direction="H" spacing={2} />

    </div>
  );
};
