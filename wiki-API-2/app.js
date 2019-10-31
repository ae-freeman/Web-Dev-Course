//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

//Avoid Mongoose deprecation warnings
app.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({extended:true}));
// app.use(express.static("public"));


//Connect to MongoDB database (db is created here)
mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true
});
//Create a new Schema
const articleSchema = {
  title: String,
  content: String
};

//Create a new mongoose model based on the Schema
const Article = mongoose.model("Article", articleSchema);



// article.save();


///////////////Requests targeting all aticles//////////////////
app.route("/articles") //--> sets up route so don't need to write the route name each time: after this write all the actions
                        // for this route (all articles)

.get(function(req, res){
  Article.find(function(err, foundArticles){
    if(!err){
      res.send(foundArticles);
    } else {
      res.send(err);
    }

  });
})

.post(function(req, res){


  const newArticle = new Article({
    title: req.body.title,
    content: req.body.content
  });

  newArticle.save(function(err){
    if(!err){
      res.send("Successfully added a new article");
    } else {
      res.send(err);
    }
  });
})

.delete(function(req, res){
  Article.deleteMany(function(err){
    if(!err){
      res.send("Successfully deleted all articles");

    } else {
      res.send(err);
    }
  });
});


///////////////Requests targeting specific articles//////////////////

app.route("/articles/:articleTitle")


.get(function(req, res){
  Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
    if(foundArticle){
      res.send(foundArticle);
    } else {
      res.send("No articles matching that title were found");
    }
  });
})

.put(function(req, res){
  Article.update(
    {title: req.params.articleTitle},
    {title: req.body.title, content: req.body.content},
    {overwrite: true}, //--> by using Mongoose, it deems it necessary to prevent overwriting, so need to tell it do it
    function(err){
      if(!err){
        res.send("Successfully updated article");
      }
    }
  );
})

.patch(function(req, res){
  Article.update(
    {title: req.params.articleTitle},
    {$set: req.body},
    function(err){
      if(!err){
        res.send("Succesfully update article");
      } else {
        res.send(err);
      }
    }
  );
})

.delete(function(req, res){
  Article.deleteOne(
    {title: req.params.articleTitle},
    function(err){
      if(!err){
        res.send("Successfully deleted the article");
      } else {
        res.send(err);
      }
    }

  );
});





//Run on local server
app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
