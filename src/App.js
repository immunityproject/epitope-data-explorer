import React, { Component } from 'react';
import { Link, Switch, Route } from 'react-router-dom'

import Home from './Home';
import About from './About';
import Epitopes from './Epitopes';

import './App.css';
import logo from './logo.svg';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route path='/epitopes' component={Epitopes}/>
      <Route path='/about' component={About}/>
    </Switch>
  </main>
)

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header>
    <nav>
      <ul>
        <li><Link to='/'>Home</Link></li>
        <li><Link to='/epitopes'>Epitopes</Link></li>
        <li><Link to='/about'>About</Link></li>
      </ul>
    </nav>
  </header>
)

const App = () => (
  <div>
    <Header />
    <Main />
  </div>
)

export default App;
