const AppDAO = require("./dao");
const BeerRepository = require("./beer_table");
const AdvocateBeerRepository = require("./advocate_beer_table");
const Kroger = require("./kroger");
const BeerAdvocate = require("./beer");

async function main() {
  const args = process.argv.slice(2);
  const dao = new AppDAO("./database.sqlite3");
  const beerRepo = new BeerRepository(dao);
  const advocateBeerRepo = new AdvocateBeerRepository(dao);

  //Create Tables if they don't exist
  await beerRepo.createTable();
  await advocateBeerRepo.createTable();

  //With retry param we want to just try beers that have failed in the past to get info from BA
  if (args.includes("retry")) {
    //TODO
    let incompleteBeerList = await beerRepo.getIncompleteBeers();
    for (incompleteBeer of incompleteBeerList) {
      let baInfo = await BeerAdvocate.getBeer(incompleteBeer.description);
      if (baInfo == {}) continue;
      console.log("good info on retry: " + incompleteBeer.description);
    }
    return;
  }

  //Otherwise we just want to grab all the available beers
  let totalCount = await Kroger.getTotalCount();
  for (let i = 0; i < totalCount; i += 48) {
    let upcs = await Kroger.getUpcs(i);
    let beerInfoList = await Kroger.getUpcsInfo(upcs);
    for (beer of beerInfoList) {
      try {
        await beerRepo.create(beer.brand, beer.description, beer.size, beer.sizeMl, beer.upc, beer.currentPrice,
          beer.regularPrice);
      } catch (e) {
        if (e.code !== "SQLITE_CONSTRAINT") throw e;
      }
      try { //TODO need to replicate incomplete loop above with this
        baInfo = await BeerAdvocate.getBeer(beer.description);
        if (baInfo == {}) continue;
        await beerRepo.update(beer.upc, baInfo.ABV, baInfo.rating, baInfo.brewery, baInfo.style);
        try {
          //TODO move this ahead of update if description is same don't call beer advocate
          await advocateBeerRepo.create(baInfo.beerId, beer.description, baInfo.beerName);
        } catch (e) {
          if (e.code !== "SQLITE_CONSTRAINT") {
            console.log("Problem with beer:" + beer.description);
            console.log(err);
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