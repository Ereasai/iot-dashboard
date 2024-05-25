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

import { useDashboard } from '../../contexts/DashboardContext';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

const AddPopup = ({ open, onClose }) => {


  const [confirmBoxOpen, setConfirmBoxOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedValueName, setSelectedValueName] = useState('');
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

    const createAndAddWidgets = async () => {
      const args = `valueName=${selectedValueName}&tagNames=${selectedTags.join(',')}`;
      const response = await fetch(`http://${BACKEND_URL}/get-things-by-value-tags?${args}`);
      const data = await response.json();
      const things = data.map(({ thing_name }) => thing_name);
      
      console.log('things:', things);

      const ws = things.map(thing => ({
        type: 'plot',
        thingName: thing, 
        valueName: selectedValueName
      }));

      console.log('ws:', ws);

      addWidgets(ws);
    };

    console.group('AddPopup::handleDone()');
    // const widget = { tags: [...selectedTags], value: selectedValueName };
    // addWidget(widget);
    // console.log("widget:", widget);
    createAndAddWidgets();
    console.groupEnd();
    handleCloseConfirm();
  };

  const handleCloseConfirm = () => {
    setPage(0);
    setSelectedTags([]);
    setSelectedValueName('');
    setConfirmBoxOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => setConfirmBoxOpen(true)}
        fullWidth
        maxWidth="md"
        TransitionComponent={Grow}
      >
        <DialogTitle>
          <Typography variant='h4'>Add a new Widget.</Typography>
          <IconButton
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            onClick={() => setConfirmBoxOpen(true)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Card hidden={true}>
          <Typography variant='body1'>selectedTags: {selectedTags.join(', ')}</Typography>
          <Typography variant='body1'>selectedValueName: {selectedValueName}</Typography>
        </Card>

        {page == 0 &&
          <Page1
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            setSelectedValueName={setSelectedValueName}
          />}
        {page == 1 &&
          <Page2
            selectedTags={selectedTags}
            selectedValueName={selectedValueName}
            setSelectedValueName={setSelectedValueName}
          />}
        {page == 2 &&
          <Page3
            selectedTags={selectedTags}
            selectedValueName={selectedValueName}
            setSelectedTags={setSelectedTags}
          />}
        {page == 3 &&
          <Page4 />}

        <DialogActions>
          {page > 0 &&
            <Button onClick={() => setPage(page - 1)}>
              Prev
            </Button>}

          {page < 3 &&
            <Button
              variant='contained'
              onClick={() => setPage(page + 1)}
              disabled={!conditionForNext()}
            >
              Next
            </Button>}

          {page == 3 &&
            <Button
              variant='contained'
              color='success'
              onClick={handleDone}
            >
              Done
            </Button>}
        </DialogActions>
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
          <Button onClick={handleCloseConfirm} color='error'>Yes</Button>
          <Button onClick={() => setConfirmBoxOpen(false)}>No</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddPopup;