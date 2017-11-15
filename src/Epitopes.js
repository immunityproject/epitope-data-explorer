import React from 'react';
import axios from 'axios';
import { Switch, Route } from 'react-router-dom';
import { Chart } from 'react-google-charts';
import vis from 'vis';


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

class ThreeDGraph extends React.Component {

  componentDidMount() {
    const graph = new vis.Graph3d(this.refs.threedgraph, this.props.data,
                                  this.props.options);
  }

  componentDidUpdate() {
    const graph = new vis.Graph3d(this.refs.threedgraph, this.props.data,
                                  this.props.options);
  }

  render() {
    return (<div ref="threedgraph"></div>);
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
      vistypes: ['2D', '3D'],
      vistype: '2D',
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
      endsite: sites[sites.length-1]
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
      endsite: sites[sites.length-1]
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

  changeVisType = (event) => {
    const vtype = event.target.value;
    this.setState({
      vistype: vtype
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
    const wts = Object.values(site_data).map(s => s[0].wt)
    const chartdata = [['WT'].concat(mutations)].concat(seriesdata);

    let data3d = new vis.DataSet();
    sites.forEach(function (site) {
      site_data[site].forEach(function(x) {
        const value = parseFloat(x.energyDelta);
        data3d.add({
          x: mutations.indexOf(x.mutation),
          y: wts.indexOf(x.wt),
          z: value,
          style: value
        });
      })
    });

    let data3draw = []
    sites.forEach(function (site) {
      site_data[site].forEach(function(x) {
        const value = parseFloat(x.energyDelta);
        data3draw.push({
          x: mutations.indexOf(x.mutation),
          y: wts.indexOf(x.wt),
          z: value,
          style: value
        });
      })
    });

    const options3d = {
      width:  '600px',
      height: '600px',
      style: 'surface',
      showPerspective: true,
      showGrid: true,
      showShadow: false,
      keepAspectRatio: true,
      verticalRatio: 0.5,
      xStep: 1,
      yStep: 1,
      xValueLabel: function(x) { return mutations[x]; },
      yValueLabel: function(y) { return wts[y]; }
    };

    return (
        <div style={{fontFamily:'sans-serif',fontSize:'0.8em'}}>
        Epitope: <EpitopeList value={this.state.number}
                     onChange={this.changeEpitope} />
        Mutation Protein: <MutationList value={this.state.selected_mutation}
                              mutations={this.state.mutations}
                              onChange={this.changeMutation} />
        Start Site: <SiteList value={this.state.startsite}
                        onChange={this.changeStartSite}
                        sites={this.state.sites}/>
        End Site: <SiteList value={this.state.endsite}
                      onChange={this.changeEndSite}
                      sites={this.state.sites}/>
        Visualization Type: <SiteList value={this.state.vistype}
                                onChange={this.changeVisType}
                                sites={this.state.vistypes} />
        <Chart
          chartType="ComboChart"
          data={chartdata}
          options={{"hAxis":{"title": "Wild Type"}, "seriesType": "bars",
                    "vAxis":{"title": "Energy Delta"},
                    "chartArea":{
                      "left": "75",
                      "top": "10",
                      "right": "125",
                      "width": "100%",
                      "height": "525",
                    }}}
          graph_id="ColumnChart"
          width="100%"
          height="600px"
        />
        <ThreeDGraph options={options3d} data={data3d} />
        </div>
    )
  }
}

// The Listing component matches one of two different routes
// depending on the full pathname
const Epitopes = () => (
  <Switch>
    <Route exact path='/epitopes' component={EpitopeHistogram}/>
  </Switch>
)

export default Epitopes
