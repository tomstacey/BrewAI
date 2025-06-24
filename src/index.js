// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot from 'react-dom/client' for React 18+
import './index.css'; // You might need to create this file, or remove if not using
import App from './App'; // This imports your main App component

// Use createRoot for React 18+ for better performance and new features
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you have a serviceWorker or reportWebVitals setup from CRA, you can add them here:
// import reportWebVitals from './reportWebVitals';
// reportWebVitals();