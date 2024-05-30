import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { useDashboard } from '../contexts/DashboardContext';

import LivePlotWidget from './Widget/LivePlotWidget/LivePlotWidget';
import StaticTextWidget from './Widget/StaticTextWidget/StaticTextWidget';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './disableAnimation.css'



const ResponsiveGridLayout = WidthProvider(Responsive);

const Grid = () => {

  const { widgets, layouts, setLayouts } = useDashboard();

  // keeps track of whether grid elements are being resized.
  const [isResizing, setResizing] = useState(false);

  useEffect(() => {
    console.group("Dashboard.useEffect()");
    console.log("widgets:", widgets);
    const newLayout = {
      lg: widgets.map(widget => {
        const existingLayout = layouts.lg.find(layout => layout.i === widget.id);

        // already exists. no need to modify.
        if (existingLayout) return existingLayout;

        return {
          i: widget.id,
          x: 0, y: Infinity,
          w: 3, h: 14,
          minW: 2, minH: 2,
        };
      }),
      // other breakpoints can be defined here.
      // e.g `md`
    };
    console.log("newLayout", newLayout);
    console.groupEnd();
    setLayouts(newLayout);
  }, [widgets]);

  const onLayoutChange = (layout, allLayouts) => { {
    console.log(allLayouts);
    console.log(widgets)
    setLayouts(allLayouts);
  }};

  /* RESPONSIVE GRID PROPERTIES */
  const responsiveProps = {
    className: 'dashboard',
    breakpoints: { lg: 1200, /*md: 960, /*sm: 720, xs: 480, xxs: 0*/ },
    cols: { lg: 20, /*md: 7, /*sm: 2, xs: 1, xxs: 1*/ },
    rowHeight: 20,
    
    compactType: 'vertical', // 'vertical',
    preventCollision: false,

    draggableHandle: ".drag-handle",
    onLayoutChange: onLayoutChange,
    margin: [2, 2], // margin between items
    containerPadding: [10, 10], // Padding inside the grid container

    onResizeStart: () => { setResizing(true); },
    onResizeStop: () => { setResizing(false); }
  };

  const renderCharts = () => {

    // based on the type of item, choose the corresponding Widget
    // component.
    const determineComponent = (item) => {
      switch (item.type) {
        case 'plot':
          return (
            <LivePlotWidget 
              isResizing={isResizing}
              {...item}
            />
          );    
        case 'staticText':
          return (
            <StaticTextWidget {...item} />
          );
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
      <ResponsiveGridLayout layouts={layouts} {...responsiveProps}>
        {renderCharts()}
      </ResponsiveGridLayout>
    </>
  );
};

export default Grid;