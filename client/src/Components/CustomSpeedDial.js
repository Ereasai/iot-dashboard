import { SpeedDial, SpeedDialAction } from '@mui/material';
import { Box } from '@mui/system';

import React, { useState } from 'react';

import TimelineIcon from '@mui/icons-material/Timeline';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';

import { useTheme } from '@mui/material/styles'


const CustomSpeedDial = ({ 
  style, 
  setDialogOpen,
  setWidgetType,
}) => {
  
  const theme = useTheme();

  const actions = [
    { 
      icon: <TimelineIcon />, 
      name: 'Live Plots',
      onClick: () => {
        setDialogOpen(true);
        setWidgetType('livePlot');
      }
    },
    { 
      icon: <TextFieldsIcon />, 
      name: 'Static Text',
      onClick: () => {
        setDialogOpen(true);
        setWidgetType('staticText');
      }
    },
  ];

  return (
    <Box
      sx={style}
    >
      <SpeedDial
        ariaLabel="Menu for adding new widgets."
        icon={ <SpeedDialIcon /> }
        sx={{
          // configure the color of the speed dial.
          '& .MuiFab-primary': {
            bgcolor: theme.palette.base.main,
            color: (theme.palette.mode === 'dark') ? 'white' : 'black',
          },
        }}
      >
      {actions.map((action) => (
        <SpeedDialAction 
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.onClick}
        />
      ))}
      </SpeedDial>
    </Box>
  );
};

export default CustomSpeedDial;
