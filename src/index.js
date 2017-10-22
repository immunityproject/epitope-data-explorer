import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { BrowserRouter, Link, Switch, Route } from 'react-router-dom'
import logo from './logo.svg';
import './App.css';

// TODO: Load a configuration file with this information to
//       populate the epitope API.
const EpitopeAPI = {
  proteins: [
    { number: 1, name: "P17" },
    { number: 2, name: "P24" }
  ],
  all: function() { return this.proteins},
  get: function(id) {
    const isEpitope = e => e.number === id;
    return this.proteins.find(isEpitope);
  }
}

// EpitopeListing generates a link for each epitope
const EpitopeListing = () => (
  <div>
    <ul>
      {
        EpitopeAPI.all().map(e => (
          <li key={e.number}>
            <Link to={`/epitopes/${e.number}`}>{e.name}</Link>
          </li>
        ))
      }
    </ul>
  </div>
)

// The Epitope looks up the protein using the number parsed from
// the URL's pathname. If no protein is found with the given
// number, then a "protein not found" message is displayed.
const Epitope = (props) => {
  const Epitope = EpitopeAPI.get(
    parseInt(props.match.params.number, 10)
  )
  if (!Epitope) {
    return <div>Protein was not found</div>
  }
  return (
    <div>
      <h1>{Epitope.name} (#{Epitope.number})</h1>
      <Link to='/epitopes'>Back</Link>
    </div>
  )
}

// START PAGES

// The Listing component matches one of two different routes
// depending on the full pathname
const Listing = () => (
  <Switch>
    <Route exact path='/epitopes' component={EpitopeListing}/>
    <Route path='/epitopes/:number' component={Epitope}/>
  </Switch>
)

const About = () => (
  <div>
    <p>This page allows you to explore the HIV-SE data.</p>
  </div>
)

const Home = () => (
  <div>
    <h1>Welcome to the Epitope Data Explorer!</h1>
  </div>
)

// END PAGES

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route path='/epitopes' component={Listing}/>
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
        <li><Link to='/about'>Listing</Link></li>
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

// This demo uses a HashRouter instead of BrowserRouter
// because there is no server to match URLs
ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'))


// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
