import React, { useEffect, useState } from 'react'

import { Typography, Alert } from '@mui/material';

import LivePlotWidgetEdit from './LivePlotWidgetEdit';
import LineChart from './Plots/LineChart';
import GaugeChart from './Plots/GaugeChart';
import Widget from '../WidgetV3';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

export const DEFAULT_WIDGET_SETTINGS = {
  plotType: '',

  isRealTime: true,
  realTimeInterval: '5minute',
  refreshRate: 500,
  historicInterval: {start: 'n/a', end: 'n/a'},

  // settings that are not common between the plots
  settings: {
    enableInterpolation: false,
    enableAxisLabels: false,

    gaugeRange: {min: 0, max: 100},
    
  }
};

const LivePlotWidget = ({ 
  id, 
  isResizing, 

  valueName, 
  thingName, 

  isRealTime=true, // bool
  realTimeInterval='30minute', // e.g. '3minute' or '1hour'
  historicInterval={start: '2024-05-27', end: '2024-06-01'}, // e.g. {start: 'date_start', end: 'date_end'}
  refreshRate=500, // in ms
  
  plotType, 
  settings=DEFAULT_WIDGET_SETTINGS.settings, 
}) => {

  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchData = async () => {

    const thingValueArg = `thing=${thingName}&value=${valueName}`;
    
    const isGuage = (plotType === 'gauge');

    const args = (isRealTime && !isGuage) ? `interval=${realTimeInterval}`
      : isGuage ? `latest=true`
      : `start=${historicInterval.start}&end=${historicInterval.end}`;

    const url = `http://${BACKEND_URL}/get-value-logs-by-thing-value?${thingValueArg}&${args}`;

    const data = await fetch(url)
      .then(response => response.text())
      .then(data => {
        setError('');
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
        setError(error);
        return [];
      });
      
    setData(data);
  };

  useEffect(() => {
    // NOTE: Consider keeping track of all promises, and canceling them when 
    // this callback is called. Many HTTP requests may be pending when new 
    // settings are applied, and user does not see the immediately even though 
    // the settings are applied. 
    fetchData();
    if (!isRealTime) return;
    const interval = setInterval(() => fetchData(), refreshRate);
    return () => clearInterval(interval);
  }, [
    valueName, 
    thingName, 
    plotType, 
    isRealTime, 
    realTimeInterval,
    refreshRate, 
    historicInterval.start, 
    historicInterval.end
  ]);


  const determinePlotComponent = () => {
    const thingIdBefore = thingName.split('_')[2];
    const thingId = (thingIdBefore) ? thingIdBefore : 'default';
    switch (plotType) {
      case 'line':
        return <LineChart 
          title={thingId} 
          label={valueName}
          data={data} 
          enableInterpolation={settings.enableInterpolation} 
          enableAxisLabels={settings.enableAxisLabels}
        />;
      case 'gauge':
        return <GaugeChart 
          title={thingId} 
          data={data} 
          min={settings.gaugeRange.min} max={settings.gaugeRange.max}
        />;
      default:
        return <Typography>Unknown Component: {plotType}</Typography>
    }
  };



  const ErrorComponent = () => {
    return (
      <div style={{ width: '100%' }}>
        <Alert severity='error'>
          No Data for {thingName} ({valueName})
        </Alert>
      </div>
    );
  };

  return (
    <>
      <Widget 
        id={id}
        title={`${thingName} (${valueName})`}
        openSettings={() => setSettingsOpen(true)}
      >
        {
          !isResizing && // only render chart if not resizing.
          <div
            style={{
              maxHeight: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transform: 'translate(1px, 1px) scale(1.01, 1)',
              zIndex: -10,
            }}
          >
            {
              error ? 
              <ErrorComponent /> :
              determinePlotComponent()
            }

          </div>
        }
      </Widget>
      <LivePlotWidgetEdit 
        id={id}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

export default LivePlotWidget
