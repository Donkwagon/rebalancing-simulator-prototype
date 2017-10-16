const express = require('express');
const simulation = express.Router();
var SIMULATION_COLLECTION = "simulations";
var ObjectID = require('mongodb').ObjectID;

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

simulation.get("", function(req, res) {
  db.collection(SIMULATION_COLLECTION).aggregate([ { $sample: { size: 100 } } ]).limit(100).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get simulations.");
    } else {
      res.status(200).json(docs);
    }
  });
});

simulation.get("/exchange/:exchange", function(req, res) {
  db.collection(SIMULATION_COLLECTION).find({exchange: req.params.exchange}).limit(100).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get simulations.");
    } else {
      res.status(200).json(docs);
    }
  });
});


simulation.post("", function(req, res) {
  
  var newsimulation = req.body;
  newsimulation.createDate = new Date();

  db.collection(SIMULATION_COLLECTION).insertOne(newsimulation, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new simulation.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

simulation.get("/:id", function(req, res) {
  db.collection(SIMULATION_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get simulation");
    } else {
      res.status(200).json(doc);
    }
  });
});

simulation.put("/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(SIMULATION_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, {$set:{updateDoc}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update simulation");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

simulation.delete("/:id", function(req, res) {
  db.collection(SIMULATION_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete simulation");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

module.exports = simulation;