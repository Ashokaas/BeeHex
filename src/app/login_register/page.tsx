"use client"

import BottomNavBar from '../../components/bottom_navbar/bottom_navbar';
import "material-symbols";
import styles from "./login_register.module.css";

import React, { useState } from 'react';
import axios from 'axios';

import Cookies from 'js-cookie';
import { Cookie } from 'next/font/google';
require('dotenv').config()


function Error(props: {text: string}) {
  return (
    <div>
      <p>{props.text}</p>
    </div>
  );
}

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://192.168.1.28:3001/login', { username, password });
      // Store the token in local storage or a state management library
      Cookies.set('token', response.data.token);
      Cookies.set('username', response.data.user.username);
      window.dispatchEvent(new Event('cookieChange'));
      localStorage.setItem('token', response.data.token);
      // Redirect the user to a protected page
      // window.location.href = '/dashboard';
      console.log(response);
      setError('Login successful');

      const user = await axios.post('http://192.168.1.28:3001/me', {}, {headers: {'Authorization':localStorage.getItem('token')}} );
      console.log(user.data);
    } catch (error) {
      console.error(error);
      setError('Invalid username or password');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>

      <Error text={error} />

    </>
  );
};
