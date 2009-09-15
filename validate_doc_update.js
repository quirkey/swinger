function (newDoc, oldDoc, userCtx) {
  if (userCtx.roles.indexOf('_admin') != -1) {
    return false;
  }
  // if (oldDoc == null) {
  //   return validate(newDoc);
  // }
  // throw {
  //   forbidden: "Invalid operation: existing messages cannot be modified."
  // };
  return true;
}