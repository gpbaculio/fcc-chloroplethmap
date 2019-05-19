import React, { Component } from 'react';
import axios from 'axios';
import * as topojson from 'topojson';
import * as d3 from 'd3';

import { educUrl, countyUrl } from './constants';
import './App.css';

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
    g.selectAll('rect')
      .data(
        color.range().map(function(d) {
          let data = color.invertExtent(d);
          if (data[0] == null) data[0] = x.domain()[0];
          if (data[1] == null) data[1] = x.domain()[1];
          return data;
        })
      )
      .enter()
      .append('rect')
      .attr('height', 8)
      .attr('x', d => x(Number(d[0])))
      .attr('width', d => x(Number(d[1])) - x(Number(d[0])))
      .attr('fill', d => color(Number(d[0])));
    g.append('text')
      .attr('class', 'caption')
      .attr('x', x.range()[0])
      .attr('y', -6)
      .attr('fill', '#000')
      .attr('text-anchor', 'start')
      .attr('font-weight', 'bold');
    g.call(
      d3
        .axisBottom(x)
        .tickSize(13)
        .tickFormat(x => Math.round(Number(x)) + '%')
        .tickValues(color.domain())
    )
      .select('.domain') // remove last empty tick
      .remove();
  };
  render() {
    return <div className='svg-container' />;
  }
}

export default App;
