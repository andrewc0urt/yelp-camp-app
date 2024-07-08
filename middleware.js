const isLoggedIn = (req, res, next) => {
  // use Passport's isAuthenticated to see if a user's logged in
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in to access this page.");
    return res.redirect("/login");
  }
  // otherwise, you're good to go, call next
  next();
};

module.exports = isLoggedIn;

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
