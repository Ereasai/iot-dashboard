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

const BACKEND_URL = process.env.REACT_APP_PUBLIC_IP;

const Page3 = ( {selectedTags, selectedValueName, setSelectedTags} ) => {

    const [thingNames, setThingNames] = useState([]);
    const [tags, setTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [loadingThings, setLoadingThings] = useState(false);
    
    useEffect(() => {
        // load things, based on tags and valueName
        const loadData = async () => {
            setLoadingThings(true);
            const args = `valueName=${selectedValueName}&tagNames=${selectedTags.join(',')}`;
            const response = await fetch(`http://${BACKEND_URL}/get-things-by-value-tags?${args}`);
            const data = await response.json();
            const things = data.map(({ thing_name }) => thing_name);
            setThingNames(things.sort());
            setLoadingThings(false);
        };

        loadData();
    }, [selectedTags]);

    useEffect (() => {
        const loadData = async () => {
            setLoadingTags(true);
            const response = await fetch(`http://${BACKEND_URL}/get-tags-by-things?things=${thingNames.join('\',\'')}`);
            const data = await response.json();
            setTags(data);
            setLoadingTags(false);
        };

        if (thingNames.length > 0)
        loadData();
    }, [thingNames]);

    const addThingNameToSelectedTags = (thingName) => {
        if (!selectedTags.includes(thingName)) {
            setSelectedTags([...selectedTags, thingName]);
        }
    }

    const toggleTag = (tagName) => {
        if (!selectedTags.includes(tagName)) {
            setSelectedTags([...selectedTags, tagName]);
        } else {
            setSelectedTags(selectedTags.filter(tag => tag !== tagName))
        }
        
    }

    return (
        <DialogContent>
            <Typography variant='h5'>Adjust your tags list.</Typography>
            <br />
            <Box>
                {(loadingTags || loadingThings) && <CircularProgress />}
                {!loadingTags && !loadingThings && tags.filter((tag) => !tag.is_thing || (tag.is_thing && selectedTags.includes(tag.tag_name)))
                                     .map((tag) => (
                    <Chip
                        key={tag.tag_name}
                        label={tag.tag_name}
                        onClick={() => toggleTag(tag.tag_name)}
                        color={(tag.is_thing) ? 'success' : 
                               (selectedTags.includes(tag.tag_name)) ? 'primary' : 'default'
                        }
                        disabled={(tag.tag_name === selectedTags[0])}
                        sx={{ margin: 0.5 }}
                    />
                ))}
            </Box>
            <br />
            <Divider />
            <Box>
                <Typography>Final Thing list:</Typography>
                {loadingThings && <CircularProgress />}
                {!loadingThings && thingNames.map(thingName => (
                    <Chip
                        label={thingName}
                        onClick={() => addThingNameToSelectedTags(thingName)}
                        color={'default'}
                        sx={{ margin: 0.5 }}
                    />
                ))}
            </Box>
        </DialogContent>
    );
};

export default Page3;