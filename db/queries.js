const pool = require("./pool");

async function queryAll() {
  const { rows } = await pool.query("SELECT * FROM users");
  return rows;
}

async function addUser(firstName, lastName, username, password) {
  await pool.query(
    "INSERT INTO users (firstName, lastName, username, password, status) VALUES ($1, $2, $3, $4, 'member')",
    [firstName, lastName, username, password]
  );
}
async function getMessages() {
  const result = await pool.query(
    "SELECT messages.txt, messages.sender, users.username, messages.sent, messages.id FROM messages JOIN users ON messages.sender = users.id"
  );
  console.log(result.rows);
  return result.rows;
}
async function queryInsertMessage(id, text) {
  const result = await pool.query(
    "INSERT INTO messages (sender,txt) VALUES ($1,$2) ",
    [id, text]
  );
  return result.rows;
}
async function updateToAdmin(id) {
  const result = await pool.query(
    "UPDATE users SET status = 'admin' WHERE id = $1",
    [id]
  );
  return result.rows;
}
async function queryMessageToDelete(id) {
  const result = await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  return result.rows;
}
module.exports = {
  queryAll,
  addUser,
  getMessages,
  queryInsertMessage,
  updateToAdmin,
  queryMessageToDelete,
};
