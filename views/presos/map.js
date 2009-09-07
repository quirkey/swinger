function(doc) {
  if (doc.type == "presentation") {
    emit(doc._id, doc);
  }
}