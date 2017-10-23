const express = require('express');
const security = express.Router();
var SECURITY_COLLECTION = "securities";
var ObjectID = require('mongodb').ObjectID;

function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

security.get("", function(req, res) {
  db.collection(SECURITY_COLLECTION).aggregate([ { $sample: { size: 50 } } ], { Symbol: 1, Issuer: 1 }).limit(50).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get securities.");
    } else {
      res.status(200).json(docs);
    }
  });
});

security.get("/exchange/:exchange", function(req, res) {
  db.collection(SECURITY_COLLECTION).find({exchange: req.params.exchange}).limit(100).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get securities.");
    } else {
      res.status(200).json(docs);
    }
  });
});


security.get("/symbol/:symbol", function(req, res) {
  db.collection(SECURITY_COLLECTION).findOne({symbol: req.params.symbol}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get securities.");
    } else {
      res.status(200).json(doc);
    }
  });
});

security.post("", function(req, res) {
  
  var newsecurity = req.body;
  newsecurity.createDate = new Date();

  db.collection(SECURITY_COLLECTION).insertOne(newsecurity, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new security.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

security.get("/:id", function(req, res) {
  db.collection(SECURITY_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get security");
    } else {
      res.status(200).json(doc);
    }
  });
});

security.put("/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(SECURITY_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, {$set:{updateDoc}}, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update security");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

security.delete("/:id", function(req, res) {
  db.collection(SECURITY_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete security");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});

module.exports = security;