// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const request =  require("request");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res){
  res.sendFile(__dirname + "/signup.html");
});


app.post("/", function(req, res){

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  var data = {
    members: [
      {email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME:firstName,
        LNAME:lastName,
      }
    }
    ]
  };

  var jsonData = JSON.stringify(data);

  var options = {
    url: "https://us4.api.mailchimp.com/3.0/lists/8776ede861",
    method: "POST",
    headers: {
      "Authorization": "aefreeman API_KEY"
    },
    body: jsonData

  };

  request(options, function(error, response, body){
      if(error || response.statusCode != 200){
        res.sendFile(__dirname + "/failure.html");
      } else {
        res.sendFile(__dirname + "/success.html");
      }
  });

});

app.post("/failure", function(req, res){
  res.redirect("/");
});



app.listen(3000, function(){
  console.log("Server is running on port 3000");
});


// 05b42197f24de361bbc76b92edb4d7a3-us4  <-- API key

// 8776ede861 <-- Audience/list ID
