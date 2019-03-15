/**
 * GET /
 * Home page.
 */
exports.index = (req, res) => {
  if (req.user) {
    return res.redirect("/account");
  }
  return res.redirect("/signup");
  // res.render('home', {
  //   title: 'Home'
  // });
};
