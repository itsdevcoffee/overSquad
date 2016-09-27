// Assign material design color to class
const assignClassImgColor = (heroClass) => {
	switch(heroClass) {
		case 'Offense':
			return {
				classImg: 'https://hydra-media.cursecdn.com/overwatch.gamepedia.com/thumb/1/14/OffenseIcon.png/100px-OffenseIcon.png',
				classColor: '#F44336'
			};
		case 'Defense':
			return {
				classImg: 'https://hydra-media.cursecdn.com/overwatch.gamepedia.com/thumb/6/61/DefenseIcon.png/100px-DefenseIcon.png',
				classColor: '#673AB7'
			};
		case 'Tank':
			return {
				classImg: 'https://hydra-media.cursecdn.com/overwatch.gamepedia.com/thumb/6/69/TankIcon.png/100px-TankIcon.png',
				classColor: '#3F51B5'
			};
		case 'Support':
			return {
				classImg: 'https://hydra-media.cursecdn.com/overwatch.gamepedia.com/thumb/5/5f/SupportIcon.png/100px-SupportIcon.png',
				classColor: '#FFC107'
			};
	}
};

export default assignClassImgColor;