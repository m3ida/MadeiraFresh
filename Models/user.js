class User {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        type TEXT  NOT NULL,
        date_created DATETIME NOT NULL)`;
    return this.dao.query(sql);
  }

  create(name, email, password, salt) {
    return this.dao.query(
      'INSERT INTO users (name, email, password, salt, type, date_created) VALUES (?,?,?,?,?,?)',
      [name, email, password, salt, 'member', Date().toLocaleString()]
    );
  }

  getUserWithEmail(email) {
    return this.dao.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  getUser(email, password) {
    return this.dao.get(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
  }

  getUserById(id) {
    return this.dao.get('SELECT * FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;
