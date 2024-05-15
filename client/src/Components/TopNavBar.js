import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import { ThemeContext } from '../ThemeContext';
import { useTheme } from '@mui/material/styles';

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
                    <Switch
                        label='Toggle Theme'
                        onChange={toggleTheme}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                    <Button color="primary" variant="outlined">Save</Button>
                    <Button color="secondary" variant="contained">Log In</Button>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default TopNavBar;
