import React, { Component } from 'react';
import axios from 'axios';
import * as topojson from 'topojson';
import * as d3 from 'd3';
import { educUrl, countyUrl } from './constants';

interface topoRes {
  features: any;
}
class App extends Component {
  state = { usFeatures: [], usEducation: [] };
  componentDidMount = async () => {
    try {
      const { usFeatures, usEducation } = await axios
        .get(educUrl)
        .then(async ({ data: usEducation }) => {
          const { features: usFeatures } = await axios
            .get(countyUrl)
            .then(async ({ data }) =>
              topojson.feature(data, data.objects.counties)
            );
          return { usFeatures, usEducation };
        });
      this.setState({ usFeatures, usEducation }, () => this.createChart());
    } catch (error) {
      this.setState({ error });
    }
  };
  createChart = () => {
    const unemployment = d3.map();
    const path = d3.geoPath();

    const x = d3
      .scaleLinear()
      .domain([2.6, 75.1])
      .rangeRound([600, 860]);

    const color = d3
      .scaleThreshold<number, string>()
      .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
      .range(d3.schemeGreens[9]);

    const svg = d3
      .select('.svg-container')
      .append('svg')
      .attr('height', 600)
      .attr('width', 960);

    const g = svg
      .append('g')
      .attr('class', 'key')
      .attr('id', 'legend')
      .attr('transform', 'translate(0,40)');
  };
  render() {
    return <div className='svg-container' />;
  }
}

export default App;
