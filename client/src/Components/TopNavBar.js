import React, { useContext, useState } from 'react';

import {
  AppBar,
  Toolbar,
  Button,
  Switch,
  Tooltip,
  Avatar,
  MenuItem,
  Menu,
  IconButton,
  Divider
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

import { Logo } from './Logo.js'
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/system';
import { useDashboard } from '../contexts/DashboardContext.js';

const TopNavBar = () => {

  const { toggleTheme } = useContext(ThemeContext);

  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { widgets, layouts } = useDashboard();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
    }
  }

  const saveLayoutData = () => {
    const dataToSave = {
      layouts: layouts,
      widgets: widgets,
    };

    localStorage.setItem('dashboardLayout', JSON.stringify(dataToSave));
  };

  return (
    <>
      <AppBar position='relative'>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            backgroundColor: theme.palette.base.main
          }}
        >
          <Logo />
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <Tooltip title={'Dark Mode'}>
              <Switch
                onChange={toggleTheme}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </Tooltip>
            <SaveButton onClick={saveLayoutData} />
            <Divider orientation='vertical' flexItem/>
            <IconButton onClick={handleAvatarClick}>
              <Avatar alt='Avatar' sx={{ color: 'black' }}>
                {currentUser.email[0].toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem disabled>
                {currentUser ? currentUser.email : 'Not Logged in'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TopNavBar;

const SaveButton = ({ onClick }) => {
  const [color, setColor] = useState('primary');
  const [clicked, setClicked] = useState(false);
  const [text, setText] = useState('Save');

  const handleClick = () => {
    onClick();

    // visual stuff.
    setClicked(true);
    setColor('success');
    setText('Saved!')
    
    setTimeout(() => {
      setColor('primary');
      setClicked(false);
      setText('Save');
    }, 1000);
  };

  return (
    <Button
      variant="contained"
      color={color}
      onClick={handleClick}
      sx={{maxWidth: 10}}
      size='small'
      // disabled={clicked}
    >
      {text}
    </Button>
  );
};