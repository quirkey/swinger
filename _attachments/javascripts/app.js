;(function($) {
  
  var dbname = window.location.pathname.split('/')[1];
  var db     = $.couch.db(dbname); 
  
  Presentation = function(doc) {
    var default_doc = {
      name: "",
      slides: [],
      type: "presentation" 
    };
    this.database   = db;
    this.attributes = $.extend(default_doc, doc);
  };
  
  Presentation.defaultCallbacks = {
    success: function(resp) {
      $.log('default successw')
    }
  }
  
  $.extend(Presentation.prototype, {
    save: function(callback) {
      this.database.saveDoc(this.attributes, {
        success: function(resp) {
          console.log('save success', resp);
          $.extend(this.attributes, resp);
          callback.apply(this, [resp]);
        }
      });
    }
  });
  
  var app = $.sammy(function() {
    this.debug = true;
    this.element_selector = '#container';
    
    this.get('#/', function() {
      this.partial('templates/index.html.erb');
    });
    
  });
  
  $(function() {
    app.run('#/');
  });

})(jQuery);