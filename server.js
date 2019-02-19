const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const routes = require('./routes/app.js');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/',(req,res)=>{
  res.render(process.cwd() + '/views/index.pug');
});

app.get('/b/:board',(req,res)=>{
  res.render(process.cwd() + '/views/boards.pug');
});

routes(app);

app.listen(port, () => console.log(`REST API running on port ${port}`));