import { Box, Card, CardContent, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert';

import React, { useState } from 'react'

import { useDashboard } from '../../contexts/DashboardContext';

import { useTheme } from '@mui/material/styles';

const Widget = ({ children, title, id }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  
  const { removeWidget } = useDashboard();
  
  const theme = useTheme();


  return (
    <Card
      component='div'
      variant='elevation'
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        className='drag-handle'
        style={{
          display: 'flex',
          justifyContent: 'center', 
          position: 'absolute',
          width: '100%',
          minHeight: '20px',
          maxHeight: '20px',
          overflow: 'hidden',
          backgroundColor: theme.palette.secondary.main,
        }}
      >
        <Typography variant='caption'>{title}</Typography>
      </div>

      <IconButton
        aria-label='action menu'
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          position: 'absolute',
          top: 20, right: 0
        }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        id='action-menu'
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>Edit</MenuItem>
        <MenuItem
          onClick={() => removeWidget(id)}
        >
          Delete
        </MenuItem>

      </Menu>

      <div
        style={{
          flexGrow: 1,
          maxHeight: '100%',
          // border: '2px solid red',
        }}
      >
        {children}
      </div>
    </Card>
  );
};

export default Widget;
