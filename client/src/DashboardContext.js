import React, { createContext, useContext, useState } from 'react';

// DashboardContext: manage the list of widgets
const DashboardContext = createContext();

export function useDashboard() {
    return useContext(DashboardContext);
}


export const DashboardProvider = ({children}) => {
    const [widgets, setWidgets] = useState([]);
    const [counter, setCounter] = useState(0);

    const addWidget = (w) => {
        // add optional argument for positional information
        // this will be required for loading saved configuration.
        
        // consider passing in list of widgets
        w = {...w, uid: counter}
        setWidgets([...widgets, w]);
        setCounter(counter + 1);
    };

    const removeWidget = (id) => {
        const newWidgets = widgets.filter(w => w.uid !== id);
        setWidgets(newWidgets);
    }

    const printWidget = () => { 
        console.log("Printing widgets:")
        console.table(widgets);
    }

    return (
        <DashboardContext.Provider value={{ widgets, addWidget, printWidget, removeWidget }}>
            {children}
        </DashboardContext.Provider>
    );
}