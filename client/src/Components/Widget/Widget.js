import React, { useState, useEffect } from 'react';
import LineChart from './LineChart';
import TextChart from './TextChart';
import GuageChart from './GaugeChart';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

/**
 * valueID: (int)
 * plotType:  (string)
 * timeRange: {start: (string), end: (string)}
 *  - time range must be in some format (TBD).
 * isRealTime: (bool)
 * 
 * Only does intervalic refreshing if isRealTime. 
 */

const Widget = ({valueID, plotType, timeRange, isRealTime, valueMetadata}) => {

    const [data, setData] = useState([]);
    const [isSuccess, setSuccess] = useState(false);

    function getValueLogs() {
        // fetch(`http://localhost:3001/get-value-logs/${valueID}`)

        // const timeStart = '2024-05-08 00:00:00.733+00';
        // const timeEnd = '2024-05-09 00:00:00.733+00';

        const timeStart = timeRange.start;
        const timeEnd = timeRange.end;
        
        const url = (isRealTime) ? `http://${BACKEND_URL}/get-value-logs/${valueID}` :
        `http://${BACKEND_URL}/get-value-logs/${valueID}?timeStart=%27${encodeURIComponent(timeStart)}%27&timeEnd=%27${encodeURIComponent(timeEnd)}%27`;
        
        // console.log("fetching from", url);

        fetch(url)
            .then(response => { 
                return response.text();
            })
            .then(data => {
                // console.log(data);
                const rawData = JSON.parse(data);
                const timeseries = rawData.map((e, index) => {
                    return {created_at : e.created_at, value_name : valueMetadata.value_name, value : e.value, value_string: e.value_string};
                })
                // console.log("printing initially fetched data.");
                // console.log(timeseries);
                setData(timeseries);
                setSuccess(true);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                setSuccess(false);
            });
    }

    // set timer + cause intevalic API call.
    useEffect(() => {
        getValueLogs();
        if (!isRealTime) return;
        const interval = setInterval(() => getValueLogs(), 500); // TODO: GLOBAL SETTING REQUIRED!
        return () => clearInterval(interval);
    }, []);

    // render chart based on the plot type
    const renderChart = () => {
        switch (plotType) {
            case 'line':
                return <LineChart data={data}/>;
            case 'text':
                return <TextChart data={data}/>;
            case 'gauge':
                return <GuageChart data={data} min={valueMetadata.value_min} max={valueMetadata.value_max}/>
            default:
                return <p>Unsupported plot type.</p>
        }
    }

    return (
        <div style={{ height: '100%', background: '#ebebeb', display: "flex", flexDirection: "column" }}>
            <div className='drag-handle' />
            <div style={{height: '100%'}}>{(isSuccess) ? renderChart() : <p>Query failed.</p>}</div>
        </div>
    );
}

export default Widget;