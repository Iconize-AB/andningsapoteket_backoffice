import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  Orders: number;
  Customers: number;
}

const data: ChartData[] = [
  { name: 'Jan', Orders: 2000, Customers: 4000 },
  { name: 'Feb', Orders: 4000, Customers: 7000 },
  { name: 'Mar', Orders: 3000, Customers: 5000 },
  { name: 'Apr', Orders: 5000, Customers: 8000 },
  { name: 'May', Orders: 6000, Customers: 10000 },
  { name: 'Jun', Orders: 7000, Customers: 12000 },
  { name: 'Jul', Orders: 8000, Customers: 14000 },
  { name: 'Aug', Orders: 9000, Customers: 15000 },
  { name: 'Sep', Orders: 8000, Customers: 14000 },
  { name: 'Oct', Orders: 9000, Customers: 15000 },
  { name: 'Nov', Orders: 9500, Customers: 15500 },
  { name: 'Dec', Orders: 9000, Customers: 15000 },
];

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Revenue</Typography>
            <Typography variant="h4">€192.1k</Typography>
            <Typography variant="body2" color="success.main">
              32% increase
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">New customers</Typography>
            <Typography variant="h4">1340</Typography>
            <Typography variant="body2" color="error.main">
              3% decrease
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">New orders</Typography>
            <Typography variant="h4">3543</Typography>
            <Typography variant="body2" color="success.main">
              7% increase
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Orders per month</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Orders" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Total customers</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="Customers" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
