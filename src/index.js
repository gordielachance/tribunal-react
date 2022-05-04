import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router
} from "react-router-dom";
import 'semantic-ui-css/semantic.min.css';
import reportWebVitals from './reportWebVitals';
import { AppProvider } from "./AppContext";

import './index.scss';
import Layout from './Layout';


ReactDOM.render(
  <React.StrictMode>
    <AppProvider>
      <Router>
        <Layout/>
      </Router>
    </AppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
