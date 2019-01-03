const sqlite3 = require("sqlite3");
const Promise = require("bluebird");

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      if (err) {
        console.log("Could not connect to database", err);
      } else {
        console.log("Connected to database");
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({id: this.lastID});
        }
      });
    });
  }

  selectAll(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log("Error running sql: " + sql);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = AppDAO;