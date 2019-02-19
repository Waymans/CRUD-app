const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const uri = process.env.MONGO_URI;

let db;
let collectionB;
let collectionC;
let dbClient;

MongoClient.connect(uri, { useNewUrlParser: true })
.then(client => {
  console.log("Connected successfully to server");
  db = client.db('board-todo');
  collectionB = db.collection('boards');
  collectionC = db.collection('cards');
  dbClient = client;
}).catch(error => console.error(error));

module.exports = function (app) {
  /* Boards */
  app.route('/boards/')
    //create board
    .post((req, res) => {
      var name = req.body.board;
      var rand = Math.random().toString(36).substring(2,7);
      collectionB.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 3600 } );
      collectionB.updateOne({ board: name }, { $setOnInsert:{ _id: rand, board: name, createdAt: new Date() } }, { upsert: true })
        .then(data => {
          if (data.matchedCount === 0) {
            res.status(200).json({ _id: rand, board: name } ) 
          } else {
            res.json({error: "There is already a board with that name."})
          }})
        .catch(err => console.log(err));
    })
    //get boards
    .get((req, res) => {
      collectionB.find({}).toArray()
        .then(data => res.status(200).json(data))
        .catch(error => console.error(error));
    })
    //remove board
    .delete((req, res) => {
      var id = req.body._id;
      var name = req.body.board;
      collectionB.deleteOne({_id: id});
      collectionC.deleteMany({ board: name })
        .then(data => res.status(200).json({deleted: 'Successfully deleted.'}))
        .catch(error => console.error(error));
    });

  /* Cards */
  app.route('/board/:board')
    // create card
    .post((req, res) => {
      var name = req.body.card;
      var board = req.params.board;
      var rand = Math.random().toString(36).substring(2,6);
      collectionC.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 3600 } );
      collectionC.updateOne({ card: name, board: board }, { $setOnInsert:{ _id: rand, card: name, board: board, list: [], createdAt: new Date() } }, { upsert: true })
        .then(data => {
          if (data.matchedCount === 0) {
            res.status(200).json({ _id: rand, card: name, list: [] }) 
          } else {
            res.json({error: "There is already a card with that name."})
          }})
        .catch(err => console.log(err));
    })
    // get cards
    .get((req, res) => {
      var name = req.params.board;
      collectionC.find({board: name}).toArray()
        .then(data => res.status(200).json(data))
        .catch(error => console.error(error));
    })
    // update card by adding to list
    .put((req, res) => {
      var board = req.params.board;
      var id = req.body.id;
      var text = req.body.list;
      collectionC.findOne({ _id: id, list: { $in: [ text ] } } )
        .then(data => data ? res.json({ result: 'Already exists' }):
          collectionC.updateOne({ _id: id }, { $push:{ list: text } })
            .then(data => res.json({ item: text }))
            .catch(err => console.log(err))
        ).catch(err => console.log(err))
    })
    //delete card
    .delete((req, res) => {
      var name = req.body.card;
      collectionC.deleteOne({ card: name })
        .then(data => res.status(200).json({deleted: 'Successfully deleted.'}))
        .catch(error => console.error(error));
    });
    //delete list
  app.put('/list/:card', (req, res) => {
    var name = req.params.card
    var item = req.body.list;
    collectionC.updateOne({ card: name }, { $pull:{ list: item } })
      .then(data => res.json({ text: 'Successfully removed.' }))
      .catch(err => console.log(err));
  })

  process.on('SIGINT', () => {
    dbClient.close();
    process.exit();
  });
}