var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var fs = require('fs');

var baseUrl = 'http://overwatch.gamepedia.com';
var url = 'http://overwatch.gamepedia.com/Overwatch_Wiki';

var overwatchScrape = function() {
	return new Promise(function(resolve, reject) {
		request(url, function(err, res, body) {
			var $ = cheerio.load(body);
			var herosArray = [];
			var heros = $('#fpheroes').children();
			heros.each(function(i, element) {
				var self = $(this);

				if(self['0'].attribs.class === 'fpimagelink') {
					var imageUrl = self.find('.image').children().find('img')[0].attribs.src;
					var aTagAttribs = self.find('.image').children().find('img')[0].parent.attribs;
					var wikiUrl = `${baseUrl}${aTagAttribs.href}`;
					var heroName = aTagAttribs.title;
					var heroObj = {
						"image": imageUrl,
						"wikiUrl": wikiUrl,
						"heroName": heroName
					};
					herosArray.push(heroObj);
				}
			});
			fs.writeFile(path.join(__dirname + '/heros.json'), JSON.stringify(herosArray), function(err) {
				if(err) {
					return reject();
				}
				return resolve();
			});
		});
	});
};

module.exports = overwatchScrape;