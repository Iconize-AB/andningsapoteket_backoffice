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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface Session {
  id: string;
  title: string;
  description: string;
  category: string;
  categories: string[];
}

interface NewSession {
  title: string;
  description: string;
  category: string;
  categories: string;
  audio: File | null;
  image: File | null;
  duration: string;
}

interface GroupedSessions {
  [key: string]: Session[];
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
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("http://localhost:3000/v1/sessions/all", {
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewSession({ ...newSession, [name]: value });
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setNewSession({ ...newSession, category: event.target.value });
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

      const response = await fetch("http://localhost:3000/v1/sessions/upload", {
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
      setNewSession({ title: '', description: '', category: '', categories: '', audio: null, image: null, duration: '' });
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

      const response = await fetch(`http://localhost:3000/v1/sessions/update/${selectedSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: selectedSession.title,
          categories: selectedSession.categories,
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

      const response = await fetch(`http://localhost:3000/v1/sessions/delete/${selectedSession.id}`, {
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

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Content Management
      </Typography>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="content tabs"
      >
        <Tab label="Overview of Sessions" />
        <Tab label="Upload New Session" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={selectedSession ? 6 : 12}>
            {Object.entries(sessions).map(([category, categorySessions]) => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{category}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {categorySessions.map((session) => (
                      <Grid item xs={12} sm={6} md={4} key={session.id}>
                        <Card
                          onClick={() => handleSessionClick(session)}
                          sx={{ cursor: "pointer" }}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {session.title}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {session.description}
                            </Typography>
                            <div style={{ marginTop: "10px" }}>
                              {session?.categories?.map((cat) => (
                                <Chip
                                  key={cat}
                                  label={cat}
                                  style={{
                                    marginRight: "5px",
                                    marginBottom: "5px",
                                  }}
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
          {selectedSession && (
            <Grid item xs={12} md={6}>
              <Card>
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
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Session Title"
                name="title"
                value={newSession.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
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
                <Select
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
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
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
                <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                  Upload Audio
                </Button>
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
                <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
                  Upload Image
                </Button>
              </label>
              {newSession.image && (
                <Typography>{newSession.image.name}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Upload Session"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </TabPanel>
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
    </div>
  );
};

export default Content;