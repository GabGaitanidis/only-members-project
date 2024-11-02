const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const pgSession = require("connect-pg-simple")(session);
const pool = require("./db/pool");
const path = require("path");

const controls = require("./controllers/controls");
require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "cats",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

app.get("/", controls.showAll);
app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});
app.get("/send-message", controls.displayForm);
app.post("/send-message", controls.addMessage);
app.post("/sign-up", controls.signUp);
app.get("/log-in", (req, res) => {
  res.render("login");
});

app.post("/message/:id", controls.deleteMessage);
app.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
      if (err) {
          return next(err); 
      }
      if (!user) {
          return res.status(401).json({ message: info.message });
      }
      req.logIn(user, (err) => {
          if (err) {
              return next(err);
          }
          return res.json({ message: "Login successful!" }); 
      });
  })(req, res, next);
});

app.get("/admin", (req, res) => {
  res.render("admin");
});
app.post("/admin", controls.admin);
app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.listen(8080, () => console.log("App listening on port 8080!"));
