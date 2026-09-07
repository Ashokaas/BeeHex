import axios from 'axios';
import Cookies from 'js-cookie';
import getEnv from '@/env/env';

export async function logoutAndRedirect(): Promise<void> {
  try {
    const { API_URL } = await getEnv();
    await axios.get(`${API_URL}/logout`, { withCredentials: true });
  } catch {
    // The local session is cleared even when the API is unavailable.
  } finally {
    Cookies.remove('username');
    Cookies.remove('userId');
    window.dispatchEvent(new Event('cookieChange'));
    window.location.assign('/login_register');
  }
}

export async function hasValidSession(): Promise<boolean> {
  try {
    const { API_URL } = await getEnv();
    await axios.post(`${API_URL}/me`, {}, { withCredentials: true });
    return true;
  } catch {
    return false;
  }
}
