import React, { useEffect, useState, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';

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

    const fontSize = Math.min(Math.abs(top - bottom), Math.abs(left - right)) / 2;

    const centerValue = dataset.data[0];  // This assumes your value is the first element
    ctx.save();
    ctx.font = `${fontSize}px Roboto`;  // Customize the font size and family as needed
    ctx.fillStyle = 'green';  // Font color
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const centerX = (left + right) / 2;
    const centerY = 2 * (top + bottom) / 3;
    ctx.fillText(centerValue, centerX, centerY);
    ctx.restore();
  }
};

const GuageChart = ({ title, data, min=55, max=56 }) => {
  const [formattedData, setFormattedData] = useState({ datasets: [] });
  const [recentValue, setRecentValue] = useState(0);

  const theme = useTheme();

  useEffect(() => {
    // set "fake" data to format the gauge correctly.
    const recent = (data.length == 0) ? 0 : data[data.length - 1];
    let val = recent.value;
    val = (val > max) ? max : val;
    val = (val < min) ? min : val;
    setRecentValue(recent.value);
    const percent = 100 * (val - min) / (max - min);
    // console.log(percent)

    const newData = {
      datasets: [
        {
          data: [percent, 100 - percent],
          label: recent.value_name,
          backgroundColor: [theme.palette.primary.main, '#ddd'],
          borderWidth: 0,
          circumference: 200,
          rotation: 260,
        },
      ],
    };

    setFormattedData(newData)

  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: true,
    cutout: '85%',
    plugins: {
      title: {
        display: true,
        text: `${title}`,
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        display: true, 
      },
    },
    layout: {
      padding: {
        top: 0,
        right: 10,
        bottom: 10,
        left: 10,
      }
    }
  };

   // plugins={[centerTextPlugin]}
  return (
    <div
      style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center' }}
    >

        <span style={{ position: 'absolute', bottom: '10%' }}>{recentValue}</span>
        <Doughnut data={formattedData} options={options} />
      
    </div>
  
); 
}

export default GuageChart;