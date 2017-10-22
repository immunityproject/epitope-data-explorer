import React from 'react';
import { Link, Switch, Route } from 'react-router-dom'


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

// The Listing component matches one of two different routes
// depending on the full pathname
const Epitopes = () => (
  <Switch>
    <Route exact path='/epitopes' component={EpitopeListing}/>
    <Route path='/epitopes/:number' component={Epitope}/>
  </Switch>
)

export default Epitopes
