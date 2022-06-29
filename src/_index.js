import React from 'react';
import ReactDOM from 'react-dom/client';
import iconLibrary from './lib/utils/iconLIbrary'
import { globalStyle, theme } from './lib/utils/theme.config'
import { Global, ThemeProvider } from '@emotion/react'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import './index.sass';
import Wrapper from './App';
import reportWebVitals from './reportWebVitals';
config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

const root = ReactDOM.createRoot(document.getElementById('root'));
iconLibrary()
root.render(
     <ThemeProvider theme={theme}>
     <Global styles={globalStyle}/>
        <Wrapper />
     </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
