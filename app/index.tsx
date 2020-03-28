import React from 'react';
import { render } from 'react-dom';
import './app.global.css';
import Home from './components/Home';

document.addEventListener('DOMContentLoaded', () =>
  render(<Home />, document.getElementById('root'))
);
