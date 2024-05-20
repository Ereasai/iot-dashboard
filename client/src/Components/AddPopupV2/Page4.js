import React, { useEffect, useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Divider,
    Grid,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    Card,
    Chip,
    Box,
    Backdrop,
    CircularProgress,
    Grow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

const Page1 = () => {

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        
        // const loadData = async () => {
        //     setLoading(true);
        //     const response = await fetch(`http://${BACKEND_URL}/get-value-tags`);
        //     let data = await response.json();
        //     const tagsOnly = data.map(({ name, value_ids }) => name);
        //     setTags(tagsOnly.sort());
        //     setLoading(false);
        // };
        // loadData();

    }, []);

    return (
        <DialogContent>
            <Typography variant='h5'>Adjust plot settings.</Typography>
            {loading && <CircularProgress />}
            <br />
            <Typography variant='h1'>TBD</Typography>
        </DialogContent>
    );
};

export default Page1;