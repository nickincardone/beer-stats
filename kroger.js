const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08119&monet=true'; //08145 craft 08119 beer
const upcUrl = 'https://www.kroger.com/products/api/products/details';
const cookie = 'ak_bmsc=5C83436E7B0E664E700A63AF4CA414B3B81C7F46610B0000455EBF5B69A4081A~plEPmumvwOd9jHv0vfFF+UMrh13rhi42JrDPHDQH5yLhXxWPrUZ14yAXWU3Nva+T92CXeTY9tsi9GuAaqSSzKYohYpzHhMsLT37mY7smVa9hesINDMec2U5T+EyszQnb0rA9t9TwD3itAnNOAxMKYm+QxN/lqv5nC+OnYqXewPRAf5n8dFOx1g6g71+NaT80tRddRRhEsopQH0+kszv/LF0kJl+aPYTN+Abogpn6oVMmE=;';
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
