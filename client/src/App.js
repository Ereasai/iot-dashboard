import React, { useContext, useState, useRef } from 'react';

import { DashboardProvider } from './DashboardContext.js';

import TopNavBar from './Components/TopNavBar.js';
import Dashboard from './Components/Dashboard'
import AddButton from './Components/AddButton.js';
import AddPopup from './Components/AddPopup.js';

import { SaveButton, LoadButton } from './Components/Testing.js'

import { useTheme } from '@mui/material/styles';



const App = () => {
    const theme = useTheme();

    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const dashboardRef = useRef(null); 
    const getLayouts = () => {
        console.log(dashboardRef.current.getLayouts());
        return dashboardRef.current.getLayouts();
    }

    const handleAddClick = () => { setIsPopupOpen(true); };
  
    const handleClosePopup = () => { setIsPopupOpen(false); };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: theme.palette.background.default}}>
            <DashboardProvider>
                <TopNavBar />

                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <SaveButton getLayouts={getLayouts} />
                    <LoadButton />
                </div>

                <Dashboard ref={dashboardRef}/>
                <AddButton
                    onClick={handleAddClick}
                    style={{ position: 'fixed', bottom: '20px', right: '20px' }}
                />
                <AddPopup
                    open={isPopupOpen}
                    onClose={handleClosePopup}
                />
            </DashboardProvider>
        </div>
    );
}

export default App;
