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
        upc TEXT PRIMARY KEY,
        currentPrice REAL,
        regularPrice REAL)`;
    return this.dao.run(sql)
  }

  create(brand, description, size, upc, currentPrice, regularPrice) {
    return this.dao.run(
      'INSERT INTO beers (brand, description, size, upc, currentPrice, regularPrice) VALUES (?, ?, ?, ?, ?, ?)',
      [brand, description, size, upc, currentPrice, regularPrice])
  }
}

module.exports = BeerRepository;