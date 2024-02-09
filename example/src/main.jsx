import React from 'react';
import ReactDOM from 'react-dom/client';
import { Prvoider } from 'react-global-hook-store';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Prvoider>
    <App />
  </Prvoider>
);
