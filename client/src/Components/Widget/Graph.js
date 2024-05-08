import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto'; 

// loading env variable
// require('dotenv').config();
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

const options = {
    scales: {
        x: { type: 'time' },
    },

    responsive: true,
    maintainAspectRatio: false,
    animations: false, // better for performance

    // layout: {
    //     padding: 0
    // }
}

const Graph = ({valueToGraph}) => {

    const [data, setData] = useState([])

    function getValueLogs(valueID) {
        // fetch(`http://localhost:3001/get-value-logs/${valueID}`)
        console.log("BACKEND_URL", BACKEND_URL);
        const url = `http://localhost/backend/get-value-logs/8`;
        console.log("fetching from", url);
        fetch(url)
            .then(response => {
                return response.text()
            })
            .then(data => {
                console.log(data)
                const rawData = JSON.parse(data)
                const timeseries = rawData.map((e, index) => {
                    return {created_at : e.created_at, value_name : e.value_name, value : e.value}
                })
                console.log("printing initially fetched data.")
                console.log(timeseries)
                setData(timeseries)
            })
    }

    useEffect(() => {
        getValueLogs(valueToGraph)
        const interval = setInterval(() => getValueLogs(valueToGraph), 500); // Fetch every 10 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [valueToGraph])

    const chartData = useMemo(() => {
        const datasets = data.reduce((acc, point) => {
            if (!acc[point.value_name]) {
                acc[point.value_name] = {
                    label: point.value_name,
                    data: [],
                    fill: true,
                };
            }
            acc[point.value_name].data.push({ x: point.created_at, y: point.value });
            return acc;
        }, {});
        
        const ret = {
            datasets: Object.values(datasets),
        };
        console.log("data set:")
        console.log(ret)
        return ret
    }, [data]);
    
    return (
        
        // scaling the object
        <div style={{ width: '100%', height: '100%'}}>
            <Line options={options} data={chartData} />
        </div>
        
    );
};

    

export default Graph;
