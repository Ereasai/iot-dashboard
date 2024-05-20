import React, {useEffect, useState} from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto'; 

const options = {
    scales: {
        x: { 
            display: false, 
            type: 'time',
            ticks: {
                maxRotation: 0,
                minRotation: 0,
                autoSkip: true,
                maxTicksLimit: 4,
            }
        },
        y: {
            ticks: {
                maxRotation: 0,
                minRotation: 0,
                autoSkip: true,
                maxTicksLimit: 4,
            }
        }
    },

    plugins: {
        // title: {
        //   display: true,
        //   text: 'Line Chart Example',
        // },
        legend: {
          display: false, // Hide legend if you want to
        },
    },

    responsive: true,
    maintainAspectRatio: false,
    animation: false, 
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
                    // backgroundColor: 'rgb(75, 192, 192)'
                };
            }
            acc[point.value_name].data.push({x: point.created_at, y: point.value});
            return acc;
        }, {});
        
        const ret = {
            datasets: Object.values(datasets),
        };
        setFormattedData(ret);

    }, [data]);

    return <Line options={options} data={formattedData}/>;
}

export default LineChart;