import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button, Autocomplete, TextField, Checkbox, List, ListItem, Card, FormControlLabel, Switch, Select, FormControl, InputLabel, MenuItem, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDashboard } from '../../../contexts/DashboardContext';

import { DEFAULT_WIDGET_SETTINGS } from './LivePlotWidget';
import { Box } from '@mui/system';

/**
 * Defines the settings form for <LivePlotWidget>.
 */
const LivePlotWidgetEdit = ({ id, open, onClose }) => {

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
        hidden={true}
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

      <Divider sx={{ m: 1 }} />

      <DialogContent>
        <Card
          variant='outlined'
          sx={{ p: 1 }}
        >
          <Typography variant='h5'>Data Type</Typography>
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
            // real time
            <>
              <Typography variant='body1'>Real Time Settings</Typography>
              <QueryIntervalSelect value={input.realTimeInterval} setValue={(val) =>
                setInput({
                  ...input,
                  realTimeInterval: val
                })
              } />
              {/* <TextField
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
                sx={{ mt: 2 }}
              /> */}
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
                sx={{ mt: 2 }}
              />
            </>
          }
          {
            !input.isRealTime &&
            // historic
            <>
              <Typography variant='body1'>Historic Settings</Typography>
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
        </Card>

        <Card
          variant='outlined'
          sx={{ p: 1, mt: 1 }}
        >
          <Typography variant='h5' sx={{ mb: 1 }}>Plot Type</Typography>
          <PlotSelect value={input.plotType} setValue={(plotType) => {
            setInput({ ...input, plotType: plotType });
          }} />

          <br />

          <Typography variant='body1'>Plot specific settings</Typography>

          {/* line plot config */}
          {
            (input.plotType === 'line') &&
            <>
              <FormControlLabel
                label='Line Interpolation'
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
                  />
                }
              />

              <FormControlLabel
                label='Axis Labels'
                control={
                  <Switch
                    checked={input.settings.enableAxisLabels}
                    onChange={(e) => setInput({
                      ...input,
                      settings: {
                        ...input.settings,
                        enableAxisLabels: e.target.checked
                      }
                    })}
                  />
                }
              />
            </>
          }

          {/* guage plot config */}
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
        </Card>

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

const PlotSelect = ({ value, setValue }) => {
  const [open, setOpen] = useState(false);

  return (
    <FormControl sx={{ marginTop: 0.5, marginBottom: 1, minWidth: 200 }}>
      <InputLabel id='plot-select-label'>Plot Type</InputLabel>
      <Select
        labelId='plot-select-label'
        open={open}
        size='small'
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        value={value}
        label='Plot Type'
        onChange={(e) => {
          setValue(e.target.value);
        }}
      >
        <MenuItem value='line'>Line</MenuItem>
        <MenuItem value='gauge'>Gauge</MenuItem>
        <MenuItem value='text'>Text</MenuItem>

      </Select>
    </FormControl>
  );
}

const QueryIntervalSelect = ({ value, setValue }) => {

  const [open, setOpen] = useState(false);
  const [unit, setUnit] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    // parse the form value, populate to internal values.
    const match = value.match(/^(\d+)([a-zA-Z]+)$/);
    setAmount(parseInt(match[1]), 10);
    setUnit(match[2]);
  }, [])

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        type='number'
        size='small'
        label='Amount'
        value={amount}
        onChange={(e) => {
          const a = parseInt(e.target.value);
          setAmount(a);
          setValue(`${a}${unit}`);
        }}
      />
      <FormControl sx={{ minWidth: 120, maxWidth: 120, }}>
        <InputLabel id='unit-select-label'>Unit</InputLabel>
        <Select

          labelId='unit-select-label'
          open={open}
          size='small'
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          value={unit}
          label='Unit'
          onChange={(e) => {
            const u = e.target.value;
            setUnit(u);
            setValue(`${amount}${u}`);
          }}
        >
          <MenuItem value='second'>Second(s)</MenuItem>
          <MenuItem value='minute'>Minute(s)</MenuItem>
          <MenuItem value='hour'>Hour(s)</MenuItem>

        </Select>
      </FormControl>
    </Box>
  );
}
