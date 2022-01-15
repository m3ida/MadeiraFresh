class Comment {
  constructor(dao) {
    this.dao = dao;
  }

  createTable() {
    const sql = `CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date_created DATETIME NOT NULL,
          comment TEXT NOT NULL,
          user_id INT,
          publication_id INT,
        CONSTRAINT comments_fk_id1 FOREIGN KEY (user_id)
          REFERENCES users(id) ON UPDATE NO ACTION ON DELETE NO ACTION,
        CONSTRAINT comments_fk_id2 FOREIGN KEY (publication_id)
          REFERENCES publications(id) ON UPDATE NO ACTION ON DELETE NO ACTION)`;
    return this.dao.query(sql);
  }

  create(comment, user_id, pub_id) {
    return this.dao.query(
      'INSERT INTO comments (date_created, comment, user_id, publication_id) VALUES (?,?,?,?)',
      [Date().toLocaleString(), comment, user_id, pub_id]
    );
  }

  getCommentsFromPublicationWithId(id) {
    return this.dao.all(
      'SELECT comments.date_created AS date_created, comment, publication_id, name FROM comments LEFT JOIN users ON comments.user_id = users.id WHERE publication_id = ? ORDER BY date_created ASC',
      [id]
    );
  }
}

module.exports = Comment;
