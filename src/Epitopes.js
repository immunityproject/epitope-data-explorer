import React from 'react';
import axios from 'axios';
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
    const isProtein = p => p.number === id;
    return this.proteins.find(isProtein);
  }
}

class ProteinList extends React.Component {
  render() {
    return (
        <select value={this.props.value} onChange={this.props.onChange}>
        <option value='0'>Select a Protein</option>
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

class EpitopeList extends React.Component {
  render() {
    return (
        <select value={this.props.value} onChange={this.props.onChange}>
        {
          this.props.epitopes.map((e, i) => (
              <option key={i} value={e}>
                {e}
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
          this.props.sites.map((s, i) => (
              <option key={i} value={s}>
                {s}
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
    if (graph == null) {
      alert('Could not generate 3d graph!');
    }
  }

  componentDidUpdate() {
    const graph = new vis.Graph3d(this.refs.threedgraph, this.props.data,
                                  this.props.options);
    if (graph == null) {
      alert('Could not generate 3d graph!');
    }
  }

  render() {
    return (<div ref="threedgraph" style={{"border": "1px solid black"}}></div>);
  }
}

class Visualization extends React.Component {

  two_d_visual(datasel) {
    const site_data = this.props.site_data;
    const sites = this.props.sites;
    let seriesdata = [];
    sites.forEach(function (site) {
      for (var wild_type in site_data[site]) {
        if (wild_type === 'entropy') {
          continue;
        }
        let energyvec = [wild_type + '(' + site + ')'];
        for (var mut_aa in site_data[site][wild_type]) {
          const d = site_data[site][wild_type][mut_aa];
          energyvec.push(parseFloat(d[datasel]));
        }
        seriesdata.push(energyvec)
      }
    });
    const mutations = this.props.mutations;
    const chartdata = [['WT'].concat(mutations)].concat(seriesdata);

    return (
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
    );
  }

  three_d_visual(datasel) {
    const sites = this.props.sites;
    const site_data = this.props.site_data;
    const mut_aas = this.props.mutations;
    const wts = this.props.wts;

    let data3d = new vis.DataSet();
    sites.forEach(function (site) {
      for (var wild_type in site_data[site]) {
        if (wild_type === 'entropy') {
          continue;
        }
        for (var mut_aa in site_data[site][wild_type]) {
          const d = site_data[site][wild_type][mut_aa];
          const value = parseFloat(d[datasel]);
          const data = {
            x: mut_aas.indexOf(mut_aa),
            y: wts.indexOf(wild_type),
            z: value,
            style: value
          };
          data3d.add(data);
        }
      }
    });

    const options3d = {
      width:  '100%',
      height: '600px',
      style: 'surface',
      showPerspective: true,
      showGrid: true,
      showShadow: false,
      keepAspectRatio: true,
      verticalRatio: 0.5,
      xStep: 1,
      yStep: 1,
      xValueLabel: function(x) { return mut_aas[x]; },
      yValueLabel: function(y) { return wts[y] + '(' + sites[y] + ')'; }
    };

    return (
        <ThreeDGraph options={options3d} data={data3d} />
    );
  }


  render() {
    if (this.props.vistype === '2D') {
      return this.two_d_visual(this.props.datasel);
    } else {
      return this.three_d_visual(this.props.datasel);
    }
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
      epitopes: [],
      selected_epitope: 0,
      sites: [],
      vistypes: ['2D', '3D'],
      vistype: '3D',
      datasels: ['energy_delta', 'displacement'],
      datasel: 'energy_delta',
      startsite: 0,
      endsite: 0
    };

    // Now load protein data using axios promise interface
    // TODO: Make the base path to the data configurable
    axios.get('/EpitopeData.json').then(res => {
      this.setState({
        data: res.data
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  getEpitopes = (pdata) => {
    let epitopes = [];
    for (var e in pdata) {
      for (var site in pdata[e]) {
        if (pdata[e][site]['entropy'] === 'None') {
          break;
        } else {
          epitopes.push(e);
          break;
        }
      }
    }
    return epitopes;
  }

  changeProtein = (event) => {
    if (event.target.value === '0') {
      return
    }
    // The target Protein name/id
    const protein = EpitopeAPI.get(parseInt(event.target.value, 10));
    // Shortcut to the protein data we care about
    const pdata = this.state.data[protein.name]
    // List of all valid epitopes in data
    const epitopes = this.getEpitopes(pdata);
    // List of sites inside first epitope
    const sites = Object.keys(pdata[epitopes[0]]).sort((a, b) => a - b)

    this.setState({
      number: protein.number,
      name: protein.name,
      epitopes: epitopes,
      selected_epitope: epitopes[0],
      sites: sites,
      data: this.state.data,
      startsite: sites[0],
      endsite: sites[sites.length-1]
    });
  }

  changeEpitope = (event) => {
    const protein = this.state.name;
    const epitope = event.target.value;
    const edata = this.state.data[protein][epitope];
    const sites = Object.keys(edata).sort((a, b) => a - b);
    this.setState({
      selected_epitope: epitope,
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

  changeDataSel = (event) => {
    const dsel = event.target.value;
    this.setState({
      datasel: dsel
    })
  }


  getWildTypes = (sitedata, start, end) => {
    let wts = []
    const b = parseInt(start, 10);
    const e = parseInt(end, 10);
    for (var site in sitedata) {
      const s = parseInt(site, 10);
      if (s >= b && site <= e) {
        wts = wts.concat(Object.keys(
          sitedata[site]).filter(x => x !== 'entropy'));
      }
    }
    return wts;
  }


  render = () => {
    if (this.state.number === 0) {
      return (
        <div>
          <ProteinList value={this.state.number}
            onChange={this.changeProtein} />
        </div>
      )
    }
    const protein = this.state.name;
    const epitope = this.state.selected_epitope;
    const start = this.state.startsite;
    const end = this.state.endsite;
    const site_data = this.state.data[protein][epitope];
    const sites = this.state.sites.filter(
      x => parseInt(x, 10) >= parseInt(start, 10)
        && parseInt(x, 10) <= parseInt(end, 10));
    const wts = this.getWildTypes(site_data, start, end);
    const mutations = Object.keys(site_data[start][wts[0]]);

    return (
        <div style={{fontFamily:'sans-serif',fontSize:'0.8em'}}>
        Protein: <ProteinList value={this.state.number}
                     onChange={this.changeProtein} />
        Epitope: <EpitopeList value={this.state.selected_epitope}
                              epitopes={this.state.epitopes}
                              onChange={this.changeEpitope} />
        Start Site: <SiteList value={this.state.startsite}
                        onChange={this.changeStartSite}
                        sites={this.state.sites}/>
        End Site: <SiteList value={this.state.endsite}
                      onChange={this.changeEndSite}
                      sites={this.state.sites}/>
        Visualization Type: <SiteList value={this.state.vistype}
                                onChange={this.changeVisType}
                                sites={this.state.vistypes} />
        Data: <SiteList value={this.state.datasel} onChange={this.changeDataSel}
                        sites={this.state.datasels} />
        <Visualization site_data={site_data} sites={sites} mutations={mutations}
                       wts={wts} vistype={this.state.vistype}
                       datasel={this.state.datasel} />
        </div>
    )
  }
}


export default EpitopeHistogram
