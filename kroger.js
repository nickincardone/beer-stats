const puppeteer = require('puppeteer');
const chrome = require('chrome-cookies-secure');
var data = {
        method: 'POST',
        headers : {'Cookie': ''}
      };
const krogerUrl = 'https://www.kroger.com/search/api/searchAll?start=<start>&count=48&tab=0&taxonomyId=08&monet=true'
// used if you need to dynamically get cookie header
// ak_bmsc is cookie that you need
// chrome.getCookies('https://www.kroger.com/', 'header', function(err, cookies) {
//     console.log(cookies);
//     data.headers.Cookie = cookies;
// });

function getJson(body) {
  let firstBrace = body.indexOf('pre-wrap;">') + 11;
  let lastBrace = body.indexOf('</pre>');
  return JSON.parse(body.slice(firstBrace, lastBrace));
}

(async () => {
  let upcs = [];
  let productCount = 0;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', interceptedRequest => {
      var data = {
          'method': 'POST',
          'headers': {'Cookie':'pid=29fd16c7-96c6-4c7e-a42d-f510ab0e375c; rxVisitor=1535680984428VJRUB9VUDP5NR7VQGOQT7JM1G4UIM1K7; _abck=005501C8207447C88930225F61431AD048F6F720234B0000699B885B5D212350~0~WKFQ7TMhEeRpB8ZAp4Ab84JI9/hMy6O437Y/9ziDARY=~-1~-1; s_vi=[CS]v1|2DC450F08507B5D7-6000010C400002F1[CE]; sid=48aaf35b-2357-aa55-51eb-843fa0ee26f6; AMCVS_371C27E253DB0F910A490D4E%40AdobeOrg=1; s_cc=true; check=true; sth_pid=29fd16c7-96c6-4c7e-a42d-f510ab0e375c; s_sq=%5B%5BB%5D%5D; dtSa=-; AKA_A2=A; bm_sz=0C7BE4254B6A7EA33E8B9FB8AAD91F22~QAAQIPf2SN+eE8ZlAQAAcFUZ0Y7TspHp90xOtNpnl9nHWS1h5rfkICcFbFtoMQk6DQoHtQajYh+PiFKT0vxpe5tUrRr4DJyxgvKyk4MRo2U57xVL4YEylYaKqoAEhfs5E7qJUYGlhMaCIDAs8m2J1pw0Lk06bBDUbu70xacKwXqhmnvikholQQjtvJaDiP0=; ak_bmsc=A384033C3B9D69A2A0EA90EAC43CBE1A48F6F720995D00009FE1995BB4444461~plriyBCQKEF3MmE7uSy14PgBCuO1wcWLWvy1Z1a3Z+0hBBoJnWoVwl3WWB33mlvFYBglm+f2uM1SMNWmMoHbN6DdwCl0oX2UfchpO7MkURsMapiUItOx6viY5+BkrMTtPUX5HHeJaOLNWzbEYbYH1O8aMRnW9GLj5B++sLSxmpCJHZlAA9IkUk93CrIgX/CmOnBDzIiLRp+xN9Mv/uhstddQkjQ5Dp05BaH/wqKMpphi1Ef8B4aaZnVo/u5PKdOMF4s0DNEX108Yb3Qfzn6v1z2MsMPABwmnd3Q+Zwx2NPIHc+4qpD/CBwbHIqhCwxkIMXjxnrL6YuxalSEWnZ3f783w==; AMCV_371C27E253DB0F910A490D4E%40AdobeOrg=-1891778711%7CMCIDTS%7C17788%7CMCMID%7C62742791279777117582112289443493613662%7CMCAAMLH-1537416184%7C7%7CMCAAMB-1537416184%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1536818584s%7CNONE%7CMCAID%7C2DC450F08507B5D7-6000010C400002F1%7CMCSYNCSOP%7C411-17782%7CvVersion%7C2.4.0; undefined_s=First%20Visit; __VCAP_ID__=89d906db-49f9-4563-7553-ebc0; DivisionID=011; StoreCode=00350; StoreZipCode=30342; StoreLocalName=Kroger; StoreAddress=4920 Roswell Rd, Atlanta, GA; StoreInformation=4920 Roswell Rd, Atlanta, GA,4048433080, 4048433225; mbox=PC#cf97967c4c5842f1962494eb83707c8f.28_64#1600056189|session#45eb42bc4df8417486e5205b4e19a6bc#1536813249; mboxEdgeCluster=28; dtLatC=1; dtPC=7$211384225_176h-vGPNNMHHEICKMHKFAFABLIONBGDBFBEKI; rxvt=1536813193208|1536811384352; s_nr=1536811394233-Repeat; s_ppvl=bn%253Ahome%2C78%2C38%2C864%2C1680%2C864%2C1680%2C1050%2C2%2CP; s_ppv=bn%253Asearch%253Aproducts%2C46%2C46%2C864%2C1680%2C864%2C1680%2C1050%2C2%2CP; XSRF-TOKEN=66dca7bb-eeae-4ad3-acdf-9d6b6ce513ac; bm_sv=B4527C123CAC5B866B0D6C668F48025A~wVLlEpIhA34+hC2Ly2qgxr+p3Zprw0Q40YYJaznqzpB4GpaFD5MKzFFI3mO2t1n1iBqL6Mqd+BjHHBhLRws3jxsXCaT1nWqXKny5E7iCsdHb2HtBStiIcbj+PXTL3Z5kN3fLTTmdT7KaE8YcC8hVCcUP199VqYZtszErvnvVdh0=; dtCookie=7$7BFC466706AA7C03380BC6923300222A|www.kroger.com+%281%29|1'}};
      interceptedRequest.continue(data);
  });
  await page.goto(krogerUrl.replace('<start>', 0));
  var results = await page.content();
  results = getJson(results);
  upcs=upcs.concat(results.upcs);
  productCount = results.productsInfo.totalCount;
  for (let i = 0; i < 200; i+=48) { //change 200 to productCount when ready
    await page.goto(krogerUrl.replace('<start>', i+1));
    var results = await page.content();
    results = getJson(results);
    upcs=upcs.concat(results.upcs);
  }

  console.log(upcs);

  await browser.close();
})();