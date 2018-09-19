const puppeteer = require('puppeteer');
const chrome = require('chrome-cookies-secure');
const request = require('request-promise');
var data = {
        method: 'POST',
        headers : {'Cookie': ''}
      };
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08&monet=true';
const upcUrl = 'https://www.kroger.com/products/api/products/details';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// used if you need to dynamically get cookie header
// ak_bmsc is cookie that you need
// chrome.getCookies('https://www.kroger.com/', 'header', function(err, cookies) {
//     console.log(cookies);
//     data.headers.Cookie = cookies;
// });

(async () => {
  let upcs = [];
  let options = {
    method: 'POST',
    headers: {
      'Cookie': 'ak_bmsc=4F1014A87C94F2382797AAC2645FF53FB83397441E5D0000745DA25B6EA7303A~plhzzsfox6fyE2APR7vccQU683At1bzBK0ZBZxYYQnJJ4yOi9WJvvCQ8w2RDml7GzBANUkKZ3hPAu4zUGaq0lPD5sWhTgQaaWopdcLA3Hk5833joIVAKt0kZJ2eYdiKStaAbFc9adJWxUw/hiyQg2B9FGlz1DL2jO/4PIXVITfheOvCBeOxrmxtlXFyfYxz4klTC0o00AxQpoH0REGMJ/ZSV35tBxlDI5PX0HmbxlBxOM=;'
    },
    uri: 'https://www.kroger.com/search/api/searchAll?start=0&count=48&tab=0&taxonomyId=08&monet=true',
    json: true,
    timeout: 20000
  }
  let results = await request(options);
  upcs=upcs.concat(results.upcs);
  console.log(upcs);

  let options2 = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'ak_bmsc=4F1014A87C94F2382797AAC2645FF53FB83397441E5D0000745DA25B6EA7303A~plhzzsfox6fyE2APR7vccQU683At1bzBK0ZBZxYYQnJJ4yOi9WJvvCQ8w2RDml7GzBANUkKZ3hPAu4zUGaq0lPD5sWhTgQaaWopdcLA3Hk5833joIVAKt0kZJ2eYdiKStaAbFc9adJWxUw/hiyQg2B9FGlz1DL2jO/4PIXVITfheOvCBeOxrmxtlXFyfYxz4klTC0o00AxQpoH0REGMJ/ZSV35tBxlDI5PX0HmbxlBxOM=;'
    },
    body: 
     { upcs: 
        [ '0001820053168',
          '0008066095615',
          '0001820053030',
          '0003410057306',
          '0001820053047',
          '0008312084207',
          '0001820025001',
          '0007089701331',
          '0063598554890',
          '0008066095757',
          '0008312084187',
          '0007199030030',
          '0001820000795',
          '0008312000282',
          '0008158401310',
          '0001820096715',
          '0007199031600',
          '0007289000016',
          '0078615000014',
          '0003410057636',
          '0001820000769',
          '0007199000048',
          '0001820006991',
          '0008312084017' ],
       filterBadProducts: true },
    uri: 'https://www.kroger.com/products/api/products/details',
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