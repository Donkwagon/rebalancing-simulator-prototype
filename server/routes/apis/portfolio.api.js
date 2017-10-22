const express = require('express');
const portfolio = express.Router();
var PORTFOLIO_COLLECTION = "portfolios";
var ObjectID = require('mongodb').ObjectID;

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

portfolio.get("", function(req, res) {
  db.collection(PORTFOLIO_COLLECTION).aggregate([ { $sample: { size: 100 } } ]).limit(100).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get portfolios.");
    } else {
      res.status(200).json(docs);
    }
  });
});

portfolio.get("/simulation/:simulationId", function(req, res) {
  db.collection(PORTFOLIO_COLLECTION).find({simulationId: req.params.simulationId}).limit(100).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get portfolios.");
    } else {
      res.status(200).json(docs);
    }
  });
});


portfolio.post("", function(req, res) {
  
  var newportfolio = req.body;
  newportfolio.createDate = new Date();

  db.collection(PORTFOLIO_COLLECTION).insertOne(newportfolio, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new portfolio.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

portfolio.get("/:id", function(req, res) {
  db.collection(PORTFOLIO_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get portfolio");
    } else {
      res.status(200).json(doc);
    }
  });
});

portfolio.put("/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(PORTFOLIO_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, {$set:{updateDoc}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update portfolio");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

portfolio.delete("/:id", function(req, res) {
  db.collection(PORTFOLIO_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete portfolio");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

module.exports = portfolio;