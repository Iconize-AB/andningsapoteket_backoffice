import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StarIcon from '@mui/icons-material/Star';
import SaveIcon from '@mui/icons-material/Save';

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
}

interface GroupedSessions {
  [key: string]: Session[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface HelpOptionContent {
  option: string;
  content: string;
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

const PageBackground = styled(Box)({
  backgroundColor: '#F4F0E5',
  minHeight: '100vh',
  padding: '24px',
});

const GradientCard = styled(Card)({
  background: 'linear-gradient(to bottom, #1E3A5F, #091D34)',
  color: '#fff',
  borderRadius: '16px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
});

const WhiteTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    color: '#fff',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#fff',
    },
  },
  '& .MuiFormHelperText-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

const WhiteSelect = styled(Select)({
  color: '#fff',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#fff',
  },
  '& .MuiSvgIcon-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

const WhiteInputLabel = styled(InputLabel)({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-focused': {
    color: '#fff',
  },
});

const WhiteFormControlLabel = styled(FormControlLabel)({
  '& .MuiFormControlLabel-label': {
    color: '#fff',
  },
});

const WhiteSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#fff',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#fff',
  },
}));

const WhiteButton = styled(Button)({
  color: '#fff',
  borderColor: '#fff',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});

const UploadButton = styled(WhiteButton)<{ component?: React.ElementType }>({
  marginTop: '16px',
  marginBottom: '8px',
});

const StyledTab = styled(Tab)({
  color: '#fff',
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: 'bold',
  },
});

const StyledAccordion = styled(Accordion)({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  '&:before': {
    display: 'none',
  },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  '& .MuiAccordionSummary-content': {
    color: '#fff',
  },
});

const StyledChip = styled(Chip)({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  color: '#fff',
  margin: '4px',
});

const Content: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState<GroupedSessions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState<NewSession>({
    title: "",
    description: "",
    category: "",
    categories: "",
    audio: null,
    image: null,
    duration: "",
    activated: true,
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [highlightedSessions, setHighlightedSessions] = useState<Session[]>([]);
  const [helpOptionContents, setHelpOptionContents] = useState<HelpOptionContent[]>([]);
  const [selectedHelpOption, setSelectedHelpOption] = useState<string>('');
  const [selectedHelpContent, setSelectedHelpContent] = useState<string>('');
  const [newHelpOption, setNewHelpOption] = useState<string>('');

  useEffect(() => {
    fetchSessions();
    fetchHighlightedSessions();
    fetchHelpOptionContents();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:3000/v1/backoffice/users/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const data = await response.json();

      // Group sessions by category
      const groupedSessions = data.items.reduce(
        (acc: GroupedSessions, session: Session) => {
          if (!acc[session.category]) {
            acc[session.category] = [];
          }
          acc[session.category].push(session);
          return acc;
        },
        {}
      );

      setSessions(groupedSessions);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchHighlightedSessions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("http://localhost:3000/v1/backoffice/sessions/highlighted", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch highlighted sessions");

      const data = await response.json();
      setHighlightedSessions(data.items);
    } catch (error) {
      console.error("Error fetching highlighted sessions:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const fetchHelpOptionContents = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("http://localhost:3000/v1/backoffice/help-option-contents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch help option contents");

      const data = await response.json();
      setHelpOptionContents(data.contents);
    } catch (error) {
      console.error("Error fetching help option contents:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    let newValue: string | boolean = value;

    if (type === 'checkbox') {
      newValue = (event.target as HTMLInputElement).checked;
    }
    
    setNewSession({ 
      ...newSession, 
      [name]: newValue 
    });
  };

  const handleCategoryChange = (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => {
    const value = event.target.value;
    setNewSession({
      ...newSession,
      category: typeof value === 'string' ? value : '',
    });
  };

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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, fileType: 'audio' | 'image') => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (fileType === 'audio') {
        try {
          const duration = await getAudioDuration(file);
          setNewSession({ ...newSession, audio: file, duration });
        } catch (error) {
          console.error("Error getting audio duration:", error);
          setNewSession({ ...newSession, audio: file, duration: "" });
        }
      } else {
        setNewSession({ ...newSession, [fileType]: file });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const formData = new FormData();
      formData.append('title', newSession.title);
      formData.append('description', newSession.description);
      formData.append('category', newSession.category);
      const categoriesArray = newSession.categories.split(',').map(cat => cat.trim());
      formData.append('categories', JSON.stringify(categoriesArray));
      formData.append('duration', newSession.duration);
      if (newSession.audio) {
        formData.append('audio', newSession.audio);
      }
      if (newSession.image) {
        formData.append('image', newSession.image);
      }
      formData.append('activated', newSession.activated.toString());

      const response = await fetch("http://localhost:3000/v1/backoffice/sessions/upload", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload session");
      }

      const result = await response.json();
      console.log("Session uploaded successfully:", result);

      // Reset form and refresh sessions list
      setNewSession({ title: '', description: '', category: '', categories: '', audio: null, image: null, duration: '', activated: true });
      fetchSessions();
      setTabValue(0); // Switch back to the sessions overview tab
    } catch (error) {
      console.error("Error uploading session:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = () => {
    setOpenConfirmDialog(false);
    handleSaveEdit();
  };

  const handleCancelSave = () => {
    setOpenConfirmDialog(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://localhost:3000/v1/backoffice/sessions/update/${selectedSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedSession.title,
          description: selectedSession.description,
          category: selectedSession.category,
          categories: JSON.stringify(selectedSession.categories),
          activated: selectedSession.activated,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update session");
      }

      const updatedSession = await response.json();
      
      setSessions(prevSessions => ({
        ...prevSessions,
        [selectedSession.category]: prevSessions[selectedSession.category].map(session =>
          session.id === selectedSession.id ? updatedSession.session : session
        ),
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating session:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://localhost:3000/v1/backoffice/sessions/delete/${selectedSession.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete session");
      }

      // Remove the deleted session from the state
      setSessions(prevSessions => ({
        ...prevSessions,
        [selectedSession.category]: prevSessions[selectedSession.category].filter(session => session.id !== selectedSession.id),
      }));

      setSelectedSession(null);
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting session:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleCancelDelete = () => {
    setOpenDeleteDialog(false);
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
      setSessions(prevSessions => ({
        ...prevSessions,
        [updatedSession.session.category]: prevSessions[updatedSession.session.category].map(session =>
          session.id === updatedSession.session.id ? updatedSession.session : session
        ),
      }));

      // Update highlighted sessions
      fetchHighlightedSessions();
    } catch (error) {
      console.error("Error toggling session highlight:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  const handleHelpOptionChange = (
    event: SelectChangeEvent<unknown>,
    child: React.ReactNode
  ) => {
    const option = event.target.value;
    if (typeof option === 'string') {
      setSelectedHelpOption(option);
      const content = helpOptionContents.find(item => item.option === option)?.content || '';
      setSelectedHelpContent(content);
    }
  };

  const handleHelpContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedHelpContent(event.target.value);
  };

  const handleNewHelpOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewHelpOption(event.target.value);
  };

  const handleHelpContentSubmit = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const optionToSubmit = selectedHelpOption || newHelpOption;
      if (!optionToSubmit) {
        alert("Please select or enter a help option.");
        return;
      }

      const response = await fetch("http://localhost:3000/v1/backoffice/update-help-option-content", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          option: optionToSubmit,
          content: selectedHelpContent,
        }),
      });

      if (!response.ok) throw new Error("Failed to update help option content");

      // Clear states
      setNewHelpOption('');
      setSelectedHelpOption('');
      setSelectedHelpContent('');

      // Refresh help option contents
      await fetchHelpOptionContents();
    } catch (error) {
      console.error("Error updating help option content:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <PageBackground>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1E3A5F' }}>
        Content Management
      </Typography>
      <GradientCard>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="content tabs"
            sx={{ borderBottom: 1, borderColor: 'rgba(255, 255, 255, 0.2)', mb: 2 }}
          >
            <StyledTab label="Overview of Sessions" />
            <StyledTab label="Upload New Session" />
            <StyledTab label="Help Option Content" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={selectedSession ? 6 : 12}>
                <GradientCard sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Highlighted Sessions
                    </Typography>
                    <List>
                      {highlightedSessions.map((session) => (
                        <ListItem key={session.id}>
                          <ListItemText
                            primary={session.title}
                            secondary={`Category: ${session.category}`}
                            secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          />
                          <ListItemSecondaryAction>
                            <StarIcon sx={{ color: '#ffd700' }} />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </GradientCard>
                {Object.entries(sessions).map(([category, categorySessions]) => (
                  <StyledAccordion key={category}>
                    <StyledAccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}>
                      <Typography variant="h6">{category}</Typography>
                    </StyledAccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {categorySessions.map((session) => (
                          <Grid item xs={12} sm={6} md={4} key={session.id}>
                            <GradientCard
                              onClick={() => handleSessionClick(session)}
                              sx={{ cursor: "pointer", height: '100%' }}
                            >
                              <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                  {session.title}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                                  {session.description}
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                  {session?.categories?.map((cat) => (
                                    <StyledChip key={cat} label={cat} />
                                  ))}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                            </GradientCard>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </StyledAccordion>
                ))}
              </Grid>
              {selectedSession && (
                <Grid item xs={12} md={6}>
                  <GradientCard>
                    <CardContent>
                      {isEditing ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleSaveClick(); }}>
                          <TextField
                            fullWidth
                            label="Title"
                            value={selectedSession.title}
                            onChange={(e) =>
                              setSelectedSession({
                                ...selectedSession,
                                title: e.target.value,
                              })
                            }
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Description"
                            value={selectedSession.description}
                            onChange={(e) =>
                              setSelectedSession({
                                ...selectedSession,
                                description: e.target.value,
                              })
                            }
                            margin="normal"
                            multiline
                            rows={4}
                          />
                          <TextField
                            fullWidth
                            label="Categories"
                            value={selectedSession.categories.join(", ")}
                            onChange={(e) =>
                              setSelectedSession({
                                ...selectedSession,
                                categories: e.target.value.split(", "),
                              })
                            }
                            margin="normal"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={selectedSession.activated}
                                onChange={(e) =>
                                  setSelectedSession({
                                    ...selectedSession,
                                    activated: e.target.checked,
                                  })
                                }
                                name="activated"
                              />
                            }
                            label="Activated"
                          />
                          <FormControlLabel
                            control={
                              <Switch
                                checked={selectedSession.highlighted}
                                onChange={(e) =>
                                  setSelectedSession({
                                    ...selectedSession,
                                    highlighted: e.target.checked,
                                  })
                                }
                                name="highlighted"
                              />
                            }
                            label="Highlighted"
                          />
                          <Button type="submit" variant="contained" color="primary">
                            Save
                          </Button>
                        </form>
                      ) : (
                        <>
                          <Typography variant="h6">
                            {selectedSession.title}
                          </Typography>
                          <Typography variant="body2">
                            {selectedSession.description}
                          </Typography>
                          <div style={{ marginTop: "10px" }}>
                            {selectedSession?.categories?.map((cat) => (
                              <Chip
                                key={cat}
                                label={cat}
                                style={{ marginRight: "5px", marginBottom: "5px" }}
                              />
                            ))}
                          </div>
                          <Typography variant="body2" style={{ marginTop: "10px" }}>
                            Status: {selectedSession.activated ? "Activated" : "Deactivated"}
                          </Typography>
                          <Typography variant="body2" style={{ marginTop: "10px" }}>
                            Highlighted: {selectedSession.highlighted ? "Yes" : "No"}
                          </Typography>
                          <Button
                            startIcon={<EditIcon />}
                            onClick={handleEditClick}
                            style={{ marginTop: "10px", marginRight: "10px" }}
                          >
                            Edit
                          </Button>
                          <Button
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteClick}
                            style={{ marginTop: "10px" }}
                            color="error"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </GradientCard>
                </Grid>
              )}
            </Grid>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <WhiteTextField
                    fullWidth
                    label="Session Title"
                    name="title"
                    value={newSession.title}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <WhiteTextField
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
                    <WhiteInputLabel>Main Category</WhiteInputLabel>
                    <WhiteSelect
                      value={newSession.category}
                      onChange={handleCategoryChange}
                      name="category"
                      required
                    >
                      {['Fire', 'Earth', 'Water', 'Wind'].map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </MenuItem>
                      ))}
                    </WhiteSelect>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <WhiteTextField
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
                    style={{ display: "none" }}
                    id="audio-file-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'audio')}
                  />
                  <label htmlFor="audio-file-upload">
                    <UploadButton variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                      Upload Audio
                    </UploadButton>
                  </label>
                  {newSession.audio && (
                    <Typography>{newSession.audio.name} (Duration: {newSession.duration})</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="image-file-upload"
                    type="file"
                    onChange={(e) => handleFileChange(e, 'image')}
                  />
                  <label htmlFor="image-file-upload">
                    <UploadButton variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                      Upload Image
                    </UploadButton>
                  </label>
                  {newSession.image && (
                    <Typography>{newSession.image.name}</Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <WhiteFormControlLabel
                    control={
                      <WhiteSwitch
                        checked={newSession.activated}
                        onChange={handleInputChange}
                        name="activated"
                      />
                    }
                    label="Activate session"
                  />
                </Grid>
                <Grid item xs={12}>
                  <WhiteButton 
                    type="submit" 
                    variant="outlined" 
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : "Upload Session"}
                  </WhiteButton>
                </Grid>
              </Grid>
            </form>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <WhiteInputLabel>Select Help Option</WhiteInputLabel>
                  <WhiteSelect
                    value={selectedHelpOption}
                    onChange={handleHelpOptionChange}
                    required
                  >
                    {helpOptionContents.map((option) => (
                      <MenuItem key={option.option} value={option.option}>
                        {option.option}
                      </MenuItem>
                    ))}
                  </WhiteSelect>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <WhiteTextField
                  fullWidth
                  label="Or Enter New Help Option"
                  value={newHelpOption}
                  onChange={handleNewHelpOptionChange}
                />
              </Grid>
              <Grid item xs={12}>
                <WhiteTextField
                  fullWidth
                  label="Help Content"
                  multiline
                  rows={6}
                  value={selectedHelpContent}
                  onChange={handleHelpContentChange}
                />
              </Grid>
              <Grid item xs={12}>
                <WhiteButton
                  onClick={handleHelpContentSubmit}
                  variant="outlined"
                  startIcon={<SaveIcon />}
                >
                  Save Help Content
                </WhiteButton>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1E3A5F' }}>
                  Existing Help Options
                </Typography>
                <List>
                  {helpOptionContents.map((item) => (
                    <ListItem key={item.option}>
                      <ListItemText
                        primary={item.option}
                        secondary={item.content}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </GradientCard>
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelSave}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Changes"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to save these changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSave}>Cancel</Button>
          <Button onClick={handleConfirmSave} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDeleteDialog}
        onClose={handleCancelDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete "{selectedSession?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageBackground>
  );
};

export default Content;
