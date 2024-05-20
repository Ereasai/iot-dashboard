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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

const Page1 = ( {selectedTags, selectedValueName, setSelectedValueName} ) => {

    const [valueNames, setValueNames] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (selectedTags.length < 1) return;
        const response = await fetch(`http://${BACKEND_URL}/get-value-names-by-tag?tag=${selectedTags[0]}`);
        const data = await response.json();
        const names = data.map(({ value_name }) => value_name);
        setValueNames(names.sort());
    };

    useEffect(() => {

        const loadData = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        };

        loadData();
    }, [])

    return (
        <DialogContent>
            <Typography variant='h5'>Select a value.</Typography>
            {loading && <CircularProgress />}
            <br />
            {!loading && valueNames.map(valueName => (
                <Chip
                    key={valueName}
                    label={valueName}
                    onClick={() => setSelectedValueName(valueName)}
                    color={(valueName === selectedValueName) ? 'primary' : 'default'}
                    sx={{ margin: 0.5 }}
                />
            ))}
        </DialogContent>
    );
};

export default Page1;