import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Users from './components/Users';
import Content from './components/Content';
import Categories from './components/Categories';
import Box from '@mui/material/Box';
import Login from './components/Login';
import Challenges from './components/Challenges';

const theme = createTheme({
  palette: {
    primary: {
      main: '#f0a500',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('userToken'));

  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    setToken(null);
  };

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Sidebar onLogout={handleLogout} />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/content" element={<Content />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
