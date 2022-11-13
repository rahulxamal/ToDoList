const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rahul:samalsamal@atlascluster.hpf00u3.mongodb.net/todolistDB", {
  useNewUrlParser: true,
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome To todo App",
});
const item2 = new Item({
  name: "<-- Click Here To Delete Item",
});

const item3 = new Item({
  name: "Hit + To Add Item",
});

const defaultItems = [item1, item2, item3];

const customItemSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = new mongoose.model("List", customItemSchema);

app.get("/", function (req, res) {
  // to Get Date

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Addedd");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "ToDoList", item: foundItems });
    }
  });
  // sending response to page
});

app.post("/", function (req, res) {
  const itemName = req.body.inputText;
  const listName = req.body.submit;

  const item = new Item({
    name: itemName,
  });

  if (listName === "ToDoList") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundItems){
      foundItems.items.push(item);
      foundItems.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const id = req.body.delete;
  const listName = req.body.listName;

    if (listName === "ToDoList"){
  Item.findByIdAndRemove(id, function (err) {
    if (err) {
      console.log(err);
    }
    console.log("successfully Deleted");
    res.redirect("/");
  });
} else {
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, function(err, foundItems){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}
  
  
});

app.get("/:customName", function (req, res) {
  const customName = _.capitalize(req.params.customName);
  List.findOne({ name: customName }, function (err, foundItems) {
    if (!err) {
      if (!foundItems) {
        const list = new List({
          name: customName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customName);
      } else {
        res.render("list", {
          listTitle: foundItems.name,
          item: foundItems.items,
        });
      }
    }
  });
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server Started Successfully");
});


