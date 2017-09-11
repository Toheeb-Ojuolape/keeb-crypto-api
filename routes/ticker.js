const express = require("express");
const router = express.Router();
const request = require("request");
const cheerio = require("cheerio");
const { rollbar } = require("../config/rollbar");
const { baseUrl } = require("../config/settings");
var currencyList = [];

/** API to get all currency price */
router.get("/:ticker?", function(req, res, next) {
  console.log("------------------------------------");
  console.log(baseUrl);
  console.log("------------------------------------");
  request(baseUrl, function(error, response, body) {
    // if no error and http response code is 200
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      $("tr").each(function name(i, elem) {
        // currency name
        var currencyName = $(this)
          .find("td")
          .eq(1)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        // market cap value
        var marketCap = $(this)
          .find("td")
          .eq(2)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        // currency price
        var price = $(this)
          .find("td")
          .eq(3)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        // date supply value
        var dataSupply = $(this)
          .find("td")
          .eq(4)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim()
          .replace(/ /g, "");

        // volume value
        var volume = $(this)
          .find("td")
          .eq(5)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        // negative change value
        var negativeChange = $(this)
          .find("td")
          .eq(6)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        // first item is empty in response so lets not push it into an array
        if (currencyName !== "") {
          const currencyItem = {
            currencyName: currencyName,
            marketCap: marketCap,
            price: price,
            dataSupply: dataSupply,
            volume: volume,
            negativeChange: negativeChange
          };

          currencyList.push(currencyItem);
        }
      });
    } else rollbar.log(error);
  });

  res.send(currencyList);
});

module.exports = router;
