(function($) {
  
  Sammy = Sammy || {};
  
  Sammy.Title = function() {
    
    this.setTitle = function(title) {
      if (!$.isFunction(title)) {
        this.title_function = function(additional_title) {
          return [title, additional_title].join(' ');
        }
      } else {
        this.title_function = title;
      }
    };
    
    this.helper('title', function() {
      var new_title = $.makeArray(arguments).join(' ');
      if (this.app.title_function) {
        new_title = this.app.title_function(new_title);
      }
      document.title = new_title;
    });
    
  };
  
})(jQuery);