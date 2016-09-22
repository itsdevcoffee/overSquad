import mongo from 'mongodb';
import assert from 'assert';
import fs from 'fs';
import path from 'path';

import overwatchScrape from './../lib/overwatchScrape.js';

const url = 'mongodb://localhost:27017/oversquad';

const herosController = {};

herosController.get = (req, res) => {
    let results = [];

    mongo.connect(url, (err, db) => {
        // Make sure that there are no errors
        assert.equal(null, err, "There was an error connecting to the database.");
        let cursor = db.collection('heros').find();
        cursor.forEach((hero) => {
            results.push(hero);
        }, () => {
            db.close();
            res.json({
                results
            });
        });
    });
};

herosController.updateHeros = (req, res) => {
    overwatchScrape()
        .then(() => {
            const heros = fs.readFileSync(path.join(__dirname, './../lib/heros.json'));
            const jsonHeros = JSON.parse(heros);

            mongo.connect(url, (err, db) => {
                assert.equal(null, err, "There was an error connecting to the database.");
                db.collection('heros').remove({});
                db.collection('heros').insert(jsonHeros);
                db.close();
            })
            res.json(jsonHeros);
        }).catch(() => {
            res.status(400).send('There was an error updating the hero list');
        });
};

module.exports = herosController;
