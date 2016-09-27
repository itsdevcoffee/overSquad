import React from 'react';

import './../../styles/styles.scss';

class Layout extends React.Component {
  render() {
    const content = this.props.children;
    return (
      <section id="layout">
        <h2>Layout</h2>
        {content}
      </section>
    );
  }
}

module.exports = Layout;
