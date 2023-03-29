const express = require('express')
const app = express()
const cors = require('cors')
const dns = require('dns');
require('dotenv').config()
var bodyParser = require("body-parser");
let mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

//My work
const MyObjectId = mongoose.Types.ObjectId;

//Set up username Schema
let userSchema = new mongoose.Schema({
  username: { type: String, required: true }
})

let User = mongoose.model("User", userSchema,"exercise");

//Set up exercise schema
let exerciseSchema = new mongoose.Schema({
  user: {type: String, required: true},
  description: {type: String, required: true},
  duration: {type: Number, min: 1, required: true},
  date: {type: Date, default: Date.now}
})

let Exercise = mongoose.model("Exercise", exerciseSchema, "exercise");

//Post requests

//Create user
app.post("/api/users", function(req, res) {
  var link = new User({
    username: req.body.username
  });
  link.save().then(ret => {
    res.json(ret);
  });
});
//Create exercise

app.post("/api/users/:_id/exercises", function(req, res) {
  if (!req.body.date){
    date = new Date().toISOString().slice(0, 10);
  }
  else{
    date=req.body.date
  }
  //check if user exists
  User.findById(req.params._id)
    .then(data =>{
      //user found, add exercise
      console.log(data)
      var link = new Exercise({
        user: req.params._id,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: date
      });
      link.save()
        .then(ret => {
          res.json({
						_id: req.params._id,
						username: data['username'],
						description: req.body.description,
						duration: parseInt(req.body.duration),
						date: new Date(date).toDateString()
					});
          //res.json(ret)
      })
      .catch(err=>{
        res.json(err)
      });
      //res.json(data)
    })
    .catch(err =>{
      //console.log(err)
      res.json('User not found')
    });
  
  
});


//Get requests

//get users
app.get("/api/users", function (req, res) {
  User.find()
  .then(post =>{
    res.json(post)
  })
});
//get exercise log
app.get("/api/users/:_id/logs", function (req, res) {
  User.findById(req.params._id)
    .then(post=>{
      let params = {}
      
      params.user = req.params._id
      //User found
      if (req.query.from!==undefined && req.query.from !== '' || req.query.to!==undefined && req.query.to !== ''){
        params.date = {}
      }
      if (req.query.from!==undefined && req.query.from !== ''){
        params.date.$gte = new Date(req.query.from)
      }
      else{
        //let from = new Date('1970-01-01')
      }
      if (req.query.to!==undefined && req.query.to !== ''){
        params.date.$lt = new Date(req.query.to)
      }
      else{
        
      }
      
      let limit = (req.query.limit !== undefined ? parseInt(req.query.limit) : 0);
      console.log(params)
      
      //this bit!!!
      //Exercise.find({user: req.params._id, date: {}}).sort({ date: 'asc' }).limit(limit)
      Exercise.find(params).sort({ date: 'asc' }).limit(limit)
        .then(post2=>{
          let retData = {}
          retData['_id'] = req.params._id
          retData['username'] = post.username
          retData['count'] = post2.length
          
          let log = []
          for (let i=0;i<post2.length;i++){
            log.push({
              description: post2[i].description,
              duration: post2[i].duration,
              date: new Date(post2[i].date).toDateString()
                     })
          }
          retData['log'] = log
          //res.json(post2)
          res.json(retData)
        })
        .catch(err2=>{
          res.json('No exercises found')
        })
    })
    .catch(err=>{
      res.json('User not found')
    });
});
//newExercise('Dan', 'Desc', 60, '2006-01-01')

/*
User.findById(req.params._id, function (err, data) {
    if (!err && data !== null) {
      var link = new Exercise({
        username: req.params._id,
        description: req.body.description,
        duration: req.body.duration,
        date: date
      });
      link.save()
        .then(ret => {
          res.json(ret);
        })
        .catch(err => {
          res.json(err)
        });
    }
    else{
      console.log('not found')
    }
  })
*/