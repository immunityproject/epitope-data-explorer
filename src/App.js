import React from 'react';
import { Link, Switch, Route } from 'react-router-dom'

import Home from './Home';
import Downloads from './Downloads';
import Epitopes from './Epitopes';

import './App.css';

const Main = () => (
  <section id='content'>
    <div className='inner content'>
      <main>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path='/epitopes' component={Epitopes}/>
          <Route path='/downloads' component={Downloads}/>
        </Switch>
      </main>
    </div>
  </section>
)

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header id='header'>
    <div className='inner clearfix'>
      <h1>Epitope Data Explorer</h1>
      <nav>
        <ul className='nav'>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/epitopes'>Epitopes</Link></li>
          <li><Link to='/downloads'>Downloads</Link></li>
        </ul>
      </nav>
    </div>
  </header>
)

const App = () => (
  <div>
    <Header />
    <Main />
  </div>
)

export default App;
