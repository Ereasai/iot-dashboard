import React, { useEffect, useState } from 'react'
import LineChart from './Plots/LineChart';
import Widget from './WidgetV3';
import { Box, Typography, Alert } from '@mui/material';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

const LivePlotWidget = ({ valueName, thingName, plotType, isResizing, id }) => {

  const [data, setData] = useState([]);

  const fetchData = async () => {
    const args = `thing=${thingName}&value=${valueName}&interval=5minute`;
    const url = `http://${BACKEND_URL}/get-value-logs-by-thing-value?${args}`;

    const data = await fetch(url)
      .then(response => response.text())
      .then(data => {
        // parse raw data into nice format
        const rawData = JSON.parse(data);
        return rawData.map(e => ({
          created_at: e.created_at,
          value_name: `${thingName}.${valueName}`,
          value: e.value,
          value_string: e.value_string,
        }));
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        return [];
      });
    
    setData(data);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 500); // TODO: GLOBAL SETTING REQUIRED!
    return () => clearInterval(interval);
  }, [valueName, thingName]);


  const determinePlot = (plotType) => {
    switch (plotType) {
      default:
        return <></>
    }
  }

  const NoDataComponent = () => {
    return (
      <div style={{ width: '100%' }}>
        <Alert severity='error'>
          No Data for {thingName} ({valueName})
        </Alert>
      </div>
    );
  };


  return (
    <Widget 
      id={id}
      title={`${thingName} (${valueName})`}
    >
      {
        !isResizing && // only render if not resizing.
        <div
          style={{
            maxHeight: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
        }}
        >
          {
            (data.length == 0) ? 
            <NoDataComponent /> :
            <LineChart data={data}/>
          }

        </div>
      }
    </Widget>
  );
}

export default LivePlotWidget
