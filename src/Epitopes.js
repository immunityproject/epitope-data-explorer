import React from 'react';
import axios from 'axios';
import { Link, Switch, Route } from 'react-router-dom'


// TODO: Load a configuration file with this information to
//       populate the epitope API.
const EpitopeAPI = {
  proteins: [
    { number: 1, name: "GP120", data: null },
    { number: 2, name: "INT", data: null },
    { number: 3, name: "NEF", data: null },
    { number: 4, name: "P17", data: null },
    { number: 5, name: "P24", data: null },
    { number: 6, name: "PRO", data: null },
    { number: 7, name: "REV", data: null },
    { number: 8, name: "RT", data: null },
    { number: 9, name: "TAT", data: null }
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
class Epitope extends React.Component{
  constructor(props) {
    super(props);
    const epitope = EpitopeAPI.get(parseInt(props.match.params.number, 10));
    if (epitope) {
      this.state = {
        number: epitope.number,
        name: epitope.name,
        data: null
      };
    } else {
      this.state = {
        number: null,
        name: null,
        data: null
      };
    }

    // Now load protein data using axios promise interface
    // TODO: Make the base path to the data configurable
    axios.get('/' + this.state.name).then(res => {
      this.setState({
        number: this.state.number,
        name: this.state.name,
        data: res.data
      });
    }).catch(function (error) {
      console.log(error);
      this.setState({
        number: this.state.number,
        name: this.state.name,
        data: error
      });
    });
  }

  render() {
    if (this.state.number == null) {
      return (<div>Protein was not found</div>);
    }
    if (this.state.data == null) {
      return (<div>Protein data loading...</div>);
    }

    let datastr = JSON.stringify(this.state.data);
    return (
        <div>
          <h1>{this.state.name} (#{this.state.number})</h1>
          <Link to='/epitopes'>Go Back</Link>
          <p>{datastr}</p>
        </div>
    );
  }
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
