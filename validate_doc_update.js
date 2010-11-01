function(newDoc, oldDoc, userCtx) {

  // !code lib/validate.js

  var is_admin = userCtx.roles.indexOf('_admin') != -1

  // not logged in
  if (!userCtx.name) {
    forbidden("Sorry, you must be logged in to save this " + newDoc.type);
  }
  log(newDoc);
  log(oldDoc);
  log(userCtx);

  // types we know about
  if (newDoc.type == 'presentation') {

    require(newDoc.user, "You must be logged in to edit or create presentations.");
    require(newDoc.name, "name is required.");

    if (!is_admin && (newDoc.user != userCtx.name || (oldDoc && oldDoc.user != userCtx.name))) {
      forbidden("Sorry, you can only edit your own presentations. Please fork this presentation to edit it.");
    }

  } else if (newDoc._deleted) {
    // deleting
    if ((oldDoc.user && oldDoc.user != userCtx.name) || !oldDoc.user) {
      forbidden("Sorry, you can only delete your own work.")
    }
  } else if (!is_admin) {
    forbidden("No can do. Only admins can save this " + newDoc.type);
  }


  return true;
};
