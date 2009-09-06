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
    id: function() {
      return this.attributes['_id'];
    },
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
    slide: function(num, update) {
      var s;
      num = parseInt(num) - 1;
      if (this.attributes.slides[num]) {
        s = this.attributes.slides[num];
      } else {
        s = {
          content_html: "",
          content: "",
          transition: "",
          position: num + 1
        };
      }
      if (typeof update != 'undefined') {
        // do update
        this.attributes.slides[num] = $.extend(s, update);
      } else {
        return s;
      }
    },
    slides: function() {
      return this.attributes.slides;
    }
  });
  
  function windowDimensions() {
    return {
      width: $(window).width(),
      height: $(window).height()
    };
  }
  
  function setSlidesCss() {
    var dimensions = windowDimensions()
    $('#display').css(dimensions);
    $('.slide').css(dimensions);
  }
  
  function goToSlide(num, transition) {
    // slide left
    var dimensions   = windowDimensions();
    var total_slides = $('#slides .slide').length;
    switch(transition) {
      case 'fade':
        $('#slides .slide').css({top: '0px', left: '0px', opacity: 0, zIndex: 0}).removeClass('active');
        var $current = $('.slide.active'), $next = $slide(num);
        $current
          .css({opacity: 1, position:'absolute', top: '0px', left: '0px'})
          .animate({opacity: 0}, function() {
            $(this).css({position: 'static'});
          })
          .removeClass('active');
        $next
          .css({opacity: 0, position:'absolute', top: '0px', left: '0px', zIndex: 10})
          .animate({opacity: 1})
          .addClass('active');
      break;
      case 'slide-left':
      default:
        var total_width = total_slides * dimensions.width;
        $('#slides').css({width: total_width});
        var left = dimensions.width * (num - 1);
        $('#slides')
          .animate({marginLeft: -left + 'px'})
          .find('.slide')
            .removeClass('active');
        $slide(num).addClass('active');
    }
    // slide up
    // cross fade
  }
  
  function $slide(num) {
    return $('#slide-' + num);
  }
  
  var app = $.sammy(function() {
    this.debug = true;
    this.element_selector = '#container';
    
    var current_preso = false;
    var current_slide = 1;
    
    var display_keymap = {
      37: 'display-prevslide', // left arrow
      38: 'display-prevslide', // up arrow
      39: 'display-nextslide', // right arrow
      40: 'display-nextslide', // down arrow
      32: 'display-togglenav', // space
      27: 'display-exit' // esc
    };
        
    this.helpers({
      withCurrentPreso: function(callback) {
        var context = this;
        if (current_preso && current_preso.id() == this.params.id) {
          context.log('withCurrentPreso', 'using current', current_preso);
          callback.apply(context, [current_preso]);
        } else {
          Preso.find(this.params.id, function(p) {
            current_preso = p;
            context.log('withCurrentPreso', 'found', current_preso);
            callback.apply(context, [current_preso]);
          });
        }
      },
      displaySlide: function() {
        var slide_id = parseInt(this.params.slide_id);
        setSlidesCss();
        goToSlide(slide_id, 'fade');
        current_slide = slide_id;
      },
      markdown: function(text) {
        return new Showdown.converter().makeHtml(text);
      }
    });
    
    this.get('#/', function() {
      this.partial('templates/index.html.erb');
    });
    
    this.post('#/create', function(e) {
      // TODO: check for validity
      var preso = new Preso({name: this.params['name']});
      preso.save(function() {
        e.redirect('#', 'preso', this.attributes._id, 'edit', '1');
      });
    });
    
    this.get('#/preso/:id/edit/:slide_id', function(e) {
      e.withCurrentPreso(function(preso) {
        e.preso = preso;
        e.partial('templates/edit.html.erb', {slide: e.preso.slide(e.params.slide_id)});
      });
    });
    
    this.post('#/preso/:id/edit/:slide_id', function(e) {
      e.withCurrentPreso(function(preso) {
        preso.slide(e.params.slide_id, {
          content: e.params['content'], 
          content_html: e.markdown(e.params['content'])
        });
        preso.save(function(p) {
          var next_id = parseInt(e.params.slide_id) + 1;
          e.redirect('#', 'preso', this.attributes._id, 'edit', next_id);
        });
      });
    });
    
    this.get('#/preso/:id/display', function() {
      this.redirect('#', 'preso', this.params.id, 'display', '1');
    });
    
    this.get('#/preso/:id/display/:slide_id', function(e) {
      e.withCurrentPreso(function(preso) {
        e.preso = preso;
        // check if display has already been rendered
        if ($('#display[rel="'+ preso.id() + '"]').length > 0) {
          e.displaySlide();
        } else {
          e.partial('templates/display.html.erb', function(display) {
            e.$element().html(display);
            e.displaySlide();
          });
        }
      });
    });
    
    this.bind('display-nextslide', function() {
      var e = this;
      e.withCurrentPreso(function(preso) {
        var total_slides = preso.slides().length;
        e.log('total_slides', total_slides, 'current_slide', current_slide);
        if (current_slide && (current_slide + 1) <= total_slides) {
          current_slide += 1
        } else {
          // just go to first slide
          current_slide = 1;
        }
        e.redirect('#', 'preso', preso.id(), 'display', current_slide);
      });
    });
    
    this.bind('display-prevslide', function() {
      var e = this;
      e.withCurrentPreso(function(preso) {
        var total_slides = preso.slides().length;
        e.log('total_slides', total_slides, 'current_slide', current_slide);
        if (current_slide && (current_slide - 1) >= 1) {
          current_slide -= 1
        } else {
          // just go to first slide
          current_slide = total_slides;
        }
        e.redirect('#', 'preso', preso.id(), 'display', current_slide);
      });
    });
    
    this.bind('display-togglenav', function() {
      
    });
    
    this.bind('display-exit', function() {
      
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
      
      $(document)
        .bind('keydown', function(e) {
          if ($('#display').length > 0 && display_keymap[e.which]) { // display is showing
            context.app.trigger(display_keymap[e.which], {id: $('#display').attr('rel')});
          }
        });
      
    });
  });
  
  $(function() {
    app.run('#/');
  });

})(jQuery);