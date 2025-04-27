import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  styled,
  Paper,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { CloudUpload, Add, Delete, Edit, Save, Cancel } from '@mui/icons-material';

interface VideoConfig {
  id: string;
  name: string;
  backgroundVideoUrl: string;
  thumbnailUrl: string | null;
  soundUrl: string | null;
  gradientColors: string[];
  gradientLocations: number[];
  createdAt: string;
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

const ColorPreview = styled(Paper)(({ color }) => ({
  width: '100%',
  height: '40px',
  backgroundColor: color,
  marginTop: '8px',
  borderRadius: '4px',
}));

const HomeScreenVideos: React.FC = () => {
  const [videos, setVideos] = useState<VideoConfig[]>([]);
  const [name, setName] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [selectedSound, setSelectedSound] = useState<File | null>(null);
  const [gradientColor1, setGradientColor1] = useState('#000000');
  const [gradientColor2, setGradientColor2] = useState('#014156');
  const [gradientColor3, setGradientColor3] = useState('#272C3D');
  const [gradientLocation1, setGradientLocation1] = useState('0');
  const [gradientLocation2, setGradientLocation2] = useState('0.37');
  const [gradientLocation3, setGradientLocation3] = useState('0.71');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTransparent1, setIsTransparent1] = useState(false);
  const [isTransparent2, setIsTransparent2] = useState(false);
  const [isTransparent3, setIsTransparent3] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState<VideoConfig | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoConfig | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/homescreen/videos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch videos');

      const data = await response.json();
      setVideos(data.videos);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!name.trim() || !selectedVideo) {
        setError('Name and video file are required');
        return;
      }

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('backgroundVideo', selectedVideo);
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }
      if (selectedSound) {
        formData.append('sound', selectedSound);
      }
      formData.append('gradientColor1', isTransparent1 ? 'transparent' : gradientColor1);
      formData.append('gradientColor2', isTransparent2 ? 'transparent' : gradientColor2);
      formData.append('gradientColor3', isTransparent3 ? 'transparent' : gradientColor3);
      formData.append('gradientLocation1', gradientLocation1);
      formData.append('gradientLocation2', gradientLocation2);
      formData.append('gradientLocation3', gradientLocation3);

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/homescreen/videos/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create video configuration');
      }

      setSuccess('Video configuration created successfully');
      setName('');
      setSelectedVideo(null);
      setSelectedThumbnail(null);
      setSelectedSound(null);
      fetchVideos();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteClick = (video: VideoConfig) => {
    setDeletingVideo(video);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingVideo) return;

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/homescreen/videos/${deletingVideo.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete video configuration');
      }

      setSuccess('Video configuration deleted successfully');
      setDeletingVideo(null);
      fetchVideos();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleEditClick = (video: VideoConfig) => {
    setEditingVideo(video);
    setName(video.name);
    setSelectedVideo(null);
    setSelectedThumbnail(null);
    setSelectedSound(null);
    const [color1, color2, color3] = video.gradientColors;
    const [loc1, loc2, loc3] = video.gradientLocations;
    setGradientColor1(color1 === 'transparent' ? '#000000' : color1);
    setGradientColor2(color2 === 'transparent' ? '#014156' : color2);
    setGradientColor3(color3 === 'transparent' ? '#272C3D' : color3);
    setIsTransparent1(color1 === 'transparent');
    setIsTransparent2(color2 === 'transparent');
    setIsTransparent3(color3 === 'transparent');
    setGradientLocation1(loc1.toString());
    setGradientLocation2(loc2.toString());
    setGradientLocation3(loc3.toString());
    setOpenEditDialog(true);
  };

  const handleCancelEdit = () => {
    setOpenEditDialog(false);
    setEditingVideo(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSelectedVideo(null);
    setSelectedThumbnail(null);
    setSelectedSound(null);
    setGradientColor1('#000000');
    setGradientColor2('#014156');
    setGradientColor3('#272C3D');
    setGradientLocation1('0');
    setGradientLocation2('0.37');
    setGradientLocation3('0.71');
    setIsTransparent1(false);
    setIsTransparent2(false);
    setIsTransparent3(false);
  };

  const handleSaveClick = () => {
    if (!editingVideo) return;
    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    try {
      if (!editingVideo) return;

      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      
      // Only append name if it's different from current name
      if (name !== editingVideo.name) {
        formData.append('name', name.trim());
      }

      // Only append files if new ones are selected
      if (selectedVideo) {
        formData.append('backgroundVideo', selectedVideo);
      }
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }
      if (selectedSound) {
        formData.append('sound', selectedSound);
      }

      // Only append gradient colors if they're different from current values
      const currentColors = editingVideo.gradientColors;
      const newColors = [
        isTransparent1 ? 'transparent' : gradientColor1,
        isTransparent2 ? 'transparent' : gradientColor2,
        isTransparent3 ? 'transparent' : gradientColor3
      ];

      if (JSON.stringify(currentColors) !== JSON.stringify(newColors)) {
        formData.append('gradientColor1', newColors[0]);
        formData.append('gradientColor2', newColors[1]);
        formData.append('gradientColor3', newColors[2]);
      }

      // Only append gradient locations if they're different from current values
      const currentLocations = editingVideo.gradientLocations;
      const newLocations = [
        parseFloat(gradientLocation1),
        parseFloat(gradientLocation2),
        parseFloat(gradientLocation3)
      ];

      if (JSON.stringify(currentLocations) !== JSON.stringify(newLocations)) {
        formData.append('gradientLocation1', gradientLocation1);
        formData.append('gradientLocation2', gradientLocation2);
        formData.append('gradientLocation3', gradientLocation3);
      }

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/homescreen/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update video configuration');
      }

      const data = await response.json();
      setSuccess(data.message || 'Video configuration updated successfully');
      setOpenConfirmDialog(false);
      setOpenEditDialog(false);
      setEditingVideo(null);
      resetForm();
      fetchVideos();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 4 }}>
        Homescreen Videos
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Video Name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="video-file-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedVideo(file);
                }}
              />
              <label htmlFor="video-file-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Video
                </StyledButton>
              </label>
              {selectedVideo && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedVideo.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="thumbnail-file-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedThumbnail(file);
                }}
              />
              <label htmlFor="thumbnail-file-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Thumbnail
                </StyledButton>
              </label>
              {selectedThumbnail && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedThumbnail.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="sound-file-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedSound(file);
                }}
              />
              <label htmlFor="sound-file-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload Sound
                </StyledButton>
              </label>
              {selectedSound && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedSound.name}
                </Typography>
              )}
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTransparent1}
                        onChange={(e) => setIsTransparent1(e.target.checked)}
                      />
                    }
                    label="Transparent"
                  />
                  {!isTransparent1 && (
                    <>
                      <StyledTextField
                        fullWidth
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        label="Gradient Color 1"
                        variant="outlined"
                      />
                      <ColorPreview color={gradientColor1} />
                    </>
                  )}
                  <StyledTextField
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={gradientLocation1}
                    onChange={(e) => setGradientLocation1(e.target.value)}
                    label="Gradient Location 1"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTransparent2}
                        onChange={(e) => setIsTransparent2(e.target.checked)}
                      />
                    }
                    label="Transparent"
                  />
                  {!isTransparent2 && (
                    <>
                      <StyledTextField
                        fullWidth
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        label="Gradient Color 2"
                        variant="outlined"
                      />
                      <ColorPreview color={gradientColor2} />
                    </>
                  )}
                  <StyledTextField
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={gradientLocation2}
                    onChange={(e) => setGradientLocation2(e.target.value)}
                    label="Gradient Location 2"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTransparent3}
                        onChange={(e) => setIsTransparent3(e.target.checked)}
                      />
                    }
                    label="Transparent"
                  />
                  {!isTransparent3 && (
                    <>
                      <StyledTextField
                        fullWidth
                        type="color"
                        value={gradientColor3}
                        onChange={(e) => setGradientColor3(e.target.value)}
                        label="Gradient Color 3"
                        variant="outlined"
                      />
                      <ColorPreview color={gradientColor3} />
                    </>
                  )}
                  <StyledTextField
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={gradientLocation3}
                    onChange={(e) => setGradientLocation3(e.target.value)}
                    label="Gradient Location 3"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <StyledButton
                onClick={handleSubmit}
                variant="contained"
                startIcon={<Add />}
              >
                Create Video Configuration
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
            {videos.map((video) => (
              <ListItem
                key={video.id}
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 'none' },
                  padding: 2,
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{video.name}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <StyledButton
                        onClick={() => handleEditClick(video)}
                        variant="outlined"
                        color="primary"
                        startIcon={<Edit />}
                      >
                        Edit
                      </StyledButton>
                      <StyledButton
                        onClick={() => handleDeleteClick(video)}
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                      >
                        Delete
                      </StyledButton>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <video width="320" controls>
                      <source src={video.backgroundVideoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {video.thumbnailUrl && (
                      <img 
                        src={video.thumbnailUrl} 
                        alt="Video thumbnail" 
                        style={{ width: '320px', objectFit: 'contain' }} 
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    {video.gradientColors.map((color, index) => (
                      <Box key={index}>
                        <Typography variant="caption">
                          Color {index + 1}: {color}
                        </Typography>
                        <ColorPreview color={color} />
                        <Typography variant="caption">
                          Location: {video.gradientLocations[index]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {video.soundUrl && (
                    <Box sx={{ mt: 1 }}>
                      <audio controls>
                        <source src={video.soundUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </Box>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog 
        open={openEditDialog} 
        onClose={handleCancelEdit}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Video Configuration</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                label="Video Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="video/*"
                style={{ display: 'none' }}
                id="edit-video-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedVideo(file);
                }}
              />
              <label htmlFor="edit-video-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload New Video
                </StyledButton>
              </label>
              {selectedVideo && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedVideo.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="edit-thumbnail-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedThumbnail(file);
                }}
              />
              <label htmlFor="edit-thumbnail-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload New Thumbnail
                </StyledButton>
              </label>
              {selectedThumbnail && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedThumbnail.name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <input
                accept="audio/*"
                style={{ display: 'none' }}
                id="edit-sound-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedSound(file);
                }}
              />
              <label htmlFor="edit-sound-upload">
                <StyledButton
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  Upload New Sound
                </StyledButton>
              </label>
              {selectedSound && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Selected: {selectedSound.name}
                </Typography>
              )}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2, px: 2 }}>
              <Grid item xs={12} md={4}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTransparent1}
                        onChange={(e) => setIsTransparent1(e.target.checked)}
                      />
                    }
                    label="Transparent"
                  />
                  {!isTransparent1 && (
                    <>
                      <StyledTextField
                        fullWidth
                        type="color"
                        value={gradientColor1}
                        onChange={(e) => setGradientColor1(e.target.value)}
                        label="Gradient Color 1"
                        variant="outlined"
                      />
                      <ColorPreview color={gradientColor1} />
                    </>
                  )}
                  <StyledTextField
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={gradientLocation1}
                    onChange={(e) => setGradientLocation1(e.target.value)}
                    label="Gradient Location 1"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTransparent2}
                        onChange={(e) => setIsTransparent2(e.target.checked)}
                      />
                    }
                    label="Transparent"
                  />
                  {!isTransparent2 && (
                    <>
                      <StyledTextField
                        fullWidth
                        type="color"
                        value={gradientColor2}
                        onChange={(e) => setGradientColor2(e.target.value)}
                        label="Gradient Color 2"
                        variant="outlined"
                      />
                      <ColorPreview color={gradientColor2} />
                    </>
                  )}
                  <StyledTextField
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={gradientLocation2}
                    onChange={(e) => setGradientLocation2(e.target.value)}
                    label="Gradient Location 2"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isTransparent3}
                        onChange={(e) => setIsTransparent3(e.target.checked)}
                      />
                    }
                    label="Transparent"
                  />
                  {!isTransparent3 && (
                    <>
                      <StyledTextField
                        fullWidth
                        type="color"
                        value={gradientColor3}
                        onChange={(e) => setGradientColor3(e.target.value)}
                        label="Gradient Color 3"
                        variant="outlined"
                      />
                      <ColorPreview color={gradientColor3} />
                    </>
                  )}
                  <StyledTextField
                    fullWidth
                    type="number"
                    inputProps={{ step: 0.01, min: 0, max: 1 }}
                    value={gradientLocation3}
                    onChange={(e) => setGradientLocation3(e.target.value)}
                    label="Gradient Location 3"
                    variant="outlined"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {editingVideo && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Current Media:</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom>Background Video:</Typography>
                  <video width="100%" controls>
                    <source src={editingVideo.backgroundVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Grid>
                {editingVideo.thumbnailUrl && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" gutterBottom>Thumbnail:</Typography>
                    <img 
                      src={editingVideo.thumbnailUrl} 
                      alt="Video thumbnail" 
                      style={{ width: '100%', objectFit: 'contain' }} 
                    />
                  </Grid>
                )}
                {editingVideo.soundUrl && (
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>Sound:</Typography>
                    <audio controls style={{ width: '100%' }}>
                      <source src={editingVideo.soundUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={handleCancelEdit} variant="outlined" startIcon={<Cancel />}>
            Cancel
          </StyledButton>
          <StyledButton onClick={handleSaveClick} variant="contained" startIcon={<Save />}>
            Save Changes
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save these changes to the video configuration?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setOpenConfirmDialog(false)} variant="outlined">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleConfirmSave} variant="contained">
            Confirm
          </StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deletingVideo)}
        onClose={() => setDeletingVideo(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the video configuration "{deletingVideo?.name}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <StyledButton
            onClick={() => setDeletingVideo(null)}
            variant="outlined"
          >
            Cancel
          </StyledButton>
          <StyledButton
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Delete
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HomeScreenVideos; 