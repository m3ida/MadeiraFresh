class Publication {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS publications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        validated TINYINT NOT NULL,
        lg FLOAT NOT NULL,
        lat FLOAT NOT NULL,
        date DATETIME NOT NULL,
        NO2 FLOAT,
        CO FLOAT,
        PM25 FLOAT,
        PM10 FLOAT,
        O3 FLOAT,
        SO2 FLOAT,
        user_id INT,
        CONSTRAINT publications_fk_id FOREIGN KEY (user_id)
          REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION)`;
    return this.dao.query(sql);
  }

  create(description, lg, lat, NO2, CO, PM25, PM10, O3, SO2, user_id) {
    return this.dao.query(
      'INSERT INTO publications (description, validated, lg, lat, date, NO2, CO, PM25, PM10, O3, SO2, user_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        description,
        0,
        lg,
        lat,
        Date().toLocaleString(),
        NO2,
        CO,
        PM25,
        PM10,
        O3,
        SO2,
        user_id,
      ]
    );
  }

  validate(pub_id) {
    return this.dao.run(
      `UPDATE publications
        SET validated = ?,
        WHERE id = ?`,
      [1, pub_id]
    );
  }

  getPublications() {
    return this.dao.all(
      'SELECT publications.id AS id, users.id AS users_id, name, description, NO2, PM25, PM10, O3, SO2, CO, date FROM publications LEFT JOIN users ON users.id = publications.user_id WHERE validated = 1 ORDER BY date DESC'
    );
  }

  getPublicationsNonValid() {
    return this.dao.all(
      'SELECT publications.id AS id, name, description, lat, lg FROM publications LEFT JOIN users ON users.id = publications.user_id WHERE validated = 0 ORDER BY date ASC'
    );
  }

  getPublicationsIdCoords() {
    return this.dao.all(
      'SELECT publications.id AS id, lg, lat FROM publications LEFT JOIN users ON users.id = publications.user_id WHERE validated = 1 ORDER BY date DESC LIMIT 20'
    );
  }

  deletePub(id) {
    return this.dao.query(`UPDATE publications SET validated=-1 WHERE id = ?`, [id])
  }

  validatePub(id) {
    return this.dao.query(`UPDATE publications SET validated=1 WHERE id = ?`, [id])
  }
}

module.exports = Publication;
