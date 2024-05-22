import React from 'react';
import { useTheme } from '@mui/material/styles'

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

const AddButton = ({ onClick, style }) => {

    const theme = useTheme();

    return (
        <Fab color={theme.palette.base.main} aria-label="add" style={style} onClick={onClick}>
            <AddIcon/>
        </Fab>
    )
}


export default AddButton;