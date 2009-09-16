function (newDoc, oldDoc, userCtx) {
  // !code lib/validate.js
  if (userCtx.roles.indexOf('_admin') == -1) {
    forbidden("Sorry, you must be logged in as an admin to save this " + newDoc.type);
  }
  // if (oldDoc == null) {
  //   return validate(newDoc);
  // }
  // 
  return true;
}