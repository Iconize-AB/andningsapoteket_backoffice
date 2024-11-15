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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
} from '@mui/material';
import { Edit, Delete, CloudUpload, Star, Save } from '@mui/icons-material';

interface Session {
  id: string;
  title: string;
  description: string;
  category: string;
  categories: string[];
  activated: boolean;
  highlighted: boolean;
}

interface NewSession {
  title: string;
  description: string;
  category: string;
  categories: string;
  audio: File | null;
  image: File | null;
  duration: string;
  activated: boolean;
  startQuestion: string;
  endQuestion: string;
}

interface HelpOptionContent {
  option: string;
  content: string;
}

interface ExtendedButtonProps {
  component?: React.ElementType;
}

interface GroupedSessions {
  [key: string]: Session[];
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
  '&.MuiButton-containedError': {
    backgroundColor: theme.palette.error.dark,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.main,
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
}));

const TabButton = styled(Button)<{ active?: boolean }>(({ theme, active }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  marginRight: theme.spacing(1),
  fontWeight: 500,
  backgroundColor: active ? theme.palette.grey[900] : 'transparent',
  color: active ? theme.palette.common.white : theme.palette.grey[700],
  '&:hover': {
    backgroundColor: active ? theme.palette.grey[800] : theme.palette.grey[100],
  },
}));

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState<GroupedSessions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState<NewSession>({
    title: '',
    description: '',
    category: '',
    categories: '',
    audio: null,
    image: null,
    duration: '',
    activated: true,
    startQuestion: '',
    endQuestion: '',
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [highlightedSessions, setHighlightedSessions] = useState<Session[]>([]);
  const [helpOptionContents, setHelpOptionContents] = useState<HelpOptionContent[]>([]);
  const [newHelpOption, setNewHelpOption] = useState<string>('');
  const [helpContent, setHelpContent] = useState<string>('');
  const [openSessionDialog, setOpenSessionDialog] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchHighlightedSessions();
    fetchHelpOptionContents();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("http://localhost:3000/v1/backoffice/sessions/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();

      const groupedSessions = data?.items?.reduce(
        (acc: GroupedSessions, session: Session) => {
          if (!acc[session.category]) {
            acc[session.category] = [];
          }
          acc[session.category].push(session);
          return acc;
        },
        {}
      );

      setSessions(groupedSessions || {});
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlightedSessions = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:3000/v1/backoffice/sessions/highlighted', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch highlighted sessions');

      const data = await response.json();
      setHighlightedSessions(data.items || []);
    } catch (error) {
      console.error('Error fetching highlighted sessions:', error);
    }
  };

  const fetchHelpOptionContents = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:3000/v1/backoffice/help-option-contents', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch help option contents');

      const data = await response.json();
      setHelpOptionContents(data.contents || []);
    } catch (error) {
      console.error('Error fetching help option contents:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = event.target;
    setNewSession(prev => ({ ...prev, [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      Object.entries(newSession).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'categories') {
            formData.append(
              key, 
              JSON.stringify(value.split(',').map((cat: string) => cat.trim()))
            );
          } else if (key === 'audio' || key === 'image') {
            if (value instanceof File) formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch('http://localhost:3000/v1/backoffice/sessions/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload session');

      await fetchSessions();
      setNewSession({
        title: '', description: '', category: '', categories: '', audio: null, 
        image: null, duration: '', activated: true, startQuestion: '', endQuestion: ''
      });
      setActiveTab(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsEditing(false);
    setOpenSessionDialog(true);
  };

  const handleCloseSessionDialog = () => {
    setOpenSessionDialog(false);
    setIsEditing(false);
  };

  const handleEditClick = () => setIsEditing(true);

  const handleSaveClick = () => {
    if (!selectedSession) return;
    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setOpenConfirmDialog(false);
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const requestBody = {
        title: selectedSession.title,
        description: selectedSession.description,
        category: selectedSession.category,
        categories: JSON.stringify(selectedSession.categories),
        activated: selectedSession.activated,
        highlighted: selectedSession.highlighted
      };

      const response = await fetch(`http://localhost:3000/v1/backoffice/sessions/update/${selectedSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update session');
      }

      const updatedSession = await response.json();
      
      setSessions((prevSessions: GroupedSessions) => {
        const newSessions = { ...prevSessions };
        const category = updatedSession.session.category;
        if (newSessions[category]) {
          newSessions[category] = newSessions[category].map((session: Session) =>
            session.id === updatedSession.session.id ? updatedSession.session : session
          );
        }
        return newSessions;
      });
      
      setIsEditing(false);
      setOpenSessionDialog(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteClick = () => setOpenDeleteDialog(true);

  const handleConfirmDelete = async () => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:3000/v1/backoffice/sessions/delete/${selectedSession.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete session');

      setSessions((prevSessions: GroupedSessions) => {
        const newSessions = { ...prevSessions };
        const category = selectedSession.category;
        if (newSessions[category]) {
          newSessions[category] = newSessions[category].filter(
            (session: Session) => session.id !== selectedSession.id
          );
        }
        return newSessions;
      });

      setSelectedSession(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleHighlightToggle = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://localhost:3000/v1/backoffice/sessions/toggle-highlight/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to toggle session highlight");

      const updatedSession = await response.json();

      // Update the sessions state
      setSessions((prevSessions: GroupedSessions) => {
        const newSessions = { ...prevSessions };
        const category = updatedSession.session.category;
        if (newSessions[category]) {
          newSessions[category] = newSessions[category].map((session: Session) =>
            session.id === updatedSession.session.id ? updatedSession.session : session
          );
        }
        return newSessions;
      });

      // Update highlighted sessions
      await fetchHighlightedSessions();
    } catch (error) {
      console.error("Error toggling session highlight:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleHelpContentSubmit = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      if (!newHelpOption) {
        alert('Please enter a help option.');
        return;
      }

      const response = await fetch('http://localhost:3000/v1/backoffice/update-help-option-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ option: newHelpOption, content: helpContent }),
      });

      if (!response.ok) throw new Error('Failed to update help option content');

      setNewHelpOption('');
      setHelpContent('');
      await fetchHelpOptionContents();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteHelpOption = async (optionToDelete: string) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`http://localhost:3000/v1/backoffice/help-option-content/${encodeURIComponent(optionToDelete)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete help option content');
      }

      await fetchHelpOptionContents();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  // const handleSaveEdit = async () => {
  //   if (!selectedSession) return;

  //   try {
  //     const token = localStorage.getItem("userToken");
  //     if (!token) throw new Error("No authentication token found");

  //     const requestBody = {
  //       title: selectedSession.title,
  //       description: selectedSession.description,
  //       category: selectedSession.category,
  //       categories: JSON.stringify(selectedSession.categories),
  //       activated: selectedSession.activated,
  //       highlighted: selectedSession.highlighted
  //     };

  //     const response = await fetch(`http://localhost:3000/v1/backoffice/sessions/update/${selectedSession.id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(requestBody),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || "Failed to update session");
  //     }

  //     const updatedSession = await response.json();
      
  //     setSessions((prevSessions: GroupedSessions) => {
  //       const newSessions: GroupedSessions = { ...prevSessions };
        
  //       // Remove from old category if category changed
  //       Object.keys(newSessions).forEach((category: string) => {
  //         newSessions[category] = newSessions[category].filter((session: Session) =>
  //           session.id !== selectedSession.id
  //         );
  //       });
        
  //       // Add to new/current category
  //       const category = updatedSession.session.category;
  //       if (!newSessions[category]) {
  //         newSessions[category] = [];
  //       }
  //       newSessions[category] = [...newSessions[category], updatedSession.session];
  //       return newSessions;
  //     });

  //     setIsEditing(false);
  //     setSelectedSession(null);
  //   } catch (error) {
  //     console.error("Error updating session:", error);
  //     setError(error instanceof Error ? error.message : "An unexpected error occurred");
  //   }
  // };

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
        Content Management
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)}>Sessions</TabButton>
        <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>Upload New Session</TabButton>
        <TabButton active={activeTab === 2} onClick={() => setActiveTab(2)}>Help Content</TabButton>
      </Box>
      <StyledCard>
        <CardContent>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
                  Highlighted Sessions
                </Typography>
                <List>
                  {highlightedSessions.map((session: Session) => (
                    <ListItem key={session.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemText 
                        primary={session.title} 
                        secondary={`Category: ${session.category}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <Star sx={{ color: 'primary.main' }} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mt: 4 }}>
                  All Sessions
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(sessions).map(([category, categorySessions]) => (
                    <Grid item xs={12} key={category}>
                      <Typography variant="h6" gutterBottom>{category}</Typography>
                      <Grid container spacing={2}>
                        {categorySessions.map((session: Session) => (
                          <Grid item xs={12} sm={6} md={4} key={session.id}>
                            <StyledCard 
                              onClick={() => handleSessionClick(session)} 
                              sx={{ cursor: 'pointer', height: '100%' }}
                            >
                              <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                  {session.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {session.description}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                  {session.categories.map((category: string) => (
                                    <Typography 
                                      key={category} 
                                      variant="caption" 
                                      sx={{ 
                                        mr: 1, 
                                        p: 0.5, 
                                        bgcolor: 'action.selected', 
                                        borderRadius: 1 
                                      }}
                                    >
                                      {category}
                                    </Typography>
                                  ))}
                                </Box>
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'space-between' 
                                }}>
                                  <Switch
                                    checked={session.highlighted}
                                    onChange={() => handleHighlightToggle(session.id)}
                                    color="primary"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <Typography variant="body2">
                                    {session.highlighted ? "Highlighted" : "Not Highlighted"}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </StyledCard>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Session Title"
                    name="title"
                    value={newSession.title}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={newSession.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Main Category</InputLabel>
                    <StyledSelect
                      value={newSession.category}
                      onChange={(e) => setNewSession({ ...newSession, category: e.target.value as string })}
                      name="category"
                      required
                    >
                      {['Fire', 'Earth', 'Water', 'Wind'].map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Additional Categories"
                    name="categories"
                    value={newSession.categories}
                    onChange={handleInputChange}
                    helperText="Enter categories separated by commas"
                  />
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="audio-file-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewSession({ ...newSession, audio: file });
                    }}
                  />
                  <label htmlFor="audio-file-upload">
                    <StyledButton variant="outlined" component="span" startIcon={<CloudUpload />}>
                      Upload Audio
                    </StyledButton>
                  </label>
                  {newSession.audio && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {newSession.audio.name} (Duration: {newSession.duration})
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-file-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewSession({ ...newSession, image: file });
                    }}
                  />
                  <label htmlFor="image-file-upload">
                    <StyledButton variant="outlined" component="span" startIcon={<CloudUpload />}>
                      Upload Image
                    </StyledButton>
                  </label>
                  {newSession.image && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {newSession.image.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Activate session</InputLabel>
                    <StyledSelect
                      value={newSession.activated ? 'true' : 'false'}
                      onChange={(e) => setNewSession({ ...newSession, activated: e.target.value === 'true' })}
                      name="activated"
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Start Question"
                    name="startQuestion"
                    value={newSession.startQuestion}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    helperText="Question to ask before the session starts (optional)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="End Question"
                    name="endQuestion"
                    value={newSession.endQuestion}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    helperText="Question to ask after the session ends (optional)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledButton type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} sx={{ color: 'common.white' }} /> : "Upload Session"}
                  </StyledButton>
                </Grid>
              </Grid>
            </form>
          )}

          {activeTab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Enter Help Option"
                  value={newHelpOption}
                  onChange={(e) => setNewHelpOption(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  fullWidth
                  label="Help Content"
                  multiline
                  rows={6}
                  value={helpContent}
                  onChange={(e) => setHelpContent(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledButton
                  onClick={handleHelpContentSubmit}
                  variant="contained"
                  startIcon={<Save />}
                >
                  Save Help Content
                </StyledButton>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>Existing Help Options</Typography>
                <List>
                  {helpOptionContents.map((item) => (
                    <ListItem key={item.option} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemText
                        primary={item.option}
                        secondary={item.content}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteHelpOption(item.option)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </StyledCard>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to save these changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setOpenConfirmDialog(false)} variant="outlined">Cancel</StyledButton>
          <StyledButton onClick={handleConfirmSave} variant="contained">Confirm</StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedSession?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setOpenDeleteDialog(false)} variant="outlined">Cancel</StyledButton>
          <StyledButton onClick={handleConfirmDelete} variant="contained" color="error">Delete</StyledButton>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openSessionDialog} 
        onClose={handleCloseSessionDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedSession && (
          <>
            <DialogTitle>
              {isEditing ? 'Edit Session' : selectedSession.title}
            </DialogTitle>
            <DialogContent>
              {isEditing ? (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                  <StyledTextField
                    fullWidth
                    label="Title"
                    value={selectedSession.title}
                    onChange={(e) => setSelectedSession({ ...selectedSession, title: e.target.value })}
                    margin="normal"
                  />
                  <StyledTextField
                    fullWidth
                    label="Description"
                    value={selectedSession.description}
                    onChange={(e) => setSelectedSession({ ...selectedSession, description: e.target.value })}
                    margin="normal"
                    multiline
                    rows={4}
                  />
                  <StyledTextField
                    fullWidth
                    label="Categories"
                    value={selectedSession.categories.join(", ")}
                    onChange={(e) => setSelectedSession({ ...selectedSession, categories: e.target.value.split(", ") })}
                    margin="normal"
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Activated</InputLabel>
                    <StyledSelect
                      value={selectedSession.activated ? 'true' : 'false'}
                      onChange={(e) => setSelectedSession({ ...selectedSession, activated: e.target.value === 'true' })}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </StyledSelect>
                  </FormControl>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Highlighted</InputLabel>
                    <StyledSelect
                      value={selectedSession.highlighted ? 'true' : 'false'}
                      onChange={(e) => setSelectedSession({ ...selectedSession, highlighted: e.target.value === 'true' })}
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </StyledSelect>
                  </FormControl>
                  <StyledButton type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    Save
                  </StyledButton>
                </form>
              ) : (
                <>
                  <Typography variant="body2" paragraph>{selectedSession.description}</Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedSession.categories.map((cat) => (
                      <Typography key={cat} variant="caption" sx={{ mr: 1, p: 0.5, bgcolor: 'action.selected', borderRadius: 1 }}>
                        {cat}
                      </Typography>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Status: {selectedSession.activated ? "Activated" : "Deactivated"}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Highlighted: {selectedSession.highlighted ? "Yes" : "No"}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <StyledButton onClick={handleCloseSessionDialog} variant="outlined">Cancel</StyledButton>
                  <StyledButton onClick={handleSaveClick} variant="contained">Save</StyledButton>
                </>
              ) : (
                <>
                  <StyledButton onClick={handleCloseSessionDialog} variant="outlined">Close</StyledButton>
                  <StyledButton
                    startIcon={<Edit />}
                    onClick={handleEditClick}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </StyledButton>
                  <StyledButton
                    startIcon={<Delete />}
                    onClick={handleDeleteClick}
                    variant="contained"
                    color="error"
                  >
                    Delete
                  </StyledButton>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Content;