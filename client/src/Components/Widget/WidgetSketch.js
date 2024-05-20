import { useState, useEffect } from 'react';

import { 
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
} from '@mui/material';

import { alpha, positions, styled } from '@mui/system';

import { useTheme } from '@mui/material/styles';

import LineChart from './LineChart';

const ScrollContainer = styled(Box)({
    display: 'flex',
    // transition: 'all 0.4s ease-in-out',
    gap: 10,
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    padding: '10px',

    // backgroundColor: 'red',
    
    scrollbarWidth: 'thin',
    // '&::-webkit-scrollbar': {
    //     alpha: 0,
    // },
    // '&:hover': {
    //     scrollbarWidth: 'thin',
    //     '&::-webkit-scrollbar': {
    //         display: 'block',
    //     },
    // },
    // '&::-webkit-scrollbar': {
    //     height: '8px',
    // },
    // '&::-webkit-scrollbar-thumb': {
    //     backgroundColor: '#888',
    //     borderRadius: '4px',
    // },
    // '&::-webkit-scrollbar-thumb:hover': {
    //     backgroundColor: '#555',
    // },
});


function generateFakeDataPoints(numPoints) {
    const dataPoints = [];

    for (let i = 1; i <= numPoints; i++) {
        dataPoints.push({
            created_at: Date.now() + i * 1000, // Adding i * 1000 to simulate different timestamps
            value: Math.floor(Math.random() * 100) + 1, // Random value between 1 and 100
            value_name: "something"
        });
    }

    return dataPoints;
}

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP;

const Widget = ({tags, value, chartType='line'}) => {

    const theme = useTheme();
    const [things, setThings] = useState([]);
    const [data, setData] = useState([]);

    // when tags or value name are adjusted, fetch things.
    useEffect(() => {
        const loadThings = async () => {
            const args = `valueName=${value}&tagNames=${tags.join(',')}`;
            const response = await fetch(`http://${BACKEND_URL}/get-things-by-value-tags?${args}`);
            const data = await response.json();
            const things = data.map(({ thing_name }) => thing_name);
            setThings(things.sort());
        };

        loadThings();
    }, [tags, value]);
    // http://localhost:3001/get-value-logs-by-thing-value?thing=Clock&value=second&interval=10seconds
    // loop for fetching values


    const getValueLogs = () => {
        // Create an array of promises for each API request
        const requests = things.map(thing => {
            const args = `thing=${thing}&value=${value}&interval=10minute`;
            const url = `http://${BACKEND_URL}/get-value-logs-by-thing-value?${args}`;

            return fetch(url)
                .then(response => response.text())
                .then(data => {
                    // parse raw data into nice format
                    const rawData = JSON.parse(data);
                    return rawData.map(e => ({
                        created_at: e.created_at,
                        value_name: value,
                        value: e.value,
                        value_string: e.value_string,
                    }));
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    return [];
                });
        });

        // Wait for all promises to resolve and update the state
        Promise.all(requests)
            .then(results => {
                setData(results);
            })
            .catch(error => {
                console.error('There was a problem with processing the results:', error);
            });
    };

    useEffect(() => {
        getValueLogs();
        const interval = setInterval(() => getValueLogs(), 500); // TODO: GLOBAL SETTING REQUIRED!
        return () => clearInterval(interval);
    }, [things, value]);

    return (
        <Card variant='elevation' style={{ minHeight: '100%'}}>
            <Box 
                className='drag-handle' 
                style={{
                    minWidth: '10px', 
                    minHeight: '10px', 
                    backgroundColor: theme.palette.secondary.main,
                }}
            />

            <CardContent>
                <Typography variant="h2">
                    {value}
                </Typography>
                <Typography variant="caption">
                    {/* 2023년 5월 1일 부터 - 2023년 10월 1일 까지 */}
                    Last 10 seconds (hardcoded).
                </Typography>
                <br/>
                <ScrollContainer>
                    {tags.map((tag) => (
                        <Chip label={'#' + tag} />
                    ))}
                </ScrollContainer>
                <ScrollContainer>
                    {/* <Box borderColor="black" p={2}>
                        {<LineChart data={generateFakeDataPoints(20)}></LineChart>}
                    </Box> */}
                    

                    {things.map((thing, index) => (
                        <Box 
                            key={thing}
                            borderColor='black' 
                            border={1}>
                            
                            {thing}
                            <Box>
                            {data[index] && <LineChart data={data[index]} />}
                            

                            {/* {(data[0]).map((point) => {
                                // console.log(point)
                                return <Chip key={point} label='d'/>
                            })} */}

                            </Box>
                            
                        </Box>
                    ))}

                </ScrollContainer>
            </CardContent>
        </Card>
    );
};

export default Widget;
