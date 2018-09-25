const AppDAO = require('./dao');
const BeerRepository = require('./beer_table');

async function main() {  
  const dao = new AppDAO('./database.sqlite3');
  const beerRepo = new BeerRepository(dao);
  await beerRepo.createTable();
  await beerRepo.create('bud light', 'description', '12 fl oz', '12345', 12.34, 14.39);
}

main();