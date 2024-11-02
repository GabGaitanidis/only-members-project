const bcrypt = require("bcryptjs");
const db = require("../db/queries"); // Your database queries module
require("dotenv").config();
async function showAll(req, res, next) {
  try {
    const messages = await db.getMessages();
    res.render("index", { user: req.user, messages });
  } catch (err) {
    next(err);
  }
}

async function signUp(req, res, next) {
  try {
    const fname = req.body.firstname;
    const lname = req.body.lastname;
    const username = req.body.username;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await db.addUser(fname, lname, username, hashedPassword);
    res.redirect("/log-in");
  } catch (err) {
    next(err);
  }
}
async function displayForm(req, res) {
  res.render("messageForm");
}
async function addMessage(req, res) {
  const id = req.user.id;
  const text = req.body.text;
  await db.queryInsertMessage(id, text);
  res.redirect("/");
}
async function admin(req, res) {
  const adm = req.body.admin;
  const id = req.user.id;
  console.log(id);
  if (adm === process.env.ADMIN) {
    await db.updateToAdmin(id);
  }
  res.redirect("/");
}
async function deleteMessage(req, res) {
  const id = req.params.id;
  await db.queryMessageToDelete(id);
  res.redirect("/");
}
module.exports = {
  showAll,
  signUp,
  displayForm,
  addMessage,
  admin,
  s,
  deleteMessage,
};
