const express = require("express");
const router = express.Router();
const rp = require("request-promise");
const cheerio = require("cheerio");
const CircularJSON = require("circular-json");

const { rollbar } = require("../config/rollbar");
const { baseUrl } = require("../config/settings");

/** API to get all currency price */
router.get("/:ticker?", function(req, res, next) {
  // it can be null as ticker is optional parameter
  let reqCurrencyName = req.params.ticker;

  const currencyList = [];

  rp(baseUrl)
    .then(body => {
      const $ = cheerio.load(body);
      const getField = (elem, orderNumber) =>
        $(elem)
          .find("td")
          .eq(orderNumber)
          .text()
          .replace(/\r?\n|\r/g, " ")
          .trim();

      const currencies = $("tr")
        .filter((i, e) => {
          if (reqCurrencyName) {
            // Filter row with requested current name
            if (reqCurrencyName === getField(e, 1)) return true;
          } else return Boolean(getField(e, 1)); // Filter rows with no currency name
        })
        .map((i, e) => ({
          // Construct the object
          currencyName: getField(e, 1),
          marketCap: getField(e, 2),
          price: getField(e, 3),
          dataSupply: getField(e, 4).replace(/ /g, ""),
          volume: getField(e, 5),
          negativeChange: getField(e, 6)
        }));

      // Respond
      res.send(currencies.get());
    })
    .catch(error => {
      rollbar.log(error);
      res.send({
        error
      });
    });
});

module.exports = router;
