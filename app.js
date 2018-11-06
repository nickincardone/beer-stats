const AppDAO = require('./dao');
const BeerRepository = require('./beer_table');
const AdvocateBeerRepository = require('./advocate_beer_table');
const Kroger = require('./kroger');
const BeerAdvocate = require('./beer');

async function main() {  
  const dao = new AppDAO('./database.sqlite3');
  const beerRepo = new BeerRepository(dao);
  const advocateBeerRepo = new AdvocateBeerRepository(dao);
  await beerRepo.createTable();
  await advocateBeerRepo.createTable();
  let totalCount = await Kroger.getTotalCount();
  for (let i = 0; i < totalCount; i+=48) { // make second one length when ready
    let upcs = await Kroger.getUpcs(i);
    let beerInfoList = await Kroger.getUpcsInfo(upcs);
    for (beer of beerInfoList) {
      try {
        await beerRepo.create(beer.brand, beer.description, beer.size, beer.sizeMl, beer.upc, beer.currentPrice, beer.regularPrice);
      } catch(e) {
        if (e.code !== "SQLITE_CONSTRAINT") throw e;
      }
      try {
        baInfo = await BeerAdvocate.getBeer(beer.description);
        if (baInfo == {}) continue;
        await beerRepo.update(beer.upc, baInfo.ABV, baInfo.rating, baInfo.brewery, baInfo.style);
        try {
          //TODO move this ahead of update if description is same don't call beer advocate
          await advocateBeerRepo.create(baInfo.beerId, beer.description, baInfo.beerName);
        } catch (e) {
            if (e.code !== "SQLITE_CONSTRAINT") {
              console.log("Problem with beer:" + beer.description);
              console.log(err)
            }
        }
      } catch (err) {
        console.log("Problem with beer:" + beer.description);
        console.log(err);
      }
    }
  }
}

main();