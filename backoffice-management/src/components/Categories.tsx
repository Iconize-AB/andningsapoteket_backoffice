import React, { useState, useEffect } from 'react';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Box,
  Alert,
  styled,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { CloudUpload, Add } from '@mui/icons-material';

interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface ExtendedButtonProps {
  component?: React.ElementType;
}

const StyledButton = styled(Button)<ExtendedButtonProps>(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  fontWeight: 500,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:3000/v1/backoffice/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.trim()) {
        setError('Category name is required');
        return;
      }

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', newCategory.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('http://localhost:3000/v1/backoffice/categories/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create category');
      }

      const data = await response.json();
      setCategories([...categories, data.category]);
      setNewCategory('');
      setSelectedImage(null);
      setSuccess('Category created successfully');
      setError(null);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 4 }}>
        Categories
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                label="New Category Name"
                variant="outlined"
                error={!!error && error.includes('name')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-file-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedImage(file);
                }}
              />
              <label htmlFor="image-file-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Image
                </StyledButton>
              </label>
              {selectedImage && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedImage.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledButton
                onClick={handleAddCategory}
                variant="contained"
                startIcon={<Add />}
                fullWidth
              >
                Add Category
              </StyledButton>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <List>
            {categories.map((category) => (
              <ListItem
                key={category.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {category.imageUrl && (
                    <Box
                      component="img"
                      src={category.imageUrl}
                      alt={category.name}
                      sx={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mr: 2,
                      }}
                    />
                  )}
                  <ListItemText
                    primary={category.name}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Categories;
