const chrome = require("chrome-cookies-secure");
const request = require("request-promise");
const krogerUrl = "https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08119&monet=true"; //08145 craft 08119 beer
const upcUrl = "https://www.kroger.com/products/api/products/details";
const cookie = "ak_bmsc=EBAA04D681F8F0B57801B44F67E1181948F6F720077A00007F15305C86AD8B0D~pl8kcpT+kJB+yzf2DAA6ZJs3p8lrl/FZa53Vmjnam3yLG+CGEwr67wdtNkNvFB1ujG8D3Ey9QjFqoe4qNzAtQfXTS5IhWmvphg4o+dWTDBnB7wR+Tqy8XbPE05IjklDIWw6s6aQsa86LB48KpD+aMyx2h2ThMQJcDtjQIxaNSANKCrhGUv9ELgE492xMRTmeZ062OY9IjS2JxclTnZugNPRuus6ekqRT++duVdEHslUrQ=;";
let options = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Cookie": cookie,
    "division-id": "035",
    "store-id": "00917" //need to find division and store with beer prices
  },
  json: true,
  timeout: 20000
};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function translateSize(sizeDescription) {
  let stringSplit = sizeDescription.split("/");
  if (stringSplit.length === 1) return convertUnit(sizeDescription);
  return parseInt(stringSplit[0]) * convertUnit(stringSplit[1]);
}

function convertUnit(measure) {
  if (measure.toLowerCase().includes("fl oz")) {
    return parseFloat(measure) * 29.5735;
  }
  if (measure.toLowerCase().includes("oz")) {
    return parseFloat(measure) * 29.5735;
  }
  if (measure.toLowerCase().includes("pt")) {
    return parseFloat(measure) * 568.261;
  }
  if (measure.toLowerCase().includes("ml")) {
    return parseFloat(measure);
  }
  console.log("Measure not accounted for: " + measure);
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
  };
}

async function getTotalCount() {
  options.uri = krogerUrl.replace("<start>", 0);
  let results = await request(options);
  return results.productsInfo.totalCount;
}

async function getUpcs(startIndex) {
  options.uri = krogerUrl.replace("<start>", startIndex);
  let results = await request(options);
  return results.upcs;
}

async function getUpcsByLocation(startIndex, location) {
  options.headers["division-id"] = location[0];
  options.headers["store-id"] = location[1];
  options.uri = krogerUrl.replace("<start>", startIndex);
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

async function getUpcsInfoByLocation(upcs, location) {
  options.headers["division-id"] = location[0];
  options.headers["store-id"] = location[1];
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
module.exports.options = options;
