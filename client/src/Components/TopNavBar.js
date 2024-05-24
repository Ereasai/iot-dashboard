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
  IconButton
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { ThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

import { Logo } from './Logo.js'
import { useNavigate } from 'react-router-dom';

const TopNavBar = () => {

  const { toggleTheme } = useContext(ThemeContext);
  
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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


  return (
    <AppBar position='relative'>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: theme.palette.base.main }}>
        <Logo />
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <Tooltip title={'Dark Mode'}>
            <Switch
              onChange={toggleTheme}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Tooltip>
          <Button color="primary" variant="outlined" disabled={true}>Save</Button>
          <IconButton onClick={handleAvatarClick} color="inherit">
            <Avatar alt="Avatar" >{currentUser.email[0].toUpperCase()}</Avatar>
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
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
