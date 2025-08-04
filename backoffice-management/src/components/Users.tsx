import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Button,
  Tabs,
  Tab,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  viewedOnBoarding: string | null;
  subscriptionType?: string | null;
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  couponCode: string;
  subscriptionPeriod: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.paper,
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  '& .MuiTableCell-body': {
    fontSize: '0.875rem',
    color: theme.palette.text.primary,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  backgroundColor: "transparant",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    minWidth: 120,
    backgroundColor: "transparent",
    margin: '0 4px',
    color: theme.palette.grey[700],
    '&.Mui-selected': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[900],
      borderRadius: theme.shape.borderRadius,
    },
    '&:hover': {
      backgroundColor: theme.palette.grey[900],
      color: theme.palette.common.white,
    },
    '&:first-of-type': {
      marginLeft: 0,
    },
    '&:last-of-type': {
      marginRight: 0,
    },
  },
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const StyledForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  maxWidth: '600px',
  margin: '0 auto',
  '& .MuiTextField-root, & .MuiFormControl-root': {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  fontWeight: 500,
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.grey[800],
  },
  '&.MuiButton-outlined': {
    backgroundColor: 'transparent',
    borderColor: theme.palette.grey[700],
    color: theme.palette.grey[700],
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
      borderColor: theme.palette.grey[900],
      color: theme.palette.grey[900],
    },
  },
}));

const Users: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    couponCode: '',
    subscriptionPeriod: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // const handleSendReminderOnboarding = async (email: string) => {
  //   try {
  //     setSendingReminder(email);
  //     const token = localStorage.getItem('userToken');
  //     if (!token) {
  //       throw new Error('No authentication token found');
  //     }

  //     const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/user/reminder-onboarding', {
  //       method: 'POST',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //       mode: 'cors',
  //       credentials: 'omit',
  //       body: JSON.stringify({ email }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to send reminder');
  //     }

  //     const data = await response.json();
  //     console.log('Reminder sent successfully:', data.message);
  //   } catch (error) {
  //     setError(error instanceof Error ? error.message : 'An unexpected error occurred');
  //   } finally {
  //     setSendingReminder(null);
  //   }
  // };

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreatingUser(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/create-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
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
      setActiveTab(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(userToDelete.id);
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/users/delete/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      const data = await response.json();
      console.log('User deleted successfully:', data.message);
      
      // Remove the user from the local state
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setDeletingUser(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/users/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          mode: 'cors',
          credentials: 'omit',
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress size={24} />
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
          Users Management
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage user accounts and permissions
        </Typography>
      </Box>

      <StyledTabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ maxWidth: 300 }}
      >
        <Tab label="Existing Users" />
        <Tab label="Add User" />
      </StyledTabs>

      {activeTab === 0 && (
        <StyledCard>
          <CardContent sx={{ p: 0 }}>
            <StyledTableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Subscription</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 500 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.fullName || "No name"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {user.role || 'User'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {user.subscriptionType || 'None'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <StyledButton
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={deletingUser === user.id ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <DeleteIcon />
                            )}
                            onClick={() => handleDeleteUser(user)}
                            disabled={deletingUser === user.id}
                            sx={{ 
                              minWidth: '80px',
                              borderColor: 'error.main',
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.light',
                                borderColor: 'error.dark',
                                color: 'error.contrastText',
                              },
                            }}
                          >
                            {deletingUser === user.id ? 'Deleting...' : 'Delete'}
                          </StyledButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </CardContent>
        </StyledCard>
      )}

      {activeTab === 1 && (
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <StyledForm onSubmit={handleCreateUser}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={newUser.firstName}
                  onChange={handleTextInputChange}
                  required
                  size="small"
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={newUser.lastName}
                  onChange={handleTextInputChange}
                  required
                  size="small"
                />
              </Box>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={newUser.email}
                onChange={handleTextInputChange}
                required
                size="small"
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                value={newUser.password}
                onChange={handleTextInputChange}
                required
                size="small"
              />
              <TextField
                name="couponCode"
                label="Coupon Code (Optional)"
                value={newUser.couponCode}
                onChange={handleTextInputChange}
                size="small"
              />
              <FormControl size="small">
                <InputLabel>Subscription Period</InputLabel>
                <Select
                  name="subscriptionPeriod"
                  value={newUser.subscriptionPeriod}
                  onChange={handleSelectChange}
                  label="Subscription Period"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="30">30 days</MenuItem>
                  <MenuItem value="60">60 days</MenuItem>
                  <MenuItem value="90">90 days</MenuItem>
                  <MenuItem value="120">120 days</MenuItem>
                  <MenuItem value="365">1 year</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                disabled={creatingUser}
                startIcon={creatingUser && <CircularProgress size={20} color="inherit" />}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                  },
                }}
              >
                {creatingUser ? 'Creating...' : 'Create User'}
              </Button>
            </StyledForm>
          </CardContent>
        </StyledCard>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the user "{userToDelete?.fullName || userToDelete?.email}"? 
            This action cannot be undone and will permanently delete the user and all their associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteUser} 
            color="error" 
            variant="contained"
            disabled={deletingUser !== null}
            startIcon={deletingUser && <CircularProgress size={20} color="inherit" />}
          >
            {deletingUser ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;