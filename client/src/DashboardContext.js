import React, { createContext, useContext, useState } from 'react';

// DashboardContext: manage the list of widgets
const DashboardContext = createContext();

export function useDashboard() {
    return useContext(DashboardContext);
}

export const DashboardProvider = ({children}) => {
    // for widget state
    const [widgets, setWidgets] = useState([]);
    const [counter, setCounter] = useState(0);

    // for layout data (grid-layout)
    // This is meant to only be used by <Dashboard/>. It is defined here 
    // because it is convenient to implement save and load.

    const addWidget = (w) => {
        w = {...w, id: counter.toString()}
        setWidgets([...widgets, w]);
        setCounter(counter + 1);
    };

    const removeWidget = (id) => {
        const newWidgets = widgets.filter(w => w.id !== id);
        setWidgets(newWidgets);
    };

    const updateWidget = (updatedWidget) => {
        console.group("DashboardContext.updateWidget()");
        console.log("updatedWidget:", updatedWidget);
        const newWidgets = widgets.map(widget => (
            (widget.id === updatedWidget.id) ? updatedWidget : widget
        ));
        console.log("newWidgets:", newWidgets);
        console.groupEnd();
        setWidgets(newWidgets);
    };

    const init = (data) => {
        let cnt = counter;
        let newWidgets = data.map((item) => {
            const w = {...item, id: cnt.toString()};
            cnt = cnt + 1;
            return w;
        });
        console.log(newWidgets);
        setWidgets(newWidgets);
        setCounter(newWidgets.length);
    };

    return (
        <DashboardContext.Provider
            value={{ widgets, addWidget, removeWidget, updateWidget, init }}>
            {children}
        </DashboardContext.Provider>
    );
}