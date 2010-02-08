function(doc) {
  if (doc.type == "presentation" && doc.user) {
    emit(doc.user, doc);
  }
}