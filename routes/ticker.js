const express = require("express");
const router = express.Router();
var rp = require("request-promise");
const cheerio = require("cheerio");
const { rollbar } = require("../config/rollbar");
const { baseUrl } = require("../config/settings");

/** API to get all currency price */
router.get("/:ticker?", function(req, res, next) {
  var currencyList = [];

  // it can be null as ticker is optional parameter
  let reqCurrencyName = req.params.ticker;

  rp(baseUrl)
    .then(body => {
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
          if (reqCurrencyName !== undefined) {
            if (currencyName === reqCurrencyName) {
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
          } else {
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
        }
      });
      res.send(currencyList);
    })
    .catch(err => {
      rollbar.log(err);
      res.send({ error: err });
    });
});

module.exports = router;
