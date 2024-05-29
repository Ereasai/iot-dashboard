import React, { createContext, useContext, useEffect, useState } from 'react';

const DashboardContext = createContext();

export function useDashboard() {
  return useContext(DashboardContext);
}

export const DashboardProvider = ({ children }) => {
  // Widget State 
  const [widgets, setWidgets] = useState([]);
  const [counter, setCounter] = useState(0);

  // Layout State (grid-layout)
  // This is meant to only be used by <Dashboard/>. It is defined here 
  // because it is convenient to implement save and load.
  const [layouts, setLayouts] = useState({ lg: [] });

  /* INTERFERACE DEFINITIONS */

  /**
   * Adds a **single** widget to the widget list.
   * @param {Object} w Widget object.
   */
  const addWidget = (w) => {
    w = { ...w, id: counter.toString() }
    setWidgets([...widgets, w]);
    setCounter(counter + 1);
  };

  /**
   * Adds multiple widgets to the widget list.
   * @param {Object} w List of widget objects.
   */
  const addWidgets = (ws) => {
    const withId = ws.map((w, index) => {
      if (w.type == undefined) throw Error('Must specify \'type\'.');

      const id = counter + index;
      return { ...w, id: id.toString() };
    });

    setWidgets([...widgets, ...withId]);
    setCounter(counter + ws.length);
  };

  // find widget by id, returns undefined if it's not there.
  const getWidget = (id) => {
    return widgets.find(w => w.id === id);
  }


  const removeWidget = (id) => {
    const newWidgets = widgets.filter(w => w.id !== id);
    setWidgets(newWidgets);
  };

  const updateWidget = (updatedWidget) => {
    const newWidgets = widgets.map(widget => (
      (widget.id === updatedWidget.id) ? updatedWidget : widget
    ));
    setWidgets(newWidgets);
  };

  const init = (data) => {

    console.group("DashboardContext.init()");

    // really bad approach, find unused id:
    // ideally, we normalize the id
    let max = 0;
    data.widgets.forEach((widget) => {
      max = (widget.id > max) ? widget.id : max;
    });
    console.log("max unused id:", max);
    console.groupEnd();

    setLayouts(data.layouts);
    setWidgets(data.widgets);
    setCounter(max + 1);
  };

  useEffect(() => {
    const dataRaw = localStorage.getItem('dashboardLayout');
    const data = JSON.parse(dataRaw);
    init(data);

  }, [])

  const value = {
    widgets,
    layouts,

    addWidget,
    addWidgets,
    getWidget,
    removeWidget,
    updateWidget,
    init,

    // state modifiers
    setWidgets,
    setLayouts
  };

  return (
    <DashboardContext.Provider
      value={value}>
      {children}
    </DashboardContext.Provider>
  );
}