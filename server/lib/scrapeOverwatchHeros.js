import path from 'path';
import chalk from 'chalk';
import request from 'request';
import cheerio from 'cheerio';
import Promise from 'bluebird';
import retryPromise from 'bluebird-retry';
import fs from 'fs';

const baseUrl = 'http://overwatch.gamepedia.com';
const url = 'http://overwatch.gamepedia.com/Heroes';

import scrapeOverwatchHero from './scrapeOverwatchHero.js';
import assignClassImgColor from './assignClassImgColor.js';

const overwatchScrape = () => {
	// State purpose
	console.log(chalk.bgGreen.white.bold('Getting all heros...'));
	return new Promise((resolve, reject) => {
		request(url, (err, res, body) => {
			let $ = cheerio.load(body);
			let herosTr = $('#mw-content-text table');
			let herosArray = [];

			herosTr.find('tr').each(function(i, element) {
				let overwatchClass;

				// Defines class and defines class variable.
				if(i > 0) {
					overwatchClass = $(this).find('th').text().replace("\n", "");
				}

				$(this).find('td').each(function(i, element) {
					let heroObj = {};
					let urlEnd = $(this).find('a')['0'].attribs.href.split('?')[0];
					let heroName = $(this).find('a')['0'].attribs.title;
					let heroImg = $(this).find('img')['0'].attribs.src.split('?')[0];

					// Define name, img, and heroClass
					heroObj.wikiUrl = baseUrl + urlEnd;
					heroObj.heroName = heroName;
					heroObj.heroImg = heroImg;
					heroObj.heroClass = overwatchClass;

					// Get class img and color
					let classImgColorObj = assignClassImgColor(overwatchClass);
					heroObj.classColor = classImgColorObj.classColor;
					heroObj.classImg = classImgColorObj.classImg;

					herosArray.push(heroObj);
				});
			});

			// Have to retry the method because sometimes abilities are just empty
			retryPromise(scrapeOverwatchHero.bind(this, herosArray), { max_tries: 32 }).done((finishedHeroArray) => {
				const createHeroJson = (finishedHeroArray) => {
					fs.writeFile(path.join(__dirname + `/archive/heros${Date.now()}.json`), JSON.stringify(finishedHeroArray), (err) => {
						if(err) {
							return reject();
						}
						console.log(chalk.bgGreen.white.bold('Created heros.json file.'));
						return resolve(finishedHeroArray);
					});
				}
				// Create archive directory or use existing
				if(!fs.existsSync(path.join(__dirname + `/archive`))) {
					fs.mkdir(path.join(__dirname + `/archive`), () => {
						createHeroJson(finishedHeroArray);
					});
				} else {
					createHeroJson(finishedHeroArray);
				}
			});
		});
	});
};

export default overwatchScrape;
