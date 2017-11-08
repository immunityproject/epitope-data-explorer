import React from 'react';
import axios from 'axios';
import { Switch, Route } from 'react-router-dom';
import { Chart } from 'react-google-charts';

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

class EpitopeList extends React.Component {
  render() {
    return (
        <select value={this.props.value} onChange={this.props.onChange}>
        <option value='0'>Select an Epitope</option>
        {
          EpitopeAPI.all().map(e => (
              <option key={e.number} value={e.number}>
                {e.name}
              </option>
          ))
        }
        </select>
    )
  }
}

class MutationList extends React.Component {
  render() {
    return (
        <select value={this.props.value} onChange={this.props.onChange}>
        {
          this.props.mutations.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
          ))
        }
        </select>
    )
  }
}

class SiteList extends React.Component {
  render() {
    return (
        <select value={this.props.value} onChange={this.props.onChange}>
        {
          this.props.sites.map((m, i) => (
              <option key={i} value={m}>
                {m}
              </option>
          ))
        }
        </select>
    )
  }
}

// EpitopeHistogram generates a link for each epitope
class EpitopeHistogram extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      number: 0,
      name: '',
      data: null,
      mutations: [],
      selected_mutation: 0,
      sites: [],
      startsite: 0,
      endsite: 0
    };

    // Now load protein data using axios promise interface
    // TODO: Make the base path to the data configurable
    axios.get('/P17').then(res => {
      this.setState({
        data: res.data
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  changeEpitope = (event) => {
    if (event.target.value === '0') {
      return
    }
    // The target Epitope name/id
    const epitope = EpitopeAPI.get(parseInt(event.target.value, 10));
    // Shortcut to the epitope data we care about
    const edata = this.state.data[epitope.name]
    // List of valid mutations
    const mutations = (Object.keys(this.state.data[epitope.name]).filter(
      mutation =>
        edata[mutation]['energies'][epitope.name] != null)).sort();
    // List of sites inside these valid mutations
    const sites = (Object.keys(
      edata[mutations[0]]['energies'][epitope.name])).sort((a, b) => a - b)

    this.setState({
      number: epitope.number,
      name: epitope.name,
      mutations: mutations,
      selected_mutation: mutations[0],
      sites: sites,
      data: this.state.data,
      startsite: sites[0],
      endsite: sites[0]
    });
  }

  changeMutation = (event) => {
    const epitope = this.state.name;
    const mutation = event.target.value;
    const mdata = this.state.data[epitope][mutation];
    const sites = (Object.keys(
      mdata['energies'][epitope])).sort((a, b) => a - b);
    this.setState({
      selected_mutation: mutation,
      sites: sites,
      startsite: sites[0],
      endsite: sites[0]
    })
  }

  changeStartSite = (event) => {
    const start = event.target.value;
    const end = Math.max(start, this.state.endsite);
    this.setState({
      startsite: start,
      endsite: end
    })
  }

  changeEndSite = (event) => {
    const end = event.target.value;
    const start = Math.min(end, this.state.startsite);
    this.setState({
      startsite: start,
      endsite: end
    })
  }

  render = () => {
    if (this.state.number === 0) {
      return (
        <div>
        <EpitopeList value={this.state.number} onChange={this.changeEpitope} />
        </div>
      )
    }
    const epitope = this.state.name;
    const mutation = this.state.selected_mutation;
    const start = this.state.startsite;
    const end = this.state.endsite;
    const site_data = this.state.data[epitope][mutation]['energies'][epitope];
    const sites = Object.keys(site_data).filter(
        x => x >= start && x <= end);
    let seriesdata = [];
    sites.forEach(function (site) {
      let energyvec = [site_data[site][0].wt]
      site_data[site].forEach(function(x) {
        energyvec.push(parseFloat(x.energyDelta))
      })
      seriesdata.push(energyvec)
    });
    const mutations = Object.values(site_data[sites[0]]).map(s => s.mutation)
    const chartdata = [['WT'].concat(mutations)].concat(seriesdata);

    return (
        <div style={{fontFamily:'sans-serif',fontSize:'0.8em'}}>
        <EpitopeList value={this.state.number} onChange={this.changeEpitope} />
        <MutationList value={this.state.selected_mutation}
          mutations={this.state.mutations} onChange={this.changeMutation} />
        <SiteList value={this.state.startsite} onChange={this.changeStartSite}
          sites={this.state.sites}/>
        <SiteList value={this.state.endsite} onChange={this.changeEndSite}
          sites={this.state.sites}/>
        <br /><br />
        <Chart
          chartType="ComboChart"
          data={chartdata}
          options={{"hAxis":{"title": "WT"}, "seriesType": "bars",
                    "vAxis":{"title": "energy"}}}
          graph_id="ColumnChart"
          width="100%"
          height="600px"
          legend_toggle
        />
        </div>
    )
  }
}

        // <Chart
        //   chartType="ColumnChart"
        //   data={chartdata}
        //   options={{}}
        //   graph_id="ColumnChart"
        //   width="100%"
        //   height="400px"
        //   legend_toggle
        // />


// The Listing component matches one of two different routes
// depending on the full pathname
const Epitopes = () => (
  <Switch>
    <Route exact path='/epitopes' component={EpitopeHistogram}/>
  </Switch>
)

export default Epitopes
