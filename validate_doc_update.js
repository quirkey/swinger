function (newDoc, oldDoc, userCtx) {
  if (userCtx.roles.indexOf('_admin') != -1) {
    return;
  }
  throw {
    forbidden: "Invalid operation: existing messages cannot be modified."
  };
}