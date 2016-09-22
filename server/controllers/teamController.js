import mongo from 'mongodb';
import assert from 'assert';

const url = 'mongodb://localhost:27017/oversquad';

const teamController = {};

teamController.get = (req, res) => {
    let results = [];

    mongo.connect(url, (err, db) => {
        // Make sure that there are no errors
        assert.equal(null, err, "There was an error connecting to the database.");
        let cursor = db.collection('team').find();
        cursor.forEach((lead) => {
            results.push(lead);
        }, () => {
            db.close();
            res.json({
                results
            });
        });
    });
};

module.exports = teamController;
