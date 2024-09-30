import React, { useState } from 'react';

interface LoginProps {
  onLogin: (success: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'pantera1A@') {
      onLogin(true);
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="w-full p-2 border rounded bg-gray-800 text-white"
      />
      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded">
        Login
      </button>
    </form>
  );
};

export default Login;