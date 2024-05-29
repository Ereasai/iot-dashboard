import React, { useState } from 'react';

import AddLivePlot from './AddLivePlot/AddLivePlot';
import AddStaticText from './AddStaticText/AddStaticText';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Grow } from '@mui/material';

const WidgetDialog = ({ open, type, onClose }) => {

  const [confirmBoxOpen, setConfirmBoxOpen] = useState(false);

  const determineComponent = () => {
    switch (type) {
      case 'livePlot':
        return (
          <AddLivePlot 
            onAttemptClose={() => setConfirmBoxOpen(true)} 
            onClose={onClose}
          />
        );
      case 'staticText':
        return (
          <AddStaticText
            onAttemptClose={() => setConfirmBoxOpen(true)} 
            onClose={onClose}
          />
        );
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setConfirmBoxOpen(true)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Grow}
      >
        {determineComponent()}
      </Dialog>

      {/* Close Confirmation Box */}
      <Dialog
        open={confirmBoxOpen}
        onClose={() => setConfirmBoxOpen(false)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography variant='body1'>
            Your progress will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setConfirmBoxOpen(false);
            onClose();
          }} 
            color='error'
          >
            Yes
          </Button>
          <Button onClick={() => setConfirmBoxOpen(false)}>No</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WidgetDialog; 
