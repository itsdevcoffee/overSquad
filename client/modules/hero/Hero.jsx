import React, { Component } from 'react';
import axios from 'axios';

import './hero.scss';

class Hero extends Component {
	constructor(props) {
	  super(props);

	  // Bind methods to this
	  this.objectMapAbilities = this.objectMapAbilities.bind(this);
	
	  this.state = {
	  	hero: null
	  };
	}

	componentWillMount() {
		const { heroName } = this.props.params;
		this.heroName = heroName;
		axios.get(`/api/heros/${heroName}`).then((res) => {
			this.setState({ hero: res.data.results });

			// format abilties array
			this.objectMapAbilities();
		});
	}

	objectMapAbilities() {
		const { hero } = this.state;
		let abilitiesList = [];

		if(hero) {
			for(let ability in hero.abilities) {
				let domifiyAbility = (
						<div key={ability} className='ability-item'>
							<p>{ability}</p>
							<img src={hero.abilities[ability].img} />
							<p>{hero.abilities[ability].nameDesc}</p>
						</div>
				);
				abilitiesList.push(domifiyAbility);
			}
		}

		return abilitiesList
	}

	render() {
		const { hero } = this.state;
		return (
			<section className='hero'>
				<h4>{this.heroName}</h4>
				<img src={hero ? hero.fullHeroImage : null} />
				<section className='ability-container'>
					{this.objectMapAbilities()}
				</section>
			</section>
		);
	}
}

export default Hero;