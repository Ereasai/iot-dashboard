import React, { useState } from 'react';

import { DashboardProvider } from './contexts/DashboardContext.js';

import TopNavBar from './components/TopNavBar.js';
import Grid from './components/Grid.js'
import AddButton from './components/AddButton.js';
import AddPopup from './components/AddPopupV2/AddPopup.js';

import { SaveButton, LoadButton } from './components/Testing.js';

import { useTheme } from '@mui/material/styles';

const Dashboard = () => {
  const theme = useTheme();

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      <DashboardProvider>
        <TopNavBar />

        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <SaveButton />
          <LoadButton />
        </div>

        <Grid />
        <AddButton
          onClick={() => setIsPopupOpen(true)}
          style={{ position: 'fixed', bottom: '20px', right: '20px' }}
        />
        <AddPopup
          open={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
        />
      </DashboardProvider>
    </div>
  );
}

export default Dashboard;
