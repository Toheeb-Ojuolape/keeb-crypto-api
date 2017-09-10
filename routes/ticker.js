const express = require("express");
const router = express.Router();
const request = require("request");
const cheerio = require("cheerio");

const baseUrl = "https://coinmarketcap.com";
var currencyList = [];

/** API to get all currency price */
router.get("/:ticker?", function(req, res, next) {
  request(baseUrl, function(error, response, body) {
    // if no error and http response code is 200
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(body);
      $("tr").each(function name(i, elem) {
        var currencyName = $(this)
          .find("td")
          .eq(1)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        var marketCap = $(this)
          .find("td")
          .eq(2)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        var price = $(this)
          .find("td")
          .eq(3)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        var dataSupply = $(this)
          .find("td")
          .eq(4)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim()
          .replace(/ /g, "");

        var volume = $(this)
          .find("td")
          .eq(5)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        var negativeChange = $(this)
          .find("td")
          .eq(6)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

        // first item is empty so lets not push it into an array
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
    }
  });

  res.send(currencyList);
});

module.exports = router;
