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
  Chip,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, CloudUpload, Star, Save, Search, FilterList } from '@mui/icons-material';
interface Session {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  categories: string[];
  subCategories: SessionSubCategory[];
  activated: boolean;
  highlighted: boolean;
  type: 'journey' | 'condition';
}

interface NewSession {
  title: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  audio: File | null;
  image: File | null;
  duration: string;
  activated: boolean;
  startQuestion: string;
  startQuestionLeftLabel: string;
  startQuestionRightLabel: string;
  endQuestion: string;
  endQuestionLeftLabel: string;
  endQuestionRightLabel: string;
  author: string;
  type: 'journey' | 'condition';
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

interface Category {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface SubCategory {
  id: string;
  name: string;
}

interface SessionSubCategory {
  id: number;
  sessionId: string;
  subCategoryId: string;
  createdAt: string;
  subCategory: {
    id: string;
    name: string;
  };
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

const CategoryTag = styled(Typography)(({ theme }) => ({
  display: 'inline-block',
  padding: theme.spacing(0.5, 1),
  marginRight: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const TypeTag = styled(Typography)(({ theme }) => ({
  display: 'inline-block',
  padding: theme.spacing(0.5, 1),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.error.main,
  color: theme.palette.error.contrastText,
  borderRadius: theme.shape.borderRadius,
  fontSize: '0.75rem',
  fontWeight: 500,
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const getAudioDuration = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      const minutes = Math.floor(audio.duration / 60);
      const seconds = Math.floor(audio.duration % 60);
      resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
  });
};

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sessions, setSessions] = useState<GroupedSessions>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState<NewSession>({
    title: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    audio: null,
    image: null,
    duration: '',
    activated: true,
    startQuestion: '',
    startQuestionLeftLabel: '',
    startQuestionRightLabel: '',
    endQuestion: '',
    endQuestionLeftLabel: '',
    endQuestionRightLabel: '',
    author: '',
    type: 'journey',
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [sessionToHighlight, setSessionToHighlight] = useState<string | null>(null);
  const [openHighlightDialog, setOpenHighlightDialog] = useState(false);
  const [highlightAction, setHighlightAction] = useState<'highlight' | 'unhighlight'>('highlight');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'journey' | 'condition'>('all');
  const [filterActivated, setFilterActivated] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchSessions();
    fetchHighlightedSessions();
    fetchHelpOptionContents();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch("https://prodandningsapoteketbackoffice.online/v1/backoffice/sessions/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch sessions");

      const data = await response.json();

      const groupedSessions = data?.items?.reduce(
        (acc: GroupedSessions, session: Session) => {
          const categoryName = session.type === 'journey' 
            ? (session?.category?.name || 'Uncategorized')
            : 'Conditions';

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }
          acc[categoryName].push(session);
          return acc;
        },
        {} as GroupedSessions
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

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/sessions/highlighted', {
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

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/help-option-contents', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch help option contents');

      const data = await response.json();
      setHelpOptionContents(data.contents || []);
    } catch (error) {
      console.error('Error fetching help option contents:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch categories');

      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

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
      console.error('Error fetching subcategories:', error);
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
          if (key === 'audio' || key === 'image') {
            if (value instanceof File) {
              formData.append(key, value);
            }
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/sessions/upload', {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload session');

      await fetchSessions();
      setNewSession({
        title: '', 
        description: '', 
        categoryId: '', 
        subCategoryId: '', 
        audio: null, 
        image: null, 
        duration: '', 
        activated: true, 
        startQuestion: '', 
        startQuestionLeftLabel: '',
        startQuestionRightLabel: '',
        endQuestion: '', 
        endQuestionLeftLabel: '',
        endQuestionRightLabel: '',
        author: '',
        type: 'journey',
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

      const subCategoryIds = selectedSession.type === 'condition' 
        ? selectedSession.subCategories.map(sc => sc.subCategory.id)
        : [];

      const requestBody = {
        title: selectedSession.title,
        description: selectedSession.description,
        type: selectedSession.type,
        categoryId: selectedSession.type === 'journey' ? selectedSession.category?.id : null,
        subCategoryIds: selectedSession.type === 'condition' ? JSON.stringify(subCategoryIds) : null,
        activated: selectedSession.activated,
        highlighted: selectedSession.highlighted
      };

      console.log('Update request body:', requestBody);

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/sessions/update/${selectedSession.id}`, {
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
        const newSessions: GroupedSessions = { ...prevSessions };
        
        // Add safety checks and logging
        if (!updatedSession) {
          console.error('Updated session is undefined');
          return prevSessions;
        }

        // Log the structure to debug
        console.log('Updated session:', updatedSession);

        // Check the response structure and access the correct path
        const categoryName = selectedSession.type === 'journey'
          ? (selectedSession.category?.name || 'Uncategorized')
          : 'Conditions';
        
        // Remove from old category
        Object.keys(newSessions).forEach((category: string) => {
          newSessions[category] = newSessions[category].filter(
            (session: Session) => session.id !== selectedSession.id
          );
          
          // Clean up empty categories
          if (newSessions[category].length === 0) {
            delete newSessions[category];
          }
        });

        // Add to new/current category
        if (!newSessions[categoryName]) {
          newSessions[categoryName] = [];
        }
        
        // Add the session with the correct structure
        const sessionToAdd = updatedSession.session || updatedSession;
        newSessions[categoryName].push(sessionToAdd);

        return newSessions;
      });
      
      setIsEditing(false);
      setOpenSessionDialog(false);
    } catch (error) {
      console.error('Update error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  const handleDeleteClick = () => setOpenDeleteDialog(true);

  const handleConfirmDelete = async () => {
    if (!selectedSession) return;

    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/sessions/delete/${selectedSession.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete session');

      setSessions((prevSessions: GroupedSessions) => {
        const newSessions = { ...prevSessions };
        const categoryName = selectedSession?.category?.name || 'uncategorized';
        
        if (categoryName && newSessions[categoryName]) {
          newSessions[categoryName] = newSessions[categoryName].filter(
            (session: Session) => session.id !== selectedSession.id
          );
          
          // Clean up empty categories
          if (newSessions[categoryName].length === 0) {
            delete newSessions[categoryName];
          }
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

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/sessions/toggle-highlight/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to toggle session highlight");

      // Update the sessions state with the new highlighted value
      setSessions((prevSessions: GroupedSessions) => {
        const newSessions = { ...prevSessions };
        Object.keys(newSessions).forEach(categoryName => {
          newSessions[categoryName] = newSessions[categoryName].map((session: Session) =>
            session.id === sessionId ? { ...session, highlighted: !session.highlighted } : session
          );
        });
        return newSessions;
      });

      // Update highlighted sessions immediately
      setHighlightedSessions(prev => {
        const isCurrentlyHighlighted = prev.some(session => session.id === sessionId);
        if (isCurrentlyHighlighted) {
          return prev.filter(session => session.id !== sessionId);
        } else {
          const sessionToAdd = Object.values(sessions)
            .flat()
            .find(session => session.id === sessionId);
          return sessionToAdd ? [...prev, { ...sessionToAdd, highlighted: true }] : prev;
        }
      });
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

      const response = await fetch('https://prodandningsapoteketbackoffice.online/v1/backoffice/update-help-option-content', {
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

      const response = await fetch(`https://prodandningsapoteketbackoffice.online/v1/backoffice/help-option-content/${encodeURIComponent(optionToDelete)}`, {
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

  const handleHighlightToggleClick = (sessionId: string, currentHighlightState: boolean) => {
    setSessionToHighlight(sessionId);
    setHighlightAction(currentHighlightState ? 'unhighlight' : 'highlight');
    setOpenHighlightDialog(true);
  };

  const handleConfirmHighlight = async () => {
    if (!sessionToHighlight) return;
    
    try {
      await handleHighlightToggle(sessionToHighlight);
    } finally {
      setOpenHighlightDialog(false);
      setSessionToHighlight(null);
    }
  };

  const getFilteredSessions = (sessions: GroupedSessions): GroupedSessions => {
    const filteredSessions: GroupedSessions = {};

    Object.entries(sessions).forEach(([category, sessionList]) => {
      const filtered = sessionList.filter(session => {
        const matchesSearch = searchQuery.toLowerCase() === '' || 
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.description.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || session.type === filterType;

        const matchesActivation = filterActivated === 'all' ||
          (filterActivated === 'active' && session.activated) ||
          (filterActivated === 'inactive' && !session.activated);

        return matchesSearch && matchesType && matchesActivation;
      });

      if (filtered.length > 0) {
        filteredSessions[category] = filtered;
      }
    });

    return filteredSessions;
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
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }} className="content-container">
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 500, color: 'text.primary', mb: 4 }}>
        Journey Management
      </Typography>
      <Box sx={{ mb: 3 }}>
        <TabButton active={activeTab === 0} onClick={() => setActiveTab(0)}>Journeys</TabButton>
        <TabButton active={activeTab === 1} onClick={() => setActiveTab(1)}>Upload New Journey</TabButton>
        <TabButton active={activeTab === 2} onClick={() => setActiveTab(2)}>Help Content</TabButton>
      </Box>
      <StyledCard>
        <CardContent>
          {activeTab === 0 && (
            <>
              <SearchContainer>
                <StyledTextField
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <StyledSelect
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                    displayEmpty
                    startAdornment={<FilterList sx={{ color: 'text.secondary', mr: 1 }} />}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="journey">Journeys</MenuItem>
                    <MenuItem value="condition">Conditions</MenuItem>
                  </StyledSelect>
                </FormControl>
                <FormControl sx={{ minWidth: 120 }}>
                  <StyledSelect
                    value={filterActivated}
                    onChange={(e) => setFilterActivated(e.target.value as typeof filterActivated)}
                    displayEmpty
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </StyledSelect>
                </FormControl>
              </SearchContainer>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
                    Highlighted Sessions
                  </Typography>
                  <List>
                    {highlightedSessions.map((session) => (
                      <ListItem
                        key={session.id}
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                          padding: 2,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <ListItemText
                              primary={session.title}
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {session.description}
                                  </Typography>
                                  <Box sx={{ mt: 1 }}>
                                    <Chip 
                                      label={session.type} 
                                      size="small" 
                                      sx={{ mr: 1 }} 
                                    />
                                    {session.category && (
                                      <Chip 
                                        label={session.category.name} 
                                        size="small" 
                                        variant="outlined" 
                                      />
                                    )}
                                  </Box>
                                </Box>
                              }
                              primaryTypographyProps={{ fontWeight: 500 }}
                            />
                          </Box>
                          <Star sx={{ color: 'primary.main', ml: 2 }} />
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12}>
                  {Object.entries(getFilteredSessions(sessions)).map(([categoryName, categorySessions]) => (
                    <Box key={categoryName} sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: 'text.primary' }}>
                        {categoryName}
                      </Typography>
                      <List>
                        {categorySessions.map((session) => (
                          <ListItem
                            key={session.id}
                            sx={{
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' },
                              padding: 2,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <ListItemText
                                  primary={session.title}
                                  secondary={
                                    <Box>
                                      <Typography variant="body2" color="text.secondary">
                                        {session.description}
                                      </Typography>
                                      <Box sx={{ mt: 1 }}>
                                        <Chip 
                                          label={session.type} 
                                          size="small" 
                                          sx={{ mr: 1 }} 
                                        />
                                        {session.type === 'condition' && session.subCategories.map((subCat) => (
                                          <Chip
                                            key={subCat.subCategory.id}
                                            label={subCat.subCategory.name}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mr: 0.5 }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                                  }
                                  primaryTypographyProps={{ fontWeight: 500 }}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Tooltip title={session.highlighted ? "Remove from highlights" : "Add to highlights"}>
                                  <Switch
                                    checked={session.highlighted}
                                    onChange={() => handleHighlightToggleClick(session.id, session.highlighted)}
                                    color="primary"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </Tooltip>
                                <Tooltip title="Edit session">
                                  <StyledButton
                                    onClick={() => handleSessionClick(session)}
                                    variant="outlined"
                                    startIcon={<Edit />}
                                  >
                                    Edit
                                  </StyledButton>
                                </Tooltip>
                                <Tooltip title="Delete session">
                                  <StyledButton
                                    onClick={() => {
                                      setSelectedSession(session);
                                      setOpenDeleteDialog(true);
                                    }}
                                    variant="outlined"
                                    color="error"
                                    startIcon={<Delete />}
                                  >
                                    Delete
                                  </StyledButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Session Type</InputLabel>
                    <StyledSelect
                      value={newSession.type}
                      onChange={(e) => setNewSession({ ...newSession, type: e.target.value as 'journey' | 'condition' })}
                      name="type"
                      required
                    >
                      <MenuItem value="journey">Journey</MenuItem>
                      <MenuItem value="condition">Condition</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>

                {newSession.type === 'journey' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Main Category</InputLabel>
                      <StyledSelect
                        value={newSession.categoryId}
                        onChange={(e) => setNewSession({ ...newSession, categoryId: e.target.value as string })}
                        name="categoryId"
                        required
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                )}
                {newSession.type === 'condition' && (
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Subcategory</InputLabel>
                      <StyledSelect
                        value={newSession.subCategoryId}
                        onChange={(e) => {
                          const value = e.target.value as string;
                          setNewSession(prev => ({ ...prev, subCategoryId: value }));
                        }}
                        required
                      >
                        {subCategories.map((subCategory) => (
                          <MenuItem key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Grid>
                )}

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
                  <input
                    accept="audio/*"
                    style={{ display: 'none' }}
                    id="audio-file-upload"
                    type="file"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const duration = await getAudioDuration(file);
                        setNewSession({ ...newSession, audio: file, duration });
                      }
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
                {newSession.type === 'condition' && (
                  <>
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
                        label="Start Question Left Label"
                        name="startQuestionLeftLabel"
                        value={newSession.startQuestionLeftLabel}
                        onChange={handleInputChange}
                        helperText="Label for the left button in the start question (optional)"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Start Question Right Label"
                        name="startQuestionRightLabel"
                        value={newSession.startQuestionRightLabel}
                        onChange={handleInputChange}
                        helperText="Label for the right button in the start question (optional)"
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
                      <StyledTextField
                        fullWidth
                        label="End Question Left Label"
                        name="endQuestionLeftLabel"
                        value={newSession.endQuestionLeftLabel}
                        onChange={handleInputChange}
                        helperText="Label for the left button in the end question (optional)"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="End Question Right Label"
                        name="endQuestionRightLabel"
                        value={newSession.endQuestionRightLabel}
                        onChange={handleInputChange}
                        helperText="Label for the right button in the end question (optional)"
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Author"
                    name="author"
                    value={newSession.author}
                    onChange={handleInputChange}
                    required
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
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Session Type</InputLabel>
                    <StyledSelect
                      value={selectedSession.type || 'journey'}
                      onChange={(e) => setSelectedSession({ 
                        ...selectedSession, 
                        type: e.target.value as 'journey' | 'condition',
                        category: e.target.value === 'condition' ? null : selectedSession.category,
                        subCategories: e.target.value === 'journey' ? [] : selectedSession.subCategories
                      })}
                    >
                      <MenuItem value="journey">Journey</MenuItem>
                      <MenuItem value="condition">Condition</MenuItem>
                    </StyledSelect>
                  </FormControl>

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

                  {selectedSession.type === 'journey' && (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Category</InputLabel>
                      <StyledSelect
                        value={selectedSession.category?.id || ''}
                        onChange={(e) => {
                          const categoryId = e.target.value as string;
                          const category = categories.find(c => c.id === categoryId);
                          setSelectedSession({
                            ...selectedSession,
                            category: category ? {
                              id: category.id,
                              name: category.name,
                              imageUrl: category.imageUrl
                            } : null
                          } as Session);
                        }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  )}

                  {selectedSession.type === 'condition' && (
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Subcategories</InputLabel>
                      <StyledSelect
                        multiple
                        value={selectedSession.subCategories?.map(sc => sc.subCategory.id) || []}
                        onChange={(e) => {
                          const selectedIds = e.target.value as string[];
                          const selectedSubCategories: SessionSubCategory[] = selectedIds.map(id => ({
                            id: 0,
                            sessionId: selectedSession.id,
                            subCategoryId: id,
                            createdAt: new Date().toISOString(),
                            subCategory: {
                              id: id,
                              name: subCategories.find(sc => sc.id === id)?.name || ''
                            }
                          }));
                          setSelectedSession({
                            ...selectedSession,
                            subCategories: selectedSubCategories
                          });
                        }}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selectedSession.subCategories || []).map((subCat) => (
                              <Chip 
                                key={subCat.subCategory.id} 
                                label={subCat.subCategory.name} 
                                size="small"
                              />
                            ))}
                          </Box>
                        )}
                      >
                        {subCategories.map((subCategory: SubCategory) => (
                          <MenuItem key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  )}

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
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Type: {selectedSession.type === 'journey' ? 'Journey' : 'Condition'}
                  </Typography>
                  {selectedSession.type === 'journey' && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Category: {selectedSession.category?.name}
                    </Typography>
                  )}
                  {selectedSession.type === 'condition' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>Subcategories:</Typography>
                      {selectedSession.subCategories?.map((subCat) => (
                        <Chip 
                          key={subCat.subCategory.id}
                          label={subCat.subCategory.name}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
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

      <Dialog open={openHighlightDialog} onClose={() => setOpenHighlightDialog(false)}>
        <DialogTitle>Confirm {highlightAction === 'highlight' ? 'Highlight' : 'Unhighlight'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {highlightAction} this session?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <StyledButton onClick={() => setOpenHighlightDialog(false)} variant="outlined">
            Cancel
          </StyledButton>
          <StyledButton onClick={handleConfirmHighlight} variant="contained">
            Confirm
          </StyledButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Content;