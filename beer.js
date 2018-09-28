const cheerio = require('cheerio');
const request = require('request-promise');

var baBase = "http://www.beeradvocate.com";
var searchPath = "/search/?q=<searchTerm>&qt=beer";


function getBeer(beerName, cb) {
  let url = baBase + searchPath.replace('<searchTerm>', formatBeerName(beerName));
  let options = {
    uri: url,
    transform: function (body) {
        return cheerio.load(body);
    },
    rejectUnauthorized: false 
  };
  let beerInfo = {};
  request(options)
    .then(function ($) {
        let beerPath = $('#ba-content div div').children('a').first().attr('href');
        let url = baBase + beerPath;
        let options = {
          uri: url,
          transform: function (body) {
              return cheerio.load(body);
          },
          rejectUnauthorized: false 
        };
        beerInfo = transformBeerInfo(beerPath);
        return request(options);
    })
    .then(function($) {
      beerInfo.rating = parseFloat($('.ba-ravg').text());
      let beerBreweryName = $('.titleBar h1').text();
      beerInfo.beerName = getBeerName(beerBreweryName);
      beerInfo.brewery = getBreweryName(beerBreweryName);
      let infoBox = $('#info_box').html();
      beerInfo.ABV = getABV($, infoBox);
      beerInfo.style = getStyle($, infoBox);
      console.log(beerInfo);
    })
    .catch(function (err) {
        console.log(err);
    });
};

function formatBeerName(beerName) {
  return beerName.replace(/ /g, '+');
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
  let subStr = html.slice(index, index+60);
  let matchArr = subStr.match(/<b>[a-zA-Z ]+?(?=<\/b>)/);
  //TODO add error handling
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

getBeer("Bud Light");