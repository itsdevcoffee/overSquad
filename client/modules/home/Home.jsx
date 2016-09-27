import React from 'react';
import $ from 'jquery';
import classNames from 'classNames';

import './home.scss';

import HeroList from './../heroList/HeroList.jsx';

class Home extends React.Component {
  constructor(props) {
    super(props);

    // Bind method to this context
    this.getHeroList = this.getHeroList.bind(this);

    this.state = {
      heroList: null
    }
  }

  componentDidMount() {
    this.getHeroList();
  }

  getHeroList() {
    $.get('http://localhost:1337/api/herosList', (data) => {
        this.setState({heroList: data.results});
    });
  }

  render() {
    const { heroList } = this.state;

    let domifiedHeroList;
    if(heroList) {
      domifiedHeroList = <HeroList heroList={heroList} />;
    }

    return (
      <section id="home">
        {domifiedHeroList}
      </section>
    );
  }
}

module.exports = Home;
