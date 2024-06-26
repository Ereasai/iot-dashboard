import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#007bff',
            light: '#a3cfff',
        },
        secondary: {
            main: '#687cf4',
        },
        base: {
            main: 'white',
        },
        background: {
            default: '#2596be'
        },
        gridLineColor: { main: undefined },
    },
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#ec7464',
        },
        base: {
            main: '#242424',
        },
        gridLineColor: { main: 'rgb(60,60,60)' },
    },
});

export { lightTheme, darkTheme };