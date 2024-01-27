import { Typography, ThemeProvider, CssBaseline, createTheme, IconButton, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { ErrorBoundary, Holidays } from './components';
import { useEffect, useState } from 'react';
import './styles/app.css';

const themes = {
   light: createTheme({ palette: { mode: 'light' } }),
   dark: createTheme({ palette: { mode: 'dark' } })
};

function App() {
   const [theme, _setTheme] = useState(1);

   // Override our DispatcherAction handler to also add the class to the body
   // for theming of other things in css such as the scrollbar.
   function setTheme(theme: number) {
      _setTheme(theme);

      document.body.classList.remove(!theme ? 'theme-dark' : 'theme-light');
      document.body.classList.add(theme ? 'theme-dark' : 'theme-light');
   }

   // Attempt to get the theme from local storage for persistent theming.
   useEffect(() => {
      try {
         const value = localStorage.getItem('theme') ?? 1;
         setTheme(Number(value));
      } catch {
         // Do nothing if the browser doesn't support local storage
      }
   }, []);

   // Wrap the app in an error boundary incase it crashes.
   return (
      <ErrorBoundary>
         <ThemeProvider theme={themes[theme ? 'dark' : 'light']}>
            <CssBaseline />
            <div className='app-mount'>
               <div className='header'>
                  <Typography className='holidays-title' aria-label='Public Holidays' fontSize={32}>
                     Public Holidays - 2022
                  </Typography>
                  <Tooltip title={theme ? 'Switch to light mode' : 'Switch to dark mode'}>
                     <IconButton
                        className='theme-changer'
                        onClick={() => handleThemeChange(setTheme, theme)}
                     >
                        {theme ? <LightMode /> : <DarkMode />}
                     </IconButton>
                  </Tooltip>
               </div>
               <div className='holidays-container'>
                  <Holidays />
               </div>
            </div>
         </ThemeProvider>
      </ErrorBoundary>
   );
}

function handleThemeChange(setTheme: (theme: number) => any, theme: number) {
   // Revert the theme value to the opposite of what is currently applied
   const value = Number(!theme);
   setTheme(value);

   // Attempt to save to local storage if the browser supports it
   try {
      localStorage.setItem('theme', String(value));
   } catch {
      // Do nothing if the browser doesn't support local storage
   }
}

export default App;
