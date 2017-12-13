import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import { unregister } from './registerServiceWorker';

import './App.css';

// Pages
import App from './App';

ReactDOM.render((
    <App />
), document.getElementById('root'))

unregister();
