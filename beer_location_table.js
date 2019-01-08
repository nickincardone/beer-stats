class BeerLocationRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS beer_location (
        upc TEXT,
        locationId REAL,
        currentPrice REAL,
        regularPrice REAL)`;
    return this.dao.run(sql);
  }

  create(upc, locationId, currentPrice, regularPrice) {
    return this.dao.run(
      "INSERT INTO beers VALUES (?, ?, ?, ?)",
      [upc, locationId, currentPrice, regularPrice]);
  }
}

module.exports = BeerLocationRepository;