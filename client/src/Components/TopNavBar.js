import React, { useContext } from 'react';

import {
    AppBar,
    Toolbar,
    Box,
    Button,
    Switch,
    Tooltip
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import { ThemeContext } from '../ThemeContext';

const logoUrl = process.env.PUBLIC_URL + '/logo.png';

const TopNavBar = () => {

    const { toggleTheme } = useContext(ThemeContext);
    const theme = useTheme();

    return (
        <AppBar position='relative'> 
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: theme.palette.base.main}}>
                <Box
                    component="img"
                    src={logoUrl}
                    alt="MySMax Logo"
                    draggable="false"
                    onDragStart={e => {e.preventDefault()}}
                    sx={{
                        WebkitUserDrag: 'none',
                        KhtmlUserDrag: 'none',
                        MozUserDrag: 'none',
                        OUserDrag: 'none',
                        userDrag: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none',
                    }}
                />
                <div style={{display: 'flex', flexDirection: 'row', gap: '10px'}}>
                    <Tooltip title={'Dark Mode'}>
                        <Switch
                            onChange={toggleTheme}
                            inputProps={{ 'aria-label': 'controlled' }}
                        />
                    </Tooltip>
                    <Button color="primary" variant="outlined" disabled={true}>Save</Button>
                    <Button color="secondary" variant="contained" disabled={true}>Log In</Button>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavBar;
