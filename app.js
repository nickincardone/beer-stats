const AppDAO = require('./dao');
const BeerRepository = require('./beer_table');
const Kroger = require('./kroger');

async function main() {  
  const dao = new AppDAO('./database.sqlite3');
  const beerRepo = new BeerRepository(dao);
  await beerRepo.createTable();
  let totalCount = await Kroger.getTotalCount();
  for (let i = 0; i < 48; i+=48) { // make second one length when ready
    let upcs = await Kroger.getUpcs(i);
    let beerInfoList = await Kroger.getUpcsInfo(upcs);
    for (beer of beerInfoList) {
      await beerRepo.create(beer.brand, beer.description, beer.size, beer.upc, beer.currentPrice, beer.regularPrice);
    }
  }
}

main();