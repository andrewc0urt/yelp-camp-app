const isLoggedIn = (req, res, next) => {
  console.log(req.path, "------------", req.originalUrl);
  // use Passport's isAuthenticated to see if a user's logged in
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in to access this page.");
    return res.redirect("/login");
  }
  // otherwise, you're good to go, call next
  next();
};

// // This also works, just a different way of exporting. Must use const { isLogged In } when importing
// module.exports.isLoggedIn = (req, res, next) => {
//   // use Passport's isAuthenticated to see if a user's logged in
//   if (!req.isAuthenticated()) {
//     req.flash("error", "You must be signed in to access this page.");
//     return res.redirect("/login");
//   }
//   // otherwise, you're good to go, call next
//   next();
// };

// Middleware function to transfer the returnTo value from the session (req.session.returnTo) to the
// Express.js app res.locals objects before the passport.authenticate() is excuted in the /login route
// ultimately clearing the session after successful login
const storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports = { isLoggedIn, storeReturnTo };
