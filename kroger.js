const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08119&monet=true'; //08145 craft 08119 beer
const upcUrl = 'https://www.kroger.com/products/api/products/details';
const cookie = 'ak_bmsc=2AA8E3839CF0677B3AA1DCABAC3BEBA8B81C7F46F9760000D8E5E05B8393B12B~plM/+YIpWlcSQCkqUkQClu501ekegLlGwF1DFaBkKdlqrytnqjll/it2D7SyflHlrIYtJ35+/jZRoDq3XjB89lH6JeUh3aJFbqGQ4lPXmRzHl8qt9Clt40hxnLaC7QK6sfIiGHbhAUnfQEWOnsycPtePObkIeS4mtNWh78NKB3s5RCeGrp5RX22G3cuyVmWdz/OgzxHzwD/22sv6vcgdZiBjqSBcBLmxRz+zPrcN0F+ZE=;';
let options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': cookie,
    'division-id': '035',
    'store-id': '00917' //need to find division and store with beer prices
  },
  json: true,
  timeout: 20000
}
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function translateSize(sizeDescription) {
  let stringSplit = sizeDescription.split('/');
  if (stringSplit.length === 1) return convertUnit(sizeDescription);
  return parseInt(stringSplit[0]) * convertUnit(stringSplit[1]);
}

function convertUnit(measure) {
  if (measure.toLowerCase().includes('fl oz')) {
    return parseFloat(measure) * 29.5735;
  }
  if (measure.toLowerCase().includes('ml')) {
    return parseFloat(measure);
  }
  console.log('Measure not accounted for: ' + measure);
  return 0.0;
}

function createBeerObject(product) {
  return {
    brand: product.brandName,
    description: product.description,
    size: product.customerFacingSize,
    sizeMl: translateSize(product.customerFacingSize),
    currentPrice: product.calculatedPromoPrice ? product.calculatedPromoPrice : product.calculatedRegularPrice,
    regularPrice: product.calculatedRegularPrice,
    upc: product.upc
  }
}

async function getTotalCount() {
  options.uri = krogerUrl.replace('<start>', 0);
  let results = await request(options);
  return results.productsInfo.totalCount;
}

async function getUpcs(startIndex) {
  options.uri = krogerUrl.replace('<start>', startIndex);
  let results = await request(options);
  return results.upcs;
}

async function getUpcsInfo(upcs) {
  options.uri = upcUrl;
  options.body = { 
    upcs: upcs,
    filterBadProducts: true 
  };
  let results = await request(options);
  let beerInfoList = [];
  for (let i = 0; i < results.products.length; i++) {
    beerInfoList.push(createBeerObject(results.products[i]));
  }
  return beerInfoList;
}

module.exports.getTotalCount = getTotalCount;
module.exports.getUpcs = getUpcs;
module.exports.getUpcsInfo = getUpcsInfo;
