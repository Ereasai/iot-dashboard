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
  IconButton,
  Grow,

} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { useTheme } from '@mui/material/styles';

import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import Page4 from './Page4';

import { useDashboard } from '../../../contexts/DashboardContext';
import { DEFAULT_WIDGET_SETTINGS } from '../../Widget/LivePlotWidget/LivePlotWidget';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP


const AddLivePlot = ({ onAttemptClose, onClose }) => {

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedValueName, setSelectedValueName] = useState('');
  const [widgetData, setWidgetData] = useState(DEFAULT_WIDGET_SETTINGS);
  const [page, setPage] = useState(0);

  const { addWidgets } = useDashboard();


  // return true if condition to move to next page is met.
  const conditionForNext = () => {
    switch (page) {
      case 0:
        return selectedTags.length > 0;
      case 1:
        return selectedValueName !== '';
      case 2:
        return true;
      default:
        return true;
    };
  };

  /**
   * Handler for when done is pressed. New widget should be added and close the
   * <Dialog> box.
   */
  const handleDone = () => {

    /** Create widgets based on selected tags and value name.
     **/
    const createAndAddWidgets = async () => {
      const args = `valueName=${selectedValueName}&tagNames=${selectedTags.join(',')}`;
      const response = await fetch(`http://${BACKEND_URL}/get-things-by-value-tags?${args}`);
      const data = await response.json();
      const things = data.map(({ thing_name }) => thing_name);

      console.log('things:', things);

      // create list of plot widget objects.
      const ws = things.map(thing => ({
        ...DEFAULT_WIDGET_SETTINGS,
        ...widgetData,
        type: 'plot',
        thingName: thing,
        valueName: selectedValueName
      }));

      console.log('ws:', ws);

      addWidgets(ws);
      onClose();
    };

    console.group('AddPopup::handleDone()');
    createAndAddWidgets();
    console.groupEnd();
    onClose();
  };

  return (
    <>
      <DialogTitle>
        <Typography fontSize='3rem'>
          Add a new Live Plot
        </Typography>
        <IconButton
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          onClick={onAttemptClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Card hidden={true}>
        <Typography variant='body1'>selectedTags: {selectedTags.join(', ')}</Typography>
        <Typography variant='body1'>selectedValueName: {selectedValueName}</Typography>
      </Card>

      {/* we will render different <FormContent> based on the page */}
      {page == 0 &&
        <Page1
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          setSelectedValueName={setSelectedValueName}
        />
      }
      {page == 1 &&
        <Page2
          selectedTags={selectedTags}
          selectedValueName={selectedValueName}
          setSelectedValueName={setSelectedValueName}
        />
      }
      {page == 2 &&
        <Page3
          selectedTags={selectedTags}
          selectedValueName={selectedValueName}
          setSelectedTags={setSelectedTags}
        />
      }
      {page == 3 &&
        <Page4 
          input={widgetData}
          setInput={setWidgetData}
        />
      }

      <DialogActions>
        {/* previous button */}
        {page > 0 &&
          <Button onClick={() => setPage(page - 1)}>
            Prev
          </Button>}
        {/* next button */}
        {page < 3 &&
          <Button
            variant='contained'
            onClick={() => setPage(page + 1)}
            disabled={!conditionForNext()}
          >
            Next
          </Button>}
        {/* done button */}
        {page == 3 &&
          <Button
            variant='contained'
            color='success'
            onClick={handleDone}
          >
            Done
          </Button>}
      </DialogActions>
    </>
  );
};

export default AddLivePlot;