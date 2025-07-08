import React, { useState } from 'react';
import axios from '../api/axios';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/signup', { email, password });
      setMessage('Signup successful. You can now login.');
    } catch (err) {
      setMessage('Signup failed. Try a different email.');
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h3>Signup</h3>
      <input type="email" placeholder="Email" value={email}
             onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password}
             onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Signup</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default SignupForm;
