import { Button, Card, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

import CloseIcon from '@mui/icons-material/Close';
import { useDashboard } from '../../../contexts/DashboardContext';

const AddStaticText = ({ onAttemptClose, onClose }) => {

  const [text, setText] = useState('');
  const { addWidget } = useDashboard();
  
  const handleDone = () => {
    const w = {
      type: 'staticText',
      text: text
    }
    
    addWidget(w);
    onClose();
  }
  

  return (
    <>
      <DialogTitle>
        <Typography variant='h4'>
          Add a new Static Text
        </Typography>
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={() => {
            if (text.length == 0) onClose();
            else onAttemptClose();
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Card sx={{ m: 1, p: 1 }} hidden={true}>
        <p>
          text: {text}
        </p>
      </Card>

      <DialogContent>
          <TextField
            label='Text'
            value={text}
            fullWidth
            size='small'
            onInput={(e) => {
              setText(e.target.value);
            }}
          />
      </DialogContent>

      <DialogActions>
        <Button
          variant='contained'
          color='success'
          disabled={text.length == 0}
          onClick={handleDone}
        >
          Done
        </Button>
      </DialogActions>
    
    </>
  )
}

export default AddStaticText
