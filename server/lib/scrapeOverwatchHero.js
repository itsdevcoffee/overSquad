import path from 'path';
import chalk from 'chalk';
import request from 'request';
import cheerio from 'cheerio';
import Promise from 'bluebird';
import fs from 'fs';

import async from 'async';
let finishedHeroArray = [];
let hasEmptyAbilities = false;

let scrapeOverwatchHero = (herosArray) => {
	return new Promise((resolve, reject) => {
		// Reset finishedHeroArray
		finishedHeroArray = [];
		hasEmptyAbilities = false;

		// Uncomment for testing purposes
		//herosArray = herosArray.slice(1, 2);

		// Loop through all heros and get abilities
		async.eachSeries(herosArray, (hero, callback) => {
				request(hero.wikiUrl, (err, res, body) => {
					if(err) {
						reject();
					}
					hero.abilities = {};

					let $ = cheerio.load(body);
					console.log(chalk.white.bgCyan.bold(`Retrieving ${hero.heroName}...`));

					// Get hero abilities
					// $('.ability_details').find('img').each((i, element) => {
					// 	hero.abilities.push(element.attribs.src);
					// });

					$('.ability_details').each(function(i, element) {
						const targetAbility = $(this).find('tr');
						let formatAbility = {};
						let currentAbility;

						targetAbility.each(function(i, element) {
							const targetChildren = $(this).children();

							// Get ability name
							targetChildren.find('.header1').each(function(i, element) {
								currentAbility = $(this).find('span').text();
								hero.abilities[currentAbility] = {};
							});

							// Get ability desc
							targetChildren.find('.header2').each(function(i, element) {
								hero.abilities[currentAbility].abilityDesc = $(this).text();
							});

							// Get ability img
							targetChildren.find('img').each(function(i, element) {
								hero.abilities[currentAbility].img = element.attribs.src;
							});

							// Get stats
							// Define stats object
							targetChildren.find('.infoboxtable').find('tr').each(function(i, element) {
								let statTitle;
								let statDesc;

								if(i === 0) {
									hero.abilities[currentAbility].stats = {};
								}

								$(this).find('td').each(function(i, element) {
									if(i === 0) {
										statTitle = $(this).text();
									} else {
										statDesc = $(this).text();
									}
								});

								hero.abilities[currentAbility].stats[statTitle] = statDesc;
							});

							// Get offical description
							targetChildren.find('i').each(function(i, element) {
								console.log($(this).text());
							});

						});
					});

					console.log(hero.abilities);
					// Get full hero image
					let fullImageSelector = $('#mw-content-text .infoboxtable').children().find('img')['0'];

					if(fullImageSelector) {
						hero.fullHeroImage = fullImageSelector.attribs.src;
					}

					if(hero.abilities.length == 0) {
						console.log(chalk.bgRed.white.bold(`${hero.heroName} is empty`));
						hasEmptyAbilities = true;
					}

					finishedHeroArray.push(hero);
					callback(null, hero);
				});
			}
			, function done() {
				if(hasEmptyAbilities) {
					console.log(chalk.bgBlue.white.bold('Some hero abilities were empty. Retrying...'));
					reject();
				}
				resolve(finishedHeroArray);
			});
	});
};

module.exports = scrapeOverwatchHero;