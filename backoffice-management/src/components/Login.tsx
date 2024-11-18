import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, Typography, Alert } from '@mui/material';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://ec2-51-20-254-95.eu-north-1.compute.amazonaws.com/v1/user/signin', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: 'cors',
        referrerPolicy: 'unsafe-url',
        credentials: 'omit',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log('response', response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      console.log('data', data);
      localStorage.setItem('userToken', data.token);
      onLogin(data.token);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <Card style={{ maxWidth: 400, margin: 'auto', marginTop: 50 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Login
        </Typography>
        {error && <Alert severity="error" style={{ marginBottom: 16 }}>{error}</Alert>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Login;