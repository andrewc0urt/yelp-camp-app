const User = require("../models/user");

// logic to render the user registration form
const getRegistrationForm = (req, res) => {
  res.render("users/register");
};

// logic to register a user after the user submits the registration form
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body.user;
    //   console.log(req.body.user);
    //   console.log(username, email, password);
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    // log the user in
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to YelpCamp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};

// logic to render the user login form
const getLoginForm = (req, res) => {
  res.render("users/login");
};

// logic to confirm the successful log in for a user (Passport's authenticate() handles the actual login process)
const confirmLogin = async (req, res) => {
  req.flash("success", `Welcome back, ${req.user.username}!`);
  // Now use res.locals.returnTo to redirect the user after login
  const redirectUrl = res.locals.returnTo || "/campgrounds";

  res.redirect(redirectUrl);
};

// logic to handle user logout functionality
const logoutUser = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You've successfully logged out!");
    res.redirect("/campgrounds");
  });
};

module.exports = { getRegistrationForm, registerUser, getLoginForm, confirmLogin, logoutUser };
