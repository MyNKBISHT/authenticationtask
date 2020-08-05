const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/authapp", { useNewUrlParser: true });

app.use(
  require("express-session")({
    secret: "auth",
    resave: false,
    saveUninitialized: false,
  })
);

const bodyParser = require("body-parser");
User = require("./models/user");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/dashboard", function (req, res) {
  console.log(req.user.type);
  res.render("dashboard", { user: req.user });
});

//ROUTES
// app.get("/", function (req, res) {
//   res.render("home");
// });

app.get("/", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  console.log(req.body);
  User.register(
    new User({
      username: req.body.username,
      type: req.body.type,
    }),
    req.body.password,
    function (err, data) {
      if (err) {
        console.log(err);
        return res.render("register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/dashboard");
        });
      }
    }
  );
});

//LOGIN

app.get("/login", function (req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/register",
  }),
  function (req, res) {}
);

//LOGOUT

app.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/login");
});

app.listen(3000, function () {
  console.log("SERVER IS LISTENING TO PORT 3000");
});
