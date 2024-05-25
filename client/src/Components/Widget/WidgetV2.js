import { Box, Card, CardContent } from '@mui/material'
import React from 'react'

import { useTheme } from '@mui/material/styles';

const Widget = ({ children }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      <div
        className='drag-handle'
        style={{
          // position: 'absolute',
          width: '100%',
          minHeight: '10px',
          backgroundColor: theme.palette.secondary.main,
        }}
      />

      <div
        style={{
          flexGrow: 1,
          maxHeight: '100%',
          // border: '2px solid red',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Widget;
