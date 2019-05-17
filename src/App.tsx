import React, { Component } from 'react';
import axios from 'axios';
import * as topojson from 'topojson';
import { educUrl, countyUrl } from './constants';

interface topoRes {
  features: any;
}
class App extends Component {
  state = {
    data: null
  };
  componentDidMount = async () => {
    try {
      const data = await axios.get(educUrl).then(async res => {
        const { data } = await axios.get(countyUrl);
        const datas = await topojson.feature(data, data.objects.counties);
        console.log('educUrl', datas.features);
        return res;
      });
    } catch (error) {
      this.setState({ error });
    }
  };
  render() {
    return <div />;
  }
}

export default App;
