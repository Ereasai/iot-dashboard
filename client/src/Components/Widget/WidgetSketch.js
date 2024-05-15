import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const WidgetSketch = () => {
    return (
        <Card style={{ minHeight: '100%' }}>
            <Box className='drag-handle' style={{minWidth: '10px', minHeight: '10px', backgroundColor: 'red'}}></Box>
            <CardContent>
                
                <Box display="flex" justifyContent="space-between" alignItems="center" borderBottom={1} borderColor="grey.200">
                    <Typography variant="h6">
                        (#ThingName).ValueName
                    </Typography>
                    <Typography variant="body2">
                        2023년 5월 1일 부터 - 2023년 10월 1일 까지
                    </Typography>
                </Box>
                <Box display="flex" justifyContent="space-around">
                    <Box border={1} borderColor="grey.200" borderRadius={4} p={2} width="30%">
                        <Typography align="center">graph1 for thing1.ValueName</Typography>
                    </Box>
                    <Box border={1} borderColor="grey.200" borderRadius={4} p={2} width="30%">
                        <Typography align="center">graph2 for thing2.ValueName</Typography>
                    </Box>
                    <Box border={1} borderColor="grey.200" borderRadius={4} p={2} width="30%">
                        <Typography align="center">graph3 for thing3.ValueName</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default WidgetSketch;
