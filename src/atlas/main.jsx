import React from 'react';
import { createRoot } from 'react-dom/client';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../design/styles.css';
import './atlas.css';
import { Atlas } from './Atlas.jsx';

createRoot(document.getElementById('root')).render(<Atlas />);
