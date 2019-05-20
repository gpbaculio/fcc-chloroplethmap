import React, { Component } from 'react';
import axios from 'axios';
import * as topojson from 'topojson';
import * as d3 from 'd3';

import { educUrl, countyUrl } from './constants';
import './App.css';

interface usFeature {
  geometry: { coordinates: [number[]]; type: string };
  id: number;
  properties: {};
  type: string;
}
// interface objectType {
//   type: string;
//   geometries: { type: string; arcs: [number[]] };
// }
// interface usEducation {
//   arcs: [[number[]]];
//   bbox: number[];
//   objects: {
//     counties: objectType;
//     states: objectType;
//     nation: objectType;
//   };
// }
interface usEducationType {
  area_name: string;
  bachelorsOrHigher: number;
  fips: number;
  state: string;
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

    const { usFeatures, usEducation } = this.state;

    const tooltip = d3
      .select('.svg-container')
      .append('div')
      .attr('class', 'tooltip')
      .attr('id', 'tooltip')
      .style('opacity', 0);
    console.log('usFeatures ', usFeatures);
    svg
      .append('g')
      .attr('class', 'counties')
      .selectAll('path')
      .data(usFeatures)
      .enter()
      .append('path')
      .attr('class', 'county')
      .attr('data-fips', function(d: usFeature) {
        return d.id;
      })
      .attr('data-education', function(d: usFeature) {
        var result: usEducationType[] = usEducation.filter(function(
          obj: usEducationType
        ) {
          return obj.fips === d.id;
        });
        if (result[0]) {
          return result[0].bachelorsOrHigher;
        }
        return 0;
      })
      .attr('fill', function(d: usFeature) {
        var result: usEducationType[] = usEducation.filter(function(
          obj: usEducationType
        ) {
          return obj.fips === d.id;
        });
        if (result[0]) {
          return color(result[0].bachelorsOrHigher);
        }
        //could not find a matching fips id in the data
        return color(0);
      })
      .attr('d', path)
      .on('mouseover', function(d: usFeature) {
        tooltip.style('opacity', 0.9);
        tooltip
          .html(() => {
            var result: usEducationType[] = usEducation.filter(function(
              obj: usEducationType
            ) {
              return obj.fips === d.id;
            });
            if (result[0]) {
              return (
                result[0]['area_name'] +
                ', ' +
                result[0]['state'] +
                ': ' +
                result[0].bachelorsOrHigher +
                '%'
              );
            }
            //could not find a matching fips id in the data
            return null;
          })
          .attr('data-education', function() {
            var result: usEducationType[] = usEducation.filter(function(
              obj: usEducationType
            ) {
              return obj.fips === d.id;
            });
            if (result[0]) {
              return result[0].bachelorsOrHigher;
            }
            //could not find a matching fips id in the data
            return 0;
          })
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      })
      .on('mouseout', function(d) {
        tooltip.style('opacity', 0);
      });
  };
  render() {
    return (
      <div className='svg-container d-flex flex-column'>
        <h1 id='title'>United States Educational Attainment</h1>
        <div id='description'>
          Percentage of adults age 25 and older with a bachelor's degree or
          higher (2010-2014)
        </div>
      </div>
    );
  }
}

export default App;
