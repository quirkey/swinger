;(function($) {
  
  $.easing.def = 'easeInOutCubic';
  
  var dbname = window.location.pathname.split('/')[1];
  var db     = $.couch.db(dbname); 
  
  var default_slide_scale = {width: 1280, height: 650};
  
  Preso = function(doc) {
    var default_doc = {
      name: "",
      slides: [],
      type: "presentation" 
    };
    this.database   = db;
    this.attributes = $.extend({}, default_doc, doc);
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
  
  Preso.all = function(success) {
    db.view('swinger/presos', Preso.mergeCallbacks({
      success: function(resp) {
        var presos = [];
        $.each(resp.rows, function(k, v) {
          presos.push(new Preso(v.value));
        });
        success(presos);
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
    var ratio = Math.floor((dimensions.width / default_slide_scale.width) * 100);
    $('.slide .content').css({"font-size": ratio + "%"});
  };
  
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
    
    var showdown = new Showdown.converter();
    
    var end_block_re = /^\s*@@@\s*$/;
    var start_block_re = /@@@\s([\w\d]+)/;
    
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
        var wrapped_callback = function(preso) {
          context.setUpLinksForPreso(preso);
          callback.apply(context, [preso]);
        }
        if (current_preso && current_preso.id() == this.params.id) {
          context.log('withCurrentPreso', 'using current', current_preso);
          wrapped_callback(current_preso);
        } else {
          Preso.find(this.params.id, function(p) {
            current_preso = p;
            context.log('withCurrentPreso', 'looked up and found', current_preso);
            wrapped_callback(current_preso);
          });
        }
      },
      highlightCode: function() {
        sh_highlightDocument('javascripts/shjs/lang/', '.min.js');
      },
      displaySlide: function() {
        var slide_id = parseInt(this.params.slide_id);
        // hide the nav
        $('.nav').hide();
        setSlidesCss();
        goToSlide(slide_id, 'fade');
        this.highlightCode();
        current_slide = slide_id;
      },
      drawSlidePreview: function(val) {
        // calculate dimensions
        var width = (windowDimensions().width / 2) - 40;
        var height = Math.floor((width * 0.75)); 
        $('.slide-edit .slide-preview .slide')
            .html(this.markdown(val))
            .css({width: width, height: height});
        this.highlightCode();
      },
      setUpLinksForPreso: function(preso) {
        $('[href="#/play"]')
          .attr('href', this.join('/','#', 'preso', preso.id(), 'display'));
      },
      markdown: function(text) {
        // includes special code block handling
        var new_text = [];
        var in_code_block = false;
        $.each(text.split(/[\n\r]/), function(i, line) {
          if (!in_code_block) {
            if (line.match(start_block_re)) {
              in_code_block = true;
              new_text.push(line.replace(start_block_re, "<pre class=\"sh_$1\"><code>"));
            } else {
              new_text.push(line);
            }
          } else {
            if (line.match(end_block_re)) {
              in_code_block = false;
              new_text.push("</code></pre>");
            } else {
              new_text.push("" + line);
            }
          }
        });
        return showdown.makeHtml(new_text.join("\n"));
      }
    });
    
    this.get('#/', function(e) {
      this.partial('templates/index.html.erb', function(t) {
        this.app.swap(t);
        Preso.all(function(presos) {
          e.presos = presos;
          e.partial('templates/_presos.html.erb', function(t) {
            $('#presos').html(t);
          });
        });
      });
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
        e.partial('templates/edit.html.erb', {slide: e.preso.slide(e.params.slide_id)}, function(t) {
          e.app.swap(t);
          e.drawSlidePreview($('.slide-edit textarea').val());
        });
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
      var e = this;
      e.withCurrentPreso(function(preso) {
        current_slide = current_slide || 1;
        e.redirect('#', 'preso', preso.id(), 'edit', current_slide);
      });
    });
    
    
    this.bind('run', function() {
      // load time
      var context = this;
      $('.slide-form textarea')
        // live preview of slide editing
        .live('keyup', function() {
          context.drawSlidePreview($(this).val());
        });
      
      $(document)
        .bind('keydown', function(e) {
          if ($('#display').length > 0 && display_keymap[e.which]) { // display is showing
            context.app.trigger(display_keymap[e.which], {id: $('#display').attr('rel')});
          }
        });
      
      $('#presos .preso')
        .live('click', function() {
          context.redirect('#', 'preso', $(this).attr('rel'), 'edit', 1);
        });
      
      $('.linked-button')
        .live('click', function(e) {
          e.preventDefault();
          context.redirect($(this).attr('rel'));
        });
      
      $(window).bind('resize', function() {
        if ($('#display').length > 0) {
          setSlidesCss();
        }
      });
        
    });
  });
  
  $(function() {
    app.run('#/');
  });

})(jQuery);