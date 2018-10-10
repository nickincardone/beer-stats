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
  for (let i = 0; i < 48; i+=48) { // make second one length when ready
    let upcs = await Kroger.getUpcs(i);
    let beerInfoList = await Kroger.getUpcsInfo(upcs);
    for (beer of beerInfoList) {
      try {
        await beerRepo.create(beer.brand, beer.description, beer.size, beer.sizeMl, beer.upc, beer.currentPrice, beer.regularPrice);
      } catch(err) {
        //console.log(err);
      }
      try {
        baInfo = await BeerAdvocate.getBeer(beer.description);
        await beerRepo.update(beer.upc, baInfo.ABV, baInfo.rating, baInfo.brewery, baInfo.style);
        try {
          await advocateBeerRepo.create(baInfo.beerId, beer.description, baInfo.beerName);
        } catch (err) {
          console.log("Problem with beer:" + beer.description);
          console.log(err)
        }
      } catch (err) {
        console.log("Problem with beer:" + beer.description);
        console.log(err);
      }
    }
  }
}

main();