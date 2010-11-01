function(doc) {
  if (doc.type == "presentation" && doc.share) {
    emit(doc.updated_at, doc);
  }
}
