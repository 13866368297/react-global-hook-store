import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-global-hook-store';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider>
    <App />
  </Provider>
);
