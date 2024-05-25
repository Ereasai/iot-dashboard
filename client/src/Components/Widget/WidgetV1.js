import { useState, useEffect, cloneElement, Children } from 'react';

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';

import MoreVertIcon from '@mui/icons-material/MoreVert';

import { alpha, margin, padding, positions, styled } from '@mui/system';

import { useTheme } from '@mui/material/styles';

import LineChart from './Plots/LineChart';
import GuageChart from './Plots/GaugeChart';

const ScrollContainerV2 = ({ children, style }) => {
  const handleScroll = (event) => {
    const container = event.currentTarget;
    const scrollAmount = event.deltaY;
    container.scrollTo({
      top: 0,
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div
      // onWheel={handleScroll}
      style={{
        ...style,
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
        // border: '2px solid black'
      }}
    >
      {children}
    </div>
  );
};

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

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP;

const Widget = ({ tags, value, chartType = 'line' }) => {

  const theme = useTheme();
  const [things, setThings] = useState([]);
  const [data, setData] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      const args = `thing=${thing}&value=${value}&interval=5minute`;
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
    <Card variant='elevation' style={{ minHeight: '100%' }}>
      
      <Box
        className='drag-handle'
        style={{
          minWidth: '10px',
          minHeight: '10px',
          backgroundColor: theme.palette.secondary.main,
        }}
      />

      <IconButton
        aria-label='action menu'
        onClick={handleMenuClick}
        sx={{
          position: 'absolute',
          top: 10, right: 0
        }}
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        id='action-menu'
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
      >
        <MenuItem>Edit</MenuItem>
        <MenuItem color='error'>Delete</MenuItem>

      </Menu>

      <CardContent>
        <Typography variant="h2">
          {value}
        </Typography>
        <Typography variant="caption">
          {/* 2023년 5월 1일 부터 - 2023년 10월 1일 까지 */}
          Last 10 seconds (hardcoded).
        </Typography>
        <br />
        <ScrollContainerV2
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {tags.map((tag) => (
            <Chip label={'#' + tag} />
          ))}
        </ScrollContainerV2>
        <ScrollContainerV2
          style={{
            gap: 10,
            marginTop: 10,
            marginLeft: -20,
            marginRight: -20
          }}
        >
          {things.map((thing, index) => (
            <Card
              variant='outlined'
              key={thing}
              sx={{
                padding: 0,
                minWidth: '500px',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >

              {thing}
             
              <Box
                sx={{
                  minWidth: '500px',
                  maxWidth: '500px',
                  minHeight: '165px',
                  maxHeight: '165px',
                  paddingLeft: 8,
                  paddingRight: 5,
                  // backgroundColor: 'red'
                }}
              >
                {data[index] && <LineChart data={data[index]} />}
              </Box>
              

            </Card>
          ))}

        </ScrollContainerV2>
      </CardContent>
    </Card>
  );
};

export default Widget;
