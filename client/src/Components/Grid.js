import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { useDashboard } from '../contexts/DashboardContext';

// import Graph from './Widget/Graph.js'
// import BarChart from './Widget/BarChart.js'
// import Widget from './Widget/WidgetSketch';
import LivePlotWidget from './Widget/LivePlotWidget';

// TODO: reconfigure to meet style
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './disableAnimation.css'


const ResponsiveGridLayout = WidthProvider(Responsive);

const Grid = () => {

  // const [layouts, setLayouts] = useState({lg: []});

  const { widgets, layouts, setLayouts } = useDashboard();
  const [isResizing, setResizing] = useState(false);

  useEffect(() => {
    // v3
    console.group("Dashboard.useEffect()");
    console.log("widgets:", widgets);
    const newLayout = {
      lg: widgets.map(widget => {
        const existingLayout = layouts.lg.find(layout => layout.i === widget.id);

        // already exists. no need to modify.
        if (existingLayout) return existingLayout;

        // create new layout.
        // the `widget` does not hold positional data anymore.
        // return {
        //     i: widget.id,
        //     x: widget.x || 0,
        //     y: (widget.y == undefined) ? Infinity : widget.y,
        //     w: widget.width || 2,
        //     h: widget.height || 3,
        // };

        return {
          i: widget.id,
          x: 0, y: Infinity,
          w: 3, h: 14,
          minW: 2, minH: 2,
        };
      }),
      // other breakpoints can be defined here.
    };
    console.log("newLayout", newLayout);
    console.groupEnd();
    setLayouts(newLayout);
  }, [widgets]);

  const onLayoutChange = (layout, allLayouts) => { setLayouts(allLayouts); };

  /* RESPONSIVE GRID PROPERTIES */
  const responsiveProps = {
    className: 'dashboard',
    breakpoints: { lg: 1200, /*md: 960, /*sm: 720, xs: 480, xxs: 0*/ },
    cols: { lg: 20, /*md: 7, /*sm: 2, xs: 1, xxs: 1*/ },
    rowHeight: 20,
    compactType: 'vertical',

    draggableHandle: ".drag-handle",
    onLayoutChange: onLayoutChange,
    margin: [2, 2], // Margin between items
    containerPadding: [10, 10], // Padding inside the grid container

    onResizeStart: () => { console.log('resizeStart()'); setResizing(true); },
    onResizeStop: () => { console.log('resizeEnd()'); setResizing(false); }
  };

  const renderCharts = () => {

    const determineComponent = (item) => {
      switch (item.type) {
        case 'plot':
          return (
            <LivePlotWidget 
              id={item.id}
              valueName={item.valueName}
              thingName={item.thingName}
              plotType='line'
              isResizing={isResizing}
            />
          );    
        case 'plot-group':
          return <p>plot group</p>
      }
    };

    return widgets.map((item) => {
      return (
        <div key={item.id}>
          {determineComponent(item)}
        </div>
      );
    });
  };

  return (
    <>
      <ResponsiveGridLayout 
        layouts={layouts} 
        {...responsiveProps}
      >
        {renderCharts()}
        {/* <div key='hello'>
                    <WidgetSketch resizing={isResizing}/>
                </div> */}
      </ResponsiveGridLayout>
    </>
  );
};

export default Grid;