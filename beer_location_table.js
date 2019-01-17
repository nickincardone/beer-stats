class BeerLocationRepository {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS beer_location (
        upc TEXT,
        locationId INTEGER,
        currentPrice REAL,
        regularPrice REAL,
        PRIMARY KEY (upc, locationId))`;
    return this.dao.run(sql);
  }

  create(upc, locationId, currentPrice, regularPrice) {
    return this.dao.run(
      "INSERT INTO beer_location VALUES (?, ?, ?, ?)",
      [upc, locationId, currentPrice, regularPrice]);
  }
}

module.exports = BeerLocationRepository;