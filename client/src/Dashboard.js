import React, { useState } from 'react';

import { DashboardProvider } from './contexts/DashboardContext.js';

import TopNavBar from './components/TopNavBar.js';
import Grid from './components/Grid.js'
import CustomSpeedDial from './components/CustomSpeedDial.js';

import { useTheme } from '@mui/material/styles';
import WidgetDialog from './components/Dialogs/WidgetDialog.js';

const Dashboard = () => {
  const theme = useTheme();

  // states to control form(s).
  const [dialogOpen, setDialogOpen] = useState(false);
  const [widgetType, setWidgetType] = useState('');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh', 
      backgroundColor: theme.palette.background.default }}>
      <DashboardProvider>
        <TopNavBar/>
        <Grid />
        {/* repalcement for the add buttom, instead give many options for adding */}
        <CustomSpeedDial
          style={{ position: 'fixed', bottom: '20px', right: '20px' }}
          setDialogOpen={setDialogOpen}
          setWidgetType={setWidgetType}
        />
        <WidgetDialog
          type={widgetType}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      </DashboardProvider>
    </div>
  );
}

export default Dashboard;
