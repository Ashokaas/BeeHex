"use client"

import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./login_register.module.css";

import React, { useState } from 'react';
import axios from 'axios';

import Cookies from 'js-cookie';

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
  console.log(getEnv());
  const router = useRouter()

  const [logginSuccess, setLogginSuccess] = useState(false);
  const [logginError, setLogginError] = useState(false);


  const handleSubmit = async (e: { preventDefault: () => void; }, type: 'login' | 'register') => {
    e.preventDefault();
    const url = type === 'login' ? `http://${getEnv()["IP_HOST"]}:3001/login` : `http://${getEnv()["IP_HOST"]}:3001/register`;

    try {
      const response = await axios.post(url, { username, password });

      // Store the token in local storage or a state management library
      Cookies.set('token', response.data.token);
      Cookies.set('username', response.data.user.username);
      window.dispatchEvent(new Event('cookieChange'));

      console.log(response);

      setLogginSuccess(true);

      if (type === 'login') {
        const user = await axios.post(`http://${getEnv()["IP_HOST"]}:3001/me`, {}, { headers: { 'Authorization': response.data.token } });
        console.log(user.data);
      }
    } catch (error) {
      console.error(error);
      setLogginError(true);
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
          text2='An error occurred'
          type='bad'
        />}
      {logginSuccess &&
        <CustomAlert
          icon="check"
          text1='Success'
          text2='You have successfully logged in'
          type='good'
          onClick={async (e) => { router.push('/home') }}
        />}


      <Title_h1 text="Login/register" icon="login" />
      <form>
        <InputText
          type="text"
          description='Username'
          placeholder='Jean Michel'
          autoComplete='off'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Spacer direction="H" spacing={2} />

        <InputText
          type='password'
          description='Password'
          placeholder=''
          autoComplete='off'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Spacer direction="H" spacing={3} />

        <div className={styles.buttons_parent}>
          <BeautifulButton text="Login" icon="login" onClick={handleLoginSubmit} />
          <Spacer direction="H" spacing={2} />
          <BeautifulButton text="Register" icon="app_registration" onClick={handleRegisterSubmit} />
        </div>
      </form>

      <Spacer direction="H" spacing={2} />

    </div>
  );
};
