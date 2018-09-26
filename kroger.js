const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08&monet=true';
const upcUrl = 'https://www.kroger.com/products/api/products/details';
const cookie = 'ak_bmsc=25C42AFFBE391062CEB44E0AC924663A48F6F708256300004FC4AB5B2CF92C36~plNBohLTtNSWvHJY1Q0Lqms2El0GkgdgHmZ+iHZZpr15mfPGGgQQsx7xAfrpbC4ya09YM2ATGQPg1GjT7qgqDdC6HZu006qiHElYUh8TuWv++uROF17oTRH10YnQf5XwPxAFIzgVzIYDCx8x8YTWTJSoasNI2ALJ0LNC663GdeC2DHL2fzudRVHcBBxP9+AHp0GsZL0AWChvGkSXBdHgX5IUZlsMZDPImHfhcxypYRadY=;';
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

function createBeerObject(product) {
  return {
    brand: product.brandName,
    description: product.description,
    size: product.customerFacingSize,
    currentPrice: product.calculatedPromoPrice,
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
