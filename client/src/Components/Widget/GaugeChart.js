import React, { useEffect, useState, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';

const centerTextPlugin = {
    id: 'centerText',
    afterDraw: (chart) => {
        // Check if chart, context, and necessary data are available
        if (!chart || !chart.ctx || !chart.data.datasets || !chart.data.datasets.length) {
            return; // Exit if no data is available to avoid errors
        }

        const { ctx, chartArea: { top, bottom, left, right }, data } = chart;
        const dataset = data.datasets[0];

        // Additional safety check for dataset data
        if (!dataset.data.length) return;

        const centerValue = dataset.data[0];  // This assumes your value is the first element
        ctx.save();
        ctx.font = '60px Arial';  // Customize the font size and family as needed
        ctx.fillStyle = 'green';  // Font color
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = (left + right) / 2;
        const centerY = 2 * (top + bottom) / 3;
        ctx.fillText(centerValue, centerX, centerY);
        ctx.restore();
    }
};
  
  

const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: true,
    cutout: '85%', // Makes chart look like a gauge
    plugins: {
        tooltip: {
            enabled: false, // Disables tooltip
        },
        legend: {
            display: false, // Hides legend
        },
    },
    layout: {
        padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }
    }
};

const GuageChart = ({data, min, max}) => {
    const [formattedData, setFormattedData] = useState({datasets: []});

    useEffect(() => {
        const recent = data[data.length-1];
        // const recent = recentData === undefined ? {value: 0} : recentData;
        const value = 100 * (recent.value - min) / (max - min) ;

        const newData = {
            datasets: [
                {
                    data: [value, 100 - value],
                    label: recent.value_name,
                    backgroundColor: ['#4CAF50', '#ddd'],
                    borderWidth: 0,
                    circumference: 200,
                    rotation: 260,
                },
            ],
        };

        setFormattedData(newData)
        
    }, [data]);

    return <Doughnut data={formattedData} options={options} plugins={[centerTextPlugin]}/>
}

export default GuageChart;