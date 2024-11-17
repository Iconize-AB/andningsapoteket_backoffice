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
import { CloudUpload, Add, Edit, Save, Cancel } from '@mui/icons-material';

interface Category {
  id: string;
  name: string;
  description: string | null;
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
  const [newDescription, setNewDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);

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
      formData.append('description', newDescription.trim());
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
      setNewDescription('');
      setSelectedImage(null);
      setSuccess('Category created successfully');
      setError(null);

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditDescription(category.description || '');
    setEditImage(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditDescription('');
    setEditImage(null);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingCategory) return;
      
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('description', editDescription.trim());
      if (editImage) {
        formData.append('image', editImage);
      }

      const response = await fetch(`http://localhost:3000/v1/backoffice/categories/update/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update category');
      }

      const data = await response.json();
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data.category : cat
      ));
      
      setSuccess('Category updated successfully');
      handleCancelEdit();
      
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
          <Grid container spacing={2} alignItems="flex-start">
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
              <StyledTextField
                fullWidth
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                label="Category Description"
                variant="outlined"
                multiline
                rows={3}
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
            <Grid item xs={12}>
              <StyledButton
                onClick={handleAddCategory}
                variant="contained"
                startIcon={<Add />}
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
                  padding: 2,
                }}
              >
                {editingCategory?.id === category.id ? (
                  // Edit mode
                  <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2} alignItems="flex-start">
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          label="Category Name"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          label="Description"
                          variant="outlined"
                          multiline
                          rows={3}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`edit-image-${category.id}`}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setEditImage(file);
                          }}
                        />
                        <label htmlFor={`edit-image-${category.id}`}>
                          <StyledButton
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUpload />}
                            fullWidth
                          >
                            Update Image
                          </StyledButton>
                        </label>
                        {editImage && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Selected: {editImage.name}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <StyledButton
                            onClick={handleSaveEdit}
                            variant="contained"
                            startIcon={<Save />}
                          >
                            Save Changes
                          </StyledButton>
                          <StyledButton
                            onClick={handleCancelEdit}
                            variant="outlined"
                            startIcon={<Cancel />}
                          >
                            Cancel
                          </StyledButton>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
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
                    <Box sx={{ flexGrow: 1 }}>
                      <ListItemText
                        primary={category.name}
                        secondary={category.description}
                        primaryTypographyProps={{
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <StyledButton
                        onClick={() => handleEditClick(category)}
                        variant="outlined"
                        startIcon={<Edit />}
                      >
                        Edit
                      </StyledButton>
                    </Box>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Categories;
