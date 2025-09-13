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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ButtonProps } from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { getApiUrlForEndpoint } from '../utils/apiConfig';

// Reuse styled components from Challenges.tsx
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
}));

const UploadButton = styled(Button)<ButtonProps>(({ theme }) => ({
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

interface SessionForm {
  title: string;
  description: string;
  longDescription: string;
  duration: string;
  day: number;
  audio: File | null;
  image: File | null;
}

const initialSessionForm: SessionForm = {
  title: '',
  description: '',
  longDescription: '',
  duration: '',
  day: 1,
  audio: null,
  image: null,
};

interface SixDayChallenge {
  id: string;
  title: string;
  description: string;
  sessions: {
    id: string;
    title: string;
    description: string;
    longDescription?: string;
    duration?: string;
    day: number;
    audioUrl?: string;
    imageUrl?: string;
  }[];
}

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

interface ChallengeSession {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  duration?: string;
  day: number;
  audioUrl?: string;
  imageUrl?: string;
}

interface DeleteSessionResponse {
  challenge: SixDayChallenge;
}

const SixDayChallenges: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [challenges, setChallenges] = useState<SixDayChallenge[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sessions, setSessions] = useState<SessionForm[]>([initialSessionForm]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<SixDayChallenge | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(getApiUrlForEndpoint('/v1/challenges/sixday/all'), {
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
    setSessions([...sessions, { ...initialSessionForm, day: sessions.length + 1 }]);
  };

  const handleRemoveSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const handleSessionChange = (index: number, field: keyof SessionForm, value: any) => {
    const newSessions = [...sessions];
    newSessions[index] = {
      ...newSessions[index],
      [field]: value,
    };
    setSessions(newSessions);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    fileType: 'audio' | 'image'
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const newSessions = [...sessions];
      newSessions[index] = {
        ...newSessions[index],
        [fileType]: file,
      };
      setSessions(newSessions);
    }
  };

  const handleEditClick = (challenge: SixDayChallenge) => {
    setTitle(challenge.title);
    setDescription(challenge.description);
    const sessionForms = challenge.sessions.map(session => ({
      title: session.title,
      description: session.description,
      longDescription: session.longDescription ?? '',
      duration: session.duration ?? '',
      day: session.day,
      audio: null,
      image: null,
    }));
    setSessions(sessionForms);
    setEditingChallenge(challenge);
    setIsEditing(true);
    setTabValue(1);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSessions([initialSessionForm]);
    setEditingChallenge(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      sessions.forEach((session, index) => {
        if (session.audio) {
          formData.append(`audio_${index}`, session.audio);
        }
        if (session.image) {
          formData.append(`image_${index}`, session.image);
        }
      });

      formData.append('sessions', JSON.stringify(
        sessions.map((session, index) => ({
          id: editingChallenge?.sessions[index]?.id,
          title: session.title,
          description: session.description,
          longDescription: session.longDescription,
          duration: session.duration,
          day: session.day,
        }))
      ));

      const url = isEditing && editingChallenge
        ? `https://prodandningsapoteketbackoffice.online/v1/challenges/sixday/update/${editingChallenge.id}`
        : 'https://prodandningsapoteketbackoffice.online/v1/challenges/sixday/create';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'create'} challenge`);

      setSuccess(`Six day challenge ${isEditing ? 'updated' : 'created'} successfully!`);
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

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(getApiUrlForEndpoint(`/v1/challenges/sixday/delete/${challengeId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete challenge');

      setSuccess('Challenge deleted successfully!');
      fetchChallenges();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(getApiUrlForEndpoint(`/v1/challenges/sixday/session/delete/${sessionId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete session');

      const data: DeleteSessionResponse = await response.json();
      setSuccess('Session deleted successfully!');
      
      setChallenges(challenges.map(challenge => 
        challenge.id === data.challenge.id ? data.challenge : challenge
      ));

      if (isEditing && editingChallenge?.id === data.challenge.id) {
        const sessionForms = data.challenge.sessions.map((session: ChallengeSession) => ({
          title: session.title,
          description: session.description,
          longDescription: session.longDescription ?? '',
          duration: session.duration ?? '',
          day: session.day,
          audio: null,
          image: null,
        }));
        setSessions(sessionForms);
        setEditingChallenge(data.challenge);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: '500', color: '#333', mb: 4 }}>
        Six Day Challenge Management
      </Typography>
      <StyledCard>
        <CardContent>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tab label="Overview" />
            <Tab label={isEditing ? "Edit Challenge" : "Create Challenge"} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {challenges.map((challenge) => (
                <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                        {challenge.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {challenge.description}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Sessions ({challenge.sessions.length}):
                      </Typography>
                      <List dense>
                        {challenge.sessions
                          .sort((a, b) => a.day - b.day)
                          .map((session) => (
                            <ListItem key={session.id}>
                              <ListItemText
                                primary={session.title}
                                secondary={`Day ${session.day}`}
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
                    <StyledCard sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Day {session.day}
                        {sessions.length > 1 && (
                          <IconButton
                            onClick={() => handleRemoveSession(index)}
                            sx={{ float: 'right' }}
                            color="error"
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
                            id={`audio-file-${index}`}
                            type="file"
                            onChange={(e) => handleFileChange(e, index, 'audio')}
                          />
                          <label htmlFor={`audio-file-${index}`}>
                            <UploadButton component="span" startIcon={<CloudUploadIcon />}>
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
                            id={`image-file-${index}`}
                            type="file"
                            onChange={(e) => handleFileChange(e, index, 'image')}
                          />
                          <label htmlFor={`image-file-${index}`}>
                            <UploadButton component="span" startIcon={<CloudUploadIcon />}>
                              Upload Image
                            </UploadButton>
                          </label>
                          {session.image && (
                            <Typography variant="body2">{session.image.name}</Typography>
                          )}
                        </Grid>
                      </Grid>
                    </StyledCard>
                  </Grid>
                ))}

                {sessions.length < 6 && (
                  <Grid item xs={12}>
                    <StyledButton
                      variant="outlined"
                      onClick={handleAddSession}
                      startIcon={<AddIcon />}
                      sx={{ mr: 2 }}
                    >
                      Add Day
                    </StyledButton>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <StyledButton
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
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
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>
      )}
    </PageBackground>
  );
};

export default SixDayChallenges; 