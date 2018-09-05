const puppeteer = require('puppeteer');
const chrome = require('chrome-cookies-secure');
var data = {
        method: 'POST',
        headers : {'Cookie': ''}
      };
// used if you need to dynamically get cookie header
// ak_bmsc is cookie that you need
// chrome.getCookies('https://www.kroger.com/', 'header', function(err, cookies) {
//     data.headers.Cookie = cookies;
// });

function getJson(body) {
  let firstBrace = body.indexOf('pre-wrap;">') + 11;
  let lastBrace = body.indexOf('</pre>');
  return JSON.parse(body.slice(firstBrace, lastBrace));
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', interceptedRequest => {
      var data = {
          'method': 'POST',
          'headers': {'Cookie':'ak_bmsc=076D7F36E5EC6639F9666B4C37B009EB1704F19488790000DFCC8F5BC9DD6162~plExDr/37yxI8pWh5cynVyM9Ton2qNIZV3n+5D+dKmlxhLxPnCMxR0WY4pgTJNwmkvUi4mFktR2EOoRJ73vVwd5tMTOjxPXD2XDTwctzm5ty79QqMF1sHVXUTulcsNK8rJHvJxJ23vVgYJgWY/aHBSVrEKvicpIByEMfDDQwuW0MLU148llOsHxIDo3ez4YFHm/aq/ClM5bHVNCP1l28vlcWiDcdfifi7fE5wL89p/GP5641FH8cPDIMoVrb6evnSH;'}};
      interceptedRequest.continue(data);
  });
  await page.goto('https://www.kroger.com/search/api/searchAll?start=0&count=48&tab=0&taxonomyId=08&monet=true');
  page.content().then(function(results) {
    console.log(getJson(results));
  })

  await browser.close();
})();