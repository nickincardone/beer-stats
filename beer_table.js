class BeerRepository {  
  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS beers (
        brand TEXT,
        description TEXT,
        size TEXT,
        sizeMl REAL,
        upc TEXT PRIMARY KEY,
        currentPrice REAL,
        regularPrice REAL,
        abv REAL,
        rating REAL,
        brewery TEXT,
        style TEXT)`;
    return this.dao.run(sql)
  }

  create(brand, description, size, sizeMl, upc, currentPrice, regularPrice) {
    return this.dao.run(
      'INSERT INTO beers VALUES (?, ?, ?, ?, ?, ?, ?, null, null, null, null)',
      [brand, description, size, sizeMl, upc, currentPrice, regularPrice])
  }

  update(upc, abv, rating, brewery, style) {
    return this.dao.run(
      'UPDATE beers set abv=?, rating=?, brewery=?, style=? where upc=?',
      [abv, rating, brewery, style, upc])
  }

  getIncompleteBeers() {
    return this.dao.run(
      'select description from beers where abv is null')
  }
}

module.exports = BeerRepository;