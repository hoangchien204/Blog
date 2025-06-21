import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import URL_LINK from '../services/API.ts'
interface LoginProps {
  onLoginSuccess?: () => void;
}
const setTokenWithExpiry = (key: string, value: string, ttl: number) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};
const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${URL_LINK.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      console.log('API Response:', data);

      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại');
        return;
      }

      if (data.user.role === 'admin') {
        // Lưu token kèm hạn là 30 phút
        setTokenWithExpiry('admin_token', data.token, 30 * 60 * 1000); // 30 phút
        console.log('Token saved with expiry');
        if (onLoginSuccess) onLoginSuccess();
        navigate('/admin/home');
      } else {
        setError('Bạn không có quyền truy cập');
      }
    } catch (err) {
      setError('Lỗi kết nối tới server');
      console.error('Login error:', err);
    }
  };

  return (
    <>
    <form style ={styles.container} onSubmit={handleSubmit}>
      <input
        style ={styles.input}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="password"
        style ={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button style ={styles.button} type="submit">Đăng nhập</button>
      {error && <p style ={styles.error}>{error}</p>}
    </form>
  
  <style>{`
    /* Login.module.css */

  `}</style>
  </>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '80px auto',
    padding: '32px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.3s'
  },
  inputFocus: {
    borderColor: '#4a90e2',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  buttonHover: {
    backgroundColor: '#357ABD'
  },
  error: {
    color: 'red',
    marginTop: '12px',
    fontSize: '14px',
    textAlign: 'center'
  }
};



export default Login;