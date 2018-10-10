class AdvocateBeerRepository {  
  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS advocate_beers (
        advocate_id REAL PRIMARY KEY,
        kroger_name TEXT,
        advocate_name TEXT)`;
    return this.dao.run(sql)
  }

  create(advocateId, krogerName, advocateName) {
    return this.dao.run(
      'INSERT INTO advocate_beers VALUES (?, ?, ?)',
      [advocateId, krogerName, advocateName])
  }

  get(advocateName) {
    return this.dao.run(
      'select * from advocate_beers where advocate_name=?',
      [advocateName])
  }
}

module.exports = AdvocateBeerRepository;