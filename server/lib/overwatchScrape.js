import path from 'path';
import chalk from 'chalk';
import request from 'request';
import cheerio from 'cheerio';
import Promise from 'bluebird';
import retryPromise from 'bluebird-retry';
import fs from 'fs';

let baseUrl = 'http://overwatch.gamepedia.com';
let url = 'http://overwatch.gamepedia.com/Overwatch_Wiki';
let overwatchClass;

import scrapeOverwatchHero from './scrapeOverwatchHero.js';

let overwatchScrape = () => {
	// State purpose
	console.log(chalk.bgGreen.white.bold('Getting all heros...'));
	return new Promise((resolve, reject) => {
		request(url, (err, res, body) => {
			let $ = cheerio.load(body);
			let heros = $('#fpheroes').children();
			let herosArray = [];

			heros.each(function (i, element) {
				let self = $(this);
				
				// Reset heros array
				if(i === 0) {
					herosArray = [];
				}

				if(self['0'].attribs.class === 'fpimagelink') {
					let imageUrl = self.find('.image').children().find('img')[0].attribs.src;
					let aTagAttribs = self.find('.image').children().find('img')[0].parent.attribs;
					let wikiUrl = `${baseUrl}${aTagAttribs.href}`;
					let heroName = aTagAttribs.title;
					let heroObj = {
						"image": imageUrl,
						"wikiUrl": wikiUrl,
						"heroName": heroName
					};

					// Defines class and defines class variable.
					if(!self.prev()[0].attribs.class) {
						let overwatchDomVariable = self.prev().find('.mw-redirect')[0];
						if(overwatchDomVariable) {
							overwatchClass = overwatchDomVariable.attribs.title;
						}
					}
					heroObj.class = overwatchClass;

					herosArray.push(heroObj);
				}
			});

			// Have to retry the method because sometimes abilities are just empty
			retryPromise(scrapeOverwatchHero.bind(this, herosArray), { max_tries: 8 }).done((finishedHeroArray) => {
				fs.writeFile(path.join(__dirname + '/heros.json'), JSON.stringify(finishedHeroArray), (err) => {
					console.log(chalk.bgGreen.white.bold('Created heros.json file.'));
					if(err) {
						return reject();
					}
					return resolve(finishedHeroArray);
				});
			});
		});
	});
};

module.exports = overwatchScrape;
