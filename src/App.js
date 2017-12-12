import React from 'react';

import EpitopeHistogram from './Epitopes';

import './App.css';

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header id='header'>
    <div className='inner clearfix'>
      <h1>Epitope Data Explorer</h1>
    </div>
  </header>
)

const App = () => (
  <div>
    <Header />
    <EpitopeHistogram />
  </div>
)

export default App;
