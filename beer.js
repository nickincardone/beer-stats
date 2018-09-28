const cheerio = require('cheerio');
const request = require('request-promise');

var baBase = "http://www.beeradvocate.com";
var searchPath = "/search/?q=<searchTerm>&qt=beer";


async function getBeer(beerName) {
  let url = baBase + searchPath.replace('<searchTerm>', formatBeerName(beerName));
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
    beerInfo = transformBeerInfo(beerPath);
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
  let cleanName = beerName.replace(' Belgium Beer', '');
  cleanName = cleanName.replace('Dos Equis XX Especial Lager Beer', 'Dos Equis Special Lager');
  cleanName = cleanName.replace('Dos Equis XX Especial Lager Beer', 'Dos Equis Amber Lager');
  cleanName = cleanName.replace('Coors Beer', 'Coors Banquet');
  cleanName = cleanName.replace('Bud Light Aluminum Bottle', 'Bud Light');
  cleanName = cleanName.replace('Coors Light Aluminum Bottles', 'Coors Light');
  cleanName = cleanName.replace('Miller Lite Aluminum Pints ', 'Miller Lite');
  cleanName = cleanName.replace('Michelob Ultra Light Beer', 'Michelob Ultra');
  cleanName = cleanName.replace('Coors Golden Banquet Beer', 'Coors Banquet');
  cleanName = cleanName.replace('Tecate Cerveza Original Mexican Beer', 'Tecate');
  cleanName = cleanName.replace('Small Town Brewery Not Your Fathers Rootbeer', 'Not Your Father\'s Root Beer');
  cleanName = cleanName.replace('The Original Coors Beer', 'Coors Banquet');
  cleanName = cleanName.replace('Bud Ice Lager', 'Bud Ice');
  cleanName = cleanName.replace('Coronita', 'Corona');
  cleanName = cleanName.replace('Budweiser Aluminum', 'Budweiser');
  cleanName = cleanName.replace(' Imported Beer', '');
  cleanName = cleanName.replace(' Beer', '');
  cleanName = cleanName.replace(' Can', '');
  cleanName = cleanName.replace('Miller Brewing Co.', 'Miller');
  cleanName = cleanName.replace(' Seasonal Variety Pack', '');
  cleanName = cleanName.replace(' Variety Pack', '');
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

module.exports.getBeer = getBeer;