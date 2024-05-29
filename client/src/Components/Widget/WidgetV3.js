import { Box, Card, CardContent, IconButton, List, ListItem, ListItemText, Menu, MenuItem, MenuList, Typography } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert';

import React, { useState } from 'react'

import { useDashboard } from '../../contexts/DashboardContext';

import { useTheme } from '@mui/material/styles';

/**
 * Parent class for all widgets. It will provide a drag handle and settings button.
 */
const Widget = ({ 
  children, 
  id, 
  title, 
  openSettings, 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [isHovered, setIsHovered] = useState(false);

  const { removeWidget, getWidget, addWidget } = useDashboard();
  const theme = useTheme();

  const hoverStyle = {
    transition: 'opacity 0.3s ease',
    opacity: (isHovered) ? 1 : 0,
  }

  return (
    <Card
      component='div'
      variant='elevation'
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        zIndex: -2,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          zIndex: 0,

          userSelect: 'none',

          ...hoverStyle
        }}
      >
        <style>
          {`
          @keyframes scrollText {
            0% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}
        </style>
        <Typography
          variant='caption'
          noWrap
          sx={{
            paddingLeft: 1.5,
            paddingRight: 1.5,
          }}
        >
          {title}
        </Typography>
      </div>

      <IconButton
        aria-label='action menu'
        size='small'
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
          setIsHovered(false);
        }}
        sx={{
          position: 'absolute', 
          top: 0, right: 0,
          ...hoverStyle
        }}
      >
        <MoreVertIcon style={{ fontSize: '10px', transform: 'scale(1.5)' }}/>
      </IconButton>

      <Menu
        id='action-menu'
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
      >
        <MenuList
          dense
        >
          <MenuItem 
            onClick={() => {
              openSettings(); // open setting
              setAnchorEl(null); // close the menu
            }}
            disabled={openSettings == undefined}
          >
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            // add a new widget with exact same data.
            const { id: _, ...w } = getWidget(id);
            addWidget(w);
            // setAnchorEl(null);
          }}>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => removeWidget(id)}>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </MenuList>

      </Menu>

      {/* container for the child */}
      <div
        style={{
          flexGrow: 1,
          maxHeight: '100%',
          zIndex: -1,
          // border: '2px solid red',
        }}
      >
        {children}
      </div>
    </Card>
  );
};

export default Widget;
