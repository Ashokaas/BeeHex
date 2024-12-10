"use client"

import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./login_register.module.css";

import React, { useState } from 'react';
import axios from 'axios';

import Cookies from 'js-cookie';
import { Cookie } from 'next/font/google';
import { Online, Offline } from 'react-detect-offline';
require('dotenv').config()

import BeautifulButton from '@/components/button/button';
import Spacer from '@/components/spacer/spacer';
import InputText from '@/components/input_text/input_text';
import Title_h1 from '@/components/title_h1/title_h1';
import { text } from 'stream/consumers';


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
  const [error, setStatus] = useState('');

  const handleLoginSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      // Store the token in local storage or a state management library
      Cookies.set('token', response.data.token);
      Cookies.set('username', response.data.user.username);
      window.dispatchEvent(new Event('cookieChange'));
      localStorage.setItem('token', response.data.token);
      // Redirect the user to a protected page
      // window.location.href = '/dashboard';
      console.log(response);
      setStatus('Login successful');

      const user = await axios.post('http://localhost:3001/me', {}, { headers: { 'Authorization': localStorage.getItem('token') } });
      console.log(user.data);
    } catch (error) {
      console.error(error);
      setStatus('Invalid username or password');
    }
  };

  const handleRegisterSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', { username, password });
      // Store the token in local storage or a state management library
      Cookies.set('token', response.data.token);
      Cookies.set('username', response.data.user.username);
      window.dispatchEvent(new Event('cookieChange'));
      localStorage.setItem('token', response.data.token);
      // Redirect the user to a protected page
      // window.location.href = '/dashboard';
      console.log(response);
      setStatus('Registration successful');
    } catch (error) {
      console.error(error);
      setStatus('Username already taken');
    }
  }

  return (
    <div className={styles.container}>
      <Title_h1 text="Login/register" icon="login" />
      <Online>
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
          <Spacer direction="H" spacing={2} />

          <div className={styles.buttons_parent}>
            <BeautifulButton text="Login" icon="login" onClick={handleLoginSubmit} />
            <Spacer direction="H" spacing={2} />
            <BeautifulButton text="Register" icon="app_registration" onClick={handleRegisterSubmit} />
          </div>
        </form>

        <StatusText text={error} />
        
      </Online>

      <Offline>
        <StatusText text="You are offline" />
      </Offline>
    </div>
  );
};
