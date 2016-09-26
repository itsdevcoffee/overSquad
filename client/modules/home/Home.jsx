import React from 'react';
import $ from 'jquery';
import classNames from 'classNames';

require('./home.scss');

class Home extends React.Component {
  constructor(props) {
    super(props);

    // Bind method to this context
    this.getCustomersList = this.getCustomersList.bind(this);

    this.state = {
      customersList: null
    }
  }

  componentDidMount() {
    this.getCustomersList();
  }

  getCustomersList() {
    $.get('http://localhost:1337/api/heros', (data) => {
        this.setState({customersList: data.results});
        console.log(data);
    });
  }

  render() {
    const { customersList } = this.state;
    let domifiedCustomers;

    if(customersList) {
      domifiedCustomers = customersList.map((customer, i) => {
        return (
          <li key={i}>
            <a href={customer.wikiUrl}>
              <img src={customer.image} />
              <h4>Name: {customer.heroName}</h4>
              {customer.abilityImages.map((ability) => {
                return <img src={ability} />
              })}
            </a>
          </li>
        );
      });
    }
    return (
      <section id="home">
        <h2>Home</h2>
        <ul>
          {domifiedCustomers}
        </ul>
      </section>
    );
  }
}

module.exports = Home;
