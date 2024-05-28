import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button, Autocomplete, TextField, Checkbox, List, ListItem, Card, FormControlLabel, Switch } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';

import { DEFAULT_WIDGET_SETTINGS } from './LivePlotWidget';

/**
 * Defines the settings form for <LivePlotWidget>.
 */
const LivePlotWidgetEdit = ({ id, open, onClose }) => {

  const [input, setInput] = useState(DEFAULT_WIDGET_SETTINGS);

  const { getWidget, updateWidget } = useDashboard();
  const widget = getWidget(id);



  useEffect(() => {
    // setSelectedPlotType(widget.plotType);
    // setSelectedSettings((widget.settings) ? widget.settings : DEFAULT_WIDGET_SETTINGS)
    setInput({
      ...DEFAULT_WIDGET_SETTINGS,
      ...widget
    });
  }, []);

  const handleDone = () => {
    console.log(input)
    updateWidget(input)
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      {/* debug only */}
      <Card
        hidden={false}
        sx={{
          // position: 'absolute',
          // top: -10
          margin: 1,
          padding: 1
        }}
      >
        State (debug):
        <List dense>
          <ListItem>plotType: {input.plotType}</ListItem>
          <ListItem>isRealTime: {input.isRealTime ? 'true' : 'false'}</ListItem>
          <ListItem>realTimeInterval: {input.realTimeInterval}</ListItem>
          <ListItem>refreshRate: {input.refreshRate}</ListItem>
          <ListItem>historicInterval: {input.historicInterval.start} TO {input.historicInterval.end} </ListItem>
          <ListItem>
            settings:
            <br />
            <List>
              <ListItem>enableInterpolation: {input.settings.enableInterpolation ? 'true' : 'false'}</ListItem>
              <ListItem>gaugeRange: (min: {input.settings.gaugeRange.min}, max: {input.settings.gaugeRange.max} )</ListItem>
            </List>
          </ListItem>
        </List>
      </Card>


      <DialogTitle>
        <Typography variant='h4'>Widget Settings</Typography>
        <Typography variant='caption'>
          for {widget.thingName} ({widget.valueName})
        </Typography>





      </DialogTitle>
      <DialogContent>
        <FormControlLabel
          label='Real time'
          control={
            <Switch
              checked={input.isRealTime}
              onChange={(e) => setInput({
                ...input,
                isRealTime: e.target.checked
              })}
            />}
        />
        <br />
        {
          input.isRealTime &&
          <>
            <TextField
              label='Query Interval'
              helperText='e.g. 3minute, 1hour, or 1day'
              value={input.realTimeInterval}
              onInput={(e) => {
                // TODO error message if val too small.
                setInput({
                  ...input,
                  realTimeInterval: e.target.value
                });
              }}
              size='small'
              sx={{ mt: 1 }}
            />
            <TextField
              label='Refresh Rate (ms)'
              value={input.refreshRate}
              type='number'
              onInput={(e) => {
                let val = parseInt(e.target.value);
                // TODO error message if val too small.
                setInput({
                  ...input,
                  refreshRate: val
                });
              }}
              size='small'
              sx={{ mt: 1 }}
            />
          </>
        }
        {
          !input.isRealTime &&

          <>
            <input
              type='date'
              value={input.historicInterval.start}
              onChange={(e) => setInput({
                ...input,
                historicInterval: {
                  ...input.historicInterval,
                  start: e.target.value
                }
              })}
            />
            -
            <input
              type='date'
              value={input.historicInterval.end}
              onChange={(e) => setInput({
                ...input,
                historicInterval: {
                  ...input.historicInterval,
                  end: e.target.value
                }
              })}
            />
          </>
        }



        <Autocomplete
          value={input.plotType}
          onChange={(_, value) => setInput({
            ...input,
            plotType: value
          })}
          disableClearable
          options={['line', 'gauge', 'text']}
          renderInput={(params) => <TextField {...params} label='Plot Type' />}
          sx={{ mt: 5 }}
        />



        {(input.plotType === 'line') &&
          <FormControlLabel
            label='Enable Interpolation'
            control={
              <Switch
                checked={input.settings.enableInterpolation}
                onChange={(e) => setInput({
                  ...input,
                  settings: {
                    ...input.settings,
                    enableInterpolation: e.target.checked
                  }
                })}
              />}
          />
        }

        {
          (input.plotType === 'gauge') &&
          <>
            <TextField
              label='min'
              value={input.settings.gaugeRange.min}
              type='number'
              onInput={(e) => {
                let val = parseInt(e.target.value);
                setInput({
                  ...input,
                  settings: {
                    ...input.settings,
                    gaugeRange: {
                      ...input.settings.gaugeRange,
                      min: val
                    }
                  }
                });
              }}
              size='small'
              sx={{ mt: 1 }}
            />
            <TextField
              label='max'
              value={input.settings.gaugeRange.max}
              type='number'
              onInput={(e) => {
                let val = parseInt(e.target.value);
                setInput({
                  ...input,
                  settings: {
                    ...input.settings,
                    gaugeRange: {
                      ...input.settings.gaugeRange,
                      max: val
                    }
                  }
                });
              }}
              size='small'
              sx={{ mt: 1 }}
            />
          </>
        }

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
  );
}


export default LivePlotWidgetEdit;
