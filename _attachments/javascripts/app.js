;(function($) {
  
  var dbname = window.location.pathname.split('/')[1];
  var db     = $.couch.db(dbname); 
  
  Preso = function(doc) {
    var default_doc = {
      name: "",
      slides: [],
      type: "presentation" 
    };
    this.database   = db;
    this.attributes = $.extend(default_doc, doc);
  };
  
  Preso.default_callbacks = {
    success: function(resp) {
      Sammy.log('default success', resp);
    },
    error: function(resp) {
      Sammy.log('default error', resp);
    }
  };
    
  Preso.mergeCallbacks = function(callbacks) {
    return $.extend({}, Preso.default_callbacks, callbacks);
  };
  
  Preso.find = function(id, success) {
    db.openDoc(id, Preso.mergeCallbacks({
      success: function(resp) {
        var p = new Preso(resp);
        success.apply(p, [p]);
      }
    }));
  };
  
  $.extend(Preso.prototype, new Sammy.Object, {
    save: function(callback) {
      var self = this;
      this.database.saveDoc(this.attributes, Preso.mergeCallbacks({
        success: function(resp) {
          Sammy.log('preso.save', self, resp);
          $.extend(self.attributes, resp);
          if (callback) { callback.apply(self, [resp]); }
        }
      }));
    },
    slide: function(num) {
      if (this.attributes.slides[num]) {
        return this.attributes.slides[num];
      } else {
        return this.attributes.slides[num] = {
          content: "",
          transition: "",
          position: num
        };
      }
    }
  });
  
  var app = $.sammy(function() {
    this.debug = true;
    this.element_selector = '#container';
    
    this.helpers({
      markdown: function(text) {
        return new Showdown.converter().makeHtml(text);
      }
    })
    
    this.get('#/', function() {
      this.partial('templates/index.html.erb');
    });
    
    this.post('#/create', function(e) {
      // TODO: check for validity
      var preso = new Preso({name: this.params['name']});
      preso.save(function() {
        e.redirect('#/preso/' + this.attributes._id + "/edit/1");
      });
    });
    
    this.get('#/preso/:id/edit/:slide_id', function(e) {
      e.preso = null;
      Preso.find(this.params.id, function(loaded) { 
        e.log('preso.find', loaded);
        e.preso = loaded;
        e.partial('templates/edit.html.erb', {slide: e.preso.slide(e.params.slide_id)});
      });
    });
    
    
    this.bind('run', function() {
      // load time
      var context = this;
      $('.slide-form textarea')
        // live preview of slide editing
        .live('keyup', function() {
          $(this).parents('.slide-edit')
            .find('.slide-preview')
              .html(context.markdown($(this).val()));
        });
      
    });
  });
  
  $(function() {
    app.run('#/');
  });

})(jQuery);