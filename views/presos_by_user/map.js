function(doc) {
  if (doc.type == "presentation" && doc.user) {
    emit([doc.user, doc.updated_at], doc._id);
  }
}
