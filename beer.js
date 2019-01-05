const cheerio = require("cheerio");
const request = require("request-promise");
const translations = require("./translations.json");

const baBase = "http://www.beeradvocate.com";
const searchPath = "/search/?q=<searchTerm>&qt=beer";
let options = {
  uri: '',
  transform: function (body) {
    return cheerio.load(body);
  },
  rejectUnauthorized: false
};

async function getBeer(beerName) {
  let formattedBeerName = formatBeerName(beerName);
  options.uri = baBase + searchPath.replace("<searchTerm>", formattedBeerName);
  let $ = await request(options);

  if (hasNoResults($)) {
    console.log("No results for beerName: " + beerName);
    return {};
  }

  //If there only one result Beer advocate goes directly to that page
  //This branch will go to the first page of the search results
  if ($(".ba-ravg").length !== 1) {
    $ = await getFirstResult($);
    if ($ === null) {
      console.log("Problem grabbing first result for beerName: " + beerName);
      return {};
    }
  }

  return getBeerInfo($);
};

function getBeerInfo($) {
  let beerInfo = {};
  beerInfo.rating = parseFloat($(".ba-ravg").text());
  let beerBreweryName = $(".titleBar h1").text();
  beerInfo.beerName = getBeerName(beerBreweryName);
  beerInfo.brewery = getBreweryName(beerBreweryName);
  let infoBox = $("#info_box").html();
  beerInfo.ABV = getABV($, infoBox);
  beerInfo.style = getStyle($, infoBox);
  return beerInfo;
}

async function getFirstResult($) {
  let beerPath = $("#ba-content div div").children("a").first().attr("href");
  if (beerPath === undefined) return null;

  beerInfo = transformBeerInfo(beerPath);
  if (beerInfo === null) return null;

  options.uri = baBase + beerPath;
  return await request(options);
}

function hasNoResults($) {
  $("li:contains('No results. Try being more specific.')").length == 1;
}

function cleanBeerName(beerName) {
  let cleanName = beerName;
  for (translation of translations) {
    cleanName = cleanName.replace(translation[0], translation[1]);
  }
  return cleanName;
}

function formatBeerName(beerName) {
  let cleanName = cleanBeerName(beerName);
  let formattedName = cleanName.replace(/ /g, "+");
  return formattedName.replace(/'/g, "%27");
}

function getABV($, html) {
  let index = html.indexOf("(ABV)");
  let subStr = html.slice(index, index + 20);
  let matchArr = subStr.match(/[0-9]{1,2}.[0-9]+%/);
  return parseFloat(matchArr[0]);
}

function getStyle($, html) {
  let index = html.indexOf("/beer/styles/");
  let subStr = html.slice(index, index + 80);
  let matchArr = subStr.match(/<b>[a-zA-Z ()/]+?(?=<\/b>)/);
  //if the style is exceptionally long this could throw, change 80 above
  return matchArr[0].replace("<b>", "");
}

function getBeerName(str) {
  let temp = str.split("|");
  return temp[0].trim();
}

function getBreweryName(str) {
  let temp = str.split("|");
  return temp[1].trim();
}

function transformBeerInfo(beerPath) {
  try {
    let attrs = beerPath.split("/");
    return {
      "breweryId": parseInt(attrs[3]),
      "beerId": parseInt(attrs[4])
    };
  } catch (e) {
    return null;
  }
}

module.exports.getBeer = getBeer;