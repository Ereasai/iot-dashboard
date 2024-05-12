import React, {useEffect, useState} from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto'; 

const options = {
    scales: {
        x: { type: 'time' },
    },

    responsive: true,
    maintainAspectRatio: false,
    animations: false, 
}

const LineChart = ({data}) => {
    const [formattedData, setFormattedData] = useState({datasets: []});

    // reformatting of the data is required; need to be formatted based on the type of the graph.
    useEffect(() => {
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
        setFormattedData(ret);

    }, [data]);

    return <Line options={options} data={formattedData}/>;
}

export default LineChart;