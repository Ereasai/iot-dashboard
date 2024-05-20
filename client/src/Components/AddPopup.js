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


import { NewWidgetPopup } from './NavbarButtons';

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP

const DEFAULT_FORM_DATA = {
    selectedTags: [],
    selectedValues: [],
    selectedThings: [],
};

const AddPopup = ({ open, onClose }) => {

    const theme = useTheme();

    // API data
    const [tags, setTags] = useState([]);
    const [tagMetadata, setTagMetadata] = useState([]);
    const [valueMetadata, setValueMetadata] = useState([]);
    const [thingMetadata, setThingMetadata] = useState([]);
    
    // form input
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    
    // UI states
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [confirmBoxOpen, setConfirmBoxOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const loadData = async () => {
            setLoading(true); // show loading animation.
            await fetchTags();
            await fetchValueMetadata();
            await fetchThingMetadata();
            setLoading(false); // end loading animation.
        };

        loadData();
    }, [open]);

    const fetchTags = async () => {
        const response = await fetch(`http://${BACKEND_URL}/get-value-tags`);
        const data = await response.json();

        setTagMetadata(data);

        const tagsOnly = data.map(({ name, value_ids }) => name);
        setTags(tagsOnly.sort());
    };

    const fetchValueMetadata = async () => {
        const response = await fetch(`http://${BACKEND_URL}/get-value-metadata`);
        const data = await response.json();
        setValueMetadata(data);
    };

    const fetchThingMetadata = async () => {
        const response = await fetch(`http://${BACKEND_URL}/get-things`);
        const data = await response.json();
        console.log(data);
        setThingMetadata(data);
    };
    


    /* Memoized */

    const filteredValueNameMap = useMemo(() => {

        const DEBUG = false;

        if (DEBUG) console.group("AddPopup::filteredValueMetadata()");
        if (DEBUG) console.log("tagMetadata:", tagMetadata);

        const filteredTagMetadata = tagMetadata.filter(tag => formData.selectedTags.includes(tag.name));

        if (DEBUG) console.log('filteredTagMetadata:', filteredTagMetadata);

        // the inside is [[value_ids_1], ..., [value_ids_n]].flat();
        const valueIdList = filteredTagMetadata.map( tagData => tagData.value_ids ).flat();
        // TODO: consider doing union

        if (DEBUG) console.log("valueIdList:", valueIdList);

        const filtered = valueMetadata.filter(valueData => valueIdList.includes(valueData.value_id));

        if (DEBUG) console.log("filtered:", filtered);

        let final = {};
        filtered.forEach(valueData => {
            const name = valueData.value_name;
            if (final[name] == undefined) {
                final[name] = [valueData.thing_id];
            } else {
                final[name].push(valueData.thing_id);
            }
        })

        if (DEBUG) console.log("final:", final);
        if (DEBUG) console.groupEnd();
        
        return final;
    }, [formData.selectedTags]);


    const filteredThingsMetadata = useMemo(() => {
        console.group("AddPopup::filteredThingNameMap()");
        console.log("filteredValueNameMap:", filteredValueNameMap);
        console.log("thingMetadata:", thingMetadata);
        const uniqueThingIds = [...new Set(formData.selectedValues.map(name => filteredValueNameMap[name]).flat())];
        console.log("uniqueThingIds:", uniqueThingIds);

        const filteredMetaData = thingMetadata.filter(thingData => uniqueThingIds.includes(thingData.thing_id));

        console.log("filteredMetadata:", filteredMetaData);
        console.groupEnd();

        return filteredMetaData;
    }, [formData.selectedValues]);

    /* Handlers */

    const handleTagChange = (toggledTag) => {
        if (formData.selectedTags.includes(toggledTag)) {
            const newSelectedTags = formData.selectedTags.filter(tag => tag !== toggledTag);
            setFormData({...formData, selectedTags: newSelectedTags});
            return;
        }
        const newSelectedTags = formData.selectedTags.concat([toggledTag]);
        setFormData({...formData, selectedTags: newSelectedTags, selectedValues: [], selectedThings: []})
    };

    const handleValueChange = (toggledValue) => {
        if (formData.selectedValues.includes(toggledValue)) {
            const newSelectedValues = formData.selectedValues.filter(value => value !== toggledValue);
            setFormData({...formData, selectedValues: newSelectedValues, selectedThings: []});
            return;
        }
        const newSelectedValues = formData.selectedValues.concat([toggledValue]);
        setFormData({...formData, selectedValues: newSelectedValues});
    }

    const handleThingChange = (toggledThing) => {
        if (formData.selectedThings.includes(toggledThing)) {
            const newSelectedThings = formData.selectedThings.filter(thing => thing !== toggledThing);
            setFormData({...formData, selectedThings: newSelectedThings});
            return;
        }
        const newSelectedThings = formData.selectedThings.concat([toggledThing]);
        setFormData({...formData, selectedThings: newSelectedThings});
    }


    const handleCloseConfirm = () => {
        setConfirmBoxOpen(false);
        setFormData(DEFAULT_FORM_DATA);
        setPage(0);
        onClose();
    }

    return (
        <>
        <Dialog 
            open={open} 
            onClose={() => {setConfirmBoxOpen(true)}} 
            fullWidth 
            maxWidth="sm"
        >
            <DialogTitle>
                <Typography variant='h4'>
                    Add a new widget
                </Typography>
            </DialogTitle>
            
            {/* First Page: Select Tags */}
            <DialogContent dividers hidden={page != 0}>

                <Typography variant='h6'>
                    <b>Step 1)</b> Select tag(s).
                </Typography>
                <Box 
                    sx={{ borderRadius: 1 }}
                >
                    
                    <br/>
                    {tags.map((tag) => (
                        
                        <Chip
                            label={tag}
                            size='small'
                            onClick={() => handleTagChange(tag)}
                            color={formData.selectedTags.includes(tag) ? 'primary' : 'default'}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                    
                </Box>
            </DialogContent>
            
            {/* Second Page: Select Values */}
            <DialogContent dividers hidden={page != 1}>
                <Typography variant='h6'>
                    <b>Step 2)</b> Select value(s).
                </Typography>
                <br/>
                <Box>
                    {Object.keys(filteredValueNameMap)
                           .map(name => (
                        <Chip
                            label={name}
                            
                            onClick={() => handleValueChange(name)}
                            color={(formData.selectedValues.includes(name)) ? 'primary' : 'default'}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
            </DialogContent>

            {/* Third Page: Select Things */}
            <DialogContent dividers hidden={page != 2}>
                <Typography variant='h6'>
                    <b>Step 3)</b> Select things(s).
                </Typography>
                <br/>
                <Box>
                    {filteredThingsMetadata.map(thingData => (
                        <Chip
                            label={thingData.thing_name}
                            onClick={() => handleThingChange(thingData.thing_name)}
                            color={(formData.selectedThings.includes(thingData.thing_name)) ? 'primary' : 'default'}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
            </DialogContent>

            {/* Fourth  Page: Confirmation */}
            <DialogContent dividers hidden={page != 3}>
                <Typography variant='h6'>
                    <b>Configure plots</b>
                </Typography>
                <br/>
                {formData.selectedValues.map(value_name => {
                    const item = valueMetadata.find(vd => vd.value_name == value_name);

                    console.log(item);
                    
                    return (
                        <Card sx={{
                            padding: 0.5
                            
                        }}>
                            <b>Name:</b> {item.value_name}
                            <br/>
                            <b>Type:</b> {item.value_type}
                            <br/>
                            <b>Min/max:</b> {item.value_min}-{item.value_max} 
                        </Card>
                        
                    )
                })}
            </DialogContent>


            {/* Fifth  Page: Confirmation */}
            <DialogContent dividers hidden={page != 4}>
                <Typography variant='h6'>
                    <b>Summary.</b>
                </Typography>
                <br/>
                <Box>
                    Tags. <br/>
                    {formData.selectedTags}
                </Box>
                <Divider/>

                <Box>
                    Values. <br/>
                    {formData.selectedValues}
                </Box>
                <Divider/>

                <Box>
                    Things. <br/>
                    {formData.selectedThings}
                </Box>
                <Divider/>
            </DialogContent>
            
            {/* Action Buttons */}
            <DialogActions>
                {(page != 0) ? // only render on pages beyond 0
                <Button onClick={() => setPage(page - 1)}>
                    Prev
                </Button> 
                : <></>} 

                <Button 
                    color="primary" 
                    onClick={() => setConfirmBoxOpen(true)}
                    >
                    Cancel
                </Button>
                <Button 
                    color="primary"
                    onClick={() => setPage(page + 1)}
                    >
                    Next
                </Button>
            </DialogActions>

        </Dialog>
        
        
        {/* Close Confirmation Box */}
        <Dialog 
            open={confirmBoxOpen} 
            onClose={() => setConfirmBoxOpen(false)} 
        >
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>
                <Typography variant='body1'>
                    Your progress will be lost.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseConfirm} color='error'>Yes</Button>
                <Button onClick={() => setConfirmBoxOpen(false)}>No</Button>
            </DialogActions>
        </Dialog>

        
        {/* Loading Animation */}
        <Backdrop 
            open={loading}
            sx={{ color: '#fff', zIndex: 9999}}
        >
            <CircularProgress color="inherit" />
        </Backdrop>

        </>
    );
};

export default AddPopup;
