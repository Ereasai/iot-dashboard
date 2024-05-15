// ThemeContext.js
import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    const muiTheme = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <MUIThemeProvider theme={muiTheme}>
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

export { ThemeProvider, ThemeContext };
