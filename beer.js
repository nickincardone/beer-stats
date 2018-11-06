const cheerio = require('cheerio');
const request = require('request-promise');
const translations = require('./translations.json');

var baBase = "http://www.beeradvocate.com";
var searchPath = "/search/?q=<searchTerm>&qt=beer";


async function getBeer(beerName) {
  let formattedBeerName = formatBeerName(beerName);
  let url = baBase + searchPath.replace('<searchTerm>', formattedBeerName);
  let options = {
    uri: url,
    transform: function (body) {
        return cheerio.load(body);
    },
    rejectUnauthorized: false 
  };
  let beerInfo = {};
  $ = await request(options);
  if ($('.ba-ravg').length !== 1) {
    let beerPath = $('#ba-content div div').children('a').first().attr('href');
    try {
        beerInfo = transformBeerInfo(beerPath);
    } catch (e) {
        console.log('Cannot Find Beer: ' + beerName + ' url: ' + options.uri);
        return {};
    }
    let url = baBase + beerPath;
    options.uri = url;
    $ = await request(options);
  }
  beerInfo.rating = parseFloat($('.ba-ravg').text());
  let beerBreweryName = $('.titleBar h1').text();
  beerInfo.beerName = getBeerName(beerBreweryName);
  beerInfo.brewery = getBreweryName(beerBreweryName);
  let infoBox = $('#info_box').html();
  beerInfo.ABV = getABV($, infoBox);
  beerInfo.style = getStyle($, infoBox);
  console.log(beerInfo);
  return beerInfo;
};

function cleanBeerName(beerName) {
  let cleanName = beerName;
  for (translation of translations) {
    cleanName = cleanName.replace(translation[0], translation[1]);
  }
  return cleanName;
}

function formatBeerName(beerName) {
  let cleanName = cleanBeerName(beerName);
  let formattedName = cleanName.replace(/ /g, '+');
  return formattedName.replace(/'/g, '%27');
}

function getABV($, html) {
  let index = html.indexOf('(ABV)');
  let subStr = html.slice(index, index+20);
  let matchArr = subStr.match(/[0-9]{1,2}.[0-9]+%/);
  //TODO add error handling
  return parseFloat(matchArr[0]);
}

function getStyle($, html) {
  let index = html.indexOf('/beer/styles/');
  let subStr = html.slice(index, index+80);
  let matchArr = subStr.match(/<b>[a-zA-Z ()/]+?(?=<\/b>)/);
  //if the style is exceptionally long this could throw
  return matchArr[0].replace('<b>', '');
}

function getBeerName(str) {
    let temp = str.split('|');
    return temp[0].trim();
}

function getBreweryName(str) {
    let temp = str.split('|');
    return temp[1].trim();
}

function transformBeerInfo(beerPath) {
  let attrs = beerPath.split('/');
  return {
    'breweryId': parseInt(attrs[3]),
    'beerId': parseInt(attrs[4])
  }
}

module.exports.getBeer = getBeer;