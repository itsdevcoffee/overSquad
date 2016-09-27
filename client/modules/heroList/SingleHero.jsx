import React, { Component } from 'react';

class SingleHero extends Component {
	render() {
		const {
		    heroName,
		    heroClass,
		    image,
		    classColor,
		    classImg
		} = this.props.hero;

		return (
			<div className='single-hero' style={{background: classColor}}>
				<img src={image} />
				<p>{heroName}</p>
				<p>{heroClass}</p>
			</div>
		);
	}
}

export default SingleHero;