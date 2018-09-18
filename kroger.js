const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08&monet=true';
const upcUrl = 'https://www.kroger.com/products/api/products/details';
const cookie = 'ak_bmsc=4F1014A87C94F2382797AAC2645FF53FB83397441E5D0000745DA25B6EA7303A~plhzzsfox6fyE2APR7vccQU683At1bzBK0ZBZxYYQnJJ4yOi9WJvvCQ8w2RDml7GzBANUkKZ3hPAu4zUGaq0lPD5sWhTgQaaWopdcLA3Hk5833joIVAKt0kZJ2eYdiKStaAbFc9adJWxUw/hiyQg2B9FGlz1DL2jO/4PIXVITfheOvCBeOxrmxtlXFyfYxz4klTC0o00AxQpoH0REGMJ/ZSV35tBxlDI5PX0HmbxlBxOM=;';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// used if you need to dynamically get cookie header
// ak_bmsc is cookie that you need
// chrome.getCookies('https://www.kroger.com/', 'header', function(err, cookies) {
//     console.log(cookies);
//     data.headers.Cookie = cookies;
// });



(async () => {
  let upcs = [];
  let results;
  let options = {
    method: 'POST',
    headers: {
      'Cookie': cookie
    },
    uri: krogerUrl.replace('<start>', 0),
    json: true,
    timeout: 20000
  }
  try {
    results = await request(options);
  } catch(e) {
    console.log(e);
    return;
  }
  
  upcs=upcs.concat(results.upcs);
  console.log(upcs);

  let options2 = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    },
    body: { 
      upcs: upcs,
      filterBadProducts: true 
    },
    uri: upcUrl,
    json: true,
    timeout: 20000
  }
  try {
    results = await request(options2);
    console.log(results);
  } catch (e) {
    console.log(e);
  }
})();