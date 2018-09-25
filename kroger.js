const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08&monet=true';
const upcUrl = 'https://www.kroger.com/products/api/products/details';
const cookie = 'ak_bmsc=7FCBC708FDF952D5BBFB1F037EEA0C0948F6F720FC3A000084A6A95B5794426E~pl32wXGVOevq6EZkfu9iTXFHVJ21vEEK4kEdzLR0JU/CC4LR4BSBOrxpuUNk/57VTPwiMsP9XWH5y2Py+0+Q3TcckwKH9B02G3faDSyr0RiZGNJxOlc6/7EZAsZPgYcblOgFPIPVHqYOCq3yuiXOcrgsUDWKxX78Z0xZr5BS/cX48rEbehLuUBxdsg8L30hkcy0gKTllRLk1428hcBY3wJTTlGWPOL4yZpOOZl5P1tfSc=;';
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
// used if you need to dynamically get cookie header
// ak_bmsc is cookie that you need
// chrome.getCookies('https://www.kroger.com/', 'header', function(err, cookies) {
//     console.log(cookies);
//     data.headers.Cookie = cookies;
// });

async function getUpcs(startIndex) {
  options.uri = krogerUrl.replace('<start>', startIndex);
  let results = await request(options);
  return results.upcs;
}

function createBeerObject(product) {
  return {
    brand: product.brandName,
    description: product.description,
    size: product.customerFacingSize,
    currentPrice: product.calculatedPromoPrice,
    regularPrice: product.calculatedRegularPrice
  }
}


(async () => {
  let upcs = [];
  let totalCount = 0;
  let results;
  options.uri = krogerUrl.replace('<start>', 0);
  try {
    results = await request(options);
  } catch(e) {
    console.log(e);
    return;
  }
  
  upcs=upcs.concat(results.upcs);
  totalCount=results.productsInfo.totalCount;

  // for use when you are ready to iterate over everything
  // for (let i = 49; i < totalCount; i += 48) {
  //   upcs=upcs.concat(getUpcs(i));
  // }

  options.uri = upcUrl;
  options.body = { 
    upcs: upcs,
    filterBadProducts: true 
  };
  try {
    results = await request(options);
  } catch (e) {
    console.log(e);
  }

  for (let i = 0; i < results.products.length; i++) {
    console.log(createBeerObject(results.products[i]));
  }
})();