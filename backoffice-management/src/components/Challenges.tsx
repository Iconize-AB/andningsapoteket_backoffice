import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ButtonProps } from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

interface SessionForm {
  title: string;
  description: string;
  longDescription: string;
  duration: string;
  audio: File | null;
  image: File | null;
}

const initialSessionForm: SessionForm = {
  title: '',
  description: '',
  longDescription: '',
  duration: '',
  audio: null,
  image: null,
};

const PageBackground = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  padding: theme.spacing(3),
}));

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    color: '#333',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(0, 0, 0, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
    },
  },
});

interface UploadButtonProps extends ButtonProps {
  component?: React.ElementType;
}

const UploadButton = styled(Button)<UploadButtonProps>(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.grey[800],
  },
}));

interface Challenge {
  id: string;
  title: string;
  description: string;
  activated: boolean;
  sessions: {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    duration?: string;
    order: number;
  }[];
}

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.grey[700],
  '&.Mui-selected': {
    color: theme.palette.grey[900],
    fontWeight: 500,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Add this function to get audio duration
const getAudioDuration = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.decodeAudioData(e.target?.result as ArrayBuffer, (buffer) => {
        const durationInSeconds = buffer.duration;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.round(durationInSeconds % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, (err) => reject(err));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};

// Modified function to handle adding sessions to an existing challenge
const handleAddSessionToExistingChallenge = async (
  newSession: SessionForm, 
  challengeId: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const formData = new FormData();
    
    // Only append the new session data
    if (newSession.audio) {
      formData.append('audio', newSession.audio);
    }
    if (newSession.image) {
      formData.append('image', newSession.image);
    }
    
    // Add session details
    formData.append('session', JSON.stringify({
      title: newSession.title,
      description: newSession.description,
      longDescription: newSession.longDescription,
      duration: newSession.duration,
    }));

    const response = await fetch(`http://localhost:3000/v1/challenges/${challengeId}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to add session to challenge');
    }

    await response.json();
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[2],
  },
  backgroundColor: theme.palette.background.paper,
}));

const StyledButton = styled(Button)<ButtonProps>(({ theme }) => ({
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

const Challenges: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState<SessionForm[]>([initialSessionForm]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('http://localhost:3000/v1/challenges/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch challenges');

      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddSession = () => {
    setSessions([...sessions, { ...initialSessionForm }]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSessionChange = (index: number, field: keyof SessionForm, value: string | File | null) => {
    const newSessions = [...sessions];
    newSessions[index] = {
      ...newSessions[index],
      [field]: value,
    };
    setSessions(newSessions);
  };

  // Update the handleFileChange function
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    fileType: 'audio' | 'image'
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (fileType === 'audio') {
        try {
          const duration = await getAudioDuration(file);
          const newSessions = [...sessions];
          newSessions[index] = {
            ...newSessions[index],
            audio: file,
            duration: duration
          };
          setSessions(newSessions);
        } catch (error) {
          console.error("Error getting audio duration:", error);
          const newSessions = [...sessions];
          newSessions[index] = {
            ...newSessions[index],
            audio: file,
            duration: ""
          };
          setSessions(newSessions);
        }
      } else {
        const newSessions = [...sessions];
        newSessions[index] = {
          ...newSessions[index],
          [fileType]: file
        };
        setSessions(newSessions);
      }
    }
  };

  const handleEditClick = (challenge: Challenge) => {
    setTitle(challenge.title);
    setDescription(challenge.description);
    // Convert challenge sessions to SessionForm format
    const sessionForms = challenge.sessions.map(session => ({
      title: session.title,
      description: session.description,
      longDescription: session.longDescription ?? '',
      duration: session.duration ?? '',
      audio: null,
      image: null,
    }));
    setSessions(sessionForms);
    setEditingChallenge(challenge);
    setIsEditing(true);
    setTabValue(1); // Switch to the create/edit tab
  };

  // Modified handleSubmit to use the updated function
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      // Handle all sessions (both existing and new)
      sessions.forEach((session, index) => {
        if (session.audio) {
          // Changed to match backend expectation
          formData.append('audio', session.audio);
        }
        if (session.image) {
          // Changed to match backend expectation
          formData.append('image', session.image);
        }
      });

      // Add all sessions data
      formData.append('sessions', JSON.stringify(
        sessions.map((session, index) => ({
          id: editingChallenge?.sessions[index]?.id,
          title: session.title,
          description: session.description,
          longDescription: session.longDescription,
          duration: session.duration,
          order: index + 1,
        }))
      ));

      const url = isEditing && editingChallenge
        ? `http://localhost:3000/v1/challenges/update/${editingChallenge.id}`
        : 'http://localhost:3000/v1/challenges';

      console.log('Sending files:', formData.getAll('audio'), formData.getAll('image')); // Debug log

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} challenge`);
      }

      setSuccess(`Challenge ${isEditing ? 'updated' : 'created'} successfully!`);
      fetchChallenges();
      setTabValue(0);
      resetForm();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} challenge:`, error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function to reset the form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSessions([initialSessionForm]);
    setEditingChallenge(null);
    setIsEditing(false);
  };

  // Add this new function to handle challenge deletion
  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:3000/v1/challenges/delete/${challengeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete challenge');
      }

      setSuccess('Challenge deleted successfully!');
      fetchChallenges(); // Refresh the challenges list
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to handle session deletion
  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:3000/v1/challenges/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete session');
      }

      const data = await response.json();
      setSuccess('Session deleted successfully!');
      
      // Update the challenges list with the updated challenge data
      setChallenges(challenges.map(challenge => 
        challenge.id === data.challenge.id ? data.challenge : challenge
      ));

      // If we're in edit mode, also update the sessions state
      if (isEditing && editingChallenge) {
        // Find the index of the deleted session
        const sessionIndex = editingChallenge.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
          // Remove the session from the sessions state
          const newSessions = [...sessions];
          newSessions.splice(sessionIndex, 1);
          setSessions(newSessions);

          // Update the editingChallenge state to reflect the change
          const updatedChallenge = {
            ...editingChallenge,
            sessions: editingChallenge.sessions.filter(s => s.id !== sessionId)
          };
          setEditingChallenge(updatedChallenge);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add this new function inside the Challenges component
  const handleToggleActivation = async (challengeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:3000/v1/challenges/toggle-activation/${challengeId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle challenge activation');
      }

      const data = await response.json();
      setSuccess(data.message);
      
      // Update the challenges list with the updated challenge data
      setChallenges(challenges.map(challenge => 
        challenge.id === challengeId ? data.challenge : challenge
      ));
    } catch (error) {
      console.error('Error toggling challenge activation:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: '500', color: '#333', mb: 4 }}>
        Challenge Management
      </Typography>
      <StyledCard>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="challenge tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 3
            }}
          >
            <StyledTab label="Overview" />
            <StyledTab label={isEditing ? "Edit Challenge" : "Create Challenge"} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {challenges?.map((challenge) => (
                <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                        {challenge.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {challenge.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={challenge.activated}
                              onChange={() => handleToggleActivation(challenge.id)}
                              disabled={loading}
                            />
                          }
                          label={challenge.activated ? "Active" : "Inactive"}
                        />
                      </Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Sessions ({challenge.sessions.length}):
                      </Typography>
                      <List dense>
                        {challenge.sessions.map((session) => (
                          <ListItem key={session.id} sx={{ px: 0 }}>
                            <ListItemText
                              primary={session.title}
                              secondary={`Order: ${session.order}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleDeleteSession(session.id)}
                                disabled={loading}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <StyledButton
                          startIcon={<EditIcon />}
                          onClick={() => handleEditClick(challenge)}
                          variant="outlined"
                          size="small"
                        >
                          Edit
                        </StyledButton>
                        <StyledButton
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          disabled={loading}
                          color="error"
                          variant="contained"
                          size="small"
                        >
                          Delete
                        </StyledButton>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Challenge Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Challenge Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>

                {sessions.map((session, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Session {index + 1}
                        {(sessions.length > 1 || editingChallenge?.sessions[index]?.id) && (
                          <IconButton
                            onClick={() => {
                              if (editingChallenge?.sessions[index]?.id) {
                                handleDeleteSession(editingChallenge.sessions[index].id);
                              } else {
                                handleRemoveSession(index);
                              }
                            }}
                            sx={{ float: 'right' }}
                            color="error"
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Session Title"
                            value={session.title}
                            onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Short Description"
                            value={session.description}
                            onChange={(e) => handleSessionChange(index, 'description', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Long Description"
                            value={session.longDescription}
                            onChange={(e) => handleSessionChange(index, 'longDescription', e.target.value)}
                            multiline
                            rows={4}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <input
                            accept="audio/*"
                            style={{ display: 'none' }}
                            id={`audio-file-upload-${index}`}
                            type="file"
                            onChange={(e) => handleFileChange(e, index, 'audio')}
                          />
                          <label htmlFor={`audio-file-upload-${index}`}>
                            <UploadButton
                              variant="contained"
                              component="span"
                              startIcon={<CloudUploadIcon />}
                            >
                              Upload Audio
                            </UploadButton>
                          </label>
                          {session.audio && (
                            <Typography variant="body2">{session.audio.name}</Typography>
                          )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id={`image-file-upload-${index}`}
                            type="file"
                            onChange={(e) => handleFileChange(e, index, 'image')}
                          />
                          <label htmlFor={`image-file-upload-${index}`}>
                            <UploadButton
                              variant="contained"
                              component="span"
                              startIcon={<CloudUploadIcon />}
                            >
                              Upload Image
                            </UploadButton>
                          </label>
                          {session.image && (
                            <Typography variant="body2">{session.image.name}</Typography>
                          )}
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                ))}

                <Grid item xs={12}>
                  <StyledButton
                    variant="outlined"
                    onClick={handleAddSession}
                    startIcon={<AddIcon />}
                    sx={{ mr: 2 }}
                  >
                    Add Session
                  </StyledButton>
                  <StyledButton
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: 'common.white' }} />
                    ) : (
                      isEditing ? "Update Challenge" : "Create Challenge"
                    )}
                  </StyledButton>
                </Grid>
              </Grid>
            </form>
          </TabPanel>
        </CardContent>
      </StyledCard>

      {error && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {success && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="success">{success}</Alert>
        </Box>
      )}
    </PageBackground>
  );
};

export default Challenges; 