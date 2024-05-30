import React, { useEffect, useState } from 'react'
import { DEFAULT_WIDGET_SETTINGS } from '../LivePlotWidget/LivePlotWidget'
import { useDashboard } from '../../../contexts/DashboardContext';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField, Typography } from '@mui/material';

const StaticTextWidgetEdit = ({ id, open, onClose }) => {
  const [input, setInput] = useState(DEFAULT_WIDGET_SETTINGS);
  const { getWidget, updateWidget } = useDashboard();
  const widget = getWidget(id);

  useEffect(() => {
    setInput({
      ...DEFAULT_WIDGET_SETTINGS,
      ...widget
    });
  }, []);

  const handleDone = () => {
    console.log(input);
    updateWidget(input);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <Typography fontSize='3rem'>
          Widget Settings
        </Typography>
      </DialogTitle>

      <Divider sx={{ m: 1 }} />

      <DialogContent>
        <TextField
          label='Text'
          value={input.text}
          fullWidth
          onInput={(e) => {
            setInput({
              ...input,
              text: e.target.value
            });
          }}
        />
      </DialogContent>


      <DialogActions>
        <Button
          variant='text'
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          color='success'
          onClick={handleDone}
        >
          Done
        </Button>
      </DialogActions>

    </Dialog>
  )
}

export default StaticTextWidgetEdit
