import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert, 
  Button,
  Tabs,
  Tab,
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  viewedOnBoarding: string | null;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    couponCode: '',
    subscriptionPeriod: '' // Add this field
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:3000/v1/backoffice/users/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Access denied. Admin privileges required.');
          }
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSendReminderOnboarding = async (email: string) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3000/v1/user/reminder-onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend onboarding email');
      }

      // Optionally, you can show a success message here
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3000/v1/backoffice/create-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const data = await response.json();
      setUsers(prev => [...prev, data.user]);
      setNewUser({ 
        email: '', 
        password: '', 
        firstName: '', 
        lastName: '', 
        couponCode: '',
        subscriptionPeriod: '' 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Users Management
      </Typography>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Existing Users" />
        <Tab label="Add User" />
      </Tabs>
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
                <TableCell>Onboarding Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || 'User'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(user.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>{user.viewedOnBoarding}</TableCell>
                  <TableCell>
                    {user.viewedOnBoarding !== "completed" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSendReminderOnboarding(user.email)}
                      >
                        Resend Onboarding
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {activeTab === 1 && (
        <Box component="form" onSubmit={handleCreateUser} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            name="email"
            label="Email"
            value={newUser.email}
            onChange={handleTextInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="password"
            label="Password"
            type="password"
            value={newUser.password}
            onChange={handleTextInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="firstName"
            label="First Name"
            value={newUser.firstName}
            onChange={handleTextInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="lastName"
            label="Last Name"
            value={newUser.lastName}
            onChange={handleTextInputChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            name="couponCode"
            label="Coupon Code (Optional)"
            value={newUser.couponCode}
            onChange={handleTextInputChange}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="subscription-period-label">Subscription Period (Days)</InputLabel>
            <Select
              labelId="subscription-period-label"
              name="subscriptionPeriod"
              value={newUser.subscriptionPeriod}
              onChange={handleSelectChange}
              label="Subscription Period (Days)"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="30">30 days</MenuItem>
              <MenuItem value="60">60 days</MenuItem>
              <MenuItem value="90">90 days</MenuItem>
              <MenuItem value="120">120 days</MenuItem>
              <MenuItem value="365">1 year</MenuItem>
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Create User
          </Button>
        </Box>
      )}
    </div>
  );
};

export default Users;
