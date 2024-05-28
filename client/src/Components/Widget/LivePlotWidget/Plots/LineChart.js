import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto';

import { useTheme } from '@mui/material/styles';

/**
 * 
 * @param {*} data The data to plot.
 */
const LineChart = ({ title, label, data, enableInterpolation=true,  }) => {
  const [formattedData, setFormattedData] = useState({ datasets: [] });

  const theme = useTheme();

  // reformatting of the data is required; need to be formatted based on the type of the graph.
  useEffect(() => {
    const datasets = data.reduce((acc, point) => {
      if (!acc[point.value_name]) {
        acc[point.value_name] = {
          label: label,
          data: [],
          fill: true,
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main,

          // smooth interpolationW
          tension: (enableInterpolation) ? 0.1 : 0,
          cubicInterpolationMode: (enableInterpolation) ?  'monotone' : null,

          // hide data points
          pointRadius: 0,
          pointHoverRadius: 0,

          // line width
          borderWidth: 1,
        };
      }
      acc[point.value_name].data.push({ x: point.created_at, y: point.value });
      return acc;
    }, {});

    const ret = {
      datasets: Object.values(datasets),
    };
    setFormattedData(ret);

  }, [data]);

  const options = {
    animation: {
      duration: 500,
      easing: 'easeInOutQuad',
    },
    layout: {
      autoPadding: false,
      padding: {
        top: 0,
        bottom: 0,
        // right: 10,
        left: 0
      }
    },
    scales: {
      x: {
        display: false,
        type: 'time',
        ticks: {
          padding: 0,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 4,
          font: {
            size: 10
          }
        },
        grid: {
          display: false,
        },
        border: {
          color: 'rgba(0,0,0,255)',
          display: false
        },
      },
      y: {
        display: false,
        ticks: {
          callback: (value, index, ticks) => {
            if (index == 0) return ''
            if (index == ticks.length-1) return ''
            return `${value}`
          },
          padding: 5,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          mirror: true,
          font: {
            size: 10
          }
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      }
    },
  
    plugins: {
      title: {
        display: true,
        text: `${title}`,
        padding: {
          top: 10
        },
      },
      tooltip: {
        enabled: false,
      },
      legend: {
        display: true, 
        onClick: null, // disable clicking labels to hide graph.
        labels: {
          padding: 10, 

          useBorderRadius: true,
          borderRadius: 5,
          boxWidth: 20,
        }
      },
    },
  
    responsive: true,
    maintainAspectRatio: false
  }

  return (
    <Line options={options} data={formattedData} />
  );
}

export default LineChart;