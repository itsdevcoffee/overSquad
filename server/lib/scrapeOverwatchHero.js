import path from 'path';
import chalk from 'chalk';
import request from 'request';
import cheerio from 'cheerio';
import Promise from 'bluebird';
import fs from 'fs';
import _ from 'lodash';

import async from 'async';
let finishedHeroArray = [];
let hasEmptyAbilities = false;

let scrapeOverwatchHero = (herosArray) => {
	return new Promise((resolve, reject) => {
		// Reset finishedHeroArray
		finishedHeroArray = [];
		hasEmptyAbilities = false;

		
		//herosArray = herosArray.slice(1, 2); // Uncomment for testing purposes

		// Loop through all heros and get abilities
		async.eachSeries(herosArray, (hero, callback) => {
				request(hero.wikiUrl, async (err, res, body) => {
					if(err) {
						reject();
					}
					hero.abilities = {};

					let $ = cheerio.load(body);
					console.log(chalk.white.bgCyan.bold(`Retrieving ${hero.heroName} abilities...`));

					if($('.external.text')['0']) {
						hero.overpwnLink = $('.external.text')['0'].attribs.href;
					}

					// Get hero abilities
					await $('.ability_details').each(function(i, element) {
						const targetAbility = $(this).find('tr');
						const targetCollapsible = $(this).find('.mw-collapsible-content');
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
								hero.abilities[currentAbility].nameDesc = $(this).text();
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
										// Added regex to get rid of any special characters
										statTitle = $(this).text().replace(/[^a-zA-Z0-9 ]/g, "");
									} else {
										statDesc = $(this).text();
									}
								});

								hero.abilities[currentAbility].stats[statTitle] = statDesc;
							});

							// Get offical description
							targetChildren.find('i').each(function(i, element) {
								hero.abilities[currentAbility].abilityDesc = $(this).text();
							});

							// Get behavior
							targetChildren.last().find('p').last().each(function(i, element) {
								if(!$(this)['0'].attribs.class) {
									hero.abilities[currentAbility].behavior =  $(this).text();
								}
							});

							// Get ability video
							targetCollapsible.find('iframe').each(function(i, element) {
								hero.abilities[currentAbility].video = $(this)['0'].attribs.src;
							});

							// Get ability details
							hero.abilities[currentAbility].details = [];

							targetCollapsible.find('li').each(function(i, element) {
								hero.abilities[currentAbility].details.push($(this).text());
							});

						});
					});

					// Get hero achievements
					hero.achievements = [];
					await $('.wikitable').each(function(i, element) {
						let targetChildren = $(this).find('tr');

						targetChildren.each(function(i, element) {
							let achievementObj = {};

							// Get achievement name
							achievementObj.name = $(this).find('i').text();

							// Get achievement description
							$(this).find('td').each(function(i, element) {
								if(i === 2) {
									achievementObj.desc = $(this).text();
								}
							});

							// Get achievement icon and reward
							$(this).find('img').each(function(i, element) {
								if(i === 0) {
									achievementObj.icon = $(this)['0'].attribs.src;
								} else {
									achievementObj.reward = $(this)['0'].attribs.src;
								}
							});

							// Push object into achievements array and make sure it isn't first tr
							if(i > 0) {
								hero.achievements.push(achievementObj);
							}

						});
					})

					// Get hero skins
					console.log(chalk.white.bgCyan.bold(`Retrieving ${hero.heroName} skins...`));
					hero.skins = [];
					let skinCategoryObj;
					$('#mw-content-text table.mw-collapsible').eq(0).children().each(function(i, element) {
						i += 1;

						// even number is categoryName and odd is skins
						if(i !== 1 && i % 2 === 0) {
							skinCategoryObj = {
								name: $(this).find('b').text(),
								skinsCollection: []
							}
						} else {
							// Loop through the skins and get img and name
							$(this).find('td').each(function(i, element) {
								if($(this).get(0).attribs.style) {
									skinCategoryObj.skinsCollection.push({
										skinName: $(this).find('b').text(),
										skinThumbImg: $(this).find('img').get(0).attribs.src,
										skinFullImg: $(this).find('img').get(0).attribs.src.replace('100px', '600px')
									});
								}
							});

							// Add it to array and make sure skinCategory isn't null
							if(skinCategoryObj) {
								hero.skins.push(skinCategoryObj);
							}
						}
					});

					// Get victory poses
					hero.victoryPoses = [];
					let victoryPoseObj;
					$('#mw-content-text table.mw-collapsible').eq(1).children().each(function(i, element) {
						i += 1;
	
						if(i !== 1 && i % 2 === 0) {
							victoryPoseObj = {
								name: $(this).find('b').text(),
								victoryPoseCollection: []
							};
						} else {
							// Loop through the victory posts and get img and name
							$(this).find('td').each(function(i, element) {
								if($(this).get(0).attribs.style) {
									victoryPoseObj.victoryPoseCollection.push({
										victoryName: $(this).find('b').text(),
										victoryThumbImg: $(this).find('img').get(0).attribs.src,
										victoryFullImg: $(this).find('img').get(0).attribs.src.replace('100px', '600px')
									});
								}
							});

							// Add it to array and make sure victoryPoseCollection isn't null
							if(victoryPoseObj) {
								hero.victoryPoses.push(victoryPoseObj);
							}
						}
					});

					// Get hero sprays
					hero.sprays = [];
					let sprayObj;
					let sprayDomTrs = $('#mw-content-text table.mw-collapsible').eq(2).children();
					$('#mw-content-text table.mw-collapsible').eq(2).children().each(function(i, element) {
						let parentIndex = i += 1;

						let sprayCategory = $(this).find('th').find('b').text();

						if(parentIndex !== 1 && sprayCategory !== "") {
							if(sprayObj) {
								hero.sprays.push(sprayObj);
							}
							sprayObj = {
								name: sprayCategory,
								sprayCollection: []
							};
						} else {
							$(this).find('td').each(function(i, element) {
								if($(this).get(0).attribs.style) {
									let imgUrl = $(this).find('img').get(0).attribs.src;

									sprayObj.sprayCollection.push({
										sprayName: $(this).find('b').text(),
										sprayThumbImg: imgUrl,
										sprayFullImg: imgUrl.replace('/thumb', '').replace('/' + _.last(imgUrl.split('/')) ,'')
									});

									if(sprayDomTrs.length === parentIndex) {
										hero.sprays.push(sprayObj);
									}
								}
							});
						}
					});

					// Get hero emotes
					hero.emotes = [];
					let emotesObj;
					let emoteDomTrs = $('#mw-content-text table.mw-collapsible').eq(3).children();
					emoteDomTrs.each(function(i, element) {
						let parentIndex = i += 1;

						let emoteCategory = $(this).find('th').find('b').text();

						if(parentIndex !== 1 && emoteCategory !== "") { 
							if(emotesObj) {
								hero.emotes.push(emotesObj);
							}
							emotesObj = {
								name: emoteCategory,
								emoteCollection: []
							};
						} else {
							$(this).find('td').each(function(i, element) {
								if($(this).get(0).attribs.style) {
									emotesObj.emoteCollection.push({
										emoteName: $(this).find('big').text(),
										emoteVideo: $(this).find('video').get(0).attribs.src
									});
								}
							});

							if(emoteDomTrs.length === parentIndex) {
								hero.emotes.push(emotesObj);
							}
						}
					});

					// Get hero highlight
					hero.highlights = [];
					let highlightObj;
					let highLightDomTrs = $('#mw-content-text table.mw-collapsible').eq(4).children();
					highLightDomTrs.each(function(i, element) {
						let parentIndex = i += 1;

						let highlightCategory = $(this).find('th').find('b').text();

						if(parentIndex !== 1 && highlightCategory !== "") { 
							if(highlightObj) {
								hero.highlights.push(highlightObj);
							}
							highlightObj = {
								name: highlightCategory,
								highlightCollection: []
							};
						} else {
							$(this).find('td').each(function(i, element) {
								if($(this).get(0).attribs.style) {
									highlightObj.highlightCollection.push({
										highlightName: $(this).find('big').text(),
										highlightVideo: $(this).find('video').get(0).attribs.src
									});
								}
							});

							if(highLightDomTrs.length === parentIndex) {
								hero.highlights.push(highlightObj);
							}
						}
					});

					// Get full hero image
					let fullImageSelector = $('#mw-content-text .infoboxtable').children().find('img')['0'];

					if(fullImageSelector) {
						hero.fullHeroImage = fullImageSelector.attribs.src;
					}

					// hero ability or skins are empty
					if(Object.keys(hero.abilities).length === 0 || hero.skins.length === 0) {
						hasEmptyAbilities = true;
						console.log(chalk.bgRed.white.bold(`${hero.heroName} is empty`));
						console.log(chalk.bgBlue.white.bold('Some hero abilities or skins were empty. Retrying...'));
						reject();
					}

					finishedHeroArray.push(hero);
					callback(null, hero);
				});
			}
			, function done() {
				resolve(finishedHeroArray);
			});
	});
};

module.exports = scrapeOverwatchHero;