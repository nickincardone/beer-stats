const AppDAO = require('./dao');
const BeerRepository = require('./beer_table');
const Kroger = require('./kroger');
const BeerAdvocate = require('./beer');

async function main() {  
  const dao = new AppDAO('./database.sqlite3');
  const beerRepo = new BeerRepository(dao);
  await beerRepo.createTable();
  let totalCount = await Kroger.getTotalCount();
  for (let i = 0; i < totalCount; i+=48) { // make second one length when ready
    let upcs = await Kroger.getUpcs(i);
    let beerInfoList = await Kroger.getUpcsInfo(upcs);
    for (beer of beerInfoList) {
      try {
        await beerRepo.create(beer.brand, beer.description, beer.size, beer.sizeMl, beer.upc, beer.currentPrice, beer.regularPrice);
      } catch(e) {
        console.log(e);
      }
      try {
        baInfo = await BeerAdvocate.getBeer(beer.description);
        beerRepo.update(beer.upc, baInfo.ABV, baInfo.rating, baInfo.brewery, baInfo.style);
      } catch (E) {
        console.log(E);
      }
    }
  }
}

main();