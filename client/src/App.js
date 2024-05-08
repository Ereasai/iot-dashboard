import React, { useContext } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// import Grid from './GridComponents/Grid';
// import ExampleGrid from './GridComponents/ExampleGrid';
// import ResponsiveGrid from './GridComponents/ResponsiveGrid';
import LeftNavBar from './Components/LeftNavBar.js'
// import ComplexGrid from './GridComponents/ComplexGrid'
import Dashboard from './Components/Dashboard'
import { DashboardProvider } from './DashboardContext.js';
import styles from './styles.js'

function App() {
    return (
        <div style={styles.app}>
            <DashboardProvider>
                <LeftNavBar />
                <div style={{width: "100%"}}>
                    <Dashboard />
                </div>
            </DashboardProvider>
        </div>
    );
}

export default App;
