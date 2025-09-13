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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
  Chip,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, CloudUpload, Star, Search, FilterList } from '@mui/icons-material';
import { getApiUrl } from '../utils/apiConfig';

interface Question {
  id: number;
  question: string;
}

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
  newImage?: File;
  newAudioPlayerImage?: File;
  imageUrl?: string;
  audioPlayerImageUrl?: string;
  subCategories: SessionSubCategory[];
  activated: boolean;
  highlighted: boolean;
  type: 'journey' | 'condition';
  startQuestion?: Question;
  endQuestion?: Question;
  startQuestionRanges?: {
    range1: string;
    range2: string;
    range3: string;
    range4: string;
    range5: string;
  };
  endQuestionRanges?: {
    range1: string;
    range2: string;
    range3: string;
    range4: string;
    range5: string;
  };
  conditionCategory?: string;
  sessionEndDuration: number;
  authorId?: string;
}

interface NewSession {
  title: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  audio: File | null;
  image: File | null;
  duration: string;
  sessionEndDuration: number;
  activated: boolean;
  startQuestion: Question | null;
  endQuestion: Question | null;
  authorId: string;
  type: 'journey' | 'condition';
  isStressedQuestion: boolean;
  startQuestionRanges: {
    range1: string;
    range2: string;
    range3: string;
    range4: string;
    range5: string;
  };
  endQuestionRanges: {
    range1: string;
    range2: string;
    range3: string;
    range4: string;
    range5: string;
  };
  numberOfRounds: number;
  roundBreathHolds: number[];
  includeQuestions: boolean;
  language: string;
  conditionCategory?: string;
  audioPlayerImage: File | null;
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

const getRangePlaceholder = (rangeNum: number): string => {
  const ranges = {
    1: 'Very Low',
    2: 'Low',
    3: 'Moderate',
    4: 'High',
    5: 'Very High'
  };
  return ranges[rangeNum as keyof typeof ranges];
};

const handleRangeUpdate = (
  type: 'start' | 'end',
  rangeNum: number,
  value: string,
  session: Session
): Session => {
  const rangeKey = `range${rangeNum}` as keyof typeof session.startQuestionRanges;
  
  if (type === 'start') {
    const currentRanges = {
      range1: '',
      range2: '',
      range3: '',
      range4: '',
      range5: '',
      ...session.startQuestionRanges,
      [rangeKey]: value || ''
    };

    return {
      ...session,
      startQuestionRanges: currentRanges
    };
  } else {
    const currentRanges = {
      range1: '',
      range2: '',
      range3: '',
      range4: '',
      range5: '',
      ...session.endQuestionRanges,
      [rangeKey]: value || ''
    };

    return {
      ...session,
      endQuestionRanges: currentRanges
    };
  }
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
    sessionEndDuration: 0,
    activated: true,
    startQuestion: null,
    endQuestion: null,
    authorId: '',
    type: 'journey',
    isStressedQuestion: false,
    startQuestionRanges: {
      range1: '',
      range2: '',
      range3: '',
      range4: '',
      range5: '',
    },
    endQuestionRanges: {
      range1: '',
      range2: '',
      range3: '',
      range4: '',
      range5: '',
    },
    numberOfRounds: 2,
    roundBreathHolds: Array(2).fill(0),
    includeQuestions: false,
    language: 'sv',
    conditionCategory: '',
    audioPlayerImage: null,
  });
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [highlightedSessions, setHighlightedSessions] = useState<Session[]>([]);
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [sessionToHighlight, setSessionToHighlight] = useState<string | null>(null);
  const [openHighlightDialog, setOpenHighlightDialog] = useState(false);
  const [highlightAction, setHighlightAction] = useState<'highlight' | 'unhighlight'>('highlight');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'journey' | 'condition'>('all');
  const [filterActivated, setFilterActivated] = useState<'all' | 'active' | 'inactive'>('all');


  const languageOptions = [
    { value: 'sv', label: 'Swedish' },
    { value: 'en', label: 'English' },
  ];

  useEffect(() => {
    fetchSessions();
    fetchHighlightedSessions();
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(getApiUrl("/v1/backoffice/sessions/all"), {
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

      const response = await fetch(getApiUrl('/v1/backoffice/sessions/highlighted'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch highlighted sessions');

      const data = await response.json();
      setHighlightedSessions(data.items || []);
    } catch (error) {
      console.error('Error fetching highlighted sessions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(getApiUrl('/v1/backoffice/categories'), {
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

      const response = await fetch(getApiUrl('/v1/backoffice/sub-categories'), {
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
      
      // Add basic session data
      formData.append('title', newSession.title);
      formData.append('description', newSession.description);
      formData.append('type', newSession.type);
      formData.append('activated', String(newSession.activated));
      formData.append('authorId', newSession.authorId);
      formData.append('language', newSession.language);
      formData.append('sessionEndDuration', String(newSession.sessionEndDuration));
      // Add category or subcategory based on type
      if (newSession.type === 'journey') {
        formData.append('categoryId', newSession.categoryId);
      } else if (newSession.type === 'condition') {
        formData.append('subCategoryId', newSession.subCategoryId);
        if (newSession.conditionCategory) {
          formData.append('conditionCategory', newSession.conditionCategory);
        }
        
        // Add start question ranges
        formData.append('startQuestionRange1', newSession.startQuestionRanges.range1);
        formData.append('startQuestionRange2', newSession.startQuestionRanges.range2);
        formData.append('startQuestionRange3', newSession.startQuestionRanges.range3);
        formData.append('startQuestionRange4', newSession.startQuestionRanges.range4);
        formData.append('startQuestionRange5', newSession.startQuestionRanges.range5);

        // Add end question ranges
        formData.append('endQuestionRange1', newSession.endQuestionRanges.range1);
        formData.append('endQuestionRange2', newSession.endQuestionRanges.range2);
        formData.append('endQuestionRange3', newSession.endQuestionRanges.range3);
        formData.append('endQuestionRange4', newSession.endQuestionRanges.range4);
        formData.append('endQuestionRange5', newSession.endQuestionRanges.range5);
      }

      // Add files if present
      if (newSession.audio instanceof File) {
        formData.append('audio', newSession.audio);
      }
      if (newSession.image instanceof File) {
        formData.append('image', newSession.image);
      }
      if (newSession.duration) {
        formData.append('duration', newSession.duration);
      }

      // Add questions data separately
      if (newSession.type === 'condition' && newSession.includeQuestions) {
        if (newSession.startQuestion) {
          formData.append('startQuestion', newSession.startQuestion.question);
        }
        if (newSession.endQuestion) {
          formData.append('endQuestion', newSession.endQuestion.question);
        }
      }

      // Add isStressedQuestion to formData
      formData.append('isStressedQuestion', String(newSession.isStressedQuestion));

      // Add number of rounds and breath holds
      formData.append('numberOfRounds', String(newSession.numberOfRounds));
      newSession.roundBreathHolds.forEach((seconds, index) => {
        formData.append(`roundBreathHolds[${index}]`, String(seconds));
      });

      // Add audio player image if present
      if (newSession.audioPlayerImage instanceof File) {
        formData.append('audioPlayerImage', newSession.audioPlayerImage);
      }

      const response = await fetch(getApiUrl('/v1/backoffice/sessions/upload'), {
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
        sessionEndDuration: 0,
        activated: true, 
        startQuestion: null,
        endQuestion: null,
        authorId: '',
        type: 'journey',
        isStressedQuestion: false,
        startQuestionRanges: {
          range1: '',
          range2: '',
          range3: '',
          range4: '',
          range5: '',
        },
        endQuestionRanges: {
          range1: '',
          range2: '',
          range3: '',
          range4: '',
          range5: '',
        },
        numberOfRounds: 5,
        roundBreathHolds: Array(5).fill(0),
        includeQuestions: false,
        language: 'sv',
        conditionCategory: '',
        audioPlayerImage: null,
      });
      setActiveTab(0);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    // Ensure we have properly initialized ranges objects
    const sessionWithRanges = {
      ...session,
      startQuestionRanges: session.startQuestionRanges || {
        range1: '',
        range2: '',
        range3: '',
        range4: '',
        range5: '',
      },
      endQuestionRanges: session.endQuestionRanges || {
        range1: '',
        range2: '',
        range3: '',
        range4: '',
        range5: '',
      }
    };
    setSelectedSession(sessionWithRanges);
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

    const formData = new FormData();
    
    const requestBody = {
      title: selectedSession.title,
      description: selectedSession.description,
      type: selectedSession.type,
      categoryId: selectedSession.type === 'journey' ? selectedSession.category?.id : null,
      subCategoryIds: selectedSession.type === 'condition' ? JSON.stringify(selectedSession.subCategories.map(sc => sc.subCategory.id)) : null,
      activated: selectedSession.activated,
      highlighted: selectedSession.highlighted,
      conditionCategory: selectedSession.type === 'condition' ? selectedSession.conditionCategory : null,
      sessionEndDuration: selectedSession.sessionEndDuration,
      authorId: selectedSession.authorId || null,
      ...(selectedSession.type === 'condition' && {
        startQuestion: selectedSession.startQuestion?.question,
        endQuestion: selectedSession.endQuestion?.question,
        startQuestionRanges: selectedSession.startQuestionRanges,
        endQuestionRanges: selectedSession.endQuestionRanges,
      }),
    };

    // Add all request body fields to formData
    Object.entries(requestBody).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    // Add new image if it exists
    if (selectedSession.newImage instanceof File) {
      formData.append('image', selectedSession.newImage);
    }

    // Add new audio player image if it exists
    if (selectedSession.newAudioPlayerImage instanceof File) {
      formData.append('audioPlayerImage', selectedSession.newAudioPlayerImage);
    }

    const response = await fetch(getApiUrl(`/v1/backoffice/sessions/update/${selectedSession.id}`), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update session');
      }

      const updatedSession = await response.json();
      
      setSessions((prevSessions: GroupedSessions) => {
        const newSessions: GroupedSessions = { ...prevSessions };
        
        if (!updatedSession) {
          console.error('Updated session is undefined');
          return prevSessions;
        }

        console.log('Updated session:', updatedSession);

        const categoryName = selectedSession.type === 'journey'
          ? (selectedSession.category?.name || 'Uncategorized')
          : 'Conditions';
        
        Object.keys(newSessions).forEach((category: string) => {
          newSessions[category] = newSessions[category].filter(
            (session: Session) => session.id !== selectedSession.id
          );
          
          if (newSessions[category].length === 0) {
            delete newSessions[category];
          }
        });

        if (!newSessions[categoryName]) {
          newSessions[categoryName] = [];
        }
        
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

      const response = await fetch(getApiUrl(`/v1/backoffice/sessions/delete/${selectedSession.id}`), {
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

      const response = await fetch(getApiUrl(`/v1/backoffice/sessions/toggle-highlight/${sessionId}`), {
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

  console.log(selectedSession);

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
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="audio-player-image-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setNewSession({ ...newSession, audioPlayerImage: file });
                    }}
                  />
                  <label htmlFor="audio-player-image-upload">
                    <StyledButton variant="outlined" component="span" startIcon={<CloudUpload />}>
                      Upload Audio Player Image
                    </StyledButton>
                  </label>
                  {newSession.audioPlayerImage && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {newSession.audioPlayerImage.name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Session End Duration (seconds)"
                    type="number"
                    value={newSession.sessionEndDuration || 0}
                    onChange={(e) => setNewSession({
                      ...newSession,
                      sessionEndDuration: parseFloat(e.target.value) || 0
                    })}
                    margin="normal"
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText="Enter when the session should end in seconds (e.g., 330 for 5:30)"
                  />
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
                  <FormControl fullWidth>
                    <InputLabel>Is Stressed Question</InputLabel>
                    <StyledSelect
                      value={newSession.isStressedQuestion ? 'true' : 'false'}
                      onChange={(e) => setNewSession({ ...newSession, isStressedQuestion: e.target.value === 'true' })}
                      name="isStressedQuestion"
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Number of Rounds</InputLabel>
                    <StyledSelect
                      value={newSession.numberOfRounds}
                      onChange={(e) => {
                        const rounds = Number(e.target.value);
                        setNewSession({
                          ...newSession,
                          numberOfRounds: rounds,
                          roundBreathHolds: Array(rounds).fill(0)
                        });
                      }}
                    >
                      {[...Array(10)].map((_, i) => (
                        <MenuItem key={i + 1} value={i + 1}>
                          {i + 1}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>

                {newSession.roundBreathHolds.map((seconds, index) => (
                  <Grid item xs={12} key={index}>
                    <StyledTextField
                      fullWidth
                      type="number"
                      label={`Round ${index + 1} Breath Hold (seconds)`}
                      value={seconds}
                      onChange={(e) => {
                        const newBreathHolds = [...newSession.roundBreathHolds];
                        newBreathHolds[index] = Number(e.target.value);
                        setNewSession({
                          ...newSession,
                          roundBreathHolds: newBreathHolds
                        });
                      }}
                      InputProps={{
                        inputProps: { min: 0 }
                      }}
                    />
                  </Grid>
                ))}

                {newSession.type === 'condition' && (
                  <>
                    <Grid item xs={12}>
                      <FormControl component="fieldset">
                        <Typography component="legend">Include Questions and Ranges</Typography>
                        <Switch
                          checked={newSession.includeQuestions}
                          onChange={(e) => setNewSession(prev => ({ ...prev, includeQuestions: e.target.checked }))}
                          name="includeQuestions"
                        />
                      </FormControl>
                    </Grid>
                    {newSession.includeQuestions && (
                      <>
                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Start Question"
                            name="startQuestion"
                            value={newSession.startQuestion?.question || ''}
                            onChange={(e) => setNewSession({
                              ...newSession,
                              startQuestion: {
                                id: newSession.startQuestion?.id ?? 0,
                                question: e.target.value,
                              }
                            })}
                            multiline
                            rows={2}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            Start Question Ranges
                          </Typography>
                          <Grid container spacing={2}>
                            {[1, 2, 3, 4, 5].map((rangeNum) => (
                              <Grid item xs={12} key={`start-range-${rangeNum}`}>
                                <StyledTextField
                                  fullWidth
                                  label={`${(rangeNum - 1) * 20}-${rangeNum * 20} Range`}
                                  name={`range${rangeNum}`}
                                  placeholder={getRangePlaceholder(rangeNum)}
                                  value={newSession.startQuestionRanges[`range${rangeNum}` as keyof typeof newSession.startQuestionRanges] || ''}
                                  onChange={(e) => {
                                    const updatedRanges = {
                                      ...newSession.startQuestionRanges,
                                      [`range${rangeNum}`]: e.target.value
                                    };
                                    setNewSession({
                                      ...newSession,
                                      startQuestionRanges: updatedRanges
                                    });
                                  }}
                                  margin="normal"
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="End Question"
                            name="endQuestion"
                            value={newSession.endQuestion?.question || ''}
                            onChange={(e) => setNewSession({
                              ...newSession,
                              endQuestion: {
                                id: newSession.endQuestion?.id ?? 0,
                                question: e.target.value,
                              }
                            })}
                            multiline
                            rows={2}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                            End Question Ranges
                          </Typography>
                          <Grid container spacing={2}>
                            {[1, 2, 3, 4, 5].map((rangeNum) => (
                              <Grid item xs={12} key={`end-range-${rangeNum}`}>
                                <StyledTextField
                                  fullWidth
                                  label={`${(rangeNum - 1) * 20}-${rangeNum * 20} Range`}
                                  name={`range${rangeNum}`}
                                  placeholder={getRangePlaceholder(rangeNum)}
                                  value={
                                    newSession.endQuestionRanges[`range${rangeNum}` as keyof typeof newSession.endQuestionRanges] || 
                                    newSession.endQuestion?.[`range${rangeNum}` as keyof typeof newSession.endQuestion] || 
                                    ''
                                  }
                                  onChange={(e) => {
                                    const updatedRanges = {
                                      ...newSession.endQuestionRanges,
                                      [`range${rangeNum}`]: e.target.value
                                    };
                                    setNewSession({
                                      ...newSession,
                                      endQuestionRanges: updatedRanges
                                    });
                                  }}
                                  margin="normal"
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </>
                )}
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="Author ID"
                    name="authorId"
                    value={newSession.authorId}
                    onChange={handleInputChange}
                    required
                    helperText="Enter the author ID for this session"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <StyledSelect
                      value={newSession.language}
                      onChange={(e) => setNewSession({ 
                        ...newSession, 
                        language: e.target.value as string 
                      })}
                      label="Language"
                    >
                      {languageOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </StyledSelect>
                  </FormControl>
                </Grid>
                {newSession.type === 'condition' && (
                  <>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        label="Condition Category"
                        name="conditionCategory"
                        value={newSession.conditionCategory}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 12 }}
                        helperText="Max 12 characters"
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={12}>
                  <StyledButton type="submit" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} sx={{ color: 'common.white' }} /> : "Upload Session"}
                  </StyledButton>
                </Grid>
              </Grid>
            </form>
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
                  
                  <StyledTextField
                    fullWidth
                    label="Author ID"
                    value={selectedSession.authorId || ''}
                    onChange={(e) => setSelectedSession({ ...selectedSession, authorId: e.target.value })}
                    margin="normal"
                    helperText="Enter the author ID for this session"
                  />
                  {selectedSession.type === 'condition' && (
                    <>
                      <Box sx={{ mt: 3, mb: 2, p: 2, bgcolor: 'background.paper', border: '1px solid' }}>
                        <Typography variant="h6" color="primary">Condition Questions Section</Typography>
                        
                        <StyledTextField
                          fullWidth
                          label="Start Question"
                          value={selectedSession.startQuestion?.question || ''}
                          onChange={(e) => setSelectedSession({
                            ...selectedSession,
                            startQuestion: {
                              id: selectedSession.startQuestion?.id ?? 0,
                              question: e.target.value,
                            }
                          })}
                          margin="normal"
                          multiline
                          rows={2}
                        />

                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: 'primary.main' }}>
                          Start Question Ranges
                        </Typography>

                        <Grid container spacing={2}>
                          {[1, 2, 3, 4, 5].map((rangeNum) => {
                            const rangeKey = `range${rangeNum}` as keyof typeof selectedSession.startQuestionRanges;
                            return (
                              <Grid item xs={12} key={`start-range-${rangeNum}`}>
                                <StyledTextField
                                  fullWidth
                                  label={`${(rangeNum - 1) * 20}-${rangeNum * 20} Range`}
                                  name={`range${rangeNum}`}
                                  placeholder={getRangePlaceholder(rangeNum)}
                                  value={
                                    selectedSession.startQuestionRanges?.[rangeKey] || 
                                    selectedSession.startQuestion?.[rangeKey] || 
                                    ''
                                  }
                                  onChange={(e) => setSelectedSession(handleRangeUpdate('start', rangeNum, e.target.value, selectedSession))}
                                  margin="normal"
                                  sx={{ bgcolor: 'background.paper' }}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>

                        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>End Question</Typography>
                        <StyledTextField
                          fullWidth
                          label="End Question"
                          value={selectedSession.endQuestion?.question || ''}
                          onChange={(e) => setSelectedSession({
                            ...selectedSession,
                            endQuestion: {
                              id: selectedSession.endQuestion?.id ?? 0,
                              question: e.target.value,
                            }
                          })}
                          margin="normal"
                          multiline
                          rows={2}
                        />

                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>End Question Ranges</Typography>
                        <Grid container spacing={2}>
                          {[1, 2, 3, 4, 5].map((rangeNum) => {
                            const rangeKey = `range${rangeNum}` as keyof typeof selectedSession.endQuestionRanges;
                            return (
                              <Grid item xs={12} key={`end-range-${rangeNum}`}>
                                <StyledTextField
                                  fullWidth
                                  label={`${(rangeNum - 1) * 20}-${rangeNum * 20} Range`}
                                  name={`range${rangeNum}`}
                                  placeholder={getRangePlaceholder(rangeNum)}
                                  value={
                                    selectedSession.endQuestionRanges?.[rangeKey] || 
                                    selectedSession.endQuestion?.[rangeKey] || 
                                    ''
                                  }
                                  onChange={(e) => setSelectedSession(handleRangeUpdate('end', rangeNum, e.target.value, selectedSession))}
                                  margin="normal"
                                  sx={{ bgcolor: 'background.paper' }}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    </>
                  )}
                  {selectedSession.type === 'condition' && (
                    <>
                      <StyledTextField
                        fullWidth
                        label="Condition Category"
                        value={selectedSession.conditionCategory || ''}
                        onChange={(e) => setSelectedSession({
                          ...selectedSession,
                          conditionCategory: e.target.value
                        })}
                        margin="normal"
                        inputProps={{ maxLength: 12 }}
                        helperText="Max 12 characters"
                      />
                    </>
                  )}
                  {isEditing && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Images</Typography>
                      
                      {/* Main Image Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        {selectedSession?.imageUrl && (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>Current Main Image:</Typography>
                            <img 
                              src={selectedSession?.imageUrl} 
                              alt="Current session" 
                              style={{ 
                                maxWidth: '100px', 
                                height: 'auto', 
                                borderRadius: '4px' 
                              }} 
                            />
                          </Box>
                        )}
                        <Box>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="edit-image-upload"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedSession(prev => ({
                                  ...prev!,
                                  newImage: file
                                }));
                              }
                            }}
                          />
                          <label htmlFor="edit-image-upload">
                            <StyledButton
                              variant="outlined"
                              component="span"
                              startIcon={<CloudUpload />}
                            >
                              Upload New Main Image
                            </StyledButton>
                          </label>
                          {selectedSession.newImage && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              New main image selected: {selectedSession.newImage.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Audio Player Image Section */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {selectedSession?.audioPlayerImageUrl && (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>Current Audio Player Image:</Typography>
                            <img 
                              src={selectedSession?.audioPlayerImageUrl} 
                              alt="Current audio player" 
                              style={{ 
                                maxWidth: '100px', 
                                height: 'auto', 
                                borderRadius: '4px' 
                              }} 
                            />
                          </Box>
                        )}
                        <Box>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="edit-audio-player-image-upload"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setSelectedSession(prev => ({
                                  ...prev!,
                                  newAudioPlayerImage: file
                                }));
                              }
                            }}
                          />
                          <label htmlFor="edit-audio-player-image-upload">
                            <StyledButton
                              variant="outlined"
                              component="span"
                              startIcon={<CloudUpload />}
                            >
                              Upload New Audio Player Image
                            </StyledButton>
                          </label>
                          {selectedSession.newAudioPlayerImage && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              New audio player image selected: {selectedSession.newAudioPlayerImage.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
                  <StyledTextField
                    fullWidth
                    label="Session End Duration (seconds)"
                    type="number"
                    value={selectedSession.sessionEndDuration || 0}
                    onChange={(e) => setSelectedSession({
                      ...selectedSession,
                      sessionEndDuration: parseFloat(e.target.value) || 0
                    })}
                    margin="normal"
                    inputProps={{ min: 0, step: 0.1 }}
                    helperText="Enter when the session should end in seconds (e.g., 330 for 5:30)"
                  />
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
                  
                  {/* Display images if they exist */}
                  {(selectedSession.imageUrl || selectedSession.audioPlayerImageUrl) && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Images</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {selectedSession.imageUrl && (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>Main Image:</Typography>
                            <img 
                              src={selectedSession.imageUrl} 
                              alt="Session main" 
                              style={{ 
                                maxWidth: '150px', 
                                height: 'auto', 
                                borderRadius: '4px' 
                              }} 
                            />
                          </Box>
                        )}
                        {selectedSession.audioPlayerImageUrl && (
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>Audio Player Image:</Typography>
                            <img 
                              src={selectedSession.audioPlayerImageUrl} 
                              alt="Audio player" 
                              style={{ 
                                maxWidth: '150px', 
                                height: 'auto', 
                                borderRadius: '4px' 
                              }} 
                            />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
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