//jshint esversion:6

//require modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

//Create app, called 'app'
const app = express();

//Allow app to use ejs as template
app.set('view engine', 'ejs');
//Avoid mongoose deprecation warnings
mongoose.set('useFindAndModify', false);

//use bodyParser module
app.use(bodyParser.urlencoded({
  extended: true
}));

//Allow computer to read static css files etc
app.use(express.static("public"));

//Connect to MongoDB database that is created here (todolistDB)
mongoose.connect("mongodb+srv://admin-annie:test123@cluster0-wtmbs.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

//Create a new schema
const itemsSchema = {
  name: String
};

//Create a new mongoose model based on the itemsSchema

const Item = mongoose.model("Item", itemsSchema);

//insert new items into collection

const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

// Save the new items into an array that can be accessed when creating new lists
const defaultItems = [item1, item2, item3];

//New Schema for lists: this will allow new lists to be added to the database
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//New model for the lists --> this is a collection
const List = mongoose.model("List", listSchema);

//Define routes
app.get("/", function(req, res) {

  //Find items in the array
  Item.find({}, function(err, foundItems) { // --> foundItems = the result from Item.find, this is a CALLBACK FUNCTION
    //Check whether there are already items in the array
    if (foundItems.length === 0) { // --> this will return 0 if it is a new list being added to the collection

      // Insert all default documents (items) into database
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err); //log any errors
        } else {
          console.log("Successfully inserted default items");
        }
      });

      //Redirect it to the top of the app.get function,
      //but this time the length won't = 0, so will go down to the else function
      res.redirect("/");

    } else {
      res.render("list", { //render list.ejs file
        listTitle: "Today", //on this list, the name is always Today
        newListItems: foundItems //display the items that were found in the Item.find function
      });
    }
  });

});


//Define route for a custom list name
app.get("/:customListName", function(req, res) {

  //assign the custom list name in a variable, taken from what user writes in the URL. This uses the
  //req.params.whatever they wrote method.
  const customListName = _.capitalize(req.params.customListName); //--> remember lodash has been
  //used so that when the list title is displayed graphically, it shows with the first letter
  //capitalized.


  //Check if that list they requested alredy exists.
  List.findOne({

    //see if there is a document in the collection that already has this custom list name.
    name: customListName


    //the second parameter when searching
  }, function(err, foundList) {
    //if there were no errors, then do the following:
    if (!err) {

      //if could not findOne (find a list) with the name: customListName, then do the following:
      if (!foundList) {

        //Create a new list
        const list = new List({
          //use the name saved in variable from the custom name user wrote in the URL
          name: customListName,
          //use the default items array defined above
          items: defaultItems
        });
        //Save the list to the database
        list.save();
        //redirect to the home route so that list.ejs loads, but with url that includes the new name
        res.redirect("/" + customListName);

    //If a list with that title was found, do the following:
      } else {
        //Show an existing list
        res.render("list", { //--> render list.ejs

          //display the list title as the result of the List.findOne function, tapping into the name that is defined
          //in the object that was found.
          listTitle: foundList.name,
          //do the same for the items that were found in the object that was found
          newListItems: foundList.items
        });
      }
    }
  });

});


//Define post requests
app.post("/", function(req, res) { //--> include the callback function to use with post

//Create new variables using the name of inputs inside the form in list.ejs
  const itemName = req.body.newItem;
  const listName = req.body.list;

//Create a new document/object called item to put into the items collection
  const item = new Item({
    //The new object has the item name saved from the body request (uses bodyParser)
    name: itemName
  });

//If list name is the default, do the following:
  if (listName === "Today") {
//Save the item to the items collection
    item.save();
    //redirect to the home route, where program finds the items in the collection and displays them
    res.redirect("/");

//if list name is not "Today", then do the following:
  } else {
    //Search for a list in the collection which has the list name from the saved variable
    List.findOne({
      name: listName
    }, function(err, foundList) { //--> callback function, foundList is what is found from List.findOne

//Push the new item into the items collection for that list
      foundList.items.push(item);
      //Save to the found list
      foundList.save();

      //Redirect to the home route where the url has the custom list name
      res.redirect("/" + listName);
    });
  }
});

//Define post request for deleting items
app.post("/delete", function(req, res) {
  //Get id of the item object in the collection (the checkbox has value of the item id)
  const checkedItemId = req.body.checkbox;
//Delete it from the correct list by getting the list name, which is the other input
  const listName = req.body.listName;

//If it is the default list, do the following:
  if (listName === "Today") {
//Inside the items collection for the default, remove using the id
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully removed checked item");
//redirect to the home route to show default list now without the deleted item
        res.redirect("/");

      }


    });
    //if not the default list, do the following:
  } else {

//Update a list that has been found.
    List.findOneAndUpdate({
//Use the listName variable assigned earlier in this function
      name: listName
    }, {
      //%pull removes an item that has been specified if it is in an array
      $pull: {
        //Pull from the items collection inside that list name
        items: {
          //inside the items collection, remove item with the checkedItemId (assigned earlier in this function)
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        //Return to main page for that list name, now without the checked item
        res.redirect("/" + listName);
      }
    });
  }


});

//Render about page
app.get("/about", function(req, res) {
  res.render("about");
});

//Deploying with a database on Heroku
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});
