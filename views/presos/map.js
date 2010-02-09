function(doc) {
  if (doc.type == "presentation") {
    emit(doc.updated_at, doc);
  }
}