import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import 'chart.js/auto';

const options = {
  animation: {
    duration: 500,
    easing: 'easeInOutQuad',
  },
  layout: {
    padding: {
      top: 20,
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
        display: false,
      },
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
  maintainAspectRatio: false
}

/**
 * 
 * @param {*} data The data to plot.
 */
const LineChart = ({ data }) => {
  const [formattedData, setFormattedData] = useState({ datasets: [] });

  // reformatting of the data is required; need to be formatted based on the type of the graph.
  useEffect(() => {
    const datasets = data.reduce((acc, point) => {
      if (!acc[point.value_name]) {
        acc[point.value_name] = {
          label: point.value_name,
          data: [],
          fill: true,

          // smooth interpolation
          // tension: 0.1,
          // cubicInterpolationMode: 'monotone',

          // hide data points
          pointRadius: 0,
          pointHoverRadius: 10,

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

  return (
    <Line options={options} data={formattedData} />
  );
}

export default LineChart;