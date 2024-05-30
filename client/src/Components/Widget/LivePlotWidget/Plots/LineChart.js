import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto';

import { useTheme } from '@mui/material/styles';

/**
 * 
 * @param {*} data The data to plot.
 */
const LineChart = ({ title, label, data, enableInterpolation=true, enableAxisLabels=true }) => {
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
        bottom: (enableAxisLabels) ? 8 : 0,
        right: (enableAxisLabels) ? 25 : 0,
        left: 0
      }
    },
    scales: {
      x: {
        display: enableAxisLabels,
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
          color: theme.palette.gridLineColor.main,
          display: true,
        },
        border: {
          color: theme.palette.gridLineColor.main,
          display: true
        },
      },
      y: {
        display: enableAxisLabels,
        ticks: {
          callback: (value, index, ticks) => {

            const crop = (input) => {
              const number = parseFloat(input);
              if (isNaN(number)) return 'NaN';
              if (Number.isInteger(number)) return number.toString();
              else return number.toFixed(1);
            };

            return `${crop(value)}`
          },
          padding: 5,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: {
            size: 10
          }
        },
        grid: {
          color: theme.palette.gridLineColor.main,
          display: true,
        },
        border: {
          color: theme.palette.gridLineColor.main,
          display: true,
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