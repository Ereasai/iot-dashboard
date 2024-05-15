import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useDashboard } from '../DashboardContext';

// import Graph from './Widget/Graph.js'
// import BarChart from './Widget/BarChart.js'
import Widget from './Widget/Widget';

// TODO: reconfigure to meet style
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// TODO: defines the widgets here? which is werid.
// should be in the widgets.
import './Dashboard.css'
import WidgetSketch from './Widget/WidgetSketch';

const ResponsiveGridLayout = WidthProvider(Responsive);   

const Dashboard = forwardRef((props, ref) => {
    
    const [layouts, setLayouts] = useState({lg: []});
    
    const {widgets, updateWidget} = useDashboard();
    
    useImperativeHandle(ref, () => ({
        getLayouts: () => {
            return layouts;
        }
    }));

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
                return {
                    i: widget.id,
                    x: widget.x || 0,
                    y: (widget.y == undefined) ? Infinity : widget.y,
                    w: widget.width || 2,
                    h: widget.height || 3,
                }
            }),
            // other breakpoints can be defined here.
        };
        console.log("newLayout",newLayout);
        console.groupEnd();
        setLayouts(newLayout);
    }, [widgets]);

    const onLayoutChange = (layout, allLayouts) => {
        // console.group("Dashboard.onLayoutChange()");
        // console.log("layout:", layout);
        // if (JSON.stringify(layouts.lg) === JSON.stringify(layout)) return;
        // layout.forEach(layoutItem => {
        //     const updatedWidget = {
        //         ...widgets.find(item => item.id === layoutItem.i),
        //         x: layoutItem.x,
        //         y: layoutItem.y,
        //         width: layoutItem.w,
        //         height: layoutItem.h,
        //     };
        //     updateWidget(updatedWidget); 
        // });
        // console.groupEnd();
        setLayouts(allLayouts);
    };
    



    /* RESPONSIVE GRID PROPERTIES */
    const responsiveProps = {
        className: 'dashboard',
        breakpoints: { lg: 1200, /*md: 960, /*sm: 720, xs: 480, xxs: 0*/ },
        cols: { lg: 20, /*md: 7, /*sm: 2, xs: 1, xxs: 1*/ },
        rowHeight: 100,
        compactType: 'vertical',

        draggableHandle: ".drag-handle",
        onLayoutChange: onLayoutChange,
        margin: [10, 10], // Margin between items
        containerPadding: [10, 10], // Padding inside the grid container
    };


    // FOR DEBUGGING 
    const printLayouts = () => {
        return (
            <div style={{border: "black 1px"}}>
                <h2>lg:</h2>
                <ul>
                    {layouts.lg.map(layout => {
                        const str = `i: ${layout.i}, x: ${layout.x}, y: ${layout.y}, w: ${layout.w}, h: ${layout.h}, `
                        return (<li key={layout.i}>{str}</li>)
                    })}
                </ul>
            </div>
        )
    }

    const renderCharts = () => {
        return widgets.map((item) => {
            // console.log("Dashboard.renderCharts(), item:", item)
            const timeRange = {start: item.startDate, end: item.endDate}
            return (
                <div key={item.id}>

                    {/* <div style={{ height: '100%', background: '#ebebeb', display: "flex", flexDirection: "column" }}>
                    <div className='drag-handle'>
                        i: {item.i}, 
                        value_id: {item.valueID}
                    </div>
                    <Graph valueToGraph={item.valueID}/>
                </div> */}
                    <Widget valueID={item.valueID} plotType={item.plotType} isRealTime={item.isRealTime} timeRange={timeRange} valueMetadata={item.valueMetadata}/>

                </div>
            )
        })
    }

    return (
        <>
            <ResponsiveGridLayout layouts={layouts} {...responsiveProps}>
                {renderCharts()}
                {/* <div key='hello'>
                    <WidgetSketch/>
                </div> */}
            </ResponsiveGridLayout>
        </>
    );
});

export default Dashboard;