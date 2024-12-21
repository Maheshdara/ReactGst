// LoginPage.js
import axios from "axios";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth';
import "./App.css"

const LoginPage = () => {
  const navigate = useNavigate();
  const { setIsLoggedIn } = useAuth();
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handlePost = async () => {
    const body = {
      username: username,
      password: password
    };
    try {
      const response = await axios.post("http://localhost:8000/login", body);
      console.log(response.data.token); // Assuming response contains a token
      if (response.data.token) {
        setIsLoggedIn(true);
        navigate('/');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <label>UserName</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUserName(e.target.value)}
      />
      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handlePost}>Submit</button>
    </div>
  );
}

export default LoginPage;
