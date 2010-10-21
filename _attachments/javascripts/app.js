;(function($) {

  $.easing.def = 'easeInOutCubic';
  $.fn.tabby.defaults.tabString = "  ";

  $.fn.center = function() {
    var dimensions = windowDimensions();
    $(this).each(function() {
      $(this).css({
        top: Math.floor((dimensions.height / 2) - $(this).outerHeight()),
        left: Math.floor((dimensions.width / 2) - $(this).outerWidth())
      });
    });
    return this
  };

  var dbname = window.location.pathname.split('/')[1] || 'swinger',
      db     = $.couch.db(dbname),
      default_slide_scale = {width: 1280, height: 650},
      window_dimensions;

  var showdown = new Showdown.converter();

  var end_block_re = /^\s*@@@\s*$/;
  var start_block_re = /@@@\s([\w\d]+)\s*/;

  var show_instructions = true;

  function markdown(text) {
    // includes special code block handling
    var new_text = [],
        prev = '',
        in_code_block = false;
    $.each(text.split(/[\n\r]/), function(i, line) {
      if (!in_code_block) {
        if (line.match(start_block_re)) {
          in_code_block = true;
          prev = line.replace(start_block_re, "<pre class=\"prettyprint lang-$1\"><code>");
        } else {
          new_text.push(line);
        }
      } else {
        if (line.match(end_block_re)) {
          in_code_block = false;
          new_text.push("</code></pre>");
        } else {
          new_text.push(prev + line.replace(/</g,"&lt;").replace(/>/g,"&gt;"));
          prev = '';
        }
      }
    });
    return showdown.makeHtml(new_text.join("\n"));
  };

  function windowDimensions(force) {
    window_dimensions = (!force && window_dimensions) ? window_dimensions : {
      width: $(window).width(),
      height: $(window).height()
    };
    return window_dimensions;
  };

  function timestamp() {
    return Math.round(new Date().getTime() / 1000);
  }

  function preloadImages() {
    var d=document;
    Sammy.log('preloadImages', arguments);
    if(d.images){
      if(!d.MM_p) d.MM_p=new Array();
      var i,j=d.MM_p.length,a=arguments;
      for(i=0; i<a.length; i++) {
        if (a[i].indexOf("#")!=0) {
          d.MM_p[j]=new Image;
          d.MM_p[j++].src=a[i];
        }
      }
    }
  };

  function showNotification(status, message) {
    var $notification = $('#inline-notification');
    $notification
      .attr('class', 'notification')
      .addClass(status)
      .find('.message')
        .html(message).end()
      .find('button').one('click', function() {
        $(this).parent().slideUp(200);
      }).end()
      .slideDown(400);
    setTimeout(function() {
      $notification.slideUp();
    }, 6000)
  };


  User = {
    _current_user: false,
    isLoggedIn: function() {
      return !!this._current_user;
    },
    current: function(callback, force) {
      var user = this;
      if (!this._current_user || force === true) {
        $.couch.session({
          success: function(session) {
            if (session.userCtx && session.userCtx.name) {
              user._current_user = session.userCtx;
              callback(user._current_user);
            } else {
              user._current_user = false;
              callback(false);
            }
          }
        });
      } else {
        callback(user._current_user);
      }
    },
    login: function(name, password, callback) {
      $.couch.login({
        name : name,
        password : password,
        success: function() {
          User.current(callback, true);
        },
        error: function(code, error, reason) {
          showNotification('error', reason);
        }
      });
    },
    logout: function(callback) {
      var user = this;
      $.couch.logout({
        success: function() {
          user._current_user = false;
          callback();
        },
        error: function(code, error, reason) {
          showNotification('error', reason);
        }
      });
    },
    signup: function(name, email, password, callback) {
      $.couch.signup({name: name, email: email}, password, {
        success: function() {
          User.login(name, password, callback);
        },
        error: function(code, error, reason) {
          showNotification('error', reason);
        }
      })
    }
  };


  Preso = function(doc) {
    var default_doc = {
      name: "",
      slides: [],
      type: "presentation",
      share: true
    };
    this.database   = db;
    this.attributes = $.extend({}, default_doc, doc);
  };

  Preso.default_callbacks = {
    success: function(resp) {
      Sammy.log('default success', resp);
    },
    error: function(status, error, reason) {
      Sammy.log('default error', arguments);
      showNotification('error', reason);
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
      },
      error: function(status, error, reason) {
        showNotification('error', "Sorry, the presentation you were looking for can't be found.");
        window.location.hash = '#/'
      }
    }));
  };

  Preso.all = function(success) {
    db.view('swinger/presos', Preso.mergeCallbacks({
      descending: true,
      success: function(resp) {
        var presos = [];
        $.each(resp.rows, function(k, v) {
          presos.push(new Preso(v.value));
        });
        success(presos);
      }
    }));
  };

  Preso.byUser = function(name, success) {
    db.view('swinger/presos_by_user', Preso.mergeCallbacks({
      startkey: [name, "a"],
      endkey: [name, null],
      descending: true,
      include_docs: true,
      success: function(resp) {
        var presos = [];
        $.each(resp.rows, function(k, v) {
          presos.push(new Preso(v.doc));
        });
        Sammy.log(name, presos);
        success(presos);
      }
    }));
  };

  $.extend(Preso.prototype, new Sammy.Object, {
    id: function() {
      return this.attributes['_id'];
    },
    uri: function() {
      return [this.database.uri, this.id()].join('');
    },
    reload: function(callback) {
      var preso = this;
      Preso.find(this.id(), function(p) {
        $.extend(preso.attributes, p.attributes);
        callback.apply(this, [preso]);
      });
    },
    save: function(callback) {
      var self = this;
      this.attributes.updated_at = timestamp();
      this.database.saveDoc(this.attributes, Preso.mergeCallbacks({
        success: function(resp) {
          Sammy.log('preso.save', self, resp);
          $.extend(self.attributes, {id: resp['id'], rev: resp['rev']});
          if (callback) { callback.apply(self, [resp]); }
        }
      }));
    },
    destroy: function(callback) {
      var self = this;
      this.database.removeDoc(this.attributes, Preso.mergeCallbacks({
        success: function(resp) {
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
          theme: this.attributes.theme || 'basic',
          additional_css: "",
          position: num + 1,
          next_on_list: true
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


  Slide = function(selector) {
    this.selector = selector;
    this.$element  = $(selector);
  };

  $.extend(Slide.prototype, {
    goTo: function(num, transition) {
      // slide left
      var dimensions   = windowDimensions();
          total_slides = this.$element.length,
          slide = this;

      switch(transition) {
        case 'fade':
          this.$element.css({top: '0px', left: '0px', opacity: 0, zIndex: 0}).removeClass('active');
          var $current = this.$element.filter('.active'),
              $next = this.$slide(num);

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
          var total_width = total_slides * dimensions.width;
          $('#slides').css({width: total_width});
          var left = dimensions.width * (num - 1);
          $('#slides')
            .animate({marginLeft: -left + 'px'})
            .find('.slide')
              .removeClass('active');
          this.$slide(num).addClass('active');
        break;
        default: //switch
          Sammy.log('switch', num, slide.$slide(num)[0]);
          slide.$element.filter('.active').hide().removeClass('active');
          slide.$slide(num).addClass('active').show();
        break;
      }
    },
    setContent: function(content) {
      // Sammy.log('setContent', content, this.$element.find('.content'));
      this.$element.find('.content').html(content);
    },
    setTheme: function(theme) {
      this.$element.attr('class', 'slide active').addClass(theme);
    },
    setContentRatio: function(dimensions, attempts) {
      if (!dimensions) dimensions = windowDimensions();
      if (!attempts) attempts = 1;
      var slide = this,
          ratio = Math.floor((dimensions.width / default_slide_scale.width) * 100);
      // Sammy.log('setContentRatio', dimensions, ratio);
      this.$element
        .find('.content').css({fontSize: ratio + "%"})
        .find('img').each(function() {
          var initial_width, new_width;
          if ($(this).data('originalWidth')) {
            initial_width = $(this).data('originalWidth');
          } else {
            initial_width = $(this).width();
            if (initial_width <= 0 && attempts < 3) {
              setTimeout(function() {
                slide.setContentRatio(dimensions, attempts + 1);
              }, 100 * attempts);
              return false;
            }
            $(this).data('originalWidth', initial_width);
          }
          new_width = initial_width * (ratio / 100);
          // Sammy.log('set img width', initial_width, 'ratio', ratio, 'new_width', new_width);
          if (new_width > 0) { $(this).css('width', new_width + "px"); }
        });
    },
    setCSS: function(dimensions) {
      if (!dimensions) dimensions = windowDimensions();
      $('#display').css(dimensions);
      var slide = this;
      // Sammy.log('setCSS', dimensions);
      this.$element.css(dimensions);
      $('#navigation').css({width: dimensions.width});
      slide.setContentRatio(dimensions);
      slide.highlightCode();
      slide.setVerticalAlignment(dimensions);
    },
    setVerticalAlignment: function(dimensions) {
      var $content       = this.$element.filter('.active').find('.content'),
          content_height = $content.height(),
          margin = Math.floor((dimensions.height - content_height) / 2);
      // Sammy.log('height', dimensions.height, 'content_height', content_height, 'margin', margin);
      if (margin > 0) { $content.css({marginTop: margin + "px"}); }
    },
    highlightCode: function() {
      prettyPrint();
    },
    drawPreview: function(val) {
      // to prevent constant updates
      var slide = this;
      if (slide.redraw_timeout) {
        clearTimeout(slide.redraw_timeout);
      }
      slide.redraw_timeout = setTimeout(function() {
        // calculate dimensions
        var width_offset = $('.slide-sort').is(':visible') ? 265 : 40,
            width = ((windowDimensions().width - width_offset) / 2),
            height = Math.floor((width * 0.75)),
            dimensions= {width: width, height: height};
        slide.setContent(markdown(val));
        slide.setCSS(dimensions);
      }, 200);
    },
    $slide: function(num) {
      return this.$element.filter('#slide-' + num);
    }
  });

  var app = $.sammy('#container', function() {
    this.use(Sammy.Template);
    this.use(Sammy.NestedParams);
    this.use(Sammy.Form);
    this.use(Sammy.Title);

    this.setTitle('// Swinger //');

    this.debug = true;
    this.template_engine = 'template';

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


    function showLoader() {
      var dimensions = windowDimensions()
      $('#modal-loader').css({
        top: Math.floor((dimensions.height / 2) - 100),
        left: Math.floor((dimensions.width / 2) - 100)
      });
      $('#modal-loader').show();
    };

    function hideLoader() {
      $('#modal-loader').hide();
    };

    this.swap = function(newcontent) {
      hideLoader();
      this.$element().html(newcontent);
    };

    this.helpers({
      themes: [
        'basic',
        'nakajima',
        'quirkey',
        'nakajima-black',
        'sammy',
        'pb'
      ],
      transitions: [
        'switch',
        'fade',
        'slide-left'
      ],
      markdown: markdown,
      showLoggedIn: function(userCtx) {
        if (userCtx && userCtx.name) {
          $('.user-nav')
            .find('.guest').hide().end()
            .find('.logged-in')
              .show()
              .find('span')
                .text('Logged in as ' + userCtx.name).end();
        } else {
          $('.user-nav')
            .find('.logged-in').find('span').text('').hide().end()
            .find('.guest').show().end()
        }
      },
      isLoggedInAs: function(username) {
        return User.isLoggedIn() && User._current_user.name == username;
      },
      showNav: function() {
        $('.nav, .user-nav, #footer').show().find('.preso-links').hide();
      },
      hideNav: function() {
        $('.nav, .user-nav, #footer').hide();
      },
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
            // preload the preso attachments
            if (p.attributes._attachments) {
              var attachment_urls = [];
              $.each(p.attributes._attachments, function(k, v) {
                if (k.match(/(jpg|gif|png|bmp)$/)) {
                  attachment_urls.push([p.uri(), k].join('/'));
                }
              });
              preloadImages.apply(preloadImages, attachment_urls);
            }
            wrapped_callback(current_preso);
          });
        }
      },
      displaySlide: function(slide) {
        var display_slide = new Slide('#display .slide');
        display_slide.goTo(slide.position, slide.transition);
        display_slide.setCSS();
        current_slide = slide.position;
        if (slide.next_on_list) {
          display_slide.$element
            .filter('.active')
              .find('li').addClass('notviewed');
        }
        // set the jump input
        $('.jump input[name="num"]').val(current_slide);
      },
      setUpLinksForPreso: function(preso) {
        var context = this;
        $('.preso-name').text(preso.attributes.name);
        $('.nav a.preso-link').each(function() {
          var meth = $(this).attr('rel');
          $(this).attr('href', context.join('/','#', 'preso', preso.id(), meth));
        });
        $('.preso-links').show();
      },
      possiblyShowInstructions: function() {
        if (show_instructions === true) {
          show_instructions = setTimeout(function() {
            $('#display-instructions').slideDown();
          }, 5000);
        }
      },
      hideInstructions: function() {
        this.log('hideInstructions', show_instructions);
        if (show_instructions !== true) {
          clearInterval(show_instructions);
          $('#display-instructions').hide();
        }
        show_instructions = false;
      }
    });

    this.around(function(callback) {
      var context = this;
      User.current(function(user) {
        context.showLoggedIn(user);
        callback();
      });
    });

    this.before({only: /\#\/(create|new|preso\/([^\/]+)\/edit)$/}, function() {
      if (!User.isLoggedIn()) {
       showNotification('error', 'Sorry, please login or signup to create a presentation.');
       this.app.last_location_before_redirect = this.path;
       this.redirect('#/login');
       return false;
      }
    });

   this.before({except: /display/}, function() {
     this.showNav();
   });

    this.get('#/', function(e) {
      this.title('Welcome');
      showLoader();
      this.partial('templates/index.html.erb', function(t) {
        this.app.swap(t);
        if (User.isLoggedIn()) {
          Preso.byUser(User._current_user.name, function(presos) {
            e.partial('templates/_presos.html.erb', {presos: presos}, function(p) {
              $('#presos').html(p).append('<div class="clear">');;
              new Slide('#presos .slide').setCSS({width: 300, height: 300});
            });
          })
        } else {
          $('.user-presos').hide();
        }
        Preso.all(function(presos) {
          e.partial('templates/_presos.html.erb', {presos: presos}, function(p) {
            $('#all-presos').html(p).append('<div class="clear">');
            new Slide('#all-presos .slide').setCSS({width: 300, height: 300});
          });
        });
      });
    });

    this.get('#/login', function(e) {
      this.title('Login')
      e.partial('templates/login.html.erb');
    });

    this.post('#/login', function(e) {
      User.login(this.params['name'], this.params['password'], function(user) {
        showNotification('success', 'Thanks for logging in, ' + user.name + '!');
        e.log('last', e.app.last_location_before_redirect);
        e.redirect(e.app.last_location_before_redirect || '#/');
        e.app.last_location_before_redirect = null;
      })
    });

    this.get('#/logout', function(e) {
      User.logout(function() {
        e.showLoggedIn(false);
        showNotification('success', "You've successfully logged out. Come back again soon!");
        e.redirect('#/');
      })
    });

    this.post('#/signup', function(e) {
      // validate
      if (this.params.has('name') &&
          this.params.has('email') &&
          this.params.has('password') &&
          this.params.has('password_confirmation') &&
          this.params['password'] === this.params['password_confirmation']) {

        // create
        User.signup(this.params['name'], this.params['email'], this.params['password'], function() {
          showNotification('success', 'Thanks for signing up! You can start making presentations now.');
          e.redirect(e.app.last_location_before_redirect || '#/');
          e.app.last_location_before_redirect = null;
        });
      } else {
        showNotification('error', 'Please fill out the entire form.');
        this.redirect('#/login');
        // invalid
      }
    });

    this.get('#/new', function(e) {
      this.title('New Presentation')
      this.partial('templates/form.html.erb', {preso: new Preso(), form_action: '#/create'}, function(html) {
        this.app.swap(html);
        new Slide('.slide').setCSS({width: 150, height: 150});
      });
    });

    this.post('#/create', function(e) {
      var preso = new Preso($.extend({}, e.params['preso'], {user: User._current_user.name}));
      preso.save(function() {
        showNotification('success', 'Your presentation has been created');
        e.redirect('#', 'preso', this.attributes._id, 'edit', '1');
      });
    });

    this.get('#/preso/:id/edit', function(e) {
      showLoader();
      e.withCurrentPreso(function(preso) {
        this.title('Editing Presentation', preso.attributes.name);
        e.preso = preso;
        e.partial('templates/form.html.erb', {form_action: '#/preso/' + preso.id() +'/edit'}, function(html) {
          e.app.swap(html);
          new Slide('.slide').setCSS({width: 150, height: 150});
        });
      });
    });

    this.post('#/preso/:id/edit', function(e) {
      showLoader();
      e.withCurrentPreso(function(preso) {
        e.log('update params', e.params['preso']);
        $.extend(preso.attributes, e.params['preso']);
        preso.save(function() {
          showNotification('success', 'Your presentation has been updated');
          e.redirect('#', 'preso', this.attributes._id, 'edit', '1');
        });
      });
    });

    this.get('#/preso/:id/delete', function(e) {
      e.withCurrentPreso(function(preso) {
        if (confirm('Are you sure you want to delete this presentation? There is no undo.')) {
          preso.destroy(function() {
            showNotification('success', 'Your presentation has been deleted.');
            e.redirect('#/');
          })
        } else {
          alert('OK. No action taken.');
          e.redirect('#', 'preso', preso.id(), 'edit');
        }
      });
    })

    this.get('#/preso/:id/edit/:slide_id', function(e) {
      showLoader();
      e.withCurrentPreso(function(preso) {
        e.preso = preso;
        e.title('Editing Presentation', preso.attributes.name);
        e.partial('templates/edit.html.erb', {slide: e.preso.slide(e.params.slide_id)}, function(t) {
          e.app.swap(t);
          e.partial('templates/_upload_form.html.erb', function(data) {
            e.$element().find('#upload_form').html(data);
          });
          var slide_preview = new Slide('.slide-preview .slide');
          var slide_sort = new Slide('.slide-sort .slide');
          slide_sort.setCSS({width: 160, height: 160});

          $('.slide-sort')
            // set up the sortable
            .sortable({
              items: '.slide',
              axis: 'y',
              scrollSpeed: 60,
              stop: function(event, ui) {
                e.trigger('slide-sort', {preso: preso, order: $(this).sortable('toArray')});
              }
            })
            // clicking a slide goes to that slide
            .find('.slide')
              .dblclick(function() {
                var slide_id = $(this).attr('id').replace('sort-slide-', '');
                e.redirect('#','preso', preso.id(), 'edit', slide_id);
              })
              .hover(function() {
                var $slide = $(this),
                    slide_id = $slide.attr('id').replace('sort-slide-', ''),
                    $slide_num = $slide.find('.slide-num');
                if ($slide_num.length === 0) {
                  $slide_num = $('<div/>', {'class': 'slide-num'}).hide().appendTo($slide);
                }
                $slide_num.text(slide_id).show();
              }, function() {
                $(this).find('.slide-num').hide();
              })
            // jump to the right slide in the slide sort
            .filter('#sort-slide-' + e.params.slide_id).each(function() {
              var $slide = $(this);
              $slide.addClass('selected');
              setTimeout(function() {
                var top = $slide.offset().top - 160;
                Sammy.log('top', top);
                $('.slide-sort').scrollTop(top)
              }, 100);
            });

          $('.slide-form')
            // live preview of slide editing
            .find('textarea.slide-content')
              .tabby()
              .bind('keyup', function(ev) {
                if ((ev.which == $.ui.keyCode.RIGHT) && ev.ctrlKey) {
                  ev.stopImmediatePropagation();
                  $(this).parents('form').submit();
                } else {
                  slide_preview.drawPreview($(this).val());
                }
              }).trigger('keyup').focus().end()
            .find('textarea.slide-additional_css')
              .bind('keyup', function() {
                var area = this;
                slide_preview.$element.attr('style', function() {
                  return $(this).attr('style') + ';' + $(area).val();
                });
              }).trigger('keyup').end()
            .find('select.slide-theme')
              .bind('change', function() {
                slide_preview.setTheme($(this).val());
              }).triggerHandler('change');
          $(window).trigger('resize');
        });
      });
    });

    this.post('#/preso/:id/edit/:slide_id', function(e) {
      e.withCurrentPreso(function(preso) {
        preso.slide(e.params.slide_id, $.extend({}, e.params['slide'], {
          content_html: markdown(e.params['slide']['content'])
        }));
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
      this.hideNav();
      e.withCurrentPreso(function(preso) {
        e.title(preso.attributes.name, "(" + e.params.slide_id + " of " + preso.slides().length + ")");
        e.preso = preso;
        // check if display has already been rendered
        if ($('#display[rel="'+ preso.id() + '"]').length > 0) {
          e.displaySlide(preso.slide(e.params.slide_id));
        } else {
          e.partial('templates/display.html.erb', function(display) {
            e.$element().html(display);
            e.possiblyShowInstructions();
            e.displaySlide(preso.slide(e.params.slide_id));
            $('#display .slide').swipe({
              threshold: {
                x: 20,
                y: 30
              },
              swipeLeft: function() {
                 e.log('swipeLeft');
                 e.trigger('display-nextslide');
              },
              swipeRight: function() {
                e.log('swipeRight');
                e.trigger('display-prevslide');
              }
            }).dblclick(function() {
              e.trigger('display-togglenav');
            });
          });
        }
      });
    });

    this.get('#/preso/:id/export', function(e) {
      e.withCurrentPreso(function(preso) {
        e.preso = preso;
        e.partial('templates/export.html.erb');
      });
    });

    this.put('#/preso/:id/upload', function(e) {
      this.log(e.params);
      e.withCurrentPreso(function(preso) {
        // set _rev
        var $form = e.params['$form'];
        var url = preso.uri() + "?include_docs=true";
        $form.find('input[name="_rev"]').val(preso.attributes._rev);
        // we have to set the action == url
        $form.attr('action', url);
        $form.ajaxSubmit({
          url: url,
          iframe: true,
          success: function(resp) {
            e.log('upload complete', resp);
            preso.reload(function(p) {
              e.preso = p;
              e.partial('templates/_upload_form.html.erb', function(data) {
                e.$element().find('#upload_form').html(data);
              });
            });
          }
        });
      });
    });

    this.post('#/preso/:id/jump', function(e) {
      e.withCurrentPreso(function(preso) {
        e.redirect('#', 'preso', preso.id(), 'display', this.params['num']);
      });
    });

    this.bind('slide-sort', function(e, data) {
      this.log('slide-sort');
      var context = this,
          prefix = "sort-slide-",
          preso = data['preso'],
          order = data['order'],
          slides = preso.slides(),
          new_slides = [];

      // edit the slide order and position
      $.each(order, function(i, new_id) {
        var slide = slides[parseInt(new_id.replace(prefix, '')) - 1];
        slide.position = i + 1;
        new_slides[i] = slide;
      });
      preso.attributes.slides = new_slides;
      // save the preso
      preso.save(function() {
        // reapply the slide ids
        $('.slide-sort')
          .find('.slide')
            .each(function(i, slide) {
              $(this).attr('id', prefix + (i + 1))
            })
            .end()
          .sortable('refresh');
      });
    });

    this.bind('display-nextslide', function() {
      var e = this;
      e.hideInstructions();
      e.withCurrentPreso(function(preso) {
        var total_slides = preso.slides().length;
        e.log('total_slides', total_slides, 'current_slide', current_slide);
        if (preso.slide(current_slide).next_on_list) {
          // deal with nexting on lists
          var $list_items = $('#display .slide.active li.notviewed');
          e.log('next on list', 'list_items', $list_items);
          if ($list_items.length > 0) {
            $list_items.eq(0).removeClass('notviewed');
            return;
          }
        }
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
      e.hideInstructions();
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
      $('#navigation').toggle();
    });

    this.bind('display-exit', function() {
      try {
        var e = this;
        e.withCurrentPreso(function(preso) {
          current_slide = current_slide || 1;
          e.redirect('#', 'preso', preso.id(), 'edit', current_slide);
        });
      } catch(error) {
        e.log(error);
      }
    });


    this.bind('run', function() {
      // load time
      var context = this;

      $(document)
        .bind('keydown', function(e) {
          if ($('#display').length > 0 && display_keymap[e.which]) { // display is showing
            context.app.trigger(display_keymap[e.which], {id: $('#display').attr('rel')});
          }
        });

      $('.presos .preso')
        .live('click', function() {
          context.redirect('#', 'preso', $(this).attr('rel'), 'display', 1);
        });

      $('.linked-button')
        .live('click', function(e) {
          e.preventDefault();
          context.redirect($(this).attr('rel'));
        });

      $('.slide-attachment')
        .live('click', function(e) {
          var attachment_url = $(this).attr('rel');
          var attachment_name = $(this).text();
          $('textarea.slide-content').val(function(i, val) {
             return val + "\n![" + attachment_name + "](" + attachment_url + ")";
          }).triggerHandler('keyup');
        });

      // preso theme selection
      $('.themes .preso')
        .live('click', function() {
          Sammy.log('click preso', this);
          var theme = $(this).attr('data-theme');
          $('input[name="preso[theme]"][value="'+ theme + '"]').attr('checked', 'checked');
          $(this).addClass('selected');
          $(this).siblings('.preso').removeClass('selected');
        });

      $('.slide-sort')
        .live('resize', function() {
          $(this).css('height', windowDimensions().height - $('#footer').outerHeight() - $(this).offset().top);
        });

      $('.slide-edit-view')
        .live('resize', function() {
          $(this).css('width', windowDimensions().width - 202);
        });

      $('#navigation')
        .find('.prev').live('click', function() {
          context.app.trigger('display-prevslide', {id: $('#display').attr('rel')});
        }).end()
        .find('.next').live('click', function() {
          context.app.trigger('display-nextslide', {id: $('#display').attr('rel')});
        });

      $(window).bind('resize', function() {
        windowDimensions(true);
        if ($('#display').length > 0) {
          new Slide('#display .slide').setCSS();
        } else {
          $('textarea.slide-content').trigger('keyup');
        }
        $('.slide-sort').trigger('resize');
        $('.slide-edit-view').trigger('resize');
      });

    });
  });

  $(function() {
    app.run('#/');
  });

})(jQuery);
