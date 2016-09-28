import mongo from 'mongodb';
import assert from 'assert';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import overwatchScrape from './../lib/overwatchScrape.js';
import scrapeOverWatchHeros from './../lib/scrapeOverWatchHeros.js';

const url = 'mongodb://localhost:27017/oversquad';

const herosController = {};

herosController.getAll = (req, res) => {
    let results = [];

    mongo.connect(url, (err, db) => {
        // Make sure that there are no errors
        assert.equal(null, err, "There was an error connecting to the database.");
        let cursor = db.collection('heros').find().sort({heroName: 1});
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

herosController.getHerosList = (req, res) => {
    let results = [];

    mongo.connect(url, (err, db) => {
        // Make sure that there are no errors
        assert.equal(null, err, "There was an error connecting to the database.");

        let selectFields = {
            heroName: 1,
            heroClass: 1,
            heroImg: 1,
            classColor: 1,
            classImg: 1
        };

        let cursor = db.collection('heros').find({}, selectFields);
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

herosController.getHero = (req, res) => {
    const { heroName } = req.params;

    mongo.connect(url, (err, db) => {
        // Make sure that there are no errors
        assert.equal(null, err, "There was an error connecting to the database.");

        let selectFields = {
            heroName: 1,
            heroClass: 1,
            heroImg: 1,
            classColor: 1,
            classImg: 1,
            fullHeroImage: 1,
            abilities: 1
        };

        db.collection('heros').find({ heroName }, selectFields).toArray((err, result) => {
            res.json({
                results: result[0]
            });
        });
        db.close();
    });
};

herosController.updateHeros = (req, res) => {
    scrapeOverWatchHeros()
        .then((finishedHeroArray) => {
            mongo.connect(url, (err, db) => {
                assert.equal(null, err, "There was an error connecting to the database.");

                console.log(chalk.white.bgCyan.bold('Removing previous hero data...'));
                db.collection('heros').remove({});

                console.log(chalk.bgGreen.white.bold('Saving new hero data...'));
                finishedHeroArray.forEach((hero) => {
                    db.collection('heros').insert(hero);
                });

                db.close();
            });
            res.json(finishedHeroArray);
        }).catch(() => {
            res.status(400).send('There was an error updating the hero list');
        });
};

module.exports = herosController;
