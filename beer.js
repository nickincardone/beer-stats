const cheerio = require('cheerio');
const request = require('request-promise');

var baBase = "http://www.beeradvocate.com"
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
        let beerPath = $('#ba-content ul li').children('a').first().attr('href');
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
      beerInfo.rating = $('.ba-ravg').text();
      beerInfo.beerName = $('.titleBar h1').text();
      let infoBox = $('#info_box');
      getABV($, infoBox);
      console.log(beerInfo);
    })
    .catch(function (err) {
        console.log(err);
    });
};

function formatBeerName(beerName) {
  return beerName.replace(/ /g, '+');
}

function getABV($, infoBox) {
  let abvLoc = 0;
  infoBox.children().each(function(i, elem) {
    if ($(this).text().includes('%')) {
      console.log($(this).text());
    }
  });
}

function transformBeerInfo(beerPath) {
  let attrs = beerPath.split('/');
  return {
    'breweryId': attrs[3],
    'beerId': attrs[4]
  }
}

getBeer("Bud Light");