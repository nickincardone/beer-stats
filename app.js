const AppDAO = require("./dao");
const BeerRepository = require("./beer_table");
const AdvocateBeerRepository = require("./advocate_beer_table");
const Kroger = require("./kroger");
const BeerAdvocate = require("./beer");

let beerRepo;
let advocateBeerRepo;

async function main() {
  const args = process.argv.slice(2);
  const dao = new AppDAO("./database.sqlite3");

  beerRepo = new BeerRepository(dao);
  advocateBeerRepo = new AdvocateBeerRepository(dao);

  //Create Tables if they don't exist
  await beerRepo.createTable();
  await advocateBeerRepo.createTable();

  //With retry param we want to just try beers that have failed in the past to get info from BA
  if (args.includes("retry")) {
    await retryIncompleteBeers();
  } else {
    await getBeers();
  }
}

async function retryIncompleteBeers() {
  let incompleteBeerList = await beerRepo.getIncompleteBeers();
  for (let incompleteBeer of incompleteBeerList) {
    let baInfo = await BeerAdvocate.getBeer(incompleteBeer.description);
    if (baInfo.rating == undefined) continue; //couldn't get info from beer advocate
    await beerRepo.update(incompleteBeer.upc, baInfo.ABV, baInfo.rating, baInfo.brewery, baInfo.style);
    console.log("Successful retry: " + incompleteBeer.description);
  }
}

async function getBeers() {
  let totalCount = await Kroger.getTotalCount();
  for (let i = 0; i < totalCount; i += 48) {
    let upcs = await Kroger.getUpcs(i);
    let beerInfoList = await Kroger.getUpcsInfo(upcs);
    for (beer of beerInfoList) {
      await insertBeer(beer);
      await getBeerAdvocateDetails(beer);
      console.log("Inserted beer: " + beer.description);
    }
  }
}

async function insertBeer(beer) {
  try {
    await beerRepo.create(beer.brand, beer.description, beer.size, beer.sizeMl, beer.upc, beer.currentPrice,
      beer.regularPrice);
  } catch (e) {
    if (e.code !== "SQLITE_CONSTRAINT") throw e;
  }
}

async function getBeerAdvocateDetails(beer) {
  try {
    let baInfo = await BeerAdvocate.getBeer(beer.description);
    if (baInfo == {}) return;
    await beerRepo.update(beer.upc, baInfo.ABV, baInfo.rating, baInfo.brewery, baInfo.style);
    await insertAdvocateBeer(beer, baInfo);
  } catch (err) {
    console.log("Problem with beer:" + beer.description);
    console.log(err);
  }
}

async function insertAdvocateBeer(beer, baInfo) {
  try {
    await advocateBeerRepo.create(baInfo.beerId, beer.description, baInfo.beerName);
  } catch (e) {
    if (e.code !== "SQLITE_CONSTRAINT") {
      console.log("Problem with beer:" + beer.description);
      console.log(err);
    }
  }
}

main();