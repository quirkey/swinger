function(newDoc, oldDoc, userCtx) {

  // !code lib/validate.js

  // not logged in
  if (!userCtx.name) {
    forbidden("Sorry, you must be logged in to save this " + newDoc.type);
  }

  // types we know about
  if (newDoc.type == 'presentation') {
    
    require(newDoc.user, "You must be logged in to edit or create presentations.");
    require(newDoc.name, "name is required.");
    
    if (newDoc.user != userCtx.name || (oldDoc && oldDoc.user != userCtx.name)) {
      forbidden("Sorry, you can only edit your own presentations. Please fork this presentation to edit it.");
    }

  } else if (userCtx.roles.indexOf('_admin') == -1) {
    forbidden("No can do. Only admins can save this " + newDoc.type);
  }


  return true;
};
