require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

let mongodb = require("mongodb");
let mongoose = require("mongoose");
mongoose.set('useFindAndModify', false); 
let bodyParser = require("body-parser");
let uri ="mongodb+srv://menios:"+process.env.PW+"@cluster0.vyae4.mongodb.net/db_1?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});
//---------------
let { Schema } = mongoose;

let urlSchema = new Schema({
  original: {type: String, required: true},
  short_url: Number
});

let Url = mongoose.model("Url", urlSchema);

app.post("/api/shorturl/new", bodyParser.urlencoded({ extended: false }), (req, res) => {
  
  let regex = new RegExp( /^[http://www.]/gi );
  
  if(req.body.url.match(regex))
    {
      let value = 1;
      Url.findOne({}).sort({ short_url: -1 }).exec((err, data) => {
        if (err) console.error(err);
        else if (data != undefined) {
          value = data.short_url + 1;
          }
        if(!err)
        {       
             Url.findOne({original:req.body.url}).exec((err, inp) => {
              if (err) return console.error(err);             
              if(inp!= undefined)
                {
                   value-=1;
                   res.json({original_url: inp.original, sorted_url: inp.short_url});  
                }
              else
              {
                let newUrl = new Url({ original: req.body.url, short_url: value });
                newUrl.save((err, data) => {
                if (err) return console.error(err);
                else res.json({original_url: data.original, sorted_url: data.short_url});            
                });
              }
          });
        }
      });
    }else res.json({error: "invalid url"});
  });
app.get("/api/shorturl/hi", (req, res)=>{

  Url.find({}, (err, data)=>{
      res.json(data)
    });      
});

app.get('/api/shorturl/:url',function(req,res){
  var new_url=req.params.url;
  console.log(new_url);
  Url.findOne({sorted:req.params.urls}).exec((err, data)=>{
      //if (err) return console.error(err);
      if(!err && data != undefined) res.redirect(data.original)
      else res.json("URL not Found");   
    });      
});
//----------
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});