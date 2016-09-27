import React, { Component } from 'react';

import SingleHero from './SingleHero.jsx';

import './heroList.scss';

class HeroList extends Component {
	render() {
		const { heroList } = this.props;

		const heros = heroList.map((hero, i) => {
			return <SingleHero hero={hero} key={`hero_${i}`} />
		});

		return (
			<section id="hero-list">
				{heros}
			</section>
		);
	}
}

export default HeroList;