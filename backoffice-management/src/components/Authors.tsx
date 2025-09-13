import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  styled,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { getApiUrlForEndpoint } from '../utils/apiConfig';

interface Author {
  id: string;
  name: string;
  imageUrl?: string;
}

interface NewAuthor {
  name: string;
  image: File | null;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
}));

interface ExtendedButtonProps {
  component?: React.ElementType;
}

const StyledButton = styled(Button)<ExtendedButtonProps>(({ theme }) => ({
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

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

const Authors: React.FC = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAuthor, setNewAuthor] = useState<NewAuthor>({
    name: '',
    image: null,
  });
  const [openAuthorDialog, setOpenAuthorDialog] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(getApiUrlForEndpoint('/v1/backoffice/authors'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch authors');

      const data = await response.json();
      setAuthors(data.authors || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuthor = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', newAuthor.name);
      if (newAuthor.image instanceof File) {
        formData.append('image', newAuthor.image);
      }

      const response = await fetch(getApiUrlForEndpoint('/v1/backoffice/authors'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create author');

      await fetchAuthors();
      setNewAuthor({ name: '', image: null });
      setOpenAuthorDialog(false);
    } catch (error) {
      console.error('Error creating author:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 4 }}>
        Author Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
          Authors
        </Typography>
        <StyledButton
          variant="contained"
          onClick={() => setOpenAuthorDialog(true)}
          startIcon={<CloudUpload />}
        >
          Add New Author
        </StyledButton>
      </Box>

      <Grid container spacing={3}>
        {authors.map((author) => (
          <Grid item xs={12} sm={6} md={4} key={author.id}>
            <StyledCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {author.imageUrl && (
                    <img
                      src={author.imageUrl}
                      alt={author.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {author.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {author.id}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {authors.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No authors found. Create your first author to get started.
          </Typography>
        </Box>
      )}

      <Dialog 
        open={openAuthorDialog} 
        onClose={() => setOpenAuthorDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Author</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <StyledTextField
              fullWidth
              label="Author Name"
              value={newAuthor.name}
              onChange={(e) => setNewAuthor({ ...newAuthor, name: e.target.value })}
              margin="normal"
              required
            />
            
            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="author-image-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setNewAuthor({ ...newAuthor, image: file });
                }}
              />
              <label htmlFor="author-image-upload">
                <StyledButton variant="outlined" component="span" startIcon={<CloudUpload />}>
                  Upload Author Image
                </StyledButton>
              </label>
              {newAuthor.image && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {newAuthor.image.name}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setOpenAuthorDialog(false)} variant="outlined">
            Cancel
          </StyledButton>
          <StyledButton 
            onClick={handleCreateAuthor} 
            variant="contained"
            disabled={!newAuthor.name.trim()}
          >
            Create Author
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Authors;
