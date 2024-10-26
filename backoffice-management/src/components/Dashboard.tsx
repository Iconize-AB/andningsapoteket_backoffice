import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';

interface Statistics {
  totalUsers: number;
  plusUsers: number;
  regularUsers: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://ec2-51-20-254-95.eu-north-1.compute.amazonaws.com/v1/statistics/user-stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
        </Grid>
        {stats && (
          <>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Total Users
                </Typography>
                <Typography component="p" variant="h4">
                  {stats.totalUsers}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Plus Users
                </Typography>
                <Typography component="p" variant="h4">
                  {stats.plusUsers}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Regular Users
                </Typography>
                <Typography component="p" variant="h4">
                  {stats.regularUsers}
                </Typography>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;