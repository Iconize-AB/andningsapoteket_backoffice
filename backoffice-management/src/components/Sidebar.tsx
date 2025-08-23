import React from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Button,
  styled,
  Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CategoryIcon from '@mui/icons-material/Category';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import BusinessIcon from '@mui/icons-material/Business';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PersonIcon from '@mui/icons-material/Person';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Organizations', icon: <BusinessIcon />, path: '/organizations' },
  { text: 'Journeys', icon: <ContentPasteIcon />, path: '/journeys' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
  { text: 'SubCategories', icon: <SubdirectoryArrowRightIcon />, path: '/subcategories' },
  { text: 'Authors', icon: <PersonIcon />, path: '/authors' },
  { text: 'Challenges', icon: <EmojiEventsIcon />, path: '/challenges' },
  { text: 'Six Day Challenge', icon: <TimerIcon />, path: '/sixday' },
  { text: 'Homescreen Videos', icon: <VideoLibraryIcon />, path: '/homescreen-videos' },
  // { text: 'Server Logs', icon: <BugReportIcon />, path: '/logs' },
];

interface SidebarProps {
  onLogout: () => void;
}

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: '4px 8px',
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: theme.palette.grey[400],
  minWidth: 40,
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(2),
  color: theme.palette.grey[400],
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <img 
          src={process.env.PUBLIC_URL + '/logo.png'}
          alt="Andningsapoteket Logo" 
          style={{
            maxWidth: '60px',
            height: 'auto',
          }}
        />
      </Box>
      <List>
        {menuItems.map((item) => (
          <StyledListItemButton
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <StyledListItemIcon>{item.icon}</StyledListItemIcon>
            <StyledListItemText primary={item.text} />
          </StyledListItemButton>
        ))}
      </List>
      <LogoutButton
        startIcon={<ExitToAppIcon />}
        onClick={onLogout}
        sx={{ mt: 'auto' }}
      >
        Logout
      </LogoutButton>
    </StyledDrawer>
  );
}

export default Sidebar;