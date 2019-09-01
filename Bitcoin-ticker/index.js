//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});


app.post("/", function(req, res){

  const cryptoType = req.body.crypto;
  const fiatType = req.body.fiat;
  const amount = req.body.amount;

  const baseURL = "https://apiv2.bitcoinaverage.com/convert/global";


  var options = {
    url: baseURL,
    method:"GET",
    qs: {
      from: cryptoType,
      to: fiatType,
      amount: amount
    }
  };

// use this to send to bitcoin servers

request(options, function(error, response, body){


  var data = JSON.parse(body); //<-- converts to readable js object
  var price = data.price; //<-- use the key 'price' to get into the value of price

  var currentDate = data.time;

  res.write("<p>The current date is " + currentDate + "<p>");
  res.write("<h1>" + amount + cryptoType + " is currently worth " + price + fiatType + "</h1>");

  res.send();

});

});

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
