import React, { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto'; 

// loading env variable
// require('dotenv').config();
const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP
console.log("BACKEND_URL", BACKEND_URL);

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

    const [data, setData] = useState([]);
    const [success, setSuccess] = useState(false);

    function getValueLogs(valueID) {
        // fetch(`http://localhost:3001/get-value-logs/${valueID}`)

        const timeStart = '2024-05-08 00:00:00.733+00';
        const timeEnd = '2024-05-09 00:00:00.733+00';
        
        const url = `http://${BACKEND_URL}/get-value-logs/${valueToGraph}?timeStart=%27${encodeURIComponent(timeStart)}%27&timeEnd=%27${encodeURIComponent(timeEnd)}%27`;
        console.log("fetching from", url);
        fetch(url)
            .then(response => {
                return response.text()
            })
            .then(data => {
                console.log(data)
                const rawData = JSON.parse(data)
                const timeseries = rawData.map((e, index) => {
                    return {created_at : e.created_at, value_name : e.value_name, value : e.value, value_string: e.value_string}
                })
                console.log("printing initially fetched data.")
                console.log(timeseries)
                setData(timeseries)
                setSuccess(true);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                setSuccess(false);
                // Handle the error (e.g., show an error message to the user)
            });
    }

    useEffect(() => {
        getValueLogs(valueToGraph)
        const interval = setInterval(() => getValueLogs(valueToGraph), 500); // Fetch every 10 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, [valueToGraph]);

    const chartData = useMemo(() => {
        console.log('chartData has been recomputed.');
        const datasets = data.reduce((acc, point) => {
            if (!acc[point.value_name]) {
                acc[point.value_name] = {
                    label: point.value_name,
                    data: [],
                    fill: true,
                };
            }
            acc[point.value_name].data.push({x: point.created_at, y: point.value});
            return acc;
        }, {});
        
        const ret = {
            datasets: Object.values(datasets),
        };
        console.log(ret);
        // console.log("data set:")
        // console.log(ret)
        return ret
    }, [data]);
    
    return (
        
        // scaling the object
        <div style={{ width: '100%', height: '100%'}}>
            {success ? <Line options={options} data={chartData} /> 
            : "query failed."}
        </div>
        
    );
};

    

export default Graph;
