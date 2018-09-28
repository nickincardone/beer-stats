const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08119&monet=true';
const upcUrl = 'https://www.kroger.com/products/api/products/details';
const cookie = 'ak_bmsc=7BD1B2AE93A8770E53589C76D372234748F6F70825630000E161AE5B54F20B1A~plkQjeOysouiVFQ9ZSoY9Cx9Q+xJwz1NL31fWHdmzg2xurcD77O7pkWJv0JubIsQ93VEC6ZX/pFCJnNNygSLK2SJEhKcOmHktZuYWiyAnAIR5MqAf40wERyHcs21qhh+zCAcK9m4Klgah+MRu6E2NCr4891kP9LABRU0xAggxwshS9oNVBtKN686AtN/lnZfIdZGtwXnUkXNa6LbUXUawPN02E/Hto2ZdNw2frxSEsT2Y=;';
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
  if (measure.includes('fl oz')) {
    return parseFloat(measure) * 29.5735;
  }
  if (measure.includes('mL')) {
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
