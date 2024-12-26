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
  ButtonProps,
  Tabs,
  Tab,
  Box,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
  description: string | null;
  vatNumber: string | null;
  address: string | null;
  users: User[];
  createdAt: string;
  updatedAt: string;
  _count: {
    users: number;
  };
}

interface NewOrganization {
  name: string;
  description: string;
  vatNumber: string;
  address: string;
}

// Reuse existing styled components
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
  backgroundColor: "transparent",
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
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
    },
  },
}));

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const StyledUploadButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  width: '100%',
  padding: theme.spacing(1.5),
  border: `1px dashed ${theme.palette.divider}`,
  '&:hover': {
    border: `1px dashed ${theme.palette.primary.main}`,
  },
}));

const Organizations: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [creating, setCreating] = useState(false);
  const [newOrganization, setNewOrganization] = useState<NewOrganization>({
    name: '',
    description: '',
    vatNumber: '',
    address: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (editMode) {
      const fetchAvailableUsers = async () => {
        try {
          const token = localStorage.getItem('userToken');
          if (!token) throw new Error('No authentication token found');
  
          const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/users/all', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
  
          if (!response.ok) throw new Error('Failed to fetch users');
  
          const data = await response.json();
          setAvailableUsers(data.users);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
      };
  
      fetchAvailableUsers();
    }
  }, [editMode]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/organizations/organizations/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrganization),
      });

      if (!response.ok) throw new Error('Failed to create organization');

      const data = await response.json();
      setOrganizations(prev => [...prev, data.organization]);
      setNewOrganization({ name: '', description: '', vatNumber: '', address: '' });
      setActiveTab(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrg) return;
  
    setUpdating(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');
  
      // Update organization details
      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/organizations/organizations/${selectedOrg.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedOrg.name,
          description: selectedOrg.description,
          vatNumber: selectedOrg.vatNumber,
          address: selectedOrg.address,
          userIds: selectedUsers.map(user => user.id), // Add this line to include selected user IDs
        }),
      });
  
      if (!response.ok) throw new Error('Failed to update organization');
  
      const data = await response.json();
      
      // Update local state with the response data
      setOrganizations(prev => prev.map(org => 
        org.id === selectedOrg.id ? { ...data.organization, users: selectedUsers } : org
      ));
      setEditMode(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const processFileContent = async (content: string, fileType: 'csv' | 'txt' | 'xlsx') => {
    let users: Array<{ firstName: string; lastName: string; email: string; }> = [];

    if (fileType === 'csv' || fileType === 'txt') {
      const rows = content.split('\n');
      // Skip header row if it exists
      const dataRows = rows[0].includes('firstName') ? rows.slice(1) : rows;
      
      users = dataRows
        .filter(row => row.trim()) // Skip empty rows
        .map(row => {
          const [firstName, lastName, email] = row.split(',').map(field => field.trim());
          return { firstName, lastName, email };
        });
    }
    // Add XLSX processing if needed

    return users;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedOrg) return;

    const fileType = file.name.split('.').pop()?.toLowerCase() as 'csv' | 'txt' | 'xlsx';
    if (!['csv', 'txt', 'xlsx'].includes(fileType)) {
      setUploadError('Invalid file type. Please upload a CSV, TXT, or XLSX file.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const content = await file.text();
      const users = await processFileContent(content, fileType);
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      // Single request with all users
      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/organizations/organizations/${selectedOrg.id}/users/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          users: users,
          organizationId: selectedOrg.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload users');
      }

      // Update progress to 100% on success
      setUploadProgress(100);

      // Refresh available users after bulk upload
      const usersResponse = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setAvailableUsers(data.users);
      }

    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/organizations/organizations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch organizations');

        const data = await response.json();
        setOrganizations(data.organizations);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
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
      <Alert severity="error" sx={{ maxWidth: '600px', margin: '24px auto', borderRadius: '12px' }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
          Organizations Management
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage organization accounts and details
        </Typography>
      </Box>

      <StyledTabs value={activeTab} onChange={handleTabChange} sx={{ maxWidth: 300 }}>
        <Tab label="Organizations" />
        <Tab label="Add Organization" />
      </StyledTabs>

      {activeTab === 0 && (
        <StyledCard>
          <CardContent sx={{ p: 0 }}>
            <StyledTableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>VAT Number</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organizations.map((org) => (
                    <TableRow 
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org);
                        setSelectedUsers(org.users || []);
                        setEditMode(true);
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{org.name}</TableCell>
                      <TableCell>{org.vatNumber || '-'}</TableCell>
                      <TableCell>{org.address || '-'}</TableCell>
                      <TableCell>{org._count?.users || 0}</TableCell>
                      <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </CardContent>
        </StyledCard>
      )}

      {activeTab === 1 && (
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <StyledForm onSubmit={handleCreateOrganization}>
              <TextField
                name="name"
                label="Organization Name"
                value={newOrganization.name}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, name: e.target.value }))}
                required
                size="small"
              />
              <TextField
                name="description"
                label="Description"
                value={newOrganization.description}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                size="small"
              />
              <TextField
                name="vatNumber"
                label="VAT Number"
                value={newOrganization.vatNumber}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, vatNumber: e.target.value }))}
                size="small"
              />
              <TextField
                name="address"
                label="Address"
                value={newOrganization.address}
                onChange={(e) => setNewOrganization(prev => ({ ...prev, address: e.target.value }))}
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={creating}
                startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <BusinessIcon />}
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
                {creating ? 'Creating...' : 'Create Organization'}
              </Button>
            </StyledForm>
          </CardContent>
        </StyledCard>
      )}

      <Dialog 
        open={editMode} 
        onClose={() => setEditMode(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Organization: {selectedOrg?.name}
        </DialogTitle>
        <DialogContent>
          <StyledForm onSubmit={handleUpdateOrganization}>
            <TextField
              name="name"
              label="Organization Name"
              value={selectedOrg?.name || ''}
              onChange={(e) => setSelectedOrg(prev => prev ? { ...prev, name: e.target.value } : null)}
              required
              size="small"
            />
            <TextField
              name="description"
              label="Description"
              value={selectedOrg?.description || ''}
              onChange={(e) => setSelectedOrg(prev => prev ? { ...prev, description: e.target.value } : null)}
              multiline
              rows={3}
              size="small"
            />
            <TextField
              name="vatNumber"
              label="VAT Number"
              value={selectedOrg?.vatNumber || ''}
              onChange={(e) => setSelectedOrg(prev => prev ? { ...prev, vatNumber: e.target.value } : null)}
              size="small"
            />
            <TextField
              name="address"
              label="Address"
              value={selectedOrg?.address || ''}
              onChange={(e) => setSelectedOrg(prev => prev ? { ...prev, address: e.target.value } : null)}
              size="small"
            />
            <Autocomplete
              multiple
              options={availableUsers}
              getOptionLabel={(option) => `${option.fullName} (${option.email})`}
              value={selectedUsers}
              onChange={(_, newValue) => setSelectedUsers(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign Users"
                  size="small"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={`${option.fullName} (${option.email})`}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
            />
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Bulk Upload Users
              </Typography>
              <StyledUploadButton
                component="label"
                variant="outlined"
                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                disabled={uploading}
              >
                {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Upload User List'}
                <VisuallyHiddenInput
                  type="file"
                  accept=".csv,.txt,.xlsx"
                  onChange={handleFileUpload}
                />
              </StyledUploadButton>
              {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Alert>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <DialogActions>
              <Button onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updating}
                startIcon={updating ? <CircularProgress size={20} color="inherit" /> : <EditIcon />}
              >
                {updating ? 'Updating...' : 'Update Organization'}
              </Button>
            </DialogActions>
          </StyledForm>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Organizations;