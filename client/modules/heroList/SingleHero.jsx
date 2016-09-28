import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class SingleHero extends Component {
	render() {
		const {
		    heroName,
		    heroClass,
		    heroImg,
		    classColor,
		    classImg
		} = this.props.hero;

		return (
			<div onClick={() => browserHistory.push(`/heros/${heroName}`)} className='single-hero' style={{background: classColor}}>
				<img src={heroImg} />
				<p>{heroName}</p>
				<p>{heroClass}</p>
				<img src={classImg.replace('100px', '20px')} />
			</div>
		);
	}
}

export default SingleHero;