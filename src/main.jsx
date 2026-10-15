import React from 'react';
import { createRoot } from 'react-dom/client';
import 'maplibre-gl/dist/maplibre-gl.css';
import './design/styles.css';
import './app.css';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);

// Offline copy (see public/sw.js). Only in the built app, not while developing.
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('sw.js');
