import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { useDashboard } from '../DashboardContext';

// import Graph from './Widget/Graph.js'
// import BarChart from './Widget/BarChart.js'
import Widget from './Widget/Widget';
import './Dashboard.css'

const ResponsiveGridLayout = WidthProvider(Responsive);   

function Dashboard () {

    const [layouts, setLayouts] = useState({lg: []});
    const [items, setItems] = useState([]);

    // global (abstract) state of the dashboard
    const {widgets, addWidget} = useDashboard();

    useEffect(() => {
        const newItems = widgets.map(widget => {
            const existingItem = items.find(item => item.i === widget.uid.toString());
            if (existingItem) {
                return existingItem;
            }
            else {
                return {...widget,i: widget.uid.toString()}
            }
        });
        setItems(newItems);

        const newLayouts = {lg: null}

        newLayouts.lg = widgets.map(widget => {
            const existingLayout = layouts.lg.find(layout => layout.i === widget.uid.toString());
            if (existingLayout) {
                return existingLayout;
            }
            else {
                return {
                    i: widget.uid + "", // MUST BE STRING
                    x: 0,
                    y: Infinity, // bottom of the layout
                    w: 2,
                    h: 2
                };
            }
        });
        setLayouts(newLayouts);
    }, [widgets]);
    



    /* RESPONSIVE GRID PROPERTIES */
    const responsiveProps = {
        className: 'dashboard',
        breakpoints: { lg: 1200, /*md: 960, /*sm: 720, xs: 480, xxs: 0*/ },
        cols: { lg: 20, /*md: 7, /*sm: 2, xs: 1, xxs: 1*/ },
        rowHeight: 100,
        compactType: 'vertical',
        animate: false,

        // preventCollision: true,

        draggableHandle: ".drag-handle",
        onLayoutChange: (layout, layouts) => {
            // console.log("onLayoutChange()")
            // console.log(layouts)
            setLayouts(layouts)
        },
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
        return items.map((item) => {
            const timeRange = {start: item.startDate, end: item.endDate}
            return (
                <div key={item.i}>

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
            {/*printLayouts() */ }
            <ResponsiveGridLayout layouts={layouts} {...responsiveProps} animate={false}>
                {renderCharts()}
            </ResponsiveGridLayout>
        </>
    );
}

export default Dashboard;