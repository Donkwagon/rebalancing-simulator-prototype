const express = require('express');
const securityMaintenance = express.Router();
var SECURITY_COLLECTION = "securities";
var ObjectID = require('mongodb').ObjectID;


var request = require('request');
var cheerio = require('cheerio');

function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}

securityMaintenance.get("/IEX-listing", function(req, res) {
    //fetch IEX list and map to listed seurities 
    //https://www.iextrading.com/api/mobile/refdata

    var URL = "https://www.iextrading.com/api/mobile/refdata";

    req = request.defaults({jar: true,rejectUnauthorized: false,followAllRedirects: true});

    req.get({url: URL,headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36'
        }
    }, function(error, response, html){

        var listing = JSON.parse(response.body);
        var len = listing.length;
        var i = 0;
        
        updateIEXListing(listing, i, len);

        res.status(200).json(response);
    });
});

updateIEXListing = function(listing, i, len) {
    if(i < len){
        var symbol = listing[i].Symbol;

        db.collection(SECURITY_COLLECTION).findOneAndUpdate({'symbol': symbol}, {$set:{IEXListed:true}}, function(err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to update security");
                i++;
                updateIEXListing(listing, i, len)
            } else {
                i++;
                console.log(doc);
                updateIEXListing(listing, i, len)
            }
        });


    }else{
        console.log("update completed!");
    }
}


securityMaintenance.get("/IEX-data/symbol/:symbol", function(req, res) {
    //fetch security data from IEX API 1.0 (free)
    //https://api.iextrading.com/1.0/stock/amd/stats

    var symbol = req.params.symbol;

    var properties =   [
        "quote",
        "company",
        "news",
        "financials",
        "earnings",
        "logo",
        "chart",
        "chart/1d",
        "chart/1m",
        "chart/3m",
        "chart/6m",
        "chart/ytd",
        "chart/1y",
        "chart/2y",
        "chart/5y",
    ];

    properties.forEach(property => {
        console.log("symbol" + symbol);
        IEXRequestToData(symbol,property);
    })

});

IEXRequestToData = function(symbol,propertyName) {

    var URL = "https://api.iextrading.com/1.0";

    URL = URL + "/stock/" + symbol + "/" + propertyName;
    console.log(URL);

    req = request.defaults({jar: true,rejectUnauthorized: false,followAllRedirects: true});

    req.get({
        url: URL,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36'
        }
    }, function(error, response, body){

        var set = {};
        set[propertyName] = JSON.parse(body);
        db.collection(SECURITY_COLLECTION).findOneAndUpdate({'symbol': symbol}, {$set:set}, function(err, doc) {
            if (err) {
                handleError(res, err.message, "Failed to update security");
            } else {
            }
        });
    });

}

securityMaintenance.get("/IEX-data/all", function(req, res) {
    //fetch security data from IEX API 1.0 (free)
    //https://api.iextrading.com/1.0/stock/amd/stats

    var stream = db.collection(SECURITY_COLLECTION).find({'IEXListed': true}).stream();

    var securities = [];

    stream.on('data', function(doc) {
        securities.push(doc);
    });
    stream.on('error', function(err) {
        console.log(err);
    });
    stream.on('end', function() {
        console.log('All done!');
        IEXGetListedSecuritiesInfo(securities,0);
    });

});

IEXGetListedSecuritiesInfo = function(securities,i){

    if(i < securities.length){

        var symbol = securities[i].symbol;

        var properties =   [
            "quote",
            "company",
            "news",
            "financials",
            "earnings",
            "logo",
            "chart",
            "chart/1d",
            "chart/1m",
            "chart/3m",
            "chart/6m",
            "chart/ytd",
            "chart/1y",
            "chart/2y",
            "chart/5y",
        ];

        properties.forEach(property => {
            IEXRequestToData(symbol,property);
        })
        
        setTimeout(function(){
            i++;
            console.log(i);
            IEXGetListedSecuritiesInfo(securities,i);
        }, 2000);
        
    }

}

module.exports = securityMaintenance;