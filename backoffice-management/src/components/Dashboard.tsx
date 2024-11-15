import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  Grid,
  styled
} from '@mui/material';

interface Statistics {
  totalUsers: number;
  plusUsers: number;
  regularUsers: number;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

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

        const response = await fetch('http://localhost:3000/v1/statistics/user-stats', {
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          maxWidth: '600px', 
          margin: '24px auto',
          borderRadius: '12px',
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Overview of user statistics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {stats && (
          <>
            <Grid item xs={12} sm={4}>
              <StyledCard>
                <CardContent>
                  <StatLabel variant="subtitle2">
                    Total Users
                  </StatLabel>
                  <StatValue variant="h4">
                    {stats.totalUsers.toLocaleString()}
                  </StatValue>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledCard>
                <CardContent>
                  <StatLabel variant="subtitle2">
                    Plus Users
                  </StatLabel>
                  <StatValue variant="h4">
                    {stats.plusUsers.toLocaleString()}
                  </StatValue>
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledCard>
                <CardContent>
                  <StatLabel variant="subtitle2">
                    Regular Users
                  </StatLabel>
                  <StatValue variant="h4">
                    {stats.regularUsers.toLocaleString()}
                  </StatValue>
                </CardContent>
              </StyledCard>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;