import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  Chip,
  Box,
  Backdrop,
  CircularProgress,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

const Page4 = ({ input, setInput }) => {

  // this is almost a 1 to 1 copy of the 
  // LivePlotWidgetEdit.js
  // very quick and dirty implementation.
  return (
    <DialogContent>
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
      <br/>

    </DialogContent>
  );
};

export default Page4;

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
