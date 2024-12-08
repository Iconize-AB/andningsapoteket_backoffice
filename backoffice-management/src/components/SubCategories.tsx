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
import { CloudUpload, Add, Edit, Save, Cancel, Delete } from '@mui/icons-material';

interface SubCategory {
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

const SubCategories: React.FC = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [newSubCategory, setNewSubCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/sub-categories', {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subcategories');

      const data = await response.json();
      setSubCategories(data.subCategories);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleAddSubCategory = async () => {
    try {
      if (!newSubCategory.trim()) {
        setError('SubCategory name is required');
        return;
      }

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', newSubCategory.trim());
      formData.append('description', newDescription.trim());
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/subcategories/create', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subcategory');
      }

      const data = await response.json();
      setSubCategories([...subCategories, data.subCategory]);
      setNewSubCategory('');
      setNewDescription('');
      setSelectedImage(null);
      setSuccess('SubCategory created successfully');
      setError(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleEditClick = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setEditName(subCategory.name);
    setEditDescription(subCategory.description || '');
    setEditImage(null);
  };

  const handleCancelEdit = () => {
    setEditingSubCategory(null);
    setEditName('');
    setEditDescription('');
    setEditImage(null);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingSubCategory) return;
      
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('description', editDescription.trim());
      if (editImage) {
        formData.append('image', editImage);
      }

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/subcategories/update/${editingSubCategory.id}`, {
        method: 'PUT',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subcategory');
      }

      const data = await response.json();
      setSubCategories(subCategories.map(subCat => 
        subCat.id === editingSubCategory.id ? data.subCategory : subCat
      ));
      
      setSuccess('SubCategory updated successfully');
      handleCancelEdit();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteClick = (subCategory: SubCategory) => {
    setDeletingSubCategory(subCategory);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingSubCategory) return;
      
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/subcategories/${deletingSubCategory.id}`, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subcategory');
      }

      setSubCategories(subCategories.filter(subCat => subCat.id !== deletingSubCategory.id));
      setSuccess('SubCategory deleted successfully');
      setDeletingSubCategory(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 4 }}>
        SubCategories
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <StyledTextField
                fullWidth
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                label="New SubCategory Name"
                variant="outlined"
                error={!!error && error.includes('name')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StyledTextField
                fullWidth
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                label="SubCategory Description"
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
                onClick={handleAddSubCategory}
                variant="contained"
                startIcon={<Add />}
              >
                Add SubCategory
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
            {subCategories.map((subCategory) => (
              <ListItem
                key={subCategory.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                  padding: 2,
                }}
              >
                {editingSubCategory?.id === subCategory.id ? (
                  <Box sx={{ width: '100%' }}>
                    <Grid container spacing={2} alignItems="flex-start">
                      <Grid item xs={12} sm={4}>
                        <StyledTextField
                          fullWidth
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          label="SubCategory Name"
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
                          id={`edit-image-${subCategory.id}`}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setEditImage(file);
                          }}
                        />
                        <label htmlFor={`edit-image-${subCategory.id}`}>
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
                    {subCategory.imageUrl && (
                      <Box
                        component="img"
                        src={subCategory.imageUrl}
                        alt={subCategory.name}
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
                        primary={subCategory.name}
                        secondary={subCategory.description}
                        primaryTypographyProps={{
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <StyledButton
                        onClick={() => handleEditClick(subCategory)}
                        variant="outlined"
                        startIcon={<Edit />}
                      >
                        Edit
                      </StyledButton>
                      <StyledButton
                        onClick={() => handleDeleteClick(subCategory)}
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                      >
                        Delete
                      </StyledButton>
                    </Box>
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {deletingSubCategory && (
        <Alert
          severity="warning"
          sx={{ mt: 2, p: 2 }}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StyledButton
                size="small"
                variant="contained"
                color="error"
                onClick={handleConfirmDelete}
              >
                Delete
              </StyledButton>
              <StyledButton
                size="small"
                variant="outlined"
                onClick={() => setDeletingSubCategory(null)}
              >
                Cancel
              </StyledButton>
            </Box>
          }
        >
          Are you sure you want to delete the subcategory "{deletingSubCategory.name}"? 
          This action cannot be undone and will also delete all associated sessions that are not linked to other subcategories.
        </Alert>
      )}
    </Box>
  );
};

export default SubCategories; 