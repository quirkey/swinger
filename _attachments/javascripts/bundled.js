/*
    http://www.JSON.org/json2.js
    2009-04-16

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*global JSON */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (!this.JSON) {
    JSON = {};
}
(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

/*
 * Configurable variables. You may need to tweak these to be compatible with
 * the server-side, but the defaults work in most cases.
 */
var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
var b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance   */
var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
function hex_sha1(s){return binb2hex(core_sha1(str2binb(s),s.length * chrsz));}
function b64_sha1(s){return binb2b64(core_sha1(str2binb(s),s.length * chrsz));}
function str_sha1(s){return binb2str(core_sha1(str2binb(s),s.length * chrsz));}
function hex_hmac_sha1(key, data){ return binb2hex(core_hmac_sha1(key, data));}
function b64_hmac_sha1(key, data){ return binb2b64(core_hmac_sha1(key, data));}
function str_hmac_sha1(key, data){ return binb2str(core_hmac_sha1(key, data));}

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Calculate the HMAC-SHA1 of a key and some data
 */
function core_hmac_sha1(key, data)
{
  var bkey = str2binb(key);
  if(bkey.length > 16) bkey = core_sha1(bkey, key.length * chrsz);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
  return core_sha1(opad.concat(hash), 512 + 160);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
function str2binb(str)
{
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
function binb2str(bin)
{
  var str = "";
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < bin.length * 32; i += chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
function binb2hex(binarray)
{
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++)
  {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
function binb2b64(binarray)
{
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i += 3)
  {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for(var j = 0; j < 4; j++)
    {
      if(i * 8 + j * 6 > binarray.length * 32) str += b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

/*!
 * jQuery JavaScript Library v1.4.2
 * http://jquery.com/
 *
 * Copyright 2010, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2010, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * Date: Sat Feb 13 22:33:48 2010 -0500
 */
(function( window, undefined ) {

// Define a local copy of jQuery
var jQuery = function( selector, context ) {
    // The jQuery object is actually just the init constructor 'enhanced'
    return new jQuery.fn.init( selector, context );
  },

  // Map over jQuery in case of overwrite
  _jQuery = window.jQuery,

  // Map over the $ in case of overwrite
  _$ = window.$,

  // Use the correct document accordingly with window argument (sandbox)
  document = window.document,

  // A central reference to the root jQuery(document)
  rootjQuery,

  // A simple way to check for HTML strings or ID strings
  // (both of which we optimize for)
  quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,

  // Is it a simple selector
  isSimple = /^.[^:#\[\.,]*$/,

  // Check if a string has a non-whitespace character in it
  rnotwhite = /\S/,

  // Used for trimming whitespace
  rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,

  // Match a standalone tag
  rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

  // Keep a UserAgent string for use with jQuery.browser
  userAgent = navigator.userAgent,

  // For matching the engine and version of the browser
  browserMatch,

  // Has the ready events already been bound?
  readyBound = false,

  // The functions to execute on DOM ready
  readyList = [],

  // The ready event handler
  DOMContentLoaded,

  // Save a reference to some core methods
  toString = Object.prototype.toString,
  hasOwnProperty = Object.prototype.hasOwnProperty,
  push = Array.prototype.push,
  slice = Array.prototype.slice,
  indexOf = Array.prototype.indexOf;

jQuery.fn = jQuery.prototype = {
  init: function( selector, context ) {
    var match, elem, ret, doc;

    // Handle $(""), $(null), or $(undefined)
    if ( !selector ) {
      return this;
    }

    // Handle $(DOMElement)
    if ( selector.nodeType ) {
      this.context = this[0] = selector;
      this.length = 1;
      return this;
    }

    // The body element only exists once, optimize finding it
    if ( selector === "body" && !context ) {
      this.context = document;
      this[0] = document.body;
      this.selector = "body";
      this.length = 1;
      return this;
    }

    // Handle HTML strings
    if ( typeof selector === "string" ) {
      // Are we dealing with HTML string or an ID?
      match = quickExpr.exec( selector );

      // Verify a match, and that no context was specified for #id
      if ( match && (match[1] || !context) ) {

        // HANDLE: $(html) -> $(array)
        if ( match[1] ) {
          doc = (context ? context.ownerDocument || context : document);

          // If a single string is passed in and it's a single tag
          // just do a createElement and skip the rest
          ret = rsingleTag.exec( selector );

          if ( ret ) {
            if ( jQuery.isPlainObject( context ) ) {
              selector = [ document.createElement( ret[1] ) ];
              jQuery.fn.attr.call( selector, context, true );

            } else {
              selector = [ doc.createElement( ret[1] ) ];
            }

          } else {
            ret = buildFragment( [ match[1] ], [ doc ] );
            selector = (ret.cacheable ? ret.fragment.cloneNode(true) : ret.fragment).childNodes;
          }

          return jQuery.merge( this, selector );

        // HANDLE: $("#id")
        } else {
          elem = document.getElementById( match[2] );

          if ( elem ) {
            // Handle the case where IE and Opera return items
            // by name instead of ID
            if ( elem.id !== match[2] ) {
              return rootjQuery.find( selector );
            }

            // Otherwise, we inject the element directly into the jQuery object
            this.length = 1;
            this[0] = elem;
          }

          this.context = document;
          this.selector = selector;
          return this;
        }

      // HANDLE: $("TAG")
      } else if ( !context && /^\w+$/.test( selector ) ) {
        this.selector = selector;
        this.context = document;
        selector = document.getElementsByTagName( selector );
        return jQuery.merge( this, selector );

      // HANDLE: $(expr, $(...))
      } else if ( !context || context.jquery ) {
        return (context || rootjQuery).find( selector );

      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return jQuery( context ).find( selector );
      }

    // HANDLE: $(function)
    // Shortcut for document ready
    } else if ( jQuery.isFunction( selector ) ) {
      return rootjQuery.ready( selector );
    }

    if (selector.selector !== undefined) {
      this.selector = selector.selector;
      this.context = selector.context;
    }

    return jQuery.makeArray( selector, this );
  },

  // Start with an empty selector
  selector: "",

  // The current version of jQuery being used
  jquery: "1.4.2",

  // The default length of a jQuery object is 0
  length: 0,

  // The number of elements contained in the matched element set
  size: function() {
    return this.length;
  },

  toArray: function() {
    return slice.call( this, 0 );
  },

  // Get the Nth element in the matched element set OR
  // Get the whole matched element set as a clean array
  get: function( num ) {
    return num == null ?

      // Return a 'clean' array
      this.toArray() :

      // Return just the object
      ( num < 0 ? this.slice(num)[ 0 ] : this[ num ] );
  },

  // Take an array of elements and push it onto the stack
  // (returning the new matched element set)
  pushStack: function( elems, name, selector ) {
    // Build a new jQuery matched element set
    var ret = jQuery();

    if ( jQuery.isArray( elems ) ) {
      push.apply( ret, elems );

    } else {
      jQuery.merge( ret, elems );
    }

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    ret.context = this.context;

    if ( name === "find" ) {
      ret.selector = this.selector + (this.selector ? " " : "") + selector;
    } else if ( name ) {
      ret.selector = this.selector + "." + name + "(" + selector + ")";
    }

    // Return the newly-formed element set
    return ret;
  },

  // Execute a callback for every element in the matched set.
  // (You can seed the arguments with an array of args, but this is
  // only used internally.)
  each: function( callback, args ) {
    return jQuery.each( this, callback, args );
  },

  ready: function( fn ) {
    // Attach the listeners
    jQuery.bindReady();

    // If the DOM is already ready
    if ( jQuery.isReady ) {
      // Execute the function immediately
      fn.call( document, jQuery );

    // Otherwise, remember the function for later
    } else if ( readyList ) {
      // Add the function to the wait list
      readyList.push( fn );
    }

    return this;
  },

  eq: function( i ) {
    return i === -1 ?
      this.slice( i ) :
      this.slice( i, +i + 1 );
  },

  first: function() {
    return this.eq( 0 );
  },

  last: function() {
    return this.eq( -1 );
  },

  slice: function() {
    return this.pushStack( slice.apply( this, arguments ),
      "slice", slice.call(arguments).join(",") );
  },

  map: function( callback ) {
    return this.pushStack( jQuery.map(this, function( elem, i ) {
      return callback.call( elem, i, elem );
    }));
  },

  end: function() {
    return this.prevObject || jQuery(null);
  },

  // For internal use only.
  // Behaves like an Array's method, not like a jQuery method.
  push: push,
  sort: [].sort,
  splice: [].splice
};

// Give the init function the jQuery prototype for later instantiation
jQuery.fn.init.prototype = jQuery.fn;

jQuery.extend = jQuery.fn.extend = function() {
  // copy reference to target object
  var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;

  // Handle a deep copy situation
  if ( typeof target === "boolean" ) {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
    target = {};
  }

  // extend jQuery itself if only one argument is passed
  if ( length === i ) {
    target = this;
    --i;
  }

  for ( ; i < length; i++ ) {
    // Only deal with non-null/undefined values
    if ( (options = arguments[ i ]) != null ) {
      // Extend the base object
      for ( name in options ) {
        src = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging object literal values or arrays
        if ( deep && copy && ( jQuery.isPlainObject(copy) || jQuery.isArray(copy) ) ) {
          var clone = src && ( jQuery.isPlainObject(src) || jQuery.isArray(src) ) ? src
            : jQuery.isArray(copy) ? [] : {};

          // Never move original objects, clone them
          target[ name ] = jQuery.extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

jQuery.extend({
  noConflict: function( deep ) {
    window.$ = _$;

    if ( deep ) {
      window.jQuery = _jQuery;
    }

    return jQuery;
  },

  // Is the DOM ready to be used? Set to true once it occurs.
  isReady: false,

  // Handle when the DOM is ready
  ready: function() {
    // Make sure that the DOM is not already loaded
    if ( !jQuery.isReady ) {
      // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
      if ( !document.body ) {
        return setTimeout( jQuery.ready, 13 );
      }

      // Remember that the DOM is ready
      jQuery.isReady = true;

      // If there are functions bound, to execute
      if ( readyList ) {
        // Execute all of them
        var fn, i = 0;
        while ( (fn = readyList[ i++ ]) ) {
          fn.call( document, jQuery );
        }

        // Reset the list of functions
        readyList = null;
      }

      // Trigger any bound ready events
      if ( jQuery.fn.triggerHandler ) {
        jQuery( document ).triggerHandler( "ready" );
      }
    }
  },

  bindReady: function() {
    if ( readyBound ) {
      return;
    }

    readyBound = true;

    // Catch cases where $(document).ready() is called after the
    // browser event has already occurred.
    if ( document.readyState === "complete" ) {
      return jQuery.ready();
    }

    // Mozilla, Opera and webkit nightlies currently support this event
    if ( document.addEventListener ) {
      // Use the handy event callback
      document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );

      // A fallback to window.onload, that will always work
      window.addEventListener( "load", jQuery.ready, false );

    // If IE event model is used
    } else if ( document.attachEvent ) {
      // ensure firing before onload,
      // maybe late but safe also for iframes
      document.attachEvent("onreadystatechange", DOMContentLoaded);

      // A fallback to window.onload, that will always work
      window.attachEvent( "onload", jQuery.ready );

      // If IE and not a frame
      // continually check to see if the document is ready
      var toplevel = false;

      try {
        toplevel = window.frameElement == null;
      } catch(e) {}

      if ( document.documentElement.doScroll && toplevel ) {
        doScrollCheck();
      }
    }
  },

  // See test/unit/core.js for details concerning isFunction.
  // Since version 1.3, DOM methods and functions like alert
  // aren't supported. They return false on IE (#2968).
  isFunction: function( obj ) {
    return toString.call(obj) === "[object Function]";
  },

  isArray: function( obj ) {
    return toString.call(obj) === "[object Array]";
  },

  isPlainObject: function( obj ) {
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
      return false;
    }

    // Not own constructor property must be Object
    if ( obj.constructor
      && !hasOwnProperty.call(obj, "constructor")
      && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
      return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.

    var key;
    for ( key in obj ) {}

    return key === undefined || hasOwnProperty.call( obj, key );
  },

  isEmptyObject: function( obj ) {
    for ( var name in obj ) {
      return false;
    }
    return true;
  },

  error: function( msg ) {
    throw msg;
  },

  parseJSON: function( data ) {
    if ( typeof data !== "string" || !data ) {
      return null;
    }

    // Make sure leading/trailing whitespace is removed (IE can't handle it)
    data = jQuery.trim( data );

    // Make sure the incoming data is actual JSON
    // Logic borrowed from http://json.org/json2.js
    if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
      .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
      .replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {

      // Try to use the native JSON parser first
      return window.JSON && window.JSON.parse ?
        window.JSON.parse( data ) :
        (new Function("return " + data))();

    } else {
      jQuery.error( "Invalid JSON: " + data );
    }
  },

  noop: function() {},

  // Evalulates a script in a global context
  globalEval: function( data ) {
    if ( data && rnotwhite.test(data) ) {
      // Inspired by code by Andrea Giammarchi
      // http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
      var head = document.getElementsByTagName("head")[0] || document.documentElement,
        script = document.createElement("script");

      script.type = "text/javascript";

      if ( jQuery.support.scriptEval ) {
        script.appendChild( document.createTextNode( data ) );
      } else {
        script.text = data;
      }

      // Use insertBefore instead of appendChild to circumvent an IE6 bug.
      // This arises when a base node is used (#2709).
      head.insertBefore( script, head.firstChild );
      head.removeChild( script );
    }
  },

  nodeName: function( elem, name ) {
    return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
  },

  // args is for internal usage only
  each: function( object, callback, args ) {
    var name, i = 0,
      length = object.length,
      isObj = length === undefined || jQuery.isFunction(object);

    if ( args ) {
      if ( isObj ) {
        for ( name in object ) {
          if ( callback.apply( object[ name ], args ) === false ) {
            break;
          }
        }
      } else {
        for ( ; i < length; ) {
          if ( callback.apply( object[ i++ ], args ) === false ) {
            break;
          }
        }
      }

    // A special, fast, case for the most common use of each
    } else {
      if ( isObj ) {
        for ( name in object ) {
          if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
            break;
          }
        }
      } else {
        for ( var value = object[0];
          i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
      }
    }

    return object;
  },

  trim: function( text ) {
    return (text || "").replace( rtrim, "" );
  },

  // results is for internal usage only
  makeArray: function( array, results ) {
    var ret = results || [];

    if ( array != null ) {
      // The window, strings (and functions) also have 'length'
      // The extra typeof function check is to prevent crashes
      // in Safari 2 (See: #3039)
      if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
        push.call( ret, array );
      } else {
        jQuery.merge( ret, array );
      }
    }

    return ret;
  },

  inArray: function( elem, array ) {
    if ( array.indexOf ) {
      return array.indexOf( elem );
    }

    for ( var i = 0, length = array.length; i < length; i++ ) {
      if ( array[ i ] === elem ) {
        return i;
      }
    }

    return -1;
  },

  merge: function( first, second ) {
    var i = first.length, j = 0;

    if ( typeof second.length === "number" ) {
      for ( var l = second.length; j < l; j++ ) {
        first[ i++ ] = second[ j ];
      }

    } else {
      while ( second[j] !== undefined ) {
        first[ i++ ] = second[ j++ ];
      }
    }

    first.length = i;

    return first;
  },

  grep: function( elems, callback, inv ) {
    var ret = [];

    // Go through the array, only saving the items
    // that pass the validator function
    for ( var i = 0, length = elems.length; i < length; i++ ) {
      if ( !inv !== !callback( elems[ i ], i ) ) {
        ret.push( elems[ i ] );
      }
    }

    return ret;
  },

  // arg is for internal usage only
  map: function( elems, callback, arg ) {
    var ret = [], value;

    // Go through the array, translating each of the items to their
    // new value (or values).
    for ( var i = 0, length = elems.length; i < length; i++ ) {
      value = callback( elems[ i ], i, arg );

      if ( value != null ) {
        ret[ ret.length ] = value;
      }
    }

    return ret.concat.apply( [], ret );
  },

  // A global GUID counter for objects
  guid: 1,

  proxy: function( fn, proxy, thisObject ) {
    if ( arguments.length === 2 ) {
      if ( typeof proxy === "string" ) {
        thisObject = fn;
        fn = thisObject[ proxy ];
        proxy = undefined;

      } else if ( proxy && !jQuery.isFunction( proxy ) ) {
        thisObject = proxy;
        proxy = undefined;
      }
    }

    if ( !proxy && fn ) {
      proxy = function() {
        return fn.apply( thisObject || this, arguments );
      };
    }

    // Set the guid of unique handler to the same of original handler, so it can be removed
    if ( fn ) {
      proxy.guid = fn.guid = fn.guid || proxy.guid || jQuery.guid++;
    }

    // So proxy can be declared as an argument
    return proxy;
  },

  // Use of jQuery.browser is frowned upon.
  // More details: http://docs.jquery.com/Utilities/jQuery.browser
  uaMatch: function( ua ) {
    ua = ua.toLowerCase();

    var match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
      /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
      /(msie) ([\w.]+)/.exec( ua ) ||
      !/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
        [];

    return { browser: match[1] || "", version: match[2] || "0" };
  },

  browser: {}
});

browserMatch = jQuery.uaMatch( userAgent );
if ( browserMatch.browser ) {
  jQuery.browser[ browserMatch.browser ] = true;
  jQuery.browser.version = browserMatch.version;
}

// Deprecated, use jQuery.browser.webkit instead
if ( jQuery.browser.webkit ) {
  jQuery.browser.safari = true;
}

if ( indexOf ) {
  jQuery.inArray = function( elem, array ) {
    return indexOf.call( array, elem );
  };
}

// All jQuery objects should point back to these
rootjQuery = jQuery(document);

// Cleanup functions for the document ready method
if ( document.addEventListener ) {
  DOMContentLoaded = function() {
    document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
    jQuery.ready();
  };

} else if ( document.attachEvent ) {
  DOMContentLoaded = function() {
    // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
    if ( document.readyState === "complete" ) {
      document.detachEvent( "onreadystatechange", DOMContentLoaded );
      jQuery.ready();
    }
  };
}

// The DOM ready check for Internet Explorer
function doScrollCheck() {
  if ( jQuery.isReady ) {
    return;
  }

  try {
    // If IE is used, use the trick by Diego Perini
    // http://javascript.nwbox.com/IEContentLoaded/
    document.documentElement.doScroll("left");
  } catch( error ) {
    setTimeout( doScrollCheck, 1 );
    return;
  }

  // and execute any waiting functions
  jQuery.ready();
}

function evalScript( i, elem ) {
  if ( elem.src ) {
    jQuery.ajax({
      url: elem.src,
      async: false,
      dataType: "script"
    });
  } else {
    jQuery.globalEval( elem.text || elem.textContent || elem.innerHTML || "" );
  }

  if ( elem.parentNode ) {
    elem.parentNode.removeChild( elem );
  }
}

// Mutifunctional method to get and set values to a collection
// The value/s can be optionally by executed if its a function
function access( elems, key, value, exec, fn, pass ) {
  var length = elems.length;

  // Setting many attributes
  if ( typeof key === "object" ) {
    for ( var k in key ) {
      access( elems, k, key[k], exec, fn, value );
    }
    return elems;
  }

  // Setting one attribute
  if ( value !== undefined ) {
    // Optionally, function values get executed if exec is true
    exec = !pass && exec && jQuery.isFunction(value);

    for ( var i = 0; i < length; i++ ) {
      fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
    }

    return elems;
  }

  // Getting an attribute
  return length ? fn( elems[0], key ) : undefined;
}

function now() {
  return (new Date).getTime();
}
(function() {

  jQuery.support = {};

  var root = document.documentElement,
    script = document.createElement("script"),
    div = document.createElement("div"),
    id = "script" + now();

  div.style.display = "none";
  div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

  var all = div.getElementsByTagName("*"),
    a = div.getElementsByTagName("a")[0];

  // Can't get basic test support
  if ( !all || !all.length || !a ) {
    return;
  }

  jQuery.support = {
    // IE strips leading whitespace when .innerHTML is used
    leadingWhitespace: div.firstChild.nodeType === 3,

    // Make sure that tbody elements aren't automatically inserted
    // IE will insert them into empty tables
    tbody: !div.getElementsByTagName("tbody").length,

    // Make sure that link elements get serialized correctly by innerHTML
    // This requires a wrapper element in IE
    htmlSerialize: !!div.getElementsByTagName("link").length,

    // Get the style information from getAttribute
    // (IE uses .cssText insted)
    style: /red/.test( a.getAttribute("style") ),

    // Make sure that URLs aren't manipulated
    // (IE normalizes it by default)
    hrefNormalized: a.getAttribute("href") === "/a",

    // Make sure that element opacity exists
    // (IE uses filter instead)
    // Use a regex to work around a WebKit issue. See #5145
    opacity: /^0.55$/.test( a.style.opacity ),

    // Verify style float existence
    // (IE uses styleFloat instead of cssFloat)
    cssFloat: !!a.style.cssFloat,

    // Make sure that if no value is specified for a checkbox
    // that it defaults to "on".
    // (WebKit defaults to "" instead)
    checkOn: div.getElementsByTagName("input")[0].value === "on",

    // Make sure that a selected-by-default option has a working selected property.
    // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
    optSelected: document.createElement("select").appendChild( document.createElement("option") ).selected,

    parentNode: div.removeChild( div.appendChild( document.createElement("div") ) ).parentNode === null,

    // Will be defined later
    deleteExpando: true,
    checkClone: false,
    scriptEval: false,
    noCloneEvent: true,
    boxModel: null
  };

  script.type = "text/javascript";
  try {
    script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
  } catch(e) {}

  root.insertBefore( script, root.firstChild );

  // Make sure that the execution of code works by injecting a script
  // tag with appendChild/createTextNode
  // (IE doesn't support this, fails, and uses .text instead)
  if ( window[ id ] ) {
    jQuery.support.scriptEval = true;
    delete window[ id ];
  }

  // Test to see if it's possible to delete an expando from an element
  // Fails in Internet Explorer
  try {
    delete script.test;

  } catch(e) {
    jQuery.support.deleteExpando = false;
  }

  root.removeChild( script );

  if ( div.attachEvent && div.fireEvent ) {
    div.attachEvent("onclick", function click() {
      // Cloning a node shouldn't copy over any
      // bound event handlers (IE does this)
      jQuery.support.noCloneEvent = false;
      div.detachEvent("onclick", click);
    });
    div.cloneNode(true).fireEvent("onclick");
  }

  div = document.createElement("div");
  div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";

  var fragment = document.createDocumentFragment();
  fragment.appendChild( div.firstChild );

  // WebKit doesn't clone checked state correctly in fragments
  jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;

  // Figure out if the W3C box model works as expected
  // document.body must exist before we can do this
  jQuery(function() {
    var div = document.createElement("div");
    div.style.width = div.style.paddingLeft = "1px";

    document.body.appendChild( div );
    jQuery.boxModel = jQuery.support.boxModel = div.offsetWidth === 2;
    document.body.removeChild( div ).style.display = 'none';

    div = null;
  });

  // Technique from Juriy Zaytsev
  // http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
  var eventSupported = function( eventName ) {
    var el = document.createElement("div");
    eventName = "on" + eventName;

    var isSupported = (eventName in el);
    if ( !isSupported ) {
      el.setAttribute(eventName, "return;");
      isSupported = typeof el[eventName] === "function";
    }
    el = null;

    return isSupported;
  };

  jQuery.support.submitBubbles = eventSupported("submit");
  jQuery.support.changeBubbles = eventSupported("change");

  // release memory in IE
  root = script = div = all = a = null;
})();

jQuery.props = {
  "for": "htmlFor",
  "class": "className",
  readonly: "readOnly",
  maxlength: "maxLength",
  cellspacing: "cellSpacing",
  rowspan: "rowSpan",
  colspan: "colSpan",
  tabindex: "tabIndex",
  usemap: "useMap",
  frameborder: "frameBorder"
};
var expando = "jQuery" + now(), uuid = 0, windowData = {};

jQuery.extend({
  cache: {},

  expando:expando,

  // The following elements throw uncatchable exceptions if you
  // attempt to add expando properties to them.
  noData: {
    "embed": true,
    "object": true,
    "applet": true
  },

  data: function( elem, name, data ) {
    if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
      return;
    }

    elem = elem == window ?
      windowData :
      elem;

    var id = elem[ expando ], cache = jQuery.cache, thisCache;

    if ( !id && typeof name === "string" && data === undefined ) {
      return null;
    }

    // Compute a unique ID for the element
    if ( !id ) {
      id = ++uuid;
    }

    // Avoid generating a new cache unless none exists and we
    // want to manipulate it.
    if ( typeof name === "object" ) {
      elem[ expando ] = id;
      thisCache = cache[ id ] = jQuery.extend(true, {}, name);

    } else if ( !cache[ id ] ) {
      elem[ expando ] = id;
      cache[ id ] = {};
    }

    thisCache = cache[ id ];

    // Prevent overriding the named cache with undefined values
    if ( data !== undefined ) {
      thisCache[ name ] = data;
    }

    return typeof name === "string" ? thisCache[ name ] : thisCache;
  },

  removeData: function( elem, name ) {
    if ( elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()] ) {
      return;
    }

    elem = elem == window ?
      windowData :
      elem;

    var id = elem[ expando ], cache = jQuery.cache, thisCache = cache[ id ];

    // If we want to remove a specific section of the element's data
    if ( name ) {
      if ( thisCache ) {
        // Remove the section of cache data
        delete thisCache[ name ];

        // If we've removed all the data, remove the element's cache
        if ( jQuery.isEmptyObject(thisCache) ) {
          jQuery.removeData( elem );
        }
      }

    // Otherwise, we want to remove all of the element's data
    } else {
      if ( jQuery.support.deleteExpando ) {
        delete elem[ jQuery.expando ];

      } else if ( elem.removeAttribute ) {
        elem.removeAttribute( jQuery.expando );
      }

      // Completely remove the data cache
      delete cache[ id ];
    }
  }
});

jQuery.fn.extend({
  data: function( key, value ) {
    if ( typeof key === "undefined" && this.length ) {
      return jQuery.data( this[0] );

    } else if ( typeof key === "object" ) {
      return this.each(function() {
        jQuery.data( this, key );
      });
    }

    var parts = key.split(".");
    parts[1] = parts[1] ? "." + parts[1] : "";

    if ( value === undefined ) {
      var data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

      if ( data === undefined && this.length ) {
        data = jQuery.data( this[0], key );
      }
      return data === undefined && parts[1] ?
        this.data( parts[0] ) :
        data;
    } else {
      return this.trigger("setData" + parts[1] + "!", [parts[0], value]).each(function() {
        jQuery.data( this, key, value );
      });
    }
  },

  removeData: function( key ) {
    return this.each(function() {
      jQuery.removeData( this, key );
    });
  }
});
jQuery.extend({
  queue: function( elem, type, data ) {
    if ( !elem ) {
      return;
    }

    type = (type || "fx") + "queue";
    var q = jQuery.data( elem, type );

    // Speed up dequeue by getting out quickly if this is just a lookup
    if ( !data ) {
      return q || [];
    }

    if ( !q || jQuery.isArray(data) ) {
      q = jQuery.data( elem, type, jQuery.makeArray(data) );

    } else {
      q.push( data );
    }

    return q;
  },

  dequeue: function( elem, type ) {
    type = type || "fx";

    var queue = jQuery.queue( elem, type ), fn = queue.shift();

    // If the fx queue is dequeued, always remove the progress sentinel
    if ( fn === "inprogress" ) {
      fn = queue.shift();
    }

    if ( fn ) {
      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      if ( type === "fx" ) {
        queue.unshift("inprogress");
      }

      fn.call(elem, function() {
        jQuery.dequeue(elem, type);
      });
    }
  }
});

jQuery.fn.extend({
  queue: function( type, data ) {
    if ( typeof type !== "string" ) {
      data = type;
      type = "fx";
    }

    if ( data === undefined ) {
      return jQuery.queue( this[0], type );
    }
    return this.each(function( i, elem ) {
      var queue = jQuery.queue( this, type, data );

      if ( type === "fx" && queue[0] !== "inprogress" ) {
        jQuery.dequeue( this, type );
      }
    });
  },
  dequeue: function( type ) {
    return this.each(function() {
      jQuery.dequeue( this, type );
    });
  },

  // Based off of the plugin by Clint Helfers, with permission.
  // http://blindsignals.com/index.php/2009/07/jquery-delay/
  delay: function( time, type ) {
    time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
    type = type || "fx";

    return this.queue( type, function() {
      var elem = this;
      setTimeout(function() {
        jQuery.dequeue( elem, type );
      }, time );
    });
  },

  clearQueue: function( type ) {
    return this.queue( type || "fx", [] );
  }
});
var rclass = /[\n\t]/g,
  rspace = /\s+/,
  rreturn = /\r/g,
  rspecialurl = /href|src|style/,
  rtype = /(button|input)/i,
  rfocusable = /(button|input|object|select|textarea)/i,
  rclickable = /^(a|area)$/i,
  rradiocheck = /radio|checkbox/;

jQuery.fn.extend({
  attr: function( name, value ) {
    return access( this, name, value, true, jQuery.attr );
  },

  removeAttr: function( name, fn ) {
    return this.each(function(){
      jQuery.attr( this, name, "" );
      if ( this.nodeType === 1 ) {
        this.removeAttribute( name );
      }
    });
  },

  addClass: function( value ) {
    if ( jQuery.isFunction(value) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        self.addClass( value.call(this, i, self.attr("class")) );
      });
    }

    if ( value && typeof value === "string" ) {
      var classNames = (value || "").split( rspace );

      for ( var i = 0, l = this.length; i < l; i++ ) {
        var elem = this[i];

        if ( elem.nodeType === 1 ) {
          if ( !elem.className ) {
            elem.className = value;

          } else {
            var className = " " + elem.className + " ", setClass = elem.className;
            for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
              if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
                setClass += " " + classNames[c];
              }
            }
            elem.className = jQuery.trim( setClass );
          }
        }
      }
    }

    return this;
  },

  removeClass: function( value ) {
    if ( jQuery.isFunction(value) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        self.removeClass( value.call(this, i, self.attr("class")) );
      });
    }

    if ( (value && typeof value === "string") || value === undefined ) {
      var classNames = (value || "").split(rspace);

      for ( var i = 0, l = this.length; i < l; i++ ) {
        var elem = this[i];

        if ( elem.nodeType === 1 && elem.className ) {
          if ( value ) {
            var className = (" " + elem.className + " ").replace(rclass, " ");
            for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
              className = className.replace(" " + classNames[c] + " ", " ");
            }
            elem.className = jQuery.trim( className );

          } else {
            elem.className = "";
          }
        }
      }
    }

    return this;
  },

  toggleClass: function( value, stateVal ) {
    var type = typeof value, isBool = typeof stateVal === "boolean";

    if ( jQuery.isFunction( value ) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
      });
    }

    return this.each(function() {
      if ( type === "string" ) {
        // toggle individual class names
        var className, i = 0, self = jQuery(this),
          state = stateVal,
          classNames = value.split( rspace );

        while ( (className = classNames[ i++ ]) ) {
          // check each className given, space seperated list
          state = isBool ? state : !self.hasClass( className );
          self[ state ? "addClass" : "removeClass" ]( className );
        }

      } else if ( type === "undefined" || type === "boolean" ) {
        if ( this.className ) {
          // store className if set
          jQuery.data( this, "__className__", this.className );
        }

        // toggle whole className
        this.className = this.className || value === false ? "" : jQuery.data( this, "__className__" ) || "";
      }
    });
  },

  hasClass: function( selector ) {
    var className = " " + selector + " ";
    for ( var i = 0, l = this.length; i < l; i++ ) {
      if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
        return true;
      }
    }

    return false;
  },

  val: function( value ) {
    if ( value === undefined ) {
      var elem = this[0];

      if ( elem ) {
        if ( jQuery.nodeName( elem, "option" ) ) {
          return (elem.attributes.value || {}).specified ? elem.value : elem.text;
        }

        // We need to handle select boxes special
        if ( jQuery.nodeName( elem, "select" ) ) {
          var index = elem.selectedIndex,
            values = [],
            options = elem.options,
            one = elem.type === "select-one";

          // Nothing was selected
          if ( index < 0 ) {
            return null;
          }

          // Loop through all the selected options
          for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
            var option = options[ i ];

            if ( option.selected ) {
              // Get the specifc value for the option
              value = jQuery(option).val();

              // We don't need an array for one selects
              if ( one ) {
                return value;
              }

              // Multi-Selects return an array
              values.push( value );
            }
          }

          return values;
        }

        // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
        if ( rradiocheck.test( elem.type ) && !jQuery.support.checkOn ) {
          return elem.getAttribute("value") === null ? "on" : elem.value;
        }


        // Everything else, we just grab the value
        return (elem.value || "").replace(rreturn, "");

      }

      return undefined;
    }

    var isFunction = jQuery.isFunction(value);

    return this.each(function(i) {
      var self = jQuery(this), val = value;

      if ( this.nodeType !== 1 ) {
        return;
      }

      if ( isFunction ) {
        val = value.call(this, i, self.val());
      }

      // Typecast each time if the value is a Function and the appended
      // value is therefore different each time.
      if ( typeof val === "number" ) {
        val += "";
      }

      if ( jQuery.isArray(val) && rradiocheck.test( this.type ) ) {
        this.checked = jQuery.inArray( self.val(), val ) >= 0;

      } else if ( jQuery.nodeName( this, "select" ) ) {
        var values = jQuery.makeArray(val);

        jQuery( "option", this ).each(function() {
          this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
        });

        if ( !values.length ) {
          this.selectedIndex = -1;
        }

      } else {
        this.value = val;
      }
    });
  }
});

jQuery.extend({
  attrFn: {
    val: true,
    css: true,
    html: true,
    text: true,
    data: true,
    width: true,
    height: true,
    offset: true
  },

  attr: function( elem, name, value, pass ) {
    // don't set attributes on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
      return undefined;
    }

    if ( pass && name in jQuery.attrFn ) {
      return jQuery(elem)[name](value);
    }

    var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc( elem ),
      // Whether we are setting (or getting)
      set = value !== undefined;

    // Try to normalize/fix the name
    name = notxml && jQuery.props[ name ] || name;

    // Only do all the following if this is a node (faster for style)
    if ( elem.nodeType === 1 ) {
      // These attributes require special treatment
      var special = rspecialurl.test( name );

      // Safari mis-reports the default selected property of an option
      // Accessing the parent's selectedIndex property fixes it
      if ( name === "selected" && !jQuery.support.optSelected ) {
        var parent = elem.parentNode;
        if ( parent ) {
          parent.selectedIndex;

          // Make sure that it also works with optgroups, see #5701
          if ( parent.parentNode ) {
            parent.parentNode.selectedIndex;
          }
        }
      }

      // If applicable, access the attribute via the DOM 0 way
      if ( name in elem && notxml && !special ) {
        if ( set ) {
          // We can't allow the type property to be changed (since it causes problems in IE)
          if ( name === "type" && rtype.test( elem.nodeName ) && elem.parentNode ) {
            jQuery.error( "type property can't be changed" );
          }

          elem[ name ] = value;
        }

        // browsers index elements by id/name on forms, give priority to attributes.
        if ( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
          return elem.getAttributeNode( name ).nodeValue;
        }

        // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
        // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
        if ( name === "tabIndex" ) {
          var attributeNode = elem.getAttributeNode( "tabIndex" );

          return attributeNode && attributeNode.specified ?
            attributeNode.value :
            rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
              0 :
              undefined;
        }

        return elem[ name ];
      }

      if ( !jQuery.support.style && notxml && name === "style" ) {
        if ( set ) {
          elem.style.cssText = "" + value;
        }

        return elem.style.cssText;
      }

      if ( set ) {
        // convert the value to a string (all browsers do this but IE) see #1070
        elem.setAttribute( name, "" + value );
      }

      var attr = !jQuery.support.hrefNormalized && notxml && special ?
          // Some attributes require a special call on IE
          elem.getAttribute( name, 2 ) :
          elem.getAttribute( name );

      // Non-existent attributes return null, we normalize to undefined
      return attr === null ? undefined : attr;
    }

    // elem is actually elem.style ... set the style
    // Using attr for specific style information is now deprecated. Use style instead.
    return jQuery.style( elem, name, value );
  }
});
var rnamespaces = /\.(.*)$/,
  fcleanup = function( nm ) {
    return nm.replace(/[^\w\s\.\|`]/g, function( ch ) {
      return "\\" + ch;
    });
  };

/*
 * A number of helper functions used for managing events.
 * Many of the ideas behind this code originated from
 * Dean Edwards' addEvent library.
 */
jQuery.event = {

  // Bind an event to an element
  // Original by Dean Edwards
  add: function( elem, types, handler, data ) {
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if ( elem.setInterval && ( elem !== window && !elem.frameElement ) ) {
      elem = window;
    }

    var handleObjIn, handleObj;

    if ( handler.handler ) {
      handleObjIn = handler;
      handler = handleObjIn.handler;
    }

    // Make sure that the function being executed has a unique ID
    if ( !handler.guid ) {
      handler.guid = jQuery.guid++;
    }

    // Init the element's event structure
    var elemData = jQuery.data( elem );

    // If no elemData is found then we must be trying to bind to one of the
    // banned noData elements
    if ( !elemData ) {
      return;
    }

    var events = elemData.events = elemData.events || {},
      eventHandle = elemData.handle, eventHandle;

    if ( !eventHandle ) {
      elemData.handle = eventHandle = function() {
        // Handle the second event of a trigger and when
        // an event is called after a page has unloaded
        return typeof jQuery !== "undefined" && !jQuery.event.triggered ?
          jQuery.event.handle.apply( eventHandle.elem, arguments ) :
          undefined;
      };
    }

    // Add elem as a property of the handle function
    // This is to prevent a memory leak with non-native events in IE.
    eventHandle.elem = elem;

    // Handle multiple events separated by a space
    // jQuery(...).bind("mouseover mouseout", fn);
    types = types.split(" ");

    var type, i = 0, namespaces;

    while ( (type = types[ i++ ]) ) {
      handleObj = handleObjIn ?
        jQuery.extend({}, handleObjIn) :
        { handler: handler, data: data };

      // Namespaced event handlers
      if ( type.indexOf(".") > -1 ) {
        namespaces = type.split(".");
        type = namespaces.shift();
        handleObj.namespace = namespaces.slice(0).sort().join(".");

      } else {
        namespaces = [];
        handleObj.namespace = "";
      }

      handleObj.type = type;
      handleObj.guid = handler.guid;

      // Get the current list of functions bound to this event
      var handlers = events[ type ],
        special = jQuery.event.special[ type ] || {};

      // Init the event handler queue
      if ( !handlers ) {
        handlers = events[ type ] = [];

        // Check for a special event handler
        // Only use addEventListener/attachEvent if the special
        // events handler returns false
        if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
          // Bind the global event handler to the element
          if ( elem.addEventListener ) {
            elem.addEventListener( type, eventHandle, false );

          } else if ( elem.attachEvent ) {
            elem.attachEvent( "on" + type, eventHandle );
          }
        }
      }

      if ( special.add ) {
        special.add.call( elem, handleObj );

        if ( !handleObj.handler.guid ) {
          handleObj.handler.guid = handler.guid;
        }
      }

      // Add the function to the element's handler list
      handlers.push( handleObj );

      // Keep track of which events have been used, for global triggering
      jQuery.event.global[ type ] = true;
    }

    // Nullify elem to prevent memory leaks in IE
    elem = null;
  },

  global: {},

  // Detach an event or set of events from an element
  remove: function( elem, types, handler, pos ) {
    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
      return;
    }

    var ret, type, fn, i = 0, all, namespaces, namespace, special, eventType, handleObj, origType,
      elemData = jQuery.data( elem ),
      events = elemData && elemData.events;

    if ( !elemData || !events ) {
      return;
    }

    // types is actually an event object here
    if ( types && types.type ) {
      handler = types.handler;
      types = types.type;
    }

    // Unbind all events for the element
    if ( !types || typeof types === "string" && types.charAt(0) === "." ) {
      types = types || "";

      for ( type in events ) {
        jQuery.event.remove( elem, type + types );
      }

      return;
    }

    // Handle multiple events separated by a space
    // jQuery(...).unbind("mouseover mouseout", fn);
    types = types.split(" ");

    while ( (type = types[ i++ ]) ) {
      origType = type;
      handleObj = null;
      all = type.indexOf(".") < 0;
      namespaces = [];

      if ( !all ) {
        // Namespaced event handlers
        namespaces = type.split(".");
        type = namespaces.shift();

        namespace = new RegExp("(^|\\.)" +
          jQuery.map( namespaces.slice(0).sort(), fcleanup ).join("\\.(?:.*\\.)?") + "(\\.|$)")
      }

      eventType = events[ type ];

      if ( !eventType ) {
        continue;
      }

      if ( !handler ) {
        for ( var j = 0; j < eventType.length; j++ ) {
          handleObj = eventType[ j ];

          if ( all || namespace.test( handleObj.namespace ) ) {
            jQuery.event.remove( elem, origType, handleObj.handler, j );
            eventType.splice( j--, 1 );
          }
        }

        continue;
      }

      special = jQuery.event.special[ type ] || {};

      for ( var j = pos || 0; j < eventType.length; j++ ) {
        handleObj = eventType[ j ];

        if ( handler.guid === handleObj.guid ) {
          // remove the given handler for the given type
          if ( all || namespace.test( handleObj.namespace ) ) {
            if ( pos == null ) {
              eventType.splice( j--, 1 );
            }

            if ( special.remove ) {
              special.remove.call( elem, handleObj );
            }
          }

          if ( pos != null ) {
            break;
          }
        }
      }

      // remove generic event handler if no more handlers exist
      if ( eventType.length === 0 || pos != null && eventType.length === 1 ) {
        if ( !special.teardown || special.teardown.call( elem, namespaces ) === false ) {
          removeEvent( elem, type, elemData.handle );
        }

        ret = null;
        delete events[ type ];
      }
    }

    // Remove the expando if it's no longer used
    if ( jQuery.isEmptyObject( events ) ) {
      var handle = elemData.handle;
      if ( handle ) {
        handle.elem = null;
      }

      delete elemData.events;
      delete elemData.handle;

      if ( jQuery.isEmptyObject( elemData ) ) {
        jQuery.removeData( elem );
      }
    }
  },

  // bubbling is internal
  trigger: function( event, data, elem /*, bubbling */ ) {
    // Event object or event type
    var type = event.type || event,
      bubbling = arguments[3];

    if ( !bubbling ) {
      event = typeof event === "object" ?
        // jQuery.Event object
        event[expando] ? event :
        // Object literal
        jQuery.extend( jQuery.Event(type), event ) :
        // Just the event type (string)
        jQuery.Event(type);

      if ( type.indexOf("!") >= 0 ) {
        event.type = type = type.slice(0, -1);
        event.exclusive = true;
      }

      // Handle a global trigger
      if ( !elem ) {
        // Don't bubble custom events when global (to avoid too much overhead)
        event.stopPropagation();

        // Only trigger if we've ever bound an event for it
        if ( jQuery.event.global[ type ] ) {
          jQuery.each( jQuery.cache, function() {
            if ( this.events && this.events[type] ) {
              jQuery.event.trigger( event, data, this.handle.elem );
            }
          });
        }
      }

      // Handle triggering a single element

      // don't do events on text and comment nodes
      if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
        return undefined;
      }

      // Clean up in case it is reused
      event.result = undefined;
      event.target = elem;

      // Clone the incoming data, if any
      data = jQuery.makeArray( data );
      data.unshift( event );
    }

    event.currentTarget = elem;

    // Trigger the event, it is assumed that "handle" is a function
    var handle = jQuery.data( elem, "handle" );
    if ( handle ) {
      handle.apply( elem, data );
    }

    var parent = elem.parentNode || elem.ownerDocument;

    // Trigger an inline bound script
    try {
      if ( !(elem && elem.nodeName && jQuery.noData[elem.nodeName.toLowerCase()]) ) {
        if ( elem[ "on" + type ] && elem[ "on" + type ].apply( elem, data ) === false ) {
          event.result = false;
        }
      }

    // prevent IE from throwing an error for some elements with some event types, see #3533
    } catch (e) {}

    if ( !event.isPropagationStopped() && parent ) {
      jQuery.event.trigger( event, data, parent, true );

    } else if ( !event.isDefaultPrevented() ) {
      var target = event.target, old,
        isClick = jQuery.nodeName(target, "a") && type === "click",
        special = jQuery.event.special[ type ] || {};

      if ( (!special._default || special._default.call( elem, event ) === false) &&
        !isClick && !(target && target.nodeName && jQuery.noData[target.nodeName.toLowerCase()]) ) {

        try {
          if ( target[ type ] ) {
            // Make sure that we don't accidentally re-trigger the onFOO events
            old = target[ "on" + type ];

            if ( old ) {
              target[ "on" + type ] = null;
            }

            jQuery.event.triggered = true;
            target[ type ]();
          }

        // prevent IE from throwing an error for some elements with some event types, see #3533
        } catch (e) {}

        if ( old ) {
          target[ "on" + type ] = old;
        }

        jQuery.event.triggered = false;
      }
    }
  },

  handle: function( event ) {
    var all, handlers, namespaces, namespace, events;

    event = arguments[0] = jQuery.event.fix( event || window.event );
    event.currentTarget = this;

    // Namespaced event handlers
    all = event.type.indexOf(".") < 0 && !event.exclusive;

    if ( !all ) {
      namespaces = event.type.split(".");
      event.type = namespaces.shift();
      namespace = new RegExp("(^|\\.)" + namespaces.slice(0).sort().join("\\.(?:.*\\.)?") + "(\\.|$)");
    }

    var events = jQuery.data(this, "events"), handlers = events[ event.type ];

    if ( events && handlers ) {
      // Clone the handlers to prevent manipulation
      handlers = handlers.slice(0);

      for ( var j = 0, l = handlers.length; j < l; j++ ) {
        var handleObj = handlers[ j ];

        // Filter the functions by class
        if ( all || namespace.test( handleObj.namespace ) ) {
          // Pass in a reference to the handler function itself
          // So that we can later remove it
          event.handler = handleObj.handler;
          event.data = handleObj.data;
          event.handleObj = handleObj;

          var ret = handleObj.handler.apply( this, arguments );

          if ( ret !== undefined ) {
            event.result = ret;
            if ( ret === false ) {
              event.preventDefault();
              event.stopPropagation();
            }
          }

          if ( event.isImmediatePropagationStopped() ) {
            break;
          }
        }
      }
    }

    return event.result;
  },

  props: "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode layerX layerY metaKey newValue offsetX offsetY originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),

  fix: function( event ) {
    if ( event[ expando ] ) {
      return event;
    }

    // store a copy of the original event object
    // and "clone" to set read-only properties
    var originalEvent = event;
    event = jQuery.Event( originalEvent );

    for ( var i = this.props.length, prop; i; ) {
      prop = this.props[ --i ];
      event[ prop ] = originalEvent[ prop ];
    }

    // Fix target property, if necessary
    if ( !event.target ) {
      event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either
    }

    // check if target is a textnode (safari)
    if ( event.target.nodeType === 3 ) {
      event.target = event.target.parentNode;
    }

    // Add relatedTarget, if necessary
    if ( !event.relatedTarget && event.fromElement ) {
      event.relatedTarget = event.fromElement === event.target ? event.toElement : event.fromElement;
    }

    // Calculate pageX/Y if missing and clientX/Y available
    if ( event.pageX == null && event.clientX != null ) {
      var doc = document.documentElement, body = document.body;
      event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0);
    }

    // Add which for key events
    if ( !event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode) ) {
      event.which = event.charCode || event.keyCode;
    }

    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
    if ( !event.metaKey && event.ctrlKey ) {
      event.metaKey = event.ctrlKey;
    }

    // Add which for click: 1 === left; 2 === middle; 3 === right
    // Note: button is not normalized, so don't use it
    if ( !event.which && event.button !== undefined ) {
      event.which = (event.button & 1 ? 1 : ( event.button & 2 ? 3 : ( event.button & 4 ? 2 : 0 ) ));
    }

    return event;
  },

  // Deprecated, use jQuery.guid instead
  guid: 1E8,

  // Deprecated, use jQuery.proxy instead
  proxy: jQuery.proxy,

  special: {
    ready: {
      // Make sure the ready event is setup
      setup: jQuery.bindReady,
      teardown: jQuery.noop
    },

    live: {
      add: function( handleObj ) {
        jQuery.event.add( this, handleObj.origType, jQuery.extend({}, handleObj, {handler: liveHandler}) );
      },

      remove: function( handleObj ) {
        var remove = true,
          type = handleObj.origType.replace(rnamespaces, "");

        jQuery.each( jQuery.data(this, "events").live || [], function() {
          if ( type === this.origType.replace(rnamespaces, "") ) {
            remove = false;
            return false;
          }
        });

        if ( remove ) {
          jQuery.event.remove( this, handleObj.origType, liveHandler );
        }
      }

    },

    beforeunload: {
      setup: function( data, namespaces, eventHandle ) {
        // We only want to do this special case on windows
        if ( this.setInterval ) {
          this.onbeforeunload = eventHandle;
        }

        return false;
      },
      teardown: function( namespaces, eventHandle ) {
        if ( this.onbeforeunload === eventHandle ) {
          this.onbeforeunload = null;
        }
      }
    }
  }
};

var removeEvent = document.removeEventListener ?
  function( elem, type, handle ) {
    elem.removeEventListener( type, handle, false );
  } :
  function( elem, type, handle ) {
    elem.detachEvent( "on" + type, handle );
  };

jQuery.Event = function( src ) {
  // Allow instantiation without the 'new' keyword
  if ( !this.preventDefault ) {
    return new jQuery.Event( src );
  }

  // Event object
  if ( src && src.type ) {
    this.originalEvent = src;
    this.type = src.type;
  // Event type
  } else {
    this.type = src;
  }

  // timeStamp is buggy for some events on Firefox(#3843)
  // So we won't rely on the native value
  this.timeStamp = now();

  // Mark it as fixed
  this[ expando ] = true;
};

function returnFalse() {
  return false;
}
function returnTrue() {
  return true;
}

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
  preventDefault: function() {
    this.isDefaultPrevented = returnTrue;

    var e = this.originalEvent;
    if ( !e ) {
      return;
    }

    // if preventDefault exists run it on the original event
    if ( e.preventDefault ) {
      e.preventDefault();
    }
    // otherwise set the returnValue property of the original event to false (IE)
    e.returnValue = false;
  },
  stopPropagation: function() {
    this.isPropagationStopped = returnTrue;

    var e = this.originalEvent;
    if ( !e ) {
      return;
    }
    // if stopPropagation exists run it on the original event
    if ( e.stopPropagation ) {
      e.stopPropagation();
    }
    // otherwise set the cancelBubble property of the original event to true (IE)
    e.cancelBubble = true;
  },
  stopImmediatePropagation: function() {
    this.isImmediatePropagationStopped = returnTrue;
    this.stopPropagation();
  },
  isDefaultPrevented: returnFalse,
  isPropagationStopped: returnFalse,
  isImmediatePropagationStopped: returnFalse
};

// Checks if an event happened on an element within another element
// Used in jQuery.event.special.mouseenter and mouseleave handlers
var withinElement = function( event ) {
  // Check if mouse(over|out) are still within the same parent element
  var parent = event.relatedTarget;

  // Firefox sometimes assigns relatedTarget a XUL element
  // which we cannot access the parentNode property of
  try {
    // Traverse up the tree
    while ( parent && parent !== this ) {
      parent = parent.parentNode;
    }

    if ( parent !== this ) {
      // set the correct event type
      event.type = event.data;

      // handle event if we actually just moused on to a non sub-element
      jQuery.event.handle.apply( this, arguments );
    }

  // assuming we've left the element since we most likely mousedover a xul element
  } catch(e) { }
},

// In case of event delegation, we only need to rename the event.type,
// liveHandler will take care of the rest.
delegate = function( event ) {
  event.type = event.data;
  jQuery.event.handle.apply( this, arguments );
};

// Create mouseenter and mouseleave events
jQuery.each({
  mouseenter: "mouseover",
  mouseleave: "mouseout"
}, function( orig, fix ) {
  jQuery.event.special[ orig ] = {
    setup: function( data ) {
      jQuery.event.add( this, fix, data && data.selector ? delegate : withinElement, orig );
    },
    teardown: function( data ) {
      jQuery.event.remove( this, fix, data && data.selector ? delegate : withinElement );
    }
  };
});

// submit delegation
if ( !jQuery.support.submitBubbles ) {

  jQuery.event.special.submit = {
    setup: function( data, namespaces ) {
      if ( this.nodeName.toLowerCase() !== "form" ) {
        jQuery.event.add(this, "click.specialSubmit", function( e ) {
          var elem = e.target, type = elem.type;

          if ( (type === "submit" || type === "image") && jQuery( elem ).closest("form").length ) {
            return trigger( "submit", this, arguments );
          }
        });

        jQuery.event.add(this, "keypress.specialSubmit", function( e ) {
          var elem = e.target, type = elem.type;

          if ( (type === "text" || type === "password") && jQuery( elem ).closest("form").length && e.keyCode === 13 ) {
            return trigger( "submit", this, arguments );
          }
        });

      } else {
        return false;
      }
    },

    teardown: function( namespaces ) {
      jQuery.event.remove( this, ".specialSubmit" );
    }
  };

}

// change delegation, happens here so we have bind.
if ( !jQuery.support.changeBubbles ) {

  var formElems = /textarea|input|select/i,

  changeFilters,

  getVal = function( elem ) {
    var type = elem.type, val = elem.value;

    if ( type === "radio" || type === "checkbox" ) {
      val = elem.checked;

    } else if ( type === "select-multiple" ) {
      val = elem.selectedIndex > -1 ?
        jQuery.map( elem.options, function( elem ) {
          return elem.selected;
        }).join("-") :
        "";

    } else if ( elem.nodeName.toLowerCase() === "select" ) {
      val = elem.selectedIndex;
    }

    return val;
  },

  testChange = function testChange( e ) {
    var elem = e.target, data, val;

    if ( !formElems.test( elem.nodeName ) || elem.readOnly ) {
      return;
    }

    data = jQuery.data( elem, "_change_data" );
    val = getVal(elem);

    // the current data will be also retrieved by beforeactivate
    if ( e.type !== "focusout" || elem.type !== "radio" ) {
      jQuery.data( elem, "_change_data", val );
    }

    if ( data === undefined || val === data ) {
      return;
    }

    if ( data != null || val ) {
      e.type = "change";
      return jQuery.event.trigger( e, arguments[1], elem );
    }
  };

  jQuery.event.special.change = {
    filters: {
      focusout: testChange,

      click: function( e ) {
        var elem = e.target, type = elem.type;

        if ( type === "radio" || type === "checkbox" || elem.nodeName.toLowerCase() === "select" ) {
          return testChange.call( this, e );
        }
      },

      // Change has to be called before submit
      // Keydown will be called before keypress, which is used in submit-event delegation
      keydown: function( e ) {
        var elem = e.target, type = elem.type;

        if ( (e.keyCode === 13 && elem.nodeName.toLowerCase() !== "textarea") ||
          (e.keyCode === 32 && (type === "checkbox" || type === "radio")) ||
          type === "select-multiple" ) {
          return testChange.call( this, e );
        }
      },

      // Beforeactivate happens also before the previous element is blurred
      // with this event you can't trigger a change event, but you can store
      // information/focus[in] is not needed anymore
      beforeactivate: function( e ) {
        var elem = e.target;
        jQuery.data( elem, "_change_data", getVal(elem) );
      }
    },

    setup: function( data, namespaces ) {
      if ( this.type === "file" ) {
        return false;
      }

      for ( var type in changeFilters ) {
        jQuery.event.add( this, type + ".specialChange", changeFilters[type] );
      }

      return formElems.test( this.nodeName );
    },

    teardown: function( namespaces ) {
      jQuery.event.remove( this, ".specialChange" );

      return formElems.test( this.nodeName );
    }
  };

  changeFilters = jQuery.event.special.change.filters;
}

function trigger( type, elem, args ) {
  args[0].type = type;
  return jQuery.event.handle.apply( elem, args );
}

// Create "bubbling" focus and blur events
if ( document.addEventListener ) {
  jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {
    jQuery.event.special[ fix ] = {
      setup: function() {
        this.addEventListener( orig, handler, true );
      },
      teardown: function() {
        this.removeEventListener( orig, handler, true );
      }
    };

    function handler( e ) {
      e = jQuery.event.fix( e );
      e.type = fix;
      return jQuery.event.handle.call( this, e );
    }
  });
}

jQuery.each(["bind", "one"], function( i, name ) {
  jQuery.fn[ name ] = function( type, data, fn ) {
    // Handle object literals
    if ( typeof type === "object" ) {
      for ( var key in type ) {
        this[ name ](key, data, type[key], fn);
      }
      return this;
    }

    if ( jQuery.isFunction( data ) ) {
      fn = data;
      data = undefined;
    }

    var handler = name === "one" ? jQuery.proxy( fn, function( event ) {
      jQuery( this ).unbind( event, handler );
      return fn.apply( this, arguments );
    }) : fn;

    if ( type === "unload" && name !== "one" ) {
      this.one( type, data, fn );

    } else {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        jQuery.event.add( this[i], type, handler, data );
      }
    }

    return this;
  };
});

jQuery.fn.extend({
  unbind: function( type, fn ) {
    // Handle object literals
    if ( typeof type === "object" && !type.preventDefault ) {
      for ( var key in type ) {
        this.unbind(key, type[key]);
      }

    } else {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        jQuery.event.remove( this[i], type, fn );
      }
    }

    return this;
  },

  delegate: function( selector, types, data, fn ) {
    return this.live( types, data, fn, selector );
  },

  undelegate: function( selector, types, fn ) {
    if ( arguments.length === 0 ) {
        return this.unbind( "live" );

    } else {
      return this.die( types, null, fn, selector );
    }
  },

  trigger: function( type, data ) {
    return this.each(function() {
      jQuery.event.trigger( type, data, this );
    });
  },

  triggerHandler: function( type, data ) {
    if ( this[0] ) {
      var event = jQuery.Event( type );
      event.preventDefault();
      event.stopPropagation();
      jQuery.event.trigger( event, data, this[0] );
      return event.result;
    }
  },

  toggle: function( fn ) {
    // Save reference to arguments for access in closure
    var args = arguments, i = 1;

    // link all the functions, so any of them can unbind this click handler
    while ( i < args.length ) {
      jQuery.proxy( fn, args[ i++ ] );
    }

    return this.click( jQuery.proxy( fn, function( event ) {
      // Figure out which function to execute
      var lastToggle = ( jQuery.data( this, "lastToggle" + fn.guid ) || 0 ) % i;
      jQuery.data( this, "lastToggle" + fn.guid, lastToggle + 1 );

      // Make sure that clicks stop
      event.preventDefault();

      // and execute the function
      return args[ lastToggle ].apply( this, arguments ) || false;
    }));
  },

  hover: function( fnOver, fnOut ) {
    return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
  }
});

var liveMap = {
  focus: "focusin",
  blur: "focusout",
  mouseenter: "mouseover",
  mouseleave: "mouseout"
};

jQuery.each(["live", "die"], function( i, name ) {
  jQuery.fn[ name ] = function( types, data, fn, origSelector /* Internal Use Only */ ) {
    var type, i = 0, match, namespaces, preType,
      selector = origSelector || this.selector,
      context = origSelector ? this : jQuery( this.context );

    if ( jQuery.isFunction( data ) ) {
      fn = data;
      data = undefined;
    }

    types = (types || "").split(" ");

    while ( (type = types[ i++ ]) != null ) {
      match = rnamespaces.exec( type );
      namespaces = "";

      if ( match )  {
        namespaces = match[0];
        type = type.replace( rnamespaces, "" );
      }

      if ( type === "hover" ) {
        types.push( "mouseenter" + namespaces, "mouseleave" + namespaces );
        continue;
      }

      preType = type;

      if ( type === "focus" || type === "blur" ) {
        types.push( liveMap[ type ] + namespaces );
        type = type + namespaces;

      } else {
        type = (liveMap[ type ] || type) + namespaces;
      }

      if ( name === "live" ) {
        // bind live handler
        context.each(function(){
          jQuery.event.add( this, liveConvert( type, selector ),
            { data: data, selector: selector, handler: fn, origType: type, origHandler: fn, preType: preType } );
        });

      } else {
        // unbind live handler
        context.unbind( liveConvert( type, selector ), fn );
      }
    }

    return this;
  }
});

function liveHandler( event ) {
  var stop, elems = [], selectors = [], args = arguments,
    related, match, handleObj, elem, j, i, l, data,
    events = jQuery.data( this, "events" );

  // Make sure we avoid non-left-click bubbling in Firefox (#3861)
  if ( event.liveFired === this || !events || !events.live || event.button && event.type === "click" ) {
    return;
  }

  event.liveFired = this;

  var live = events.live.slice(0);

  for ( j = 0; j < live.length; j++ ) {
    handleObj = live[j];

    if ( handleObj.origType.replace( rnamespaces, "" ) === event.type ) {
      selectors.push( handleObj.selector );

    } else {
      live.splice( j--, 1 );
    }
  }

  match = jQuery( event.target ).closest( selectors, event.currentTarget );

  for ( i = 0, l = match.length; i < l; i++ ) {
    for ( j = 0; j < live.length; j++ ) {
      handleObj = live[j];

      if ( match[i].selector === handleObj.selector ) {
        elem = match[i].elem;
        related = null;

        // Those two events require additional checking
        if ( handleObj.preType === "mouseenter" || handleObj.preType === "mouseleave" ) {
          related = jQuery( event.relatedTarget ).closest( handleObj.selector )[0];
        }

        if ( !related || related !== elem ) {
          elems.push({ elem: elem, handleObj: handleObj });
        }
      }
    }
  }

  for ( i = 0, l = elems.length; i < l; i++ ) {
    match = elems[i];
    event.currentTarget = match.elem;
    event.data = match.handleObj.data;
    event.handleObj = match.handleObj;

    if ( match.handleObj.origHandler.apply( match.elem, args ) === false ) {
      stop = false;
      break;
    }
  }

  return stop;
}

function liveConvert( type, selector ) {
  return "live." + (type && type !== "*" ? type + "." : "") + selector.replace(/\./g, "`").replace(/ /g, "&");
}

jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
  "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
  "change select submit keydown keypress keyup error").split(" "), function( i, name ) {

  // Handle event binding
  jQuery.fn[ name ] = function( fn ) {
    return fn ? this.bind( name, fn ) : this.trigger( name );
  };

  if ( jQuery.attrFn ) {
    jQuery.attrFn[ name ] = true;
  }
});

// Prevent memory leaks in IE
// Window isn't included so as not to unbind existing unload events
// More info:
//  - http://isaacschlueter.com/2006/10/msie-memory-leaks/
if ( window.attachEvent && !window.addEventListener ) {
  window.attachEvent("onunload", function() {
    for ( var id in jQuery.cache ) {
      if ( jQuery.cache[ id ].handle ) {
        // Try/Catch is to handle iframes being unloaded, see #4280
        try {
          jQuery.event.remove( jQuery.cache[ id ].handle.elem );
        } catch(e) {}
      }
    }
  });
}
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
  done = 0,
  toString = Object.prototype.toString,
  hasDuplicate = false,
  baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
  baseHasDuplicate = false;
  return 0;
});

var Sizzle = function(selector, context, results, seed) {
  results = results || [];
  var origContext = context = context || document;

  if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
    return [];
  }

  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  var parts = [], m, set, checkSet, extra, prune = true, contextXML = isXML(context),
    soFar = selector;

  // Reset the position of the chunker regexp (start from head)
  while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
    soFar = m[3];

    parts.push( m[1] );

    if ( m[2] ) {
      extra = m[3];
      break;
    }
  }

  if ( parts.length > 1 && origPOS.exec( selector ) ) {
    if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
      set = posProcess( parts[0] + parts[1], context );
    } else {
      set = Expr.relative[ parts[0] ] ?
        [ context ] :
        Sizzle( parts.shift(), context );

      while ( parts.length ) {
        selector = parts.shift();

        if ( Expr.relative[ selector ] ) {
          selector += parts.shift();
        }

        set = posProcess( selector, set );
      }
    }
  } else {
    // Take a shortcut and set the context if the root selector is an ID
    // (but not if it'll be faster if the inner selector is an ID)
    if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
      var ret = Sizzle.find( parts.shift(), context, contextXML );
      context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
    }

    if ( context ) {
      var ret = seed ?
        { expr: parts.pop(), set: makeArray(seed) } :
        Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
      set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

      if ( parts.length > 0 ) {
        checkSet = makeArray(set);
      } else {
        prune = false;
      }

      while ( parts.length ) {
        var cur = parts.pop(), pop = cur;

        if ( !Expr.relative[ cur ] ) {
          cur = "";
        } else {
          pop = parts.pop();
        }

        if ( pop == null ) {
          pop = context;
        }

        Expr.relative[ cur ]( checkSet, pop, contextXML );
      }
    } else {
      checkSet = parts = [];
    }
  }

  if ( !checkSet ) {
    checkSet = set;
  }

  if ( !checkSet ) {
    Sizzle.error( cur || selector );
  }

  if ( toString.call(checkSet) === "[object Array]" ) {
    if ( !prune ) {
      results.push.apply( results, checkSet );
    } else if ( context && context.nodeType === 1 ) {
      for ( var i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
          results.push( set[i] );
        }
      }
    } else {
      for ( var i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
          results.push( set[i] );
        }
      }
    }
  } else {
    makeArray( checkSet, results );
  }

  if ( extra ) {
    Sizzle( extra, origContext, results, seed );
    Sizzle.uniqueSort( results );
  }

  return results;
};

Sizzle.uniqueSort = function(results){
  if ( sortOrder ) {
    hasDuplicate = baseHasDuplicate;
    results.sort(sortOrder);

    if ( hasDuplicate ) {
      for ( var i = 1; i < results.length; i++ ) {
        if ( results[i] === results[i-1] ) {
          results.splice(i--, 1);
        }
      }
    }
  }

  return results;
};

Sizzle.matches = function(expr, set){
  return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
  var set, match;

  if ( !expr ) {
    return [];
  }

  for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
    var type = Expr.order[i], match;

    if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
      var left = match[1];
      match.splice(1,1);

      if ( left.substr( left.length - 1 ) !== "\\" ) {
        match[1] = (match[1] || "").replace(/\\/g, "");
        set = Expr.find[ type ]( match, context, isXML );
        if ( set != null ) {
          expr = expr.replace( Expr.match[ type ], "" );
          break;
        }
      }
    }
  }

  if ( !set ) {
    set = context.getElementsByTagName("*");
  }

  return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
  var old = expr, result = [], curLoop = set, match, anyFound,
    isXMLFilter = set && set[0] && isXML(set[0]);

  while ( expr && set.length ) {
    for ( var type in Expr.filter ) {
      if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
        var filter = Expr.filter[ type ], found, item, left = match[1];
        anyFound = false;

        match.splice(1,1);

        if ( left.substr( left.length - 1 ) === "\\" ) {
          continue;
        }

        if ( curLoop === result ) {
          result = [];
        }

        if ( Expr.preFilter[ type ] ) {
          match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

          if ( !match ) {
            anyFound = found = true;
          } else if ( match === true ) {
            continue;
          }
        }

        if ( match ) {
          for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
            if ( item ) {
              found = filter( item, match, i, curLoop );
              var pass = not ^ !!found;

              if ( inplace && found != null ) {
                if ( pass ) {
                  anyFound = true;
                } else {
                  curLoop[i] = false;
                }
              } else if ( pass ) {
                result.push( item );
                anyFound = true;
              }
            }
          }
        }

        if ( found !== undefined ) {
          if ( !inplace ) {
            curLoop = result;
          }

          expr = expr.replace( Expr.match[ type ], "" );

          if ( !anyFound ) {
            return [];
          }

          break;
        }
      }
    }

    // Improper expression
    if ( expr === old ) {
      if ( anyFound == null ) {
        Sizzle.error( expr );
      } else {
        break;
      }
    }

    old = expr;
  }

  return curLoop;
};

Sizzle.error = function( msg ) {
  throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
  order: [ "ID", "NAME", "TAG" ],
  match: {
    ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
    CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
    TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
    CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
    PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
  },
  leftMatch: {},
  attrMap: {
    "class": "className",
    "for": "htmlFor"
  },
  attrHandle: {
    href: function(elem){
      return elem.getAttribute("href");
    }
  },
  relative: {
    "+": function(checkSet, part){
      var isPartStr = typeof part === "string",
        isTag = isPartStr && !/\W/.test(part),
        isPartStrNotTag = isPartStr && !isTag;

      if ( isTag ) {
        part = part.toLowerCase();
      }

      for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
        if ( (elem = checkSet[i]) ) {
          while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

          checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
            elem || false :
            elem === part;
        }
      }

      if ( isPartStrNotTag ) {
        Sizzle.filter( part, checkSet, true );
      }
    },
    ">": function(checkSet, part){
      var isPartStr = typeof part === "string";

      if ( isPartStr && !/\W/.test(part) ) {
        part = part.toLowerCase();

        for ( var i = 0, l = checkSet.length; i < l; i++ ) {
          var elem = checkSet[i];
          if ( elem ) {
            var parent = elem.parentNode;
            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
          }
        }
      } else {
        for ( var i = 0, l = checkSet.length; i < l; i++ ) {
          var elem = checkSet[i];
          if ( elem ) {
            checkSet[i] = isPartStr ?
              elem.parentNode :
              elem.parentNode === part;
          }
        }

        if ( isPartStr ) {
          Sizzle.filter( part, checkSet, true );
        }
      }
    },
    "": function(checkSet, part, isXML){
      var doneName = done++, checkFn = dirCheck;

      if ( typeof part === "string" && !/\W/.test(part) ) {
        var nodeCheck = part = part.toLowerCase();
        checkFn = dirNodeCheck;
      }

      checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
    },
    "~": function(checkSet, part, isXML){
      var doneName = done++, checkFn = dirCheck;

      if ( typeof part === "string" && !/\W/.test(part) ) {
        var nodeCheck = part = part.toLowerCase();
        checkFn = dirNodeCheck;
      }

      checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
    }
  },
  find: {
    ID: function(match, context, isXML){
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);
        return m ? [m] : [];
      }
    },
    NAME: function(match, context){
      if ( typeof context.getElementsByName !== "undefined" ) {
        var ret = [], results = context.getElementsByName(match[1]);

        for ( var i = 0, l = results.length; i < l; i++ ) {
          if ( results[i].getAttribute("name") === match[1] ) {
            ret.push( results[i] );
          }
        }

        return ret.length === 0 ? null : ret;
      }
    },
    TAG: function(match, context){
      return context.getElementsByTagName(match[1]);
    }
  },
  preFilter: {
    CLASS: function(match, curLoop, inplace, result, not, isXML){
      match = " " + match[1].replace(/\\/g, "") + " ";

      if ( isXML ) {
        return match;
      }

      for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
        if ( elem ) {
          if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
            if ( !inplace ) {
              result.push( elem );
            }
          } else if ( inplace ) {
            curLoop[i] = false;
          }
        }
      }

      return false;
    },
    ID: function(match){
      return match[1].replace(/\\/g, "");
    },
    TAG: function(match, curLoop){
      return match[1].toLowerCase();
    },
    CHILD: function(match){
      if ( match[1] === "nth" ) {
        // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
        var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
          match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
          !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

        // calculate the numbers (first)n+(last) including if they are negative
        match[2] = (test[1] + (test[2] || 1)) - 0;
        match[3] = test[3] - 0;
      }

      // TODO: Move to normal caching system
      match[0] = done++;

      return match;
    },
    ATTR: function(match, curLoop, inplace, result, not, isXML){
      var name = match[1].replace(/\\/g, "");

      if ( !isXML && Expr.attrMap[name] ) {
        match[1] = Expr.attrMap[name];
      }

      if ( match[2] === "~=" ) {
        match[4] = " " + match[4] + " ";
      }

      return match;
    },
    PSEUDO: function(match, curLoop, inplace, result, not){
      if ( match[1] === "not" ) {
        // If we're dealing with a complex expression, or a simple one
        if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
          match[3] = Sizzle(match[3], null, null, curLoop);
        } else {
          var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
          if ( !inplace ) {
            result.push.apply( result, ret );
          }
          return false;
        }
      } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
        return true;
      }

      return match;
    },
    POS: function(match){
      match.unshift( true );
      return match;
    }
  },
  filters: {
    enabled: function(elem){
      return elem.disabled === false && elem.type !== "hidden";
    },
    disabled: function(elem){
      return elem.disabled === true;
    },
    checked: function(elem){
      return elem.checked === true;
    },
    selected: function(elem){
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      elem.parentNode.selectedIndex;
      return elem.selected === true;
    },
    parent: function(elem){
      return !!elem.firstChild;
    },
    empty: function(elem){
      return !elem.firstChild;
    },
    has: function(elem, i, match){
      return !!Sizzle( match[3], elem ).length;
    },
    header: function(elem){
      return /h\d/i.test( elem.nodeName );
    },
    text: function(elem){
      return "text" === elem.type;
    },
    radio: function(elem){
      return "radio" === elem.type;
    },
    checkbox: function(elem){
      return "checkbox" === elem.type;
    },
    file: function(elem){
      return "file" === elem.type;
    },
    password: function(elem){
      return "password" === elem.type;
    },
    submit: function(elem){
      return "submit" === elem.type;
    },
    image: function(elem){
      return "image" === elem.type;
    },
    reset: function(elem){
      return "reset" === elem.type;
    },
    button: function(elem){
      return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
    },
    input: function(elem){
      return /input|select|textarea|button/i.test(elem.nodeName);
    }
  },
  setFilters: {
    first: function(elem, i){
      return i === 0;
    },
    last: function(elem, i, match, array){
      return i === array.length - 1;
    },
    even: function(elem, i){
      return i % 2 === 0;
    },
    odd: function(elem, i){
      return i % 2 === 1;
    },
    lt: function(elem, i, match){
      return i < match[3] - 0;
    },
    gt: function(elem, i, match){
      return i > match[3] - 0;
    },
    nth: function(elem, i, match){
      return match[3] - 0 === i;
    },
    eq: function(elem, i, match){
      return match[3] - 0 === i;
    }
  },
  filter: {
    PSEUDO: function(elem, match, i, array){
      var name = match[1], filter = Expr.filters[ name ];

      if ( filter ) {
        return filter( elem, i, match, array );
      } else if ( name === "contains" ) {
        return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
      } else if ( name === "not" ) {
        var not = match[3];

        for ( var i = 0, l = not.length; i < l; i++ ) {
          if ( not[i] === elem ) {
            return false;
          }
        }

        return true;
      } else {
        Sizzle.error( "Syntax error, unrecognized expression: " + name );
      }
    },
    CHILD: function(elem, match){
      var type = match[1], node = elem;
      switch (type) {
        case 'only':
        case 'first':
          while ( (node = node.previousSibling) )   {
            if ( node.nodeType === 1 ) {
              return false;
            }
          }
          if ( type === "first" ) {
            return true;
          }
          node = elem;
        case 'last':
          while ( (node = node.nextSibling) )   {
            if ( node.nodeType === 1 ) {
              return false;
            }
          }
          return true;
        case 'nth':
          var first = match[2], last = match[3];

          if ( first === 1 && last === 0 ) {
            return true;
          }

          var doneName = match[0],
            parent = elem.parentNode;

          if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
            var count = 0;
            for ( node = parent.firstChild; node; node = node.nextSibling ) {
              if ( node.nodeType === 1 ) {
                node.nodeIndex = ++count;
              }
            }
            parent.sizcache = doneName;
          }

          var diff = elem.nodeIndex - last;
          if ( first === 0 ) {
            return diff === 0;
          } else {
            return ( diff % first === 0 && diff / first >= 0 );
          }
      }
    },
    ID: function(elem, match){
      return elem.nodeType === 1 && elem.getAttribute("id") === match;
    },
    TAG: function(elem, match){
      return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
    },
    CLASS: function(elem, match){
      return (" " + (elem.className || elem.getAttribute("class")) + " ")
        .indexOf( match ) > -1;
    },
    ATTR: function(elem, match){
      var name = match[1],
        result = Expr.attrHandle[ name ] ?
          Expr.attrHandle[ name ]( elem ) :
          elem[ name ] != null ?
            elem[ name ] :
            elem.getAttribute( name ),
        value = result + "",
        type = match[2],
        check = match[4];

      return result == null ?
        type === "!=" :
        type === "=" ?
        value === check :
        type === "*=" ?
        value.indexOf(check) >= 0 :
        type === "~=" ?
        (" " + value + " ").indexOf(check) >= 0 :
        !check ?
        value && result !== false :
        type === "!=" ?
        value !== check :
        type === "^=" ?
        value.indexOf(check) === 0 :
        type === "$=" ?
        value.substr(value.length - check.length) === check :
        type === "|=" ?
        value === check || value.substr(0, check.length + 1) === check + "-" :
        false;
    },
    POS: function(elem, match, i, array){
      var name = match[2], filter = Expr.setFilters[ name ];

      if ( filter ) {
        return filter( elem, i, match, array );
      }
    }
  }
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
  Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
  Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, function(all, num){
    return "\\" + (num - 0 + 1);
  }));
}

var makeArray = function(array, results) {
  array = Array.prototype.slice.call( array, 0 );

  if ( results ) {
    results.push.apply( results, array );
    return results;
  }

  return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
  Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
  makeArray = function(array, results) {
    var ret = results || [];

    if ( toString.call(array) === "[object Array]" ) {
      Array.prototype.push.apply( ret, array );
    } else {
      if ( typeof array.length === "number" ) {
        for ( var i = 0, l = array.length; i < l; i++ ) {
          ret.push( array[i] );
        }
      } else {
        for ( var i = 0; array[i]; i++ ) {
          ret.push( array[i] );
        }
      }
    }

    return ret;
  };
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
  sortOrder = function( a, b ) {
    if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
      if ( a == b ) {
        hasDuplicate = true;
      }
      return a.compareDocumentPosition ? -1 : 1;
    }

    var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
    if ( ret === 0 ) {
      hasDuplicate = true;
    }
    return ret;
  };
} else if ( "sourceIndex" in document.documentElement ) {
  sortOrder = function( a, b ) {
    if ( !a.sourceIndex || !b.sourceIndex ) {
      if ( a == b ) {
        hasDuplicate = true;
      }
      return a.sourceIndex ? -1 : 1;
    }

    var ret = a.sourceIndex - b.sourceIndex;
    if ( ret === 0 ) {
      hasDuplicate = true;
    }
    return ret;
  };
} else if ( document.createRange ) {
  sortOrder = function( a, b ) {
    if ( !a.ownerDocument || !b.ownerDocument ) {
      if ( a == b ) {
        hasDuplicate = true;
      }
      return a.ownerDocument ? -1 : 1;
    }

    var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
    aRange.setStart(a, 0);
    aRange.setEnd(a, 0);
    bRange.setStart(b, 0);
    bRange.setEnd(b, 0);
    var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
    if ( ret === 0 ) {
      hasDuplicate = true;
    }
    return ret;
  };
}

// Utility function for retreiving the text value of an array of DOM nodes
function getText( elems ) {
  var ret = "", elem;

  for ( var i = 0; elems[i]; i++ ) {
    elem = elems[i];

    // Get the text from text nodes and CDATA nodes
    if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
      ret += elem.nodeValue;

    // Traverse everything else, except comment nodes
    } else if ( elem.nodeType !== 8 ) {
      ret += getText( elem.childNodes );
    }
  }

  return ret;
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
  // We're going to inject a fake input element with a specified name
  var form = document.createElement("div"),
    id = "script" + (new Date).getTime();
  form.innerHTML = "<a name='" + id + "'/>";

  // Inject it into the root element, check its status, and remove it quickly
  var root = document.documentElement;
  root.insertBefore( form, root.firstChild );

  // The workaround has to do additional checks after a getElementById
  // Which slows things down for other browsers (hence the branching)
  if ( document.getElementById( id ) ) {
    Expr.find.ID = function(match, context, isXML){
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);
        return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
      }
    };

    Expr.filter.ID = function(elem, match){
      var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
      return elem.nodeType === 1 && node && node.nodeValue === match;
    };
  }

  root.removeChild( form );
  root = form = null; // release memory in IE
})();

(function(){
  // Check to see if the browser returns only elements
  // when doing getElementsByTagName("*")

  // Create a fake element
  var div = document.createElement("div");
  div.appendChild( document.createComment("") );

  // Make sure no comments are found
  if ( div.getElementsByTagName("*").length > 0 ) {
    Expr.find.TAG = function(match, context){
      var results = context.getElementsByTagName(match[1]);

      // Filter out possible comments
      if ( match[1] === "*" ) {
        var tmp = [];

        for ( var i = 0; results[i]; i++ ) {
          if ( results[i].nodeType === 1 ) {
            tmp.push( results[i] );
          }
        }

        results = tmp;
      }

      return results;
    };
  }

  // Check to see if an attribute returns normalized href attributes
  div.innerHTML = "<a href='#'></a>";
  if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
      div.firstChild.getAttribute("href") !== "#" ) {
    Expr.attrHandle.href = function(elem){
      return elem.getAttribute("href", 2);
    };
  }

  div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
  (function(){
    var oldSizzle = Sizzle, div = document.createElement("div");
    div.innerHTML = "<p class='TEST'></p>";

    // Safari can't handle uppercase or unicode characters when
    // in quirks mode.
    if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
      return;
    }

    Sizzle = function(query, context, extra, seed){
      context = context || document;

      // Only use querySelectorAll on non-XML documents
      // (ID selectors don't work in non-HTML documents)
      if ( !seed && context.nodeType === 9 && !isXML(context) ) {
        try {
          return makeArray( context.querySelectorAll(query), extra );
        } catch(e){}
      }

      return oldSizzle(query, context, extra, seed);
    };

    for ( var prop in oldSizzle ) {
      Sizzle[ prop ] = oldSizzle[ prop ];
    }

    div = null; // release memory in IE
  })();
}

(function(){
  var div = document.createElement("div");

  div.innerHTML = "<div class='test e'></div><div class='test'></div>";

  // Opera can't find a second classname (in 9.6)
  // Also, make sure that getElementsByClassName actually exists
  if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
    return;
  }

  // Safari caches class attributes, doesn't catch changes (in 3.2)
  div.lastChild.className = "e";

  if ( div.getElementsByClassName("e").length === 1 ) {
    return;
  }

  Expr.order.splice(1, 0, "CLASS");
  Expr.find.CLASS = function(match, context, isXML) {
    if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
      return context.getElementsByClassName(match[1]);
    }
  };

  div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];
    if ( elem ) {
      elem = elem[dir];
      var match = false;

      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }

        if ( elem.nodeType === 1 && !isXML ){
          elem.sizcache = doneName;
          elem.sizset = i;
        }

        if ( elem.nodeName.toLowerCase() === cur ) {
          match = elem;
          break;
        }

        elem = elem[dir];
      }

      checkSet[i] = match;
    }
  }
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];
    if ( elem ) {
      elem = elem[dir];
      var match = false;

      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }

        if ( elem.nodeType === 1 ) {
          if ( !isXML ) {
            elem.sizcache = doneName;
            elem.sizset = i;
          }
          if ( typeof cur !== "string" ) {
            if ( elem === cur ) {
              match = true;
              break;
            }

          } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
            match = elem;
            break;
          }
        }

        elem = elem[dir];
      }

      checkSet[i] = match;
    }
  }
}

var contains = document.compareDocumentPosition ? function(a, b){
  return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
  return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833)
  var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
  var tmpSet = [], later = "", match,
    root = context.nodeType ? [context] : context;

  // Position selectors must be done after the filter
  // And so must :not(positional) so we move all PSEUDOs to the end
  while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
    later += match[0];
    selector = selector.replace( Expr.match.PSEUDO, "" );
  }

  selector = Expr.relative[selector] ? selector + "*" : selector;

  for ( var i = 0, l = root.length; i < l; i++ ) {
    Sizzle( selector, root[i], tmpSet );
  }

  return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.filters;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = getText;
jQuery.isXMLDoc = isXML;
jQuery.contains = contains;

return;

window.Sizzle = Sizzle;

})();
var runtil = /Until$/,
  rparentsprev = /^(?:parents|prevUntil|prevAll)/,
  // Note: This RegExp should be improved, or likely pulled from Sizzle
  rmultiselector = /,/,
  slice = Array.prototype.slice;

// Implement the identical functionality for filter and not
var winnow = function( elements, qualifier, keep ) {
  if ( jQuery.isFunction( qualifier ) ) {
    return jQuery.grep(elements, function( elem, i ) {
      return !!qualifier.call( elem, i, elem ) === keep;
    });

  } else if ( qualifier.nodeType ) {
    return jQuery.grep(elements, function( elem, i ) {
      return (elem === qualifier) === keep;
    });

  } else if ( typeof qualifier === "string" ) {
    var filtered = jQuery.grep(elements, function( elem ) {
      return elem.nodeType === 1;
    });

    if ( isSimple.test( qualifier ) ) {
      return jQuery.filter(qualifier, filtered, !keep);
    } else {
      qualifier = jQuery.filter( qualifier, filtered );
    }
  }

  return jQuery.grep(elements, function( elem, i ) {
    return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
  });
};

jQuery.fn.extend({
  find: function( selector ) {
    var ret = this.pushStack( "", "find", selector ), length = 0;

    for ( var i = 0, l = this.length; i < l; i++ ) {
      length = ret.length;
      jQuery.find( selector, this[i], ret );

      if ( i > 0 ) {
        // Make sure that the results are unique
        for ( var n = length; n < ret.length; n++ ) {
          for ( var r = 0; r < length; r++ ) {
            if ( ret[r] === ret[n] ) {
              ret.splice(n--, 1);
              break;
            }
          }
        }
      }
    }

    return ret;
  },

  has: function( target ) {
    var targets = jQuery( target );
    return this.filter(function() {
      for ( var i = 0, l = targets.length; i < l; i++ ) {
        if ( jQuery.contains( this, targets[i] ) ) {
          return true;
        }
      }
    });
  },

  not: function( selector ) {
    return this.pushStack( winnow(this, selector, false), "not", selector);
  },

  filter: function( selector ) {
    return this.pushStack( winnow(this, selector, true), "filter", selector );
  },

  is: function( selector ) {
    return !!selector && jQuery.filter( selector, this ).length > 0;
  },

  closest: function( selectors, context ) {
    if ( jQuery.isArray( selectors ) ) {
      var ret = [], cur = this[0], match, matches = {}, selector;

      if ( cur && selectors.length ) {
        for ( var i = 0, l = selectors.length; i < l; i++ ) {
          selector = selectors[i];

          if ( !matches[selector] ) {
            matches[selector] = jQuery.expr.match.POS.test( selector ) ?
              jQuery( selector, context || this.context ) :
              selector;
          }
        }

        while ( cur && cur.ownerDocument && cur !== context ) {
          for ( selector in matches ) {
            match = matches[selector];

            if ( match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match) ) {
              ret.push({ selector: selector, elem: cur });
              delete matches[selector];
            }
          }
          cur = cur.parentNode;
        }
      }

      return ret;
    }

    var pos = jQuery.expr.match.POS.test( selectors ) ?
      jQuery( selectors, context || this.context ) : null;

    return this.map(function( i, cur ) {
      while ( cur && cur.ownerDocument && cur !== context ) {
        if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selectors) ) {
          return cur;
        }
        cur = cur.parentNode;
      }
      return null;
    });
  },

  // Determine the position of an element within
  // the matched set of elements
  index: function( elem ) {
    if ( !elem || typeof elem === "string" ) {
      return jQuery.inArray( this[0],
        // If it receives a string, the selector is used
        // If it receives nothing, the siblings are used
        elem ? jQuery( elem ) : this.parent().children() );
    }
    // Locate the position of the desired element
    return jQuery.inArray(
      // If it receives a jQuery object, the first element is used
      elem.jquery ? elem[0] : elem, this );
  },

  add: function( selector, context ) {
    var set = typeof selector === "string" ?
        jQuery( selector, context || this.context ) :
        jQuery.makeArray( selector ),
      all = jQuery.merge( this.get(), set );

    return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
      all :
      jQuery.unique( all ) );
  },

  andSelf: function() {
    return this.add( this.prevObject );
  }
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
  return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jQuery.each({
  parent: function( elem ) {
    var parent = elem.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  },
  parents: function( elem ) {
    return jQuery.dir( elem, "parentNode" );
  },
  parentsUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "parentNode", until );
  },
  next: function( elem ) {
    return jQuery.nth( elem, 2, "nextSibling" );
  },
  prev: function( elem ) {
    return jQuery.nth( elem, 2, "previousSibling" );
  },
  nextAll: function( elem ) {
    return jQuery.dir( elem, "nextSibling" );
  },
  prevAll: function( elem ) {
    return jQuery.dir( elem, "previousSibling" );
  },
  nextUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "nextSibling", until );
  },
  prevUntil: function( elem, i, until ) {
    return jQuery.dir( elem, "previousSibling", until );
  },
  siblings: function( elem ) {
    return jQuery.sibling( elem.parentNode.firstChild, elem );
  },
  children: function( elem ) {
    return jQuery.sibling( elem.firstChild );
  },
  contents: function( elem ) {
    return jQuery.nodeName( elem, "iframe" ) ?
      elem.contentDocument || elem.contentWindow.document :
      jQuery.makeArray( elem.childNodes );
  }
}, function( name, fn ) {
  jQuery.fn[ name ] = function( until, selector ) {
    var ret = jQuery.map( this, fn, until );

    if ( !runtil.test( name ) ) {
      selector = until;
    }

    if ( selector && typeof selector === "string" ) {
      ret = jQuery.filter( selector, ret );
    }

    ret = this.length > 1 ? jQuery.unique( ret ) : ret;

    if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
      ret = ret.reverse();
    }

    return this.pushStack( ret, name, slice.call(arguments).join(",") );
  };
});

jQuery.extend({
  filter: function( expr, elems, not ) {
    if ( not ) {
      expr = ":not(" + expr + ")";
    }

    return jQuery.find.matches(expr, elems);
  },

  dir: function( elem, dir, until ) {
    var matched = [], cur = elem[dir];
    while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
      if ( cur.nodeType === 1 ) {
        matched.push( cur );
      }
      cur = cur[dir];
    }
    return matched;
  },

  nth: function( cur, result, dir, elem ) {
    result = result || 1;
    var num = 0;

    for ( ; cur; cur = cur[dir] ) {
      if ( cur.nodeType === 1 && ++num === result ) {
        break;
      }
    }

    return cur;
  },

  sibling: function( n, elem ) {
    var r = [];

    for ( ; n; n = n.nextSibling ) {
      if ( n.nodeType === 1 && n !== elem ) {
        r.push( n );
      }
    }

    return r;
  }
});
var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
  rleadingWhitespace = /^\s+/,
  rxhtmlTag = /(<([\w:]+)[^>]*?)\/>/g,
  rselfClosing = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
  rtagName = /<([\w:]+)/,
  rtbody = /<tbody/i,
  rhtml = /<|&#?\w+;/,
  rnocache = /<script|<object|<embed|<option|<style/i,
  rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,  // checked="checked" or checked (html5)
  fcloseTag = function( all, front, tag ) {
    return rselfClosing.test( tag ) ?
      all :
      front + "></" + tag + ">";
  },
  wrapMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    area: [ 1, "<map>", "</map>" ],
    _default: [ 0, "", "" ]
  };

wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// IE can't serialize <link> and <script> tags normally
if ( !jQuery.support.htmlSerialize ) {
  wrapMap._default = [ 1, "div<div>", "</div>" ];
}

jQuery.fn.extend({
  text: function( text ) {
    if ( jQuery.isFunction(text) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        self.text( text.call(this, i, self.text()) );
      });
    }

    if ( typeof text !== "object" && text !== undefined ) {
      return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
    }

    return jQuery.text( this );
  },

  wrapAll: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapAll( html.call(this, i) );
      });
    }

    if ( this[0] ) {
      // The elements to wrap the target around
      var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);

      if ( this[0].parentNode ) {
        wrap.insertBefore( this[0] );
      }

      wrap.map(function() {
        var elem = this;

        while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
          elem = elem.firstChild;
        }

        return elem;
      }).append(this);
    }

    return this;
  },

  wrapInner: function( html ) {
    if ( jQuery.isFunction( html ) ) {
      return this.each(function(i) {
        jQuery(this).wrapInner( html.call(this, i) );
      });
    }

    return this.each(function() {
      var self = jQuery( this ), contents = self.contents();

      if ( contents.length ) {
        contents.wrapAll( html );

      } else {
        self.append( html );
      }
    });
  },

  wrap: function( html ) {
    return this.each(function() {
      jQuery( this ).wrapAll( html );
    });
  },

  unwrap: function() {
    return this.parent().each(function() {
      if ( !jQuery.nodeName( this, "body" ) ) {
        jQuery( this ).replaceWith( this.childNodes );
      }
    }).end();
  },

  append: function() {
    return this.domManip(arguments, true, function( elem ) {
      if ( this.nodeType === 1 ) {
        this.appendChild( elem );
      }
    });
  },

  prepend: function() {
    return this.domManip(arguments, true, function( elem ) {
      if ( this.nodeType === 1 ) {
        this.insertBefore( elem, this.firstChild );
      }
    });
  },

  before: function() {
    if ( this[0] && this[0].parentNode ) {
      return this.domManip(arguments, false, function( elem ) {
        this.parentNode.insertBefore( elem, this );
      });
    } else if ( arguments.length ) {
      var set = jQuery(arguments[0]);
      set.push.apply( set, this.toArray() );
      return this.pushStack( set, "before", arguments );
    }
  },

  after: function() {
    if ( this[0] && this[0].parentNode ) {
      return this.domManip(arguments, false, function( elem ) {
        this.parentNode.insertBefore( elem, this.nextSibling );
      });
    } else if ( arguments.length ) {
      var set = this.pushStack( this, "after", arguments );
      set.push.apply( set, jQuery(arguments[0]).toArray() );
      return set;
    }
  },

  // keepData is for internal use only--do not document
  remove: function( selector, keepData ) {
    for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
      if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
        if ( !keepData && elem.nodeType === 1 ) {
          jQuery.cleanData( elem.getElementsByTagName("*") );
          jQuery.cleanData( [ elem ] );
        }

        if ( elem.parentNode ) {
           elem.parentNode.removeChild( elem );
        }
      }
    }

    return this;
  },

  empty: function() {
    for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
      // Remove element nodes and prevent memory leaks
      if ( elem.nodeType === 1 ) {
        jQuery.cleanData( elem.getElementsByTagName("*") );
      }

      // Remove any remaining nodes
      while ( elem.firstChild ) {
        elem.removeChild( elem.firstChild );
      }
    }

    return this;
  },

  clone: function( events ) {
    // Do the clone
    var ret = this.map(function() {
      if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
        // IE copies events bound via attachEvent when
        // using cloneNode. Calling detachEvent on the
        // clone will also remove the events from the orignal
        // In order to get around this, we use innerHTML.
        // Unfortunately, this means some modifications to
        // attributes in IE that are actually only stored
        // as properties will not be copied (such as the
        // the name attribute on an input).
        var html = this.outerHTML, ownerDocument = this.ownerDocument;
        if ( !html ) {
          var div = ownerDocument.createElement("div");
          div.appendChild( this.cloneNode(true) );
          html = div.innerHTML;
        }

        return jQuery.clean([html.replace(rinlinejQuery, "")
          // Handle the case in IE 8 where action=/test/> self-closes a tag
          .replace(/=([^="'>\s]+\/)>/g, '="$1">')
          .replace(rleadingWhitespace, "")], ownerDocument)[0];
      } else {
        return this.cloneNode(true);
      }
    });

    // Copy the events from the original to the clone
    if ( events === true ) {
      cloneCopyEvent( this, ret );
      cloneCopyEvent( this.find("*"), ret.find("*") );
    }

    // Return the cloned set
    return ret;
  },

  html: function( value ) {
    if ( value === undefined ) {
      return this[0] && this[0].nodeType === 1 ?
        this[0].innerHTML.replace(rinlinejQuery, "") :
        null;

    // See if we can take a shortcut and just use innerHTML
    } else if ( typeof value === "string" && !rnocache.test( value ) &&
      (jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
      !wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {

      value = value.replace(rxhtmlTag, fcloseTag);

      try {
        for ( var i = 0, l = this.length; i < l; i++ ) {
          // Remove element nodes and prevent memory leaks
          if ( this[i].nodeType === 1 ) {
            jQuery.cleanData( this[i].getElementsByTagName("*") );
            this[i].innerHTML = value;
          }
        }

      // If using innerHTML throws an exception, use the fallback method
      } catch(e) {
        this.empty().append( value );
      }

    } else if ( jQuery.isFunction( value ) ) {
      this.each(function(i){
        var self = jQuery(this), old = self.html();
        self.empty().append(function(){
          return value.call( this, i, old );
        });
      });

    } else {
      this.empty().append( value );
    }

    return this;
  },

  replaceWith: function( value ) {
    if ( this[0] && this[0].parentNode ) {
      // Make sure that the elements are removed from the DOM before they are inserted
      // this can help fix replacing a parent with child elements
      if ( jQuery.isFunction( value ) ) {
        return this.each(function(i) {
          var self = jQuery(this), old = self.html();
          self.replaceWith( value.call( this, i, old ) );
        });
      }

      if ( typeof value !== "string" ) {
        value = jQuery(value).detach();
      }

      return this.each(function() {
        var next = this.nextSibling, parent = this.parentNode;

        jQuery(this).remove();

        if ( next ) {
          jQuery(next).before( value );
        } else {
          jQuery(parent).append( value );
        }
      });
    } else {
      return this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value );
    }
  },

  detach: function( selector ) {
    return this.remove( selector, true );
  },

  domManip: function( args, table, callback ) {
    var results, first, value = args[0], scripts = [], fragment, parent;

    // We can't cloneNode fragments that contain checked, in WebKit
    if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
      return this.each(function() {
        jQuery(this).domManip( args, table, callback, true );
      });
    }

    if ( jQuery.isFunction(value) ) {
      return this.each(function(i) {
        var self = jQuery(this);
        args[0] = value.call(this, i, table ? self.html() : undefined);
        self.domManip( args, table, callback );
      });
    }

    if ( this[0] ) {
      parent = value && value.parentNode;

      // If we're in a fragment, just use that instead of building a new one
      if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
        results = { fragment: parent };

      } else {
        results = buildFragment( args, this, scripts );
      }

      fragment = results.fragment;

      if ( fragment.childNodes.length === 1 ) {
        first = fragment = fragment.firstChild;
      } else {
        first = fragment.firstChild;
      }

      if ( first ) {
        table = table && jQuery.nodeName( first, "tr" );

        for ( var i = 0, l = this.length; i < l; i++ ) {
          callback.call(
            table ?
              root(this[i], first) :
              this[i],
            i > 0 || results.cacheable || this.length > 1  ?
              fragment.cloneNode(true) :
              fragment
          );
        }
      }

      if ( scripts.length ) {
        jQuery.each( scripts, evalScript );
      }
    }

    return this;

    function root( elem, cur ) {
      return jQuery.nodeName(elem, "table") ?
        (elem.getElementsByTagName("tbody")[0] ||
        elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
        elem;
    }
  }
});

function cloneCopyEvent(orig, ret) {
  var i = 0;

  ret.each(function() {
    if ( this.nodeName !== (orig[i] && orig[i].nodeName) ) {
      return;
    }

    var oldData = jQuery.data( orig[i++] ), curData = jQuery.data( this, oldData ), events = oldData && oldData.events;

    if ( events ) {
      delete curData.handle;
      curData.events = {};

      for ( var type in events ) {
        for ( var handler in events[ type ] ) {
          jQuery.event.add( this, type, events[ type ][ handler ], events[ type ][ handler ].data );
        }
      }
    }
  });
}

function buildFragment( args, nodes, scripts ) {
  var fragment, cacheable, cacheresults,
    doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);

  // Only cache "small" (1/2 KB) strings that are associated with the main document
  // Cloning options loses the selected state, so don't cache them
  // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
  // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
  if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
    !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {

    cacheable = true;
    cacheresults = jQuery.fragments[ args[0] ];
    if ( cacheresults ) {
      if ( cacheresults !== 1 ) {
        fragment = cacheresults;
      }
    }
  }

  if ( !fragment ) {
    fragment = doc.createDocumentFragment();
    jQuery.clean( args, doc, fragment, scripts );
  }

  if ( cacheable ) {
    jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
  }

  return { fragment: fragment, cacheable: cacheable };
}

jQuery.fragments = {};

jQuery.each({
  appendTo: "append",
  prependTo: "prepend",
  insertBefore: "before",
  insertAfter: "after",
  replaceAll: "replaceWith"
}, function( name, original ) {
  jQuery.fn[ name ] = function( selector ) {
    var ret = [], insert = jQuery( selector ),
      parent = this.length === 1 && this[0].parentNode;

    if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
      insert[ original ]( this[0] );
      return this;

    } else {
      for ( var i = 0, l = insert.length; i < l; i++ ) {
        var elems = (i > 0 ? this.clone(true) : this).get();
        jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
        ret = ret.concat( elems );
      }

      return this.pushStack( ret, name, insert.selector );
    }
  };
});

jQuery.extend({
  clean: function( elems, context, fragment, scripts ) {
    context = context || document;

    // !context.createElement fails in IE with an error but returns typeof 'object'
    if ( typeof context.createElement === "undefined" ) {
      context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
    }

    var ret = [];

    for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
      if ( typeof elem === "number" ) {
        elem += "";
      }

      if ( !elem ) {
        continue;
      }

      // Convert html string into DOM nodes
      if ( typeof elem === "string" && !rhtml.test( elem ) ) {
        elem = context.createTextNode( elem );

      } else if ( typeof elem === "string" ) {
        // Fix "XHTML"-style tags in all browsers
        elem = elem.replace(rxhtmlTag, fcloseTag);

        // Trim whitespace, otherwise indexOf won't work as expected
        var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
          wrap = wrapMap[ tag ] || wrapMap._default,
          depth = wrap[0],
          div = context.createElement("div");

        // Go to html and back, then peel off extra wrappers
        div.innerHTML = wrap[1] + elem + wrap[2];

        // Move to the right depth
        while ( depth-- ) {
          div = div.lastChild;
        }

        // Remove IE's autoinserted <tbody> from table fragments
        if ( !jQuery.support.tbody ) {

          // String was a <table>, *may* have spurious <tbody>
          var hasBody = rtbody.test(elem),
            tbody = tag === "table" && !hasBody ?
              div.firstChild && div.firstChild.childNodes :

              // String was a bare <thead> or <tfoot>
              wrap[1] === "<table>" && !hasBody ?
                div.childNodes :
                [];

          for ( var j = tbody.length - 1; j >= 0 ; --j ) {
            if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
              tbody[ j ].parentNode.removeChild( tbody[ j ] );
            }
          }

        }

        // IE completely kills leading whitespace when innerHTML is used
        if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
          div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
        }

        elem = div.childNodes;
      }

      if ( elem.nodeType ) {
        ret.push( elem );
      } else {
        ret = jQuery.merge( ret, elem );
      }
    }

    if ( fragment ) {
      for ( var i = 0; ret[i]; i++ ) {
        if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
          scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );

        } else {
          if ( ret[i].nodeType === 1 ) {
            ret.splice.apply( ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))) );
          }
          fragment.appendChild( ret[i] );
        }
      }
    }

    return ret;
  },

  cleanData: function( elems ) {
    var data, id, cache = jQuery.cache,
      special = jQuery.event.special,
      deleteExpando = jQuery.support.deleteExpando;

    for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
      id = elem[ jQuery.expando ];

      if ( id ) {
        data = cache[ id ];

        if ( data.events ) {
          for ( var type in data.events ) {
            if ( special[ type ] ) {
              jQuery.event.remove( elem, type );

            } else {
              removeEvent( elem, type, data.handle );
            }
          }
        }

        if ( deleteExpando ) {
          delete elem[ jQuery.expando ];

        } else if ( elem.removeAttribute ) {
          elem.removeAttribute( jQuery.expando );
        }

        delete cache[ id ];
      }
    }
  }
});
// exclude the following css properties to add px
var rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i,
  ralpha = /alpha\([^)]*\)/,
  ropacity = /opacity=([^)]*)/,
  rfloat = /float/i,
  rdashAlpha = /-([a-z])/ig,
  rupper = /([A-Z])/g,
  rnumpx = /^-?\d+(?:px)?$/i,
  rnum = /^-?\d/,

  cssShow = { position: "absolute", visibility: "hidden", display:"block" },
  cssWidth = [ "Left", "Right" ],
  cssHeight = [ "Top", "Bottom" ],

  // cache check for defaultView.getComputedStyle
  getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
  // normalize float css property
  styleFloat = jQuery.support.cssFloat ? "cssFloat" : "styleFloat",
  fcamelCase = function( all, letter ) {
    return letter.toUpperCase();
  };

jQuery.fn.css = function( name, value ) {
  return access( this, name, value, true, function( elem, name, value ) {
    if ( value === undefined ) {
      return jQuery.curCSS( elem, name );
    }

    if ( typeof value === "number" && !rexclude.test(name) ) {
      value += "px";
    }

    jQuery.style( elem, name, value );
  });
};

jQuery.extend({
  style: function( elem, name, value ) {
    // don't set styles on text and comment nodes
    if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
      return undefined;
    }

    // ignore negative width and height values #1599
    if ( (name === "width" || name === "height") && parseFloat(value) < 0 ) {
      value = undefined;
    }

    var style = elem.style || elem, set = value !== undefined;

    // IE uses filters for opacity
    if ( !jQuery.support.opacity && name === "opacity" ) {
      if ( set ) {
        // IE has trouble with opacity if it does not have layout
        // Force it by setting the zoom level
        style.zoom = 1;

        // Set the alpha filter to set the opacity
        var opacity = parseInt( value, 10 ) + "" === "NaN" ? "" : "alpha(opacity=" + value * 100 + ")";
        var filter = style.filter || jQuery.curCSS( elem, "filter" ) || "";
        style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : opacity;
      }

      return style.filter && style.filter.indexOf("opacity=") >= 0 ?
        (parseFloat( ropacity.exec(style.filter)[1] ) / 100) + "":
        "";
    }

    // Make sure we're using the right name for getting the float value
    if ( rfloat.test( name ) ) {
      name = styleFloat;
    }

    name = name.replace(rdashAlpha, fcamelCase);

    if ( set ) {
      style[ name ] = value;
    }

    return style[ name ];
  },

  css: function( elem, name, force, extra ) {
    if ( name === "width" || name === "height" ) {
      var val, props = cssShow, which = name === "width" ? cssWidth : cssHeight;

      function getWH() {
        val = name === "width" ? elem.offsetWidth : elem.offsetHeight;

        if ( extra === "border" ) {
          return;
        }

        jQuery.each( which, function() {
          if ( !extra ) {
            val -= parseFloat(jQuery.curCSS( elem, "padding" + this, true)) || 0;
          }

          if ( extra === "margin" ) {
            val += parseFloat(jQuery.curCSS( elem, "margin" + this, true)) || 0;
          } else {
            val -= parseFloat(jQuery.curCSS( elem, "border" + this + "Width", true)) || 0;
          }
        });
      }

      if ( elem.offsetWidth !== 0 ) {
        getWH();
      } else {
        jQuery.swap( elem, props, getWH );
      }

      return Math.max(0, Math.round(val));
    }

    return jQuery.curCSS( elem, name, force );
  },

  curCSS: function( elem, name, force ) {
    var ret, style = elem.style, filter;

    // IE uses filters for opacity
    if ( !jQuery.support.opacity && name === "opacity" && elem.currentStyle ) {
      ret = ropacity.test(elem.currentStyle.filter || "") ?
        (parseFloat(RegExp.$1) / 100) + "" :
        "";

      return ret === "" ?
        "1" :
        ret;
    }

    // Make sure we're using the right name for getting the float value
    if ( rfloat.test( name ) ) {
      name = styleFloat;
    }

    if ( !force && style && style[ name ] ) {
      ret = style[ name ];

    } else if ( getComputedStyle ) {

      // Only "float" is needed here
      if ( rfloat.test( name ) ) {
        name = "float";
      }

      name = name.replace( rupper, "-$1" ).toLowerCase();

      var defaultView = elem.ownerDocument.defaultView;

      if ( !defaultView ) {
        return null;
      }

      var computedStyle = defaultView.getComputedStyle( elem, null );

      if ( computedStyle ) {
        ret = computedStyle.getPropertyValue( name );
      }

      // We should always get a number back from opacity
      if ( name === "opacity" && ret === "" ) {
        ret = "1";
      }

    } else if ( elem.currentStyle ) {
      var camelCase = name.replace(rdashAlpha, fcamelCase);

      ret = elem.currentStyle[ name ] || elem.currentStyle[ camelCase ];

      // From the awesome hack by Dean Edwards
      // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

      // If we're not dealing with a regular pixel number
      // but a number that has a weird ending, we need to convert it to pixels
      if ( !rnumpx.test( ret ) && rnum.test( ret ) ) {
        // Remember the original values
        var left = style.left, rsLeft = elem.runtimeStyle.left;

        // Put in the new values to get a computed value out
        elem.runtimeStyle.left = elem.currentStyle.left;
        style.left = camelCase === "fontSize" ? "1em" : (ret || 0);
        ret = style.pixelLeft + "px";

        // Revert the changed values
        style.left = left;
        elem.runtimeStyle.left = rsLeft;
      }
    }

    return ret;
  },

  // A method for quickly swapping in/out CSS properties to get correct calculations
  swap: function( elem, options, callback ) {
    var old = {};

    // Remember the old values, and insert the new ones
    for ( var name in options ) {
      old[ name ] = elem.style[ name ];
      elem.style[ name ] = options[ name ];
    }

    callback.call( elem );

    // Revert the old values
    for ( var name in options ) {
      elem.style[ name ] = old[ name ];
    }
  }
});

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.hidden = function( elem ) {
    var width = elem.offsetWidth, height = elem.offsetHeight,
      skip = elem.nodeName.toLowerCase() === "tr";

    return width === 0 && height === 0 && !skip ?
      true :
      width > 0 && height > 0 && !skip ?
        false :
        jQuery.curCSS(elem, "display") === "none";
  };

  jQuery.expr.filters.visible = function( elem ) {
    return !jQuery.expr.filters.hidden( elem );
  };
}
var jsc = now(),
  rscript = /<script(.|\s)*?\/script>/gi,
  rselectTextarea = /select|textarea/i,
  rinput = /color|date|datetime|email|hidden|month|number|password|range|search|tel|text|time|url|week/i,
  jsre = /=\?(&|$)/,
  rquery = /\?/,
  rts = /(\?|&)_=.*?(&|$)/,
  rurl = /^(\w+:)?\/\/([^\/?#]+)/,
  r20 = /%20/g,

  // Keep a copy of the old load method
  _load = jQuery.fn.load;

jQuery.fn.extend({
  load: function( url, params, callback ) {
    if ( typeof url !== "string" ) {
      return _load.call( this, url );

    // Don't do a request if no elements are being requested
    } else if ( !this.length ) {
      return this;
    }

    var off = url.indexOf(" ");
    if ( off >= 0 ) {
      var selector = url.slice(off, url.length);
      url = url.slice(0, off);
    }

    // Default to a GET request
    var type = "GET";

    // If the second parameter was provided
    if ( params ) {
      // If it's a function
      if ( jQuery.isFunction( params ) ) {
        // We assume that it's the callback
        callback = params;
        params = null;

      // Otherwise, build a param string
      } else if ( typeof params === "object" ) {
        params = jQuery.param( params, jQuery.ajaxSettings.traditional );
        type = "POST";
      }
    }

    var self = this;

    // Request the remote document
    jQuery.ajax({
      url: url,
      type: type,
      dataType: "html",
      data: params,
      complete: function( res, status ) {
        // If successful, inject the HTML into all the matched elements
        if ( status === "success" || status === "notmodified" ) {
          // See if a selector was specified
          self.html( selector ?
            // Create a dummy div to hold the results
            jQuery("<div />")
              // inject the contents of the document in, removing the scripts
              // to avoid any 'Permission Denied' errors in IE
              .append(res.responseText.replace(rscript, ""))

              // Locate the specified elements
              .find(selector) :

            // If not, just inject the full result
            res.responseText );
        }

        if ( callback ) {
          self.each( callback, [res.responseText, status, res] );
        }
      }
    });

    return this;
  },

  serialize: function() {
    return jQuery.param(this.serializeArray());
  },
  serializeArray: function() {
    return this.map(function() {
      return this.elements ? jQuery.makeArray(this.elements) : this;
    })
    .filter(function() {
      return this.name && !this.disabled &&
        (this.checked || rselectTextarea.test(this.nodeName) ||
          rinput.test(this.type));
    })
    .map(function( i, elem ) {
      var val = jQuery(this).val();

      return val == null ?
        null :
        jQuery.isArray(val) ?
          jQuery.map( val, function( val, i ) {
            return { name: elem.name, value: val };
          }) :
          { name: elem.name, value: val };
    }).get();
  }
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( "ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function( i, o ) {
  jQuery.fn[o] = function( f ) {
    return this.bind(o, f);
  };
});

jQuery.extend({

  get: function( url, data, callback, type ) {
    // shift arguments if data argument was omited
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = null;
    }

    return jQuery.ajax({
      type: "GET",
      url: url,
      data: data,
      success: callback,
      dataType: type
    });
  },

  getScript: function( url, callback ) {
    return jQuery.get(url, null, callback, "script");
  },

  getJSON: function( url, data, callback ) {
    return jQuery.get(url, data, callback, "json");
  },

  post: function( url, data, callback, type ) {
    // shift arguments if data argument was omited
    if ( jQuery.isFunction( data ) ) {
      type = type || callback;
      callback = data;
      data = {};
    }

    return jQuery.ajax({
      type: "POST",
      url: url,
      data: data,
      success: callback,
      dataType: type
    });
  },

  ajaxSetup: function( settings ) {
    jQuery.extend( jQuery.ajaxSettings, settings );
  },

  ajaxSettings: {
    url: location.href,
    global: true,
    type: "GET",
    contentType: "application/x-www-form-urlencoded",
    processData: true,
    async: true,
    /*
    timeout: 0,
    data: null,
    username: null,
    password: null,
    traditional: false,
    */
    // Create the request object; Microsoft failed to properly
    // implement the XMLHttpRequest in IE7 (can't request local files),
    // so we use the ActiveXObject when it is available
    // This function can be overriden by calling jQuery.ajaxSetup
    xhr: window.XMLHttpRequest && (window.location.protocol !== "file:" || !window.ActiveXObject) ?
      function() {
        return new window.XMLHttpRequest();
      } :
      function() {
        try {
          return new window.ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {}
      },
    accepts: {
      xml: "application/xml, text/xml",
      html: "text/html",
      script: "text/javascript, application/javascript",
      json: "application/json, text/javascript",
      text: "text/plain",
      _default: "*/*"
    }
  },

  // Last-Modified header cache for next request
  lastModified: {},
  etag: {},

  ajax: function( origSettings ) {
    var s = jQuery.extend(true, {}, jQuery.ajaxSettings, origSettings);

    var jsonp, status, data,
      callbackContext = origSettings && origSettings.context || s,
      type = s.type.toUpperCase();

    // convert data if not already a string
    if ( s.data && s.processData && typeof s.data !== "string" ) {
      s.data = jQuery.param( s.data, s.traditional );
    }

    // Handle JSONP Parameter Callbacks
    if ( s.dataType === "jsonp" ) {
      if ( type === "GET" ) {
        if ( !jsre.test( s.url ) ) {
          s.url += (rquery.test( s.url ) ? "&" : "?") + (s.jsonp || "callback") + "=?";
        }
      } else if ( !s.data || !jsre.test(s.data) ) {
        s.data = (s.data ? s.data + "&" : "") + (s.jsonp || "callback") + "=?";
      }
      s.dataType = "json";
    }

    // Build temporary JSONP function
    if ( s.dataType === "json" && (s.data && jsre.test(s.data) || jsre.test(s.url)) ) {
      jsonp = s.jsonpCallback || ("jsonp" + jsc++);

      // Replace the =? sequence both in the query string and the data
      if ( s.data ) {
        s.data = (s.data + "").replace(jsre, "=" + jsonp + "$1");
      }

      s.url = s.url.replace(jsre, "=" + jsonp + "$1");

      // We need to make sure
      // that a JSONP style response is executed properly
      s.dataType = "script";

      // Handle JSONP-style loading
      window[ jsonp ] = window[ jsonp ] || function( tmp ) {
        data = tmp;
        success();
        complete();
        // Garbage collect
        window[ jsonp ] = undefined;

        try {
          delete window[ jsonp ];
        } catch(e) {}

        if ( head ) {
          head.removeChild( script );
        }
      };
    }

    if ( s.dataType === "script" && s.cache === null ) {
      s.cache = false;
    }

    if ( s.cache === false && type === "GET" ) {
      var ts = now();

      // try replacing _= if it is there
      var ret = s.url.replace(rts, "$1_=" + ts + "$2");

      // if nothing was replaced, add timestamp to the end
      s.url = ret + ((ret === s.url) ? (rquery.test(s.url) ? "&" : "?") + "_=" + ts : "");
    }

    // If data is available, append data to url for get requests
    if ( s.data && type === "GET" ) {
      s.url += (rquery.test(s.url) ? "&" : "?") + s.data;
    }

    // Watch for a new set of requests
    if ( s.global && ! jQuery.active++ ) {
      jQuery.event.trigger( "ajaxStart" );
    }

    // Matches an absolute URL, and saves the domain
    var parts = rurl.exec( s.url ),
      remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

    // If we're requesting a remote document
    // and trying to load JSON or Script with a GET
    if ( s.dataType === "script" && type === "GET" && remote ) {
      var head = document.getElementsByTagName("head")[0] || document.documentElement;
      var script = document.createElement("script");
      script.src = s.url;
      if ( s.scriptCharset ) {
        script.charset = s.scriptCharset;
      }

      // Handle Script loading
      if ( !jsonp ) {
        var done = false;

        // Attach handlers for all browsers
        script.onload = script.onreadystatechange = function() {
          if ( !done && (!this.readyState ||
              this.readyState === "loaded" || this.readyState === "complete") ) {
            done = true;
            success();
            complete();

            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
              head.removeChild( script );
            }
          }
        };
      }

      // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
      // This arises when a base node is used (#2709 and #4378).
      head.insertBefore( script, head.firstChild );

      // We handle everything using the script element injection
      return undefined;
    }

    var requestDone = false;

    // Create the request object
    var xhr = s.xhr();

    if ( !xhr ) {
      return;
    }

    // Open the socket
    // Passing null username, generates a login popup on Opera (#2865)
    if ( s.username ) {
      xhr.open(type, s.url, s.async, s.username, s.password);
    } else {
      xhr.open(type, s.url, s.async);
    }

    // Need an extra try/catch for cross domain requests in Firefox 3
    try {
      // Set the correct header, if data is being sent
      if ( s.data || origSettings && origSettings.contentType ) {
        xhr.setRequestHeader("Content-Type", s.contentType);
      }

      // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
      if ( s.ifModified ) {
        if ( jQuery.lastModified[s.url] ) {
          xhr.setRequestHeader("If-Modified-Since", jQuery.lastModified[s.url]);
        }

        if ( jQuery.etag[s.url] ) {
          xhr.setRequestHeader("If-None-Match", jQuery.etag[s.url]);
        }
      }

      // Set header so the called script knows that it's an XMLHttpRequest
      // Only send the header if it's not a remote XHR
      if ( !remote ) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      }

      // Set the Accepts header for the server, depending on the dataType
      xhr.setRequestHeader("Accept", s.dataType && s.accepts[ s.dataType ] ?
        s.accepts[ s.dataType ] + ", */*" :
        s.accepts._default );
    } catch(e) {}

    // Allow custom headers/mimetypes and early abort
    if ( s.beforeSend && s.beforeSend.call(callbackContext, xhr, s) === false ) {
      // Handle the global AJAX counter
      if ( s.global && ! --jQuery.active ) {
        jQuery.event.trigger( "ajaxStop" );
      }

      // close opended socket
      xhr.abort();
      return false;
    }

    if ( s.global ) {
      trigger("ajaxSend", [xhr, s]);
    }

    // Wait for a response to come back
    var onreadystatechange = xhr.onreadystatechange = function( isTimeout ) {
      // The request was aborted
      if ( !xhr || xhr.readyState === 0 || isTimeout === "abort" ) {
        // Opera doesn't call onreadystatechange before this point
        // so we simulate the call
        if ( !requestDone ) {
          complete();
        }

        requestDone = true;
        if ( xhr ) {
          xhr.onreadystatechange = jQuery.noop;
        }

      // The transfer is complete and the data is available, or the request timed out
      } else if ( !requestDone && xhr && (xhr.readyState === 4 || isTimeout === "timeout") ) {
        requestDone = true;
        xhr.onreadystatechange = jQuery.noop;

        status = isTimeout === "timeout" ?
          "timeout" :
          !jQuery.httpSuccess( xhr ) ?
            "error" :
            s.ifModified && jQuery.httpNotModified( xhr, s.url ) ?
              "notmodified" :
              "success";

        var errMsg;

        if ( status === "success" ) {
          // Watch for, and catch, XML document parse errors
          try {
            // process the data (runs the xml through httpData regardless of callback)
            data = jQuery.httpData( xhr, s.dataType, s );
          } catch(err) {
            status = "parsererror";
            errMsg = err;
          }
        }

        // Make sure that the request was successful or notmodified
        if ( status === "success" || status === "notmodified" ) {
          // JSONP handles its own success callback
          if ( !jsonp ) {
            success();
          }
        } else {
          jQuery.handleError(s, xhr, status, errMsg);
        }

        // Fire the complete handlers
        complete();

        if ( isTimeout === "timeout" ) {
          xhr.abort();
        }

        // Stop memory leaks
        if ( s.async ) {
          xhr = null;
        }
      }
    };

    // Override the abort handler, if we can (IE doesn't allow it, but that's OK)
    // Opera doesn't fire onreadystatechange at all on abort
    try {
      var oldAbort = xhr.abort;
      xhr.abort = function() {
        if ( xhr ) {
          oldAbort.call( xhr );
        }

        onreadystatechange( "abort" );
      };
    } catch(e) { }

    // Timeout checker
    if ( s.async && s.timeout > 0 ) {
      setTimeout(function() {
        // Check to see if the request is still happening
        if ( xhr && !requestDone ) {
          onreadystatechange( "timeout" );
        }
      }, s.timeout);
    }

    // Send the data
    try {
      xhr.send( type === "POST" || type === "PUT" || type === "DELETE" ? s.data : null );
    } catch(e) {
      jQuery.handleError(s, xhr, null, e);
      // Fire the complete handlers
      complete();
    }

    // firefox 1.5 doesn't fire statechange for sync requests
    if ( !s.async ) {
      onreadystatechange();
    }

    function success() {
      // If a local callback was specified, fire it and pass it the data
      if ( s.success ) {
        s.success.call( callbackContext, data, status, xhr );
      }

      // Fire the global callback
      if ( s.global ) {
        trigger( "ajaxSuccess", [xhr, s] );
      }
    }

    function complete() {
      // Process result
      if ( s.complete ) {
        s.complete.call( callbackContext, xhr, status);
      }

      // The request was completed
      if ( s.global ) {
        trigger( "ajaxComplete", [xhr, s] );
      }

      // Handle the global AJAX counter
      if ( s.global && ! --jQuery.active ) {
        jQuery.event.trigger( "ajaxStop" );
      }
    }

    function trigger(type, args) {
      (s.context ? jQuery(s.context) : jQuery.event).trigger(type, args);
    }

    // return XMLHttpRequest to allow aborting the request etc.
    return xhr;
  },

  handleError: function( s, xhr, status, e ) {
    // If a local callback was specified, fire it
    if ( s.error ) {
      s.error.call( s.context || s, xhr, status, e );
    }

    // Fire the global callback
    if ( s.global ) {
      (s.context ? jQuery(s.context) : jQuery.event).trigger( "ajaxError", [xhr, s, e] );
    }
  },

  // Counter for holding the number of active queries
  active: 0,

  // Determines if an XMLHttpRequest was successful or not
  httpSuccess: function( xhr ) {
    try {
      // IE error sometimes returns 1223 when it should be 204 so treat it as success, see #1450
      return !xhr.status && location.protocol === "file:" ||
        // Opera returns 0 when status is 304
        ( xhr.status >= 200 && xhr.status < 300 ) ||
        xhr.status === 304 || xhr.status === 1223 || xhr.status === 0;
    } catch(e) {}

    return false;
  },

  // Determines if an XMLHttpRequest returns NotModified
  httpNotModified: function( xhr, url ) {
    var lastModified = xhr.getResponseHeader("Last-Modified"),
      etag = xhr.getResponseHeader("Etag");

    if ( lastModified ) {
      jQuery.lastModified[url] = lastModified;
    }

    if ( etag ) {
      jQuery.etag[url] = etag;
    }

    // Opera returns 0 when status is 304
    return xhr.status === 304 || xhr.status === 0;
  },

  httpData: function( xhr, type, s ) {
    var ct = xhr.getResponseHeader("content-type") || "",
      xml = type === "xml" || !type && ct.indexOf("xml") >= 0,
      data = xml ? xhr.responseXML : xhr.responseText;

    if ( xml && data.documentElement.nodeName === "parsererror" ) {
      jQuery.error( "parsererror" );
    }

    // Allow a pre-filtering function to sanitize the response
    // s is checked to keep backwards compatibility
    if ( s && s.dataFilter ) {
      data = s.dataFilter( data, type );
    }

    // The filter can actually parse the response
    if ( typeof data === "string" ) {
      // Get the JavaScript object, if JSON is used.
      if ( type === "json" || !type && ct.indexOf("json") >= 0 ) {
        data = jQuery.parseJSON( data );

      // If the type is "script", eval it in global context
      } else if ( type === "script" || !type && ct.indexOf("javascript") >= 0 ) {
        jQuery.globalEval( data );
      }
    }

    return data;
  },

  // Serialize an array of form elements or a set of
  // key/values into a query string
  param: function( a, traditional ) {
    var s = [];

    // Set traditional to true for jQuery <= 1.3.2 behavior.
    if ( traditional === undefined ) {
      traditional = jQuery.ajaxSettings.traditional;
    }

    // If an array was passed in, assume that it is an array of form elements.
    if ( jQuery.isArray(a) || a.jquery ) {
      // Serialize the form elements
      jQuery.each( a, function() {
        add( this.name, this.value );
      });

    } else {
      // If traditional, encode the "old" way (the way 1.3.2 or older
      // did it), otherwise encode params recursively.
      for ( var prefix in a ) {
        buildParams( prefix, a[prefix] );
      }
    }

    // Return the resulting serialization
    return s.join("&").replace(r20, "+");

    function buildParams( prefix, obj ) {
      if ( jQuery.isArray(obj) ) {
        // Serialize array item.
        jQuery.each( obj, function( i, v ) {
          if ( traditional || /\[\]$/.test( prefix ) ) {
            // Treat each array item as a scalar.
            add( prefix, v );
          } else {
            // If array item is non-scalar (array or object), encode its
            // numeric index to resolve deserialization ambiguity issues.
            // Note that rack (as of 1.0.0) can't currently deserialize
            // nested arrays properly, and attempting to do so may cause
            // a server error. Possible fixes are to modify rack's
            // deserialization algorithm or to provide an option or flag
            // to force array serialization to be shallow.
            buildParams( prefix + "[" + ( typeof v === "object" || jQuery.isArray(v) ? i : "" ) + "]", v );
          }
        });

      } else if ( !traditional && obj != null && typeof obj === "object" ) {
        // Serialize object item.
        jQuery.each( obj, function( k, v ) {
          buildParams( prefix + "[" + k + "]", v );
        });

      } else {
        // Serialize scalar item.
        add( prefix, obj );
      }
    }

    function add( key, value ) {
      // If value is a function, invoke it and return its value
      value = jQuery.isFunction(value) ? value() : value;
      s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
    }
  }
});
var elemdisplay = {},
  rfxtypes = /toggle|show|hide/,
  rfxnum = /^([+-]=)?([\d+-.]+)(.*)$/,
  timerId,
  fxAttrs = [
    // height animations
    [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
    // width animations
    [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
    // opacity animations
    [ "opacity" ]
  ];

jQuery.fn.extend({
  show: function( speed, callback ) {
    if ( speed || speed === 0) {
      return this.animate( genFx("show", 3), speed, callback);

    } else {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        var old = jQuery.data(this[i], "olddisplay");

        this[i].style.display = old || "";

        if ( jQuery.css(this[i], "display") === "none" ) {
          var nodeName = this[i].nodeName, display;

          if ( elemdisplay[ nodeName ] ) {
            display = elemdisplay[ nodeName ];

          } else {
            var elem = jQuery("<" + nodeName + " />").appendTo("body");

            display = elem.css("display");

            if ( display === "none" ) {
              display = "block";
            }

            elem.remove();

            elemdisplay[ nodeName ] = display;
          }

          jQuery.data(this[i], "olddisplay", display);
        }
      }

      // Set the display of the elements in a second loop
      // to avoid the constant reflow
      for ( var j = 0, k = this.length; j < k; j++ ) {
        this[j].style.display = jQuery.data(this[j], "olddisplay") || "";
      }

      return this;
    }
  },

  hide: function( speed, callback ) {
    if ( speed || speed === 0 ) {
      return this.animate( genFx("hide", 3), speed, callback);

    } else {
      for ( var i = 0, l = this.length; i < l; i++ ) {
        var old = jQuery.data(this[i], "olddisplay");
        if ( !old && old !== "none" ) {
          jQuery.data(this[i], "olddisplay", jQuery.css(this[i], "display"));
        }
      }

      // Set the display of the elements in a second loop
      // to avoid the constant reflow
      for ( var j = 0, k = this.length; j < k; j++ ) {
        this[j].style.display = "none";
      }

      return this;
    }
  },

  // Save the old toggle function
  _toggle: jQuery.fn.toggle,

  toggle: function( fn, fn2 ) {
    var bool = typeof fn === "boolean";

    if ( jQuery.isFunction(fn) && jQuery.isFunction(fn2) ) {
      this._toggle.apply( this, arguments );

    } else if ( fn == null || bool ) {
      this.each(function() {
        var state = bool ? fn : jQuery(this).is(":hidden");
        jQuery(this)[ state ? "show" : "hide" ]();
      });

    } else {
      this.animate(genFx("toggle", 3), fn, fn2);
    }

    return this;
  },

  fadeTo: function( speed, to, callback ) {
    return this.filter(":hidden").css("opacity", 0).show().end()
          .animate({opacity: to}, speed, callback);
  },

  animate: function( prop, speed, easing, callback ) {
    var optall = jQuery.speed(speed, easing, callback);

    if ( jQuery.isEmptyObject( prop ) ) {
      return this.each( optall.complete );
    }

    return this[ optall.queue === false ? "each" : "queue" ](function() {
      var opt = jQuery.extend({}, optall), p,
        hidden = this.nodeType === 1 && jQuery(this).is(":hidden"),
        self = this;

      for ( p in prop ) {
        var name = p.replace(rdashAlpha, fcamelCase);

        if ( p !== name ) {
          prop[ name ] = prop[ p ];
          delete prop[ p ];
          p = name;
        }

        if ( prop[p] === "hide" && hidden || prop[p] === "show" && !hidden ) {
          return opt.complete.call(this);
        }

        if ( ( p === "height" || p === "width" ) && this.style ) {
          // Store display property
          opt.display = jQuery.css(this, "display");

          // Make sure that nothing sneaks out
          opt.overflow = this.style.overflow;
        }

        if ( jQuery.isArray( prop[p] ) ) {
          // Create (if needed) and add to specialEasing
          (opt.specialEasing = opt.specialEasing || {})[p] = prop[p][1];
          prop[p] = prop[p][0];
        }
      }

      if ( opt.overflow != null ) {
        this.style.overflow = "hidden";
      }

      opt.curAnim = jQuery.extend({}, prop);

      jQuery.each( prop, function( name, val ) {
        var e = new jQuery.fx( self, opt, name );

        if ( rfxtypes.test(val) ) {
          e[ val === "toggle" ? hidden ? "show" : "hide" : val ]( prop );

        } else {
          var parts = rfxnum.exec(val),
            start = e.cur(true) || 0;

          if ( parts ) {
            var end = parseFloat( parts[2] ),
              unit = parts[3] || "px";

            // We need to compute starting value
            if ( unit !== "px" ) {
              self.style[ name ] = (end || 1) + unit;
              start = ((end || 1) / e.cur(true)) * start;
              self.style[ name ] = start + unit;
            }

            // If a +=/-= token was provided, we're doing a relative animation
            if ( parts[1] ) {
              end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
            }

            e.custom( start, end, unit );

          } else {
            e.custom( start, val, "" );
          }
        }
      });

      // For JS strict compliance
      return true;
    });
  },

  stop: function( clearQueue, gotoEnd ) {
    var timers = jQuery.timers;

    if ( clearQueue ) {
      this.queue([]);
    }

    this.each(function() {
      // go in reverse order so anything added to the queue during the loop is ignored
      for ( var i = timers.length - 1; i >= 0; i-- ) {
        if ( timers[i].elem === this ) {
          if (gotoEnd) {
            // force the next step to be the last
            timers[i](true);
          }

          timers.splice(i, 1);
        }
      }
    });

    // start the next in the queue if the last step wasn't forced
    if ( !gotoEnd ) {
      this.dequeue();
    }

    return this;
  }

});

// Generate shortcuts for custom animations
jQuery.each({
  slideDown: genFx("show", 1),
  slideUp: genFx("hide", 1),
  slideToggle: genFx("toggle", 1),
  fadeIn: { opacity: "show" },
  fadeOut: { opacity: "hide" }
}, function( name, props ) {
  jQuery.fn[ name ] = function( speed, callback ) {
    return this.animate( props, speed, callback );
  };
});

jQuery.extend({
  speed: function( speed, easing, fn ) {
    var opt = speed && typeof speed === "object" ? speed : {
      complete: fn || !fn && easing ||
        jQuery.isFunction( speed ) && speed,
      duration: speed,
      easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
    };

    opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
      jQuery.fx.speeds[opt.duration] || jQuery.fx.speeds._default;

    // Queueing
    opt.old = opt.complete;
    opt.complete = function() {
      if ( opt.queue !== false ) {
        jQuery(this).dequeue();
      }
      if ( jQuery.isFunction( opt.old ) ) {
        opt.old.call( this );
      }
    };

    return opt;
  },

  easing: {
    linear: function( p, n, firstNum, diff ) {
      return firstNum + diff * p;
    },
    swing: function( p, n, firstNum, diff ) {
      return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
    }
  },

  timers: [],

  fx: function( elem, options, prop ) {
    this.options = options;
    this.elem = elem;
    this.prop = prop;

    if ( !options.orig ) {
      options.orig = {};
    }
  }

});

jQuery.fx.prototype = {
  // Simple function for setting a style value
  update: function() {
    if ( this.options.step ) {
      this.options.step.call( this.elem, this.now, this );
    }

    (jQuery.fx.step[this.prop] || jQuery.fx.step._default)( this );

    // Set display property to block for height/width animations
    if ( ( this.prop === "height" || this.prop === "width" ) && this.elem.style ) {
      this.elem.style.display = "block";
    }
  },

  // Get the current size
  cur: function( force ) {
    if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
      return this.elem[ this.prop ];
    }

    var r = parseFloat(jQuery.css(this.elem, this.prop, force));
    return r && r > -10000 ? r : parseFloat(jQuery.curCSS(this.elem, this.prop)) || 0;
  },

  // Start an animation from one number to another
  custom: function( from, to, unit ) {
    this.startTime = now();
    this.start = from;
    this.end = to;
    this.unit = unit || this.unit || "px";
    this.now = this.start;
    this.pos = this.state = 0;

    var self = this;
    function t( gotoEnd ) {
      return self.step(gotoEnd);
    }

    t.elem = this.elem;

    if ( t() && jQuery.timers.push(t) && !timerId ) {
      timerId = setInterval(jQuery.fx.tick, 13);
    }
  },

  // Simple 'show' function
  show: function() {
    // Remember where we started, so that we can go back to it later
    this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
    this.options.show = true;

    // Begin the animation
    // Make sure that we start at a small width/height to avoid any
    // flash of content
    this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());

    // Start by showing the element
    jQuery( this.elem ).show();
  },

  // Simple 'hide' function
  hide: function() {
    // Remember where we started, so that we can go back to it later
    this.options.orig[this.prop] = jQuery.style( this.elem, this.prop );
    this.options.hide = true;

    // Begin the animation
    this.custom(this.cur(), 0);
  },

  // Each step of an animation
  step: function( gotoEnd ) {
    var t = now(), done = true;

    if ( gotoEnd || t >= this.options.duration + this.startTime ) {
      this.now = this.end;
      this.pos = this.state = 1;
      this.update();

      this.options.curAnim[ this.prop ] = true;

      for ( var i in this.options.curAnim ) {
        if ( this.options.curAnim[i] !== true ) {
          done = false;
        }
      }

      if ( done ) {
        if ( this.options.display != null ) {
          // Reset the overflow
          this.elem.style.overflow = this.options.overflow;

          // Reset the display
          var old = jQuery.data(this.elem, "olddisplay");
          this.elem.style.display = old ? old : this.options.display;

          if ( jQuery.css(this.elem, "display") === "none" ) {
            this.elem.style.display = "block";
          }
        }

        // Hide the element if the "hide" operation was done
        if ( this.options.hide ) {
          jQuery(this.elem).hide();
        }

        // Reset the properties, if the item has been hidden or shown
        if ( this.options.hide || this.options.show ) {
          for ( var p in this.options.curAnim ) {
            jQuery.style(this.elem, p, this.options.orig[p]);
          }
        }

        // Execute the complete function
        this.options.complete.call( this.elem );
      }

      return false;

    } else {
      var n = t - this.startTime;
      this.state = n / this.options.duration;

      // Perform the easing function, defaults to swing
      var specialEasing = this.options.specialEasing && this.options.specialEasing[this.prop];
      var defaultEasing = this.options.easing || (jQuery.easing.swing ? "swing" : "linear");
      this.pos = jQuery.easing[specialEasing || defaultEasing](this.state, n, 0, 1, this.options.duration);
      this.now = this.start + ((this.end - this.start) * this.pos);

      // Perform the next step of the animation
      this.update();
    }

    return true;
  }
};

jQuery.extend( jQuery.fx, {
  tick: function() {
    var timers = jQuery.timers;

    for ( var i = 0; i < timers.length; i++ ) {
      if ( !timers[i]() ) {
        timers.splice(i--, 1);
      }
    }

    if ( !timers.length ) {
      jQuery.fx.stop();
    }
  },

  stop: function() {
    clearInterval( timerId );
    timerId = null;
  },

  speeds: {
    slow: 600,
     fast: 200,
     // Default speed
     _default: 400
  },

  step: {
    opacity: function( fx ) {
      jQuery.style(fx.elem, "opacity", fx.now);
    },

    _default: function( fx ) {
      if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
        fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
      } else {
        fx.elem[ fx.prop ] = fx.now;
      }
    }
  }
});

if ( jQuery.expr && jQuery.expr.filters ) {
  jQuery.expr.filters.animated = function( elem ) {
    return jQuery.grep(jQuery.timers, function( fn ) {
      return elem === fn.elem;
    }).length;
  };
}

function genFx( type, num ) {
  var obj = {};

  jQuery.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
    obj[ this ] = type;
  });

  return obj;
}
if ( "getBoundingClientRect" in document.documentElement ) {
  jQuery.fn.offset = function( options ) {
    var elem = this[0];

    if ( options ) {
      return this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
    }

    if ( !elem || !elem.ownerDocument ) {
      return null;
    }

    if ( elem === elem.ownerDocument.body ) {
      return jQuery.offset.bodyOffset( elem );
    }

    var box = elem.getBoundingClientRect(), doc = elem.ownerDocument, body = doc.body, docElem = doc.documentElement,
      clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0,
      top  = box.top  + (self.pageYOffset || jQuery.support.boxModel && docElem.scrollTop  || body.scrollTop ) - clientTop,
      left = box.left + (self.pageXOffset || jQuery.support.boxModel && docElem.scrollLeft || body.scrollLeft) - clientLeft;

    return { top: top, left: left };
  };

} else {
  jQuery.fn.offset = function( options ) {
    var elem = this[0];

    if ( options ) {
      return this.each(function( i ) {
        jQuery.offset.setOffset( this, options, i );
      });
    }

    if ( !elem || !elem.ownerDocument ) {
      return null;
    }

    if ( elem === elem.ownerDocument.body ) {
      return jQuery.offset.bodyOffset( elem );
    }

    jQuery.offset.initialize();

    var offsetParent = elem.offsetParent, prevOffsetParent = elem,
      doc = elem.ownerDocument, computedStyle, docElem = doc.documentElement,
      body = doc.body, defaultView = doc.defaultView,
      prevComputedStyle = defaultView ? defaultView.getComputedStyle( elem, null ) : elem.currentStyle,
      top = elem.offsetTop, left = elem.offsetLeft;

    while ( (elem = elem.parentNode) && elem !== body && elem !== docElem ) {
      if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
        break;
      }

      computedStyle = defaultView ? defaultView.getComputedStyle(elem, null) : elem.currentStyle;
      top  -= elem.scrollTop;
      left -= elem.scrollLeft;

      if ( elem === offsetParent ) {
        top  += elem.offsetTop;
        left += elem.offsetLeft;

        if ( jQuery.offset.doesNotAddBorder && !(jQuery.offset.doesAddBorderForTableAndCells && /^t(able|d|h)$/i.test(elem.nodeName)) ) {
          top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
          left += parseFloat( computedStyle.borderLeftWidth ) || 0;
        }

        prevOffsetParent = offsetParent, offsetParent = elem.offsetParent;
      }

      if ( jQuery.offset.subtractsBorderForOverflowNotVisible && computedStyle.overflow !== "visible" ) {
        top  += parseFloat( computedStyle.borderTopWidth  ) || 0;
        left += parseFloat( computedStyle.borderLeftWidth ) || 0;
      }

      prevComputedStyle = computedStyle;
    }

    if ( prevComputedStyle.position === "relative" || prevComputedStyle.position === "static" ) {
      top  += body.offsetTop;
      left += body.offsetLeft;
    }

    if ( jQuery.offset.supportsFixedPosition && prevComputedStyle.position === "fixed" ) {
      top  += Math.max( docElem.scrollTop, body.scrollTop );
      left += Math.max( docElem.scrollLeft, body.scrollLeft );
    }

    return { top: top, left: left };
  };
}

jQuery.offset = {
  initialize: function() {
    var body = document.body, container = document.createElement("div"), innerDiv, checkDiv, table, td, bodyMarginTop = parseFloat( jQuery.curCSS(body, "marginTop", true) ) || 0,
      html = "<div style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;'><div></div></div><table style='position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>";

    jQuery.extend( container.style, { position: "absolute", top: 0, left: 0, margin: 0, border: 0, width: "1px", height: "1px", visibility: "hidden" } );

    container.innerHTML = html;
    body.insertBefore( container, body.firstChild );
    innerDiv = container.firstChild;
    checkDiv = innerDiv.firstChild;
    td = innerDiv.nextSibling.firstChild.firstChild;

    this.doesNotAddBorder = (checkDiv.offsetTop !== 5);
    this.doesAddBorderForTableAndCells = (td.offsetTop === 5);

    checkDiv.style.position = "fixed", checkDiv.style.top = "20px";
    // safari subtracts parent border width here which is 5px
    this.supportsFixedPosition = (checkDiv.offsetTop === 20 || checkDiv.offsetTop === 15);
    checkDiv.style.position = checkDiv.style.top = "";

    innerDiv.style.overflow = "hidden", innerDiv.style.position = "relative";
    this.subtractsBorderForOverflowNotVisible = (checkDiv.offsetTop === -5);

    this.doesNotIncludeMarginInBodyOffset = (body.offsetTop !== bodyMarginTop);

    body.removeChild( container );
    body = container = innerDiv = checkDiv = table = td = null;
    jQuery.offset.initialize = jQuery.noop;
  },

  bodyOffset: function( body ) {
    var top = body.offsetTop, left = body.offsetLeft;

    jQuery.offset.initialize();

    if ( jQuery.offset.doesNotIncludeMarginInBodyOffset ) {
      top  += parseFloat( jQuery.curCSS(body, "marginTop",  true) ) || 0;
      left += parseFloat( jQuery.curCSS(body, "marginLeft", true) ) || 0;
    }

    return { top: top, left: left };
  },

  setOffset: function( elem, options, i ) {
    // set position first, in-case top/left are set even on static elem
    if ( /static/.test( jQuery.curCSS( elem, "position" ) ) ) {
      elem.style.position = "relative";
    }
    var curElem   = jQuery( elem ),
      curOffset = curElem.offset(),
      curTop    = parseInt( jQuery.curCSS( elem, "top",  true ), 10 ) || 0,
      curLeft   = parseInt( jQuery.curCSS( elem, "left", true ), 10 ) || 0;

    if ( jQuery.isFunction( options ) ) {
      options = options.call( elem, i, curOffset );
    }

    var props = {
      top:  (options.top  - curOffset.top)  + curTop,
      left: (options.left - curOffset.left) + curLeft
    };

    if ( "using" in options ) {
      options.using.call( elem, props );
    } else {
      curElem.css( props );
    }
  }
};


jQuery.fn.extend({
  position: function() {
    if ( !this[0] ) {
      return null;
    }

    var elem = this[0],

    // Get *real* offsetParent
    offsetParent = this.offsetParent(),

    // Get correct offsets
    offset       = this.offset(),
    parentOffset = /^body|html$/i.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset();

    // Subtract element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    offset.top  -= parseFloat( jQuery.curCSS(elem, "marginTop",  true) ) || 0;
    offset.left -= parseFloat( jQuery.curCSS(elem, "marginLeft", true) ) || 0;

    // Add offsetParent borders
    parentOffset.top  += parseFloat( jQuery.curCSS(offsetParent[0], "borderTopWidth",  true) ) || 0;
    parentOffset.left += parseFloat( jQuery.curCSS(offsetParent[0], "borderLeftWidth", true) ) || 0;

    // Subtract the two offsets
    return {
      top:  offset.top  - parentOffset.top,
      left: offset.left - parentOffset.left
    };
  },

  offsetParent: function() {
    return this.map(function() {
      var offsetParent = this.offsetParent || document.body;
      while ( offsetParent && (!/^body|html$/i.test(offsetParent.nodeName) && jQuery.css(offsetParent, "position") === "static") ) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent;
    });
  }
});


// Create scrollLeft and scrollTop methods
jQuery.each( ["Left", "Top"], function( i, name ) {
  var method = "scroll" + name;

  jQuery.fn[ method ] = function(val) {
    var elem = this[0], win;

    if ( !elem ) {
      return null;
    }

    if ( val !== undefined ) {
      // Set the scroll offset
      return this.each(function() {
        win = getWindow( this );

        if ( win ) {
          win.scrollTo(
            !i ? val : jQuery(win).scrollLeft(),
             i ? val : jQuery(win).scrollTop()
          );

        } else {
          this[ method ] = val;
        }
      });
    } else {
      win = getWindow( elem );

      // Return the scroll offset
      return win ? ("pageXOffset" in win) ? win[ i ? "pageYOffset" : "pageXOffset" ] :
        jQuery.support.boxModel && win.document.documentElement[ method ] ||
          win.document.body[ method ] :
        elem[ method ];
    }
  };
});

function getWindow( elem ) {
  return ("scrollTo" in elem && elem.document) ?
    elem :
    elem.nodeType === 9 ?
      elem.defaultView || elem.parentWindow :
      false;
}
// Create innerHeight, innerWidth, outerHeight and outerWidth methods
jQuery.each([ "Height", "Width" ], function( i, name ) {

  var type = name.toLowerCase();

  // innerHeight and innerWidth
  jQuery.fn["inner" + name] = function() {
    return this[0] ?
      jQuery.css( this[0], type, false, "padding" ) :
      null;
  };

  // outerHeight and outerWidth
  jQuery.fn["outer" + name] = function( margin ) {
    return this[0] ?
      jQuery.css( this[0], type, false, margin ? "margin" : "border" ) :
      null;
  };

  jQuery.fn[ type ] = function( size ) {
    // Get window width or height
    var elem = this[0];
    if ( !elem ) {
      return size == null ? null : this;
    }

    if ( jQuery.isFunction( size ) ) {
      return this.each(function( i ) {
        var self = jQuery( this );
        self[ type ]( size.call( this, i, self[ type ]() ) );
      });
    }

    return ("scrollTo" in elem && elem.document) ? // does it walk and quack like a window?
      // Everyone else use document.documentElement or document.body depending on Quirks vs Standards mode
      elem.document.compatMode === "CSS1Compat" && elem.document.documentElement[ "client" + name ] ||
      elem.document.body[ "client" + name ] :

      // Get document width or height
      (elem.nodeType === 9) ? // is it a document
        // Either scroll[Width/Height] or offset[Width/Height], whichever is greater
        Math.max(
          elem.documentElement["client" + name],
          elem.body["scroll" + name], elem.documentElement["scroll" + name],
          elem.body["offset" + name], elem.documentElement["offset" + name]
        ) :

        // Get or set width or height on the element
        size === undefined ?
          // Get width or height on the element
          jQuery.css( elem, type ) :

          // Set the width or height on the element (default to pixels if value is unitless)
          this.css( type, typeof size === "string" ? size : size + "px" );
  };

});
// Expose jQuery to the global object
window.jQuery = window.$ = jQuery;

})(window);

// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

(function($) {
  $.couch = $.couch || {};

  function encodeDocId(docID) {
    var parts = docID.split("/");
    if (parts[0] == "_design") {
      parts.shift();
      return "_design/" + encodeURIComponent(parts.join('/'));
    }
    return encodeURIComponent(docID);
  };

  function prepareUserDoc(user_doc, new_password) {
    if (typeof hex_sha1 == "undefined") {
      alert("creating a user doc requires sha1.js to be loaded in the page");
      return;
    }
    var user_prefix = "org.couchdb.user:";
    user_doc._id = user_doc._id || user_prefix + user_doc.name;
    if (new_password) {
      // handle the password crypto
      user_doc.salt = $.couch.newUUID();
      user_doc.password_sha = hex_sha1(new_password + user_doc.salt);
    }
    user_doc.type = "user";
    if (!user_doc.roles) {
      user_doc.roles = []
    }
    return user_doc;
  };

  var uuidCache = [];

  $.extend($.couch, {
    urlPrefix: '',
    activeTasks: function(options) {
      ajax(
        {url: this.urlPrefix + "/_active_tasks"},
        options,
        "Active task status could not be retrieved"
      );
    },

    allDbs: function(options) {
      ajax(
        {url: this.urlPrefix + "/_all_dbs"},
        options,
        "An error occurred retrieving the list of all databases"
      );
    },

    config: function(options, section, option, value) {
      var req = {url: this.urlPrefix + "/_config/"};
      if (section) {
        req.url += encodeURIComponent(section) + "/";
        if (option) {
          req.url += encodeURIComponent(option);
        }
      }
      if (value === null) {
        req.type = "DELETE";
      } else if (value !== undefined) {
        req.type = "PUT";
        req.data = toJSON(value);
        req.contentType = "application/json";
        req.processData = false
      }

      ajax(req, options,
        "An error occurred retrieving/updating the server configuration"
      );
    },

    session: function(options) {
      options = options || {};
      $.ajax({
        type: "GET", url: this.urlPrefix + "/_session",
        complete: function(req) {
          var resp = $.httpData(req, "json");
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            alert("An error occurred getting session info: " + resp.reason);
          }
        }
      });
    },

    userDb : function(callback) {
      $.couch.session({
        success : function(resp) {
          var userDb = $.couch.db(resp.info.authentication_db);
          callback(userDb);
        }
      });
    },

    signup: function(user_doc, password, options) {
      options = options || {};
      // prepare user doc based on name and password
      user_doc = prepareUserDoc(user_doc, password);
      $.couch.userDb(function(db) {
        db.saveDoc(user_doc, options);
      })
    },

    login: function(options) {
      options = options || {};
      $.ajax({
        type: "POST", url: this.urlPrefix + "/_session", dataType: "json",
        data: {name: options.name, password: options.password},
        complete: function(req) {
          var resp = $.httpData(req, "json");
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            alert("An error occurred logging in: " + resp.reason);
          }
        }
      });
    },
    logout: function(options) {
      options = options || {};
      $.ajax({
        type: "DELETE", url: this.urlPrefix + "/_session", dataType: "json",
        username : "_", password : "_",
        complete: function(req) {
          var resp = $.httpData(req, "json");
          if (req.status == 200) {
            if (options.success) options.success(resp);
          } else if (options.error) {
            options.error(req.status, resp.error, resp.reason);
          } else {
            alert("An error occurred logging out: " + resp.reason);
          }
        }
      });
    },

    db: function(name) {
      return {
        name: name,
        uri: this.urlPrefix + "/" + encodeURIComponent(name) + "/",

        compact: function(options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_compact",
              data: "", processData: false
            },
            options,
            "The database could not be compacted"
          );
        },
        viewCleanup: function(options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_view_cleanup",
              data: "", processData: false
            },
            options,
            "The views could not be cleaned up"
          );
        },
        compactView: function(groupname, options) {
          $.extend(options, {successStatus: 202});
          ajax({
              type: "POST", url: this.uri + "_compact/" + groupname,
              data: "", processData: false
            },
            options,
            "The view could not be compacted"
          );
        },
        create: function(options) {
          $.extend(options, {successStatus: 201});
          ajax({
              type: "PUT", url: this.uri, contentType: "application/json",
              data: "", processData: false
            },
            options,
            "The database could not be created"
          );
        },
        drop: function(options) {
          ajax(
            {type: "DELETE", url: this.uri},
            options,
            "The database could not be deleted"
          );
        },
        info: function(options) {
          ajax(
            {url: this.uri},
            options,
            "Database information could not be retrieved"
          );
        },
        allDocs: function(options) {
          ajax(
            {url: this.uri + "_all_docs" + encodeOptions(options)},
            options,
            "An error occurred retrieving a list of all documents"
          );
        },
        allDesignDocs: function(options) {
          this.allDocs($.extend({startkey:"_design", endkey:"_design0"}, options));
        },
        allApps: function(options) {
          options = options || {};
          var self = this;
          if (options.eachApp) {
            this.allDesignDocs({
              success: function(resp) {
                $.each(resp.rows, function() {
                  self.openDoc(this.id, {
                    success: function(ddoc) {
                      var index, appPath, appName = ddoc._id.split('/');
                      appName.shift();
                      appName = appName.join('/');
                      index = ddoc.couchapp && ddoc.couchapp.index;
                      if (index) {
                        appPath = ['', name, ddoc._id, index].join('/');
                      } else if (ddoc._attachments && ddoc._attachments["index.html"]) {
                        appPath = ['', name, ddoc._id, "index.html"].join('/');
                      }
                      if (appPath) options.eachApp(appName, appPath, ddoc);
                    }
                  });
                });
              }
            });
          } else {
            alert("please provide an eachApp function for allApps()");
          }
        },
        openDoc: function(docId, options, ajaxOptions) {
          ajax({url: this.uri + encodeDocId(docId) + encodeOptions(options)},
            options,
            "The document could not be retrieved",
            ajaxOptions
          );
        },
        saveDoc: function(doc, options) {
          options = options || {};
          if (doc._id === undefined) {
            var method = "POST";
            var uri = this.uri;
          } else {
            var method = "PUT";
            var uri = this.uri + encodeDocId(doc._id);
          }
          $.ajax({
            type: method, url: uri + encodeOptions(options),
            contentType: "application/json",
            dataType: "json", data: toJSON(doc),
            complete: function(req) {
              var resp = $.httpData(req, "json");
              if (req.status == 201) {
                doc._id = resp.id;
                doc._rev = resp.rev;
                if (options.success) options.success(resp);
              } else if (options.error) {
                options.error(req.status, resp.error, resp.reason);
              } else {
                alert("The document could not be saved: " + resp.reason);
              }
            }
          });
        },
        bulkSave: function(docs, options) {
          $.extend(options, {successStatus: 201});
          ajax({
              type: "POST",
              url: this.uri + "_bulk_docs" + encodeOptions(options),
              data: toJSON(docs)
            },
            options,
            "The documents could not be saved"
          );
        },
        removeDoc: function(doc, options) {
          ajax({
              type: "DELETE",
              url: this.uri +
                   encodeDocId(doc._id) +
                   encodeOptions({rev: doc._rev})
            },
            options,
            "The document could not be deleted"
          );
        },
        copyDoc: function(doc, options, ajaxOptions) {
          ajaxOptions = $.extend(ajaxOptions, {
            complete: function(req) {
              var resp = $.httpData(req, "json");
              if (req.status == 201) {
                doc._id = resp.id;
                doc._rev = resp.rev;
                if (options.success) options.success(resp);
              } else if (options.error) {
                options.error(req.status, resp.error, resp.reason);
              } else {
                alert("The document could not be copied: " + resp.reason);
              }
            }
          });
          ajax({
              type: "COPY",
              url: this.uri +
                   encodeDocId(doc._id) +
                   encodeOptions({rev: doc._rev})
            },
            options,
            "The document could not be copied",
            ajaxOptions
          );
        },
        query: function(mapFun, reduceFun, language, options) {
          language = language || "javascript";
          if (typeof(mapFun) !== "string") {
            mapFun = mapFun.toSource ? mapFun.toSource() : "(" + mapFun.toString() + ")";
          }
          var body = {language: language, map: mapFun};
          if (reduceFun != null) {
            if (typeof(reduceFun) !== "string")
              reduceFun = reduceFun.toSource ? reduceFun.toSource() : "(" + reduceFun.toString() + ")";
            body.reduce = reduceFun;
          }
          ajax({
              type: "POST",
              url: this.uri + "_temp_view" + encodeOptions(options),
              contentType: "application/json", data: toJSON(body)
            },
            options,
            "An error occurred querying the database"
          );
        },
        view: function(name, options) {
          var name = name.split('/');
          var options = options || {};
          var type = "GET";
          var data= null;
          if (options["keys"]) {
            type = "POST";
            var keys = options["keys"];
            delete options["keys"];
            data = toJSON({ "keys": keys });
          }
          ajax({
              type: type,
              data: data,
              url: this.uri + "_design/" + name[0] +
                   "/_view/" + name[1] + encodeOptions(options)
            },
            options, "An error occurred accessing the view"
          );
        },
        getDbProperty: function(propName, options, ajaxOptions) {
          ajax({url: this.uri + propName + encodeOptions(options)},
            options,
            "The property could not be retrieved",
            ajaxOptions
          );
        },

        setDbProperty: function(propName, propValue, options, ajaxOptions) {
          ajax({
            type: "PUT",
            url: this.uri + propName + encodeOptions(options),
            data : JSON.stringify(propValue)
          },
            options,
            "The property could not be updated",
            ajaxOptions
          );
        }
      };
    },

    encodeDocId: encodeDocId,

    info: function(options) {
      ajax(
        {url: this.urlPrefix + "/"},
        options,
        "Server information could not be retrieved"
      );
    },

    replicate: function(source, target, options) {
      ajax({
          type: "POST", url: this.urlPrefix + "/_replicate",
          data: JSON.stringify({source: source, target: target}),
          contentType: "application/json"
        },
        options,
        "Replication failed"
      );
    },

    newUUID: function(cacheNum) {
      if (cacheNum === undefined) {
        cacheNum = 1;
      }
      if (!uuidCache.length) {
        ajax({url: this.urlPrefix + "/_uuids", data: {count: cacheNum}, async: false}, {
            success: function(resp) {
              uuidCache = resp.uuids
            }
          },
          "Failed to retrieve UUID batch."
        );
      }
      return uuidCache.shift();
    }

  });

  function ajax(obj, options, errorMessage, ajaxOptions) {
    options = $.extend({successStatus: 200}, options);
    errorMessage = errorMessage || "Unknown error";

    $.ajax($.extend($.extend({
      type: "GET", dataType: "json",
      complete: function(req) {
        var resp = $.httpData(req, "json");
        if (req.status == options.successStatus) {
          if (options.success) options.success(resp);
        } else if (options.error) {
          options.error(req.status, resp.error, resp.reason);
        } else {
          alert(errorMessage + ": " + resp.reason);
        }
      }
    }, obj), ajaxOptions));
  }

  // Convert a options object to an url query string.
  // ex: {key:'value',key2:'value2'} becomes '?key="value"&key2="value2"'
  function encodeOptions(options) {
    var buf = [];
    if (typeof(options) === "object" && options !== null) {
      for (var name in options) {
        if ($.inArray(name, ["error", "success"]) >= 0)
          continue;
        var value = options[name];
        if ($.inArray(name, ["key", "startkey", "endkey"]) >= 0) {
          value = toJSON(value);
        }
        buf.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
      }
    }
    return buf.length ? "?" + buf.join("&") : "";
  }

  function toJSON(obj) {
    return obj !== null ? JSON.stringify(obj) : null;
  }

})(jQuery);

/*
 * jQuery Form Plugin
 * version: 2.40 (26-FEB-2010)
 * @requires jQuery v1.3.2 or later
 *
 * Examples and documentation at: http://malsup.com/jquery/form/
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function($) {

/*
  Usage Note:
  -----------
  Do not use both ajaxSubmit and ajaxForm on the same form.  These
  functions are intended to be exclusive.  Use ajaxSubmit if you want
  to bind your own submit handler to the form.  For example,

  $(document).ready(function() {
    $('#myForm').bind('submit', function() {
      $(this).ajaxSubmit({
        target: '#output'
      });
      return false; // <-- important!
    });
  });

  Use ajaxForm when you want the plugin to manage all the event binding
  for you.  For example,

  $(document).ready(function() {
    $('#myForm').ajaxForm({
      target: '#output'
    });
  });

  When using ajaxForm, the ajaxSubmit function will be invoked for you
  at the appropriate time.
*/

/**
 * ajaxSubmit() provides a mechanism for immediately submitting
 * an HTML form using AJAX.
 */
$.fn.ajaxSubmit = function(options) {
  // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
  if (!this.length) {
    log('ajaxSubmit: skipping submit process - no element selected');
    return this;
  }

  if (typeof options == 'function')
    options = { success: options };

  var url = $.trim(this.attr('action'));
  if (url) {
    // clean url (don't include hash vaue)
    url = (url.match(/^([^#]+)/)||[])[1];
     }
     url = url || window.location.href || '';

  options = $.extend({
    url:  url,
    type: this.attr('method') || 'GET',
    iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
  }, options || {});

  // hook for manipulating the form data before it is extracted;
  // convenient for use with rich editors like tinyMCE or FCKEditor
  var veto = {};
  this.trigger('form-pre-serialize', [this, options, veto]);
  if (veto.veto) {
    log('ajaxSubmit: submit vetoed via form-pre-serialize trigger');
    return this;
  }

  // provide opportunity to alter form data before it is serialized
  if (options.beforeSerialize && options.beforeSerialize(this, options) === false) {
    log('ajaxSubmit: submit aborted via beforeSerialize callback');
    return this;
  }

  var a = this.formToArray(options.semantic);
  if (options.data) {
    options.extraData = options.data;
    for (var n in options.data) {
      if(options.data[n] instanceof Array) {
      for (var k in options.data[n])
        a.push( { name: n, value: options.data[n][k] } );
      }
      else
       a.push( { name: n, value: options.data[n] } );
    }
  }

  // give pre-submit callback an opportunity to abort the submit
  if (options.beforeSubmit && options.beforeSubmit(a, this, options) === false) {
    log('ajaxSubmit: submit aborted via beforeSubmit callback');
    return this;
  }

  // fire vetoable 'validate' event
  this.trigger('form-submit-validate', [a, this, options, veto]);
  if (veto.veto) {
    log('ajaxSubmit: submit vetoed via form-submit-validate trigger');
    return this;
  }

  var q = $.param(a);

  if (options.type.toUpperCase() == 'GET') {
    options.url += (options.url.indexOf('?') >= 0 ? '&' : '?') + q;
    options.data = null;  // data is null for 'get'
  }
  else
    options.data = q; // data is the query string for 'post'

  var $form = this, callbacks = [];
  if (options.resetForm) callbacks.push(function() { $form.resetForm(); });
  if (options.clearForm) callbacks.push(function() { $form.clearForm(); });

  // perform a load on the target only if dataType is not provided
  if (!options.dataType && options.target) {
    var oldSuccess = options.success || function(){};
    callbacks.push(function(data) {
      $(options.target).html(data).each(oldSuccess, arguments);
    });
  }
  else if (options.success)
    callbacks.push(options.success);

  options.success = function(data, status, xhr) { // jQuery 1.4+ passes xhr as 3rd arg
    for (var i=0, max=callbacks.length; i < max; i++)
      callbacks[i].apply(options, [data, status, xhr || $form, $form]);
  };

  // are there files to upload?
  var files = $('input:file', this).fieldValue();
  var found = false;
  for (var j=0; j < files.length; j++)
    if (files[j])
      found = true;

  var multipart = false;
//  var mp = 'multipart/form-data';
//  multipart = ($form.attr('enctype') == mp || $form.attr('encoding') == mp);

  // options.iframe allows user to force iframe mode
  // 06-NOV-09: now defaulting to iframe mode if file input is detected
   if ((files.length && options.iframe !== false) || options.iframe || found || multipart) {
     // hack to fix Safari hang (thanks to Tim Molendijk for this)
     // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
     if (options.closeKeepAlive)
       $.get(options.closeKeepAlive, fileUpload);
     else
       fileUpload();
     }
   else
     $.ajax(options);

  // fire 'notify' event
  this.trigger('form-submit-notify', [this, options]);
  return this;


  // private function for handling file uploads (hat tip to YAHOO!)
  function fileUpload() {
    var form = $form[0];

    if ($(':input[name=submit]', form).length) {
      alert('Error: Form elements must not be named "submit".');
      return;
    }

    var opts = $.extend({}, $.ajaxSettings, options);
    var s = $.extend(true, {}, $.extend(true, {}, $.ajaxSettings), opts);

    var id = 'jqFormIO' + (new Date().getTime());
    var $io = $('<iframe id="' + id + '" name="' + id + '" src="'+ opts.iframeSrc +'" onload="(jQuery(this).data(\'form-plugin-onload\'))()" />');
    var io = $io[0];

    $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });

    var xhr = { // mock object
      aborted: 0,
      responseText: null,
      responseXML: null,
      status: 0,
      statusText: 'n/a',
      getAllResponseHeaders: function() {},
      getResponseHeader: function() {},
      setRequestHeader: function() {},
      abort: function() {
        this.aborted = 1;
        $io.attr('src', opts.iframeSrc); // abort op in progress
      }
    };

    var g = opts.global;
    // trigger ajax global events so that activity/block indicators work like normal
    if (g && ! $.active++) $.event.trigger("ajaxStart");
    if (g) $.event.trigger("ajaxSend", [xhr, opts]);

    if (s.beforeSend && s.beforeSend(xhr, s) === false) {
      s.global && $.active--;
      return;
    }
    if (xhr.aborted)
      return;

    var cbInvoked = false;
    var timedOut = 0;

    // add submitting element to data if we know it
    var sub = form.clk;
    if (sub) {
      var n = sub.name;
      if (n && !sub.disabled) {
        opts.extraData = opts.extraData || {};
        opts.extraData[n] = sub.value;
        if (sub.type == "image") {
          opts.extraData[name+'.x'] = form.clk_x;
          opts.extraData[name+'.y'] = form.clk_y;
        }
      }
    }

    // take a breath so that pending repaints get some cpu time before the upload starts
    function doSubmit() {
      // make sure form attrs are set
      var t = $form.attr('target'), a = $form.attr('action');

      // update form attrs in IE friendly way
      form.setAttribute('target',id);
      if (form.getAttribute('method') != 'POST')
        form.setAttribute('method', 'POST');
      if (form.getAttribute('action') != opts.url)
        form.setAttribute('action', opts.url);

      // ie borks in some cases when setting encoding
      if (! opts.skipEncodingOverride) {
        $form.attr({
          encoding: 'multipart/form-data',
          enctype:  'multipart/form-data'
        });
      }

      // support timout
      if (opts.timeout)
        setTimeout(function() { timedOut = true; cb(); }, opts.timeout);

      // add "extra" data to form if provided in options
      var extraInputs = [];
      try {
        if (opts.extraData)
          for (var n in opts.extraData)
            extraInputs.push(
              $('<input type="hidden" name="'+n+'" value="'+opts.extraData[n]+'" />')
                .appendTo(form)[0]);

        // add iframe to doc and submit the form
        $io.appendTo('body');
        $io.data('form-plugin-onload', cb);
        form.submit();
      }
      finally {
        // reset attrs and remove "extra" input elements
        form.setAttribute('action',a);
        t ? form.setAttribute('target', t) : $form.removeAttr('target');
        $(extraInputs).remove();
      }
    };

    if (opts.forceSync)
      doSubmit();
    else
      setTimeout(doSubmit, 10); // this lets dom updates render

    var domCheckCount = 100;

    function cb() {
      if (cbInvoked)
        return;

      var ok = true;
      try {
        if (timedOut) throw 'timeout';
        // extract the server response from the iframe
        var data, doc;

        doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;

        var isXml = opts.dataType == 'xml' || doc.XMLDocument || $.isXMLDoc(doc);
        log('isXml='+isXml);
        if (!isXml && (doc.body == null || doc.body.innerHTML == '')) {
           if (--domCheckCount) {
            // in some browsers (Opera) the iframe DOM is not always traversable when
            // the onload callback fires, so we loop a bit to accommodate
            setTimeout(cb, 250);
            return;
          }
          log('Could not access iframe DOM after 100 tries.');
          return;
        }

        cbInvoked = true;
        xhr.responseText = doc.body ? doc.body.innerHTML : null;
        xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
        xhr.getResponseHeader = function(header){
          var headers = {'content-type': opts.dataType};
          return headers[header];
        };

        if (opts.dataType == 'json' || opts.dataType == 'script') {
          // see if user embedded response in textarea
          var ta = doc.getElementsByTagName('textarea')[0];
          if (ta)
            xhr.responseText = ta.value;
          else {
            // account for browsers injecting pre around json response
            var pre = doc.getElementsByTagName('pre')[0];
            if (pre)
              xhr.responseText = pre.innerHTML;
          }
        }
        else if (opts.dataType == 'xml' && !xhr.responseXML && xhr.responseText != null) {
          xhr.responseXML = toXml(xhr.responseText);
        }
        data = $.httpData(xhr, opts.dataType);
      }
      catch(e){
        ok = false;
        $.handleError(opts, xhr, 'error', e);
      }

      // ordering of these callbacks/triggers is odd, but that's how $.ajax does it
      if (ok) {
        opts.success(data, 'success');
        if (g) $.event.trigger("ajaxSuccess", [xhr, opts]);
      }
      if (g) $.event.trigger("ajaxComplete", [xhr, opts]);
      if (g && ! --$.active) $.event.trigger("ajaxStop");
      if (opts.complete) opts.complete(xhr, ok ? 'success' : 'error');

      // clean up
      setTimeout(function() {
        $io.removeData('form-plugin-onload');
        $io.remove();
        xhr.responseXML = null;
      }, 100);
    };

    function toXml(s, doc) {
      if (window.ActiveXObject) {
        doc = new ActiveXObject('Microsoft.XMLDOM');
        doc.async = 'false';
        doc.loadXML(s);
      }
      else
        doc = (new DOMParser()).parseFromString(s, 'text/xml');
      return (doc && doc.documentElement && doc.documentElement.tagName != 'parsererror') ? doc : null;
    };
  };
};

/**
 * ajaxForm() provides a mechanism for fully automating form submission.
 *
 * The advantages of using this method instead of ajaxSubmit() are:
 *
 * 1: This method will include coordinates for <input type="image" /> elements (if the element
 *  is used to submit the form).
 * 2. This method will include the submit element's name/value data (for the element that was
 *  used to submit the form).
 * 3. This method binds the submit() method to the form for you.
 *
 * The options argument for ajaxForm works exactly as it does for ajaxSubmit.  ajaxForm merely
 * passes the options argument along after properly binding events for submit elements and
 * the form itself.
 */
$.fn.ajaxForm = function(options) {
  return this.ajaxFormUnbind().bind('submit.form-plugin', function(e) {
    e.preventDefault();
    $(this).ajaxSubmit(options);
  }).bind('click.form-plugin', function(e) {
    var target = e.target;
    var $el = $(target);
    if (!($el.is(":submit,input:image"))) {
      // is this a child element of the submit el?  (ex: a span within a button)
      var t = $el.closest(':submit');
      if (t.length == 0)
        return;
      target = t[0];
    }
    var form = this;
    form.clk = target;
    if (target.type == 'image') {
      if (e.offsetX != undefined) {
        form.clk_x = e.offsetX;
        form.clk_y = e.offsetY;
      } else if (typeof $.fn.offset == 'function') { // try to use dimensions plugin
        var offset = $el.offset();
        form.clk_x = e.pageX - offset.left;
        form.clk_y = e.pageY - offset.top;
      } else {
        form.clk_x = e.pageX - target.offsetLeft;
        form.clk_y = e.pageY - target.offsetTop;
      }
    }
    // clear form vars
    setTimeout(function() { form.clk = form.clk_x = form.clk_y = null; }, 100);
  });
};

// ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
$.fn.ajaxFormUnbind = function() {
  return this.unbind('submit.form-plugin click.form-plugin');
};

/**
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 */
$.fn.formToArray = function(semantic) {
  var a = [];
  if (this.length == 0) return a;

  var form = this[0];
  var els = semantic ? form.getElementsByTagName('*') : form.elements;
  if (!els) return a;
  for(var i=0, max=els.length; i < max; i++) {
    var el = els[i];
    var n = el.name;
    if (!n) continue;

    if (semantic && form.clk && el.type == "image") {
      // handle image inputs on the fly when semantic == true
      if(!el.disabled && form.clk == el) {
        a.push({name: n, value: $(el).val()});
        a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
      }
      continue;
    }

    var v = $.fieldValue(el, true);
    if (v && v.constructor == Array) {
      for(var j=0, jmax=v.length; j < jmax; j++)
        a.push({name: n, value: v[j]});
    }
    else if (v !== null && typeof v != 'undefined')
      a.push({name: n, value: v});
  }

  if (!semantic && form.clk) {
    // input type=='image' are not found in elements array! handle it here
    var $input = $(form.clk), input = $input[0], n = input.name;
    if (n && !input.disabled && input.type == 'image') {
      a.push({name: n, value: $input.val()});
      a.push({name: n+'.x', value: form.clk_x}, {name: n+'.y', value: form.clk_y});
    }
  }
  return a;
};

/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 */
$.fn.formSerialize = function(semantic) {
  //hand off to jQuery.param for proper encoding
  return $.param(this.formToArray(semantic));
};

/**
 * Serializes all field elements in the jQuery object into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 */
$.fn.fieldSerialize = function(successful) {
  var a = [];
  this.each(function() {
    var n = this.name;
    if (!n) return;
    var v = $.fieldValue(this, successful);
    if (v && v.constructor == Array) {
      for (var i=0,max=v.length; i < max; i++)
        a.push({name: n, value: v[i]});
    }
    else if (v !== null && typeof v != 'undefined')
      a.push({name: this.name, value: v});
  });
  //hand off to jQuery.param for proper encoding
  return $.param(a);
};

/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *  <form><fieldset>
 *    <input name="A" type="text" />
 *    <input name="A" type="text" />
 *    <input name="B" type="checkbox" value="B1" />
 *    <input name="B" type="checkbox" value="B2"/>
 *    <input name="C" type="radio" value="C1" />
 *    <input name="C" type="radio" value="C2" />
 *  </fieldset></form>
 *
 *  var v = $(':text').fieldValue();
 *  // if no values are entered into the text inputs
 *  v == ['','']
 *  // if values entered into the text inputs are 'foo' and 'bar'
 *  v == ['foo','bar']
 *
 *  var v = $(':checkbox').fieldValue();
 *  // if neither checkbox is checked
 *  v === undefined
 *  // if both checkboxes are checked
 *  v == ['B1', 'B2']
 *
 *  var v = $(':radio').fieldValue();
 *  // if neither radio is checked
 *  v === undefined
 *  // if first radio is checked
 *  v == ['C1']
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *     array will be empty, otherwise it will contain one or more values.
 */
$.fn.fieldValue = function(successful) {
  for (var val=[], i=0, max=this.length; i < max; i++) {
    var el = this[i];
    var v = $.fieldValue(el, successful);
    if (v === null || typeof v == 'undefined' || (v.constructor == Array && !v.length))
      continue;
    v.constructor == Array ? $.merge(val, v) : val.push(v);
  }
  return val;
};

/**
 * Returns the value of the field element.
 */
$.fieldValue = function(el, successful) {
  var n = el.name, t = el.type, tag = el.tagName.toLowerCase();
  if (typeof successful == 'undefined') successful = true;

  if (successful && (!n || el.disabled || t == 'reset' || t == 'button' ||
    (t == 'checkbox' || t == 'radio') && !el.checked ||
    (t == 'submit' || t == 'image') && el.form && el.form.clk != el ||
    tag == 'select' && el.selectedIndex == -1))
      return null;

  if (tag == 'select') {
    var index = el.selectedIndex;
    if (index < 0) return null;
    var a = [], ops = el.options;
    var one = (t == 'select-one');
    var max = (one ? index+1 : ops.length);
    for(var i=(one ? index : 0); i < max; i++) {
      var op = ops[i];
      if (op.selected) {
        var v = op.value;
        if (!v) // extra pain for IE...
          v = (op.attributes && op.attributes['value'] && !(op.attributes['value'].specified)) ? op.text : op.value;
        if (one) return v;
        a.push(v);
      }
    }
    return a;
  }
  return el.value;
};

/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 */
$.fn.clearForm = function() {
  return this.each(function() {
    $('input,select,textarea', this).clearFields();
  });
};

/**
 * Clears the selected form elements.
 */
$.fn.clearFields = $.fn.clearInputs = function() {
  return this.each(function() {
    var t = this.type, tag = this.tagName.toLowerCase();
    if (t == 'text' || t == 'password' || tag == 'textarea')
      this.value = '';
    else if (t == 'checkbox' || t == 'radio')
      this.checked = false;
    else if (tag == 'select')
      this.selectedIndex = -1;
  });
};

/**
 * Resets the form data.  Causes all form elements to be reset to their original value.
 */
$.fn.resetForm = function() {
  return this.each(function() {
    // guard against an input with the name of 'reset'
    // note that IE reports the reset function as an 'object'
    if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType))
      this.reset();
  });
};

/**
 * Enables or disables any matching elements.
 */
$.fn.enable = function(b) {
  if (b == undefined) b = true;
  return this.each(function() {
    this.disabled = !b;
  });
};

/**
 * Checks/unchecks any matching checkboxes or radio buttons and
 * selects/deselects and matching option elements.
 */
$.fn.selected = function(select) {
  if (select == undefined) select = true;
  return this.each(function() {
    var t = this.type;
    if (t == 'checkbox' || t == 'radio')
      this.checked = select;
    else if (this.tagName.toLowerCase() == 'option') {
      var $sel = $(this).parent('select');
      if (select && $sel[0] && $sel[0].type == 'select-one') {
        // deselect all other options
        $sel.find('option').selected(false);
      }
      this.selected = select;
    }
  });
};

// helper fn for console logging
// set $.fn.ajaxSubmit.debug to true to enable debug logging
function log() {
  if ($.fn.ajaxSubmit.debug && window.console && window.console.log)
    window.console.log('[jquery.form] ' + Array.prototype.join.call(arguments,''));
};

})(jQuery);

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/

// t: current time, b: begInnIng value, c: change In value, d: duration
jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
/*!
 * jQuery UI 1.8rc3
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI
 */
;jQuery.ui || (function($) {

var isFF2 = $.browser.mozilla && (parseFloat($.browser.version) < 1.9);

//Helper functions and ui object
$.ui = {
  version: "1.8rc3",

  // $.ui.plugin is deprecated.  Use the proxy pattern instead.
  plugin: {
    add: function(module, option, set) {
      var proto = $.ui[module].prototype;
      for(var i in set) {
        proto.plugins[i] = proto.plugins[i] || [];
        proto.plugins[i].push([option, set[i]]);
      }
    },
    call: function(instance, name, args) {
      var set = instance.plugins[name];
      if(!set || !instance.element[0].parentNode) { return; }

      for (var i = 0; i < set.length; i++) {
        if (instance.options[set[i][0]]) {
          set[i][1].apply(instance.element, args);
        }
      }
    }
  },

  contains: function(a, b) {
    return document.compareDocumentPosition
      ? a.compareDocumentPosition(b) & 16
      : a !== b && a.contains(b);
  },

  hasScroll: function(el, a) {

    //If overflow is hidden, the element might have extra content, but the user wants to hide it
    if ($(el).css('overflow') == 'hidden') { return false; }

    var scroll = (a && a == 'left') ? 'scrollLeft' : 'scrollTop',
      has = false;

    if (el[scroll] > 0) { return true; }

    // TODO: determine which cases actually cause this to happen
    // if the element doesn't have the scroll set, see if it's possible to
    // set the scroll
    el[scroll] = 1;
    has = (el[scroll] > 0);
    el[scroll] = 0;
    return has;
  },

  isOverAxis: function(x, reference, size) {
    //Determines when x coordinate is over "b" element axis
    return (x > reference) && (x < (reference + size));
  },

  isOver: function(y, x, top, left, height, width) {
    //Determines when x, y coordinates is over "b" element
    return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
  },

  keyCode: {
    BACKSPACE: 8,
    CAPS_LOCK: 20,
    COMMA: 188,
    CONTROL: 17,
    DELETE: 46,
    DOWN: 40,
    END: 35,
    ENTER: 13,
    ESCAPE: 27,
    HOME: 36,
    INSERT: 45,
    LEFT: 37,
    NUMPAD_ADD: 107,
    NUMPAD_DECIMAL: 110,
    NUMPAD_DIVIDE: 111,
    NUMPAD_ENTER: 108,
    NUMPAD_MULTIPLY: 106,
    NUMPAD_SUBTRACT: 109,
    PAGE_DOWN: 34,
    PAGE_UP: 33,
    PERIOD: 190,
    RIGHT: 39,
    SHIFT: 16,
    SPACE: 32,
    TAB: 9,
    UP: 38
  }
};

//jQuery plugins
$.fn.extend({
  _focus: $.fn.focus,
  focus: function(delay, fn) {
    return typeof delay === 'number'
      ? this.each(function() {
        var elem = this;
        setTimeout(function() {
          $(elem).focus();
          (fn && fn.call(elem));
        }, delay);
      })
      : this._focus.apply(this, arguments);
  },

  enableSelection: function() {
    return this
      .attr('unselectable', 'off')
      .css('MozUserSelect', '')
      .unbind('selectstart.ui');
  },

  disableSelection: function() {
    return this
      .attr('unselectable', 'on')
      .css('MozUserSelect', 'none')
      .bind('selectstart.ui', function() { return false; });
  },

  scrollParent: function() {
    var scrollParent;
    if(($.browser.msie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
      scrollParent = this.parents().filter(function() {
        return (/(relative|absolute|fixed)/).test($.curCSS(this,'position',1)) && (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
      }).eq(0);
    } else {
      scrollParent = this.parents().filter(function() {
        return (/(auto|scroll)/).test($.curCSS(this,'overflow',1)+$.curCSS(this,'overflow-y',1)+$.curCSS(this,'overflow-x',1));
      }).eq(0);
    }

    return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
  },

  zIndex: function(zIndex) {
    if (zIndex !== undefined) {
      return this.css('zIndex', zIndex);
    }

    if (this.length) {
      var elem = $(this[0]), position, value;
      while (elem.length && elem[0] !== document) {
        // Ignore z-index if position is set to a value where z-index is ignored by the browser
        // This makes behavior of this function consistent across browsers
        // WebKit always returns auto if the element is positioned
        position = elem.css('position');
        if (position == 'absolute' || position == 'relative' || position == 'fixed')
        {
          // IE returns 0 when zIndex is not specified
          // other browsers return a string
          // we ignore the case of nested elements with an explicit value of 0
          // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
          value = parseInt(elem.css('zIndex'));
          if (!isNaN(value) && value != 0) {
            return value;
          }
        }
        elem = elem.parent();
      }
    }

    return 0;
  }
});


//Additional selectors
$.extend($.expr[':'], {
  data: function(elem, i, match) {
    return !!$.data(elem, match[3]);
  },

  focusable: function(element) {
    var nodeName = element.nodeName.toLowerCase(),
      tabIndex = $.attr(element, 'tabindex');
    return (/input|select|textarea|button|object/.test(nodeName)
      ? !element.disabled
      : 'a' == nodeName || 'area' == nodeName
        ? element.href || !isNaN(tabIndex)
        : !isNaN(tabIndex))
      // the element and all of its ancestors must be visible
      // the browser may report that the area is hidden
      && !$(element)['area' == nodeName ? 'parents' : 'closest'](':hidden').length;
  },

  tabbable: function(element) {
    var tabIndex = $.attr(element, 'tabindex');
    return (isNaN(tabIndex) || tabIndex >= 0) && $(element).is(':focusable');
  }
});

})(jQuery);

/*!
 * jQuery UI Widget 1.8rc3
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Widget
 */
(function( $ ) {

var _remove = $.fn.remove;

$.fn.remove = function( selector, keepData ) {
  return this.each(function() {
    if ( !keepData ) {
      if ( !selector || $.filter( selector, [ this ] ).length ) {
        $( "*", this ).add( this ).each(function() {
          $( this ).triggerHandler( "remove" );
        });
      }
    }
    return _remove.call( $(this), selector, keepData );
  });
};

$.widget = function( name, base, prototype ) {
  var namespace = name.split( "." )[ 0 ],
    fullName;
  name = name.split( "." )[ 1 ];
  fullName = namespace + "-" + name;

  if ( !prototype ) {
    prototype = base;
    base = $.Widget;
  }

  // create selector for plugin
  $.expr[ ":" ][ fullName ] = function( elem ) {
    return !!$.data( elem, name );
  };

  $[ namespace ] = $[ namespace ] || {};
  $[ namespace ][ name ] = function( options, element ) {
    // allow instantiation without initializing for simple inheritance
    if ( arguments.length ) {
      this._createWidget( options, element );
    }
  };

  var basePrototype = new base();
  // we need to make the options hash a property directly on the new instance
  // otherwise we'll modify the options hash on the prototype that we're
  // inheriting from
//  $.each( basePrototype, function( key, val ) {
//    if ( $.isPlainObject(val) ) {
//      basePrototype[ key ] = $.extend( {}, val );
//    }
//  });
  basePrototype.options = $.extend( {}, basePrototype.options );
  $[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
    namespace: namespace,
    widgetName: name,
    widgetEventPrefix: $[ namespace ][ name ].prototype.widgetEventPrefix || name,
    widgetBaseClass: fullName
  }, prototype );

  $.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
  $.fn[ name ] = function( options ) {
    var isMethodCall = typeof options === "string",
      args = Array.prototype.slice.call( arguments, 1 ),
      returnValue = this;

    // allow multiple hashes to be passed on init
    options = !isMethodCall && args.length ?
      $.extend.apply( null, [ true, options ].concat(args) ) :
      options;

    // prevent calls to internal methods
    if ( isMethodCall && options.substring( 0, 1 ) === "_" ) {
      return returnValue;
    }

    if ( isMethodCall ) {
      this.each(function() {
        var instance = $.data( this, name ),
          methodValue = instance && $.isFunction( instance[options] ) ?
            instance[ options ].apply( instance, args ) :
            instance;
        if ( methodValue !== instance && methodValue !== undefined ) {
          returnValue = methodValue;
          return false;
        }
      });
    } else {
      this.each(function() {
        var instance = $.data( this, name );
        if ( instance ) {
          if ( options ) {
            instance.option( options );
          }
          instance._init();
        } else {
          $.data( this, name, new object( options, this ) );
        }
      });
    }

    return returnValue;
  };
};

$.Widget = function( options, element ) {
  // allow instantiation without initializing for simple inheritance
  if ( arguments.length ) {
    this._createWidget( options, element );
  }
};

$.Widget.prototype = {
  widgetName: "widget",
  widgetEventPrefix: "",
  options: {
    disabled: false
  },
  _createWidget: function( options, element ) {
    // $.widget.bridge stores the plugin instance, but we do it anyway
    // so that it's stored even before the _create function runs
    this.element = $( element ).data( this.widgetName, this );
    this.options = $.extend( true, {},
      this.options,
      $.metadata && $.metadata.get( element )[ this.widgetName ],
      options );

    var self = this;
    this.element.bind( "remove." + this.widgetName, function() {
      self.destroy();
    });

    this._create();
    this._init();
  },
  _create: function() {},
  _init: function() {},

  destroy: function() {
    this.element
      .unbind( "." + this.widgetName )
      .removeData( this.widgetName );
    this.widget()
      .unbind( "." + this.widgetName )
      .removeAttr( "aria-disabled" )
      .removeClass(
        this.widgetBaseClass + "-disabled " +
        this.namespace + "-state-disabled" );
  },

  widget: function() {
    return this.element;
  },

  option: function( key, value ) {
    var options = key,
      self = this;

    if ( arguments.length === 0 ) {
      // don't return a reference to the internal hash
      return $.extend( {}, self.options );
    }

    if  (typeof key === "string" ) {
      if ( value === undefined ) {
        return this.options[ key ];
      }
      options = {};
      options[ key ] = value;
    }

    $.each( options, function( key, value ) {
      self._setOption( key, value );
    });

    return self;
  },
  _setOption: function( key, value ) {
    this.options[ key ] = value;

    if ( key === "disabled" ) {
      this.widget()
        [ value ? "addClass" : "removeClass"](
          this.widgetBaseClass + "-disabled" + " " +
          this.namespace + "-state-disabled" )
        .attr( "aria-disabled", value );
    }

    return this;
  },

  enable: function() {
    return this._setOption( "disabled", false );
  },
  disable: function() {
    return this._setOption( "disabled", true );
  },

  _trigger: function( type, event, data ) {
    var callback = this.options[ type ];

    event = $.Event( event );
    event.type = ( type === this.widgetEventPrefix ?
      type :
      this.widgetEventPrefix + type ).toLowerCase();
    data = data || {};

    // copy original event properties over to the new event
    // this would happen if we could call $.event.fix instead of $.Event
    // but we don't have a way to force an event to be fixed multiple times
    if ( event.originalEvent ) {
      for ( var i = $.event.props.length, prop; i; ) {
        prop = $.event.props[ --i ];
        event[ prop ] = event.originalEvent[ prop ];
      }
    }

    this.element.trigger( event, data );

    return !( $.isFunction(callback) &&
      callback.call( this.element[0], event, data ) === false ||
      event.isDefaultPrevented() );
  }
};

})( jQuery );

/*!
 * jQuery UI Mouse 1.8rc3
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Mouse
 *
 * Depends:
 *  jquery.ui.widget.js
 */
(function($) {

$.widget("ui.mouse", {
  options: {
    cancel: ':input,option',
    distance: 1,
    delay: 0
  },
  _mouseInit: function() {
    var self = this;

    this.element
      .bind('mousedown.'+this.widgetName, function(event) {
        return self._mouseDown(event);
      })
      .bind('click.'+this.widgetName, function(event) {
        if(self._preventClickEvent) {
          self._preventClickEvent = false;
          event.stopImmediatePropagation();
          return false;
        }
      });

    this.started = false;
  },

  // TODO: make sure destroying one instance of mouse doesn't mess with
  // other instances of mouse
  _mouseDestroy: function() {
    this.element.unbind('.'+this.widgetName);
  },

  _mouseDown: function(event) {
    // don't let more than one widget handle mouseStart
    // TODO: figure out why we have to use originalEvent
    event.originalEvent = event.originalEvent || {};
    if (event.originalEvent.mouseHandled) { return; }

    // we may have missed mouseup (out of window)
    (this._mouseStarted && this._mouseUp(event));

    this._mouseDownEvent = event;

    var self = this,
      btnIsLeft = (event.which == 1),
      elIsCancel = (typeof this.options.cancel == "string" ? $(event.target).parents().add(event.target).filter(this.options.cancel).length : false);
    if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
      return true;
    }

    this.mouseDelayMet = !this.options.delay;
    if (!this.mouseDelayMet) {
      this._mouseDelayTimer = setTimeout(function() {
        self.mouseDelayMet = true;
      }, this.options.delay);
    }

    if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
      this._mouseStarted = (this._mouseStart(event) !== false);
      if (!this._mouseStarted) {
        event.preventDefault();
        return true;
      }
    }

    // these delegates are required to keep context
    this._mouseMoveDelegate = function(event) {
      return self._mouseMove(event);
    };
    this._mouseUpDelegate = function(event) {
      return self._mouseUp(event);
    };
    $(document)
      .bind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
      .bind('mouseup.'+this.widgetName, this._mouseUpDelegate);

    // preventDefault() is used to prevent the selection of text here -
    // however, in Safari, this causes select boxes not to be selectable
    // anymore, so this fix is needed
    ($.browser.safari || event.preventDefault());

    event.originalEvent.mouseHandled = true;
    return true;
  },

  _mouseMove: function(event) {
    // IE mouseup check - mouseup happened when mouse was out of window
    if ($.browser.msie && !event.button) {
      return this._mouseUp(event);
    }

    if (this._mouseStarted) {
      this._mouseDrag(event);
      return event.preventDefault();
    }

    if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
      this._mouseStarted =
        (this._mouseStart(this._mouseDownEvent, event) !== false);
      (this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event));
    }

    return !this._mouseStarted;
  },

  _mouseUp: function(event) {
    $(document)
      .unbind('mousemove.'+this.widgetName, this._mouseMoveDelegate)
      .unbind('mouseup.'+this.widgetName, this._mouseUpDelegate);

    if (this._mouseStarted) {
      this._mouseStarted = false;
      this._preventClickEvent = (event.target == this._mouseDownEvent.target);
      this._mouseStop(event);
    }

    return false;
  },

  _mouseDistanceMet: function(event) {
    return (Math.max(
        Math.abs(this._mouseDownEvent.pageX - event.pageX),
        Math.abs(this._mouseDownEvent.pageY - event.pageY)
      ) >= this.options.distance
    );
  },

  _mouseDelayMet: function(event) {
    return this.mouseDelayMet;
  },

  // These are placeholder methods, to be overriden by extending plugin
  _mouseStart: function(event) {},
  _mouseDrag: function(event) {},
  _mouseStop: function(event) {},
  _mouseCapture: function(event) { return true; }
});

})(jQuery);

/*
 * jQuery UI Sortable 1.8rc3
 *
 * Copyright (c) 2010 AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * Depends:
 *  jquery.ui.core.js
 *  jquery.ui.mouse.js
 *  jquery.ui.widget.js
 */
(function($) {

$.widget("ui.sortable", $.ui.mouse, {
  widgetEventPrefix: "sort",
  options: {
    appendTo: "parent",
    axis: false,
    connectWith: false,
    containment: false,
    cursor: 'auto',
    cursorAt: false,
    dropOnEmpty: true,
    forcePlaceholderSize: false,
    forceHelperSize: false,
    grid: false,
    handle: false,
    helper: "original",
    items: '> *',
    opacity: false,
    placeholder: false,
    revert: false,
    scroll: true,
    scrollSensitivity: 20,
    scrollSpeed: 20,
    scope: "default",
    tolerance: "intersect",
    zIndex: 1000
  },
  _create: function() {

    var o = this.options;
    this.containerCache = {};
    this.element.addClass("ui-sortable");

    //Get the items
    this.refresh();

    //Let's determine if the items are floating
    this.floating = this.items.length ? (/left|right/).test(this.items[0].item.css('float')) : false;

    //Let's determine the parent's offset
    this.offset = this.element.offset();

    //Initialize mouse events for interaction
    this._mouseInit();

  },

  destroy: function() {
    this.element
      .removeClass("ui-sortable ui-sortable-disabled")
      .removeData("sortable")
      .unbind(".sortable");
    this._mouseDestroy();

    for ( var i = this.items.length - 1; i >= 0; i-- )
      this.items[i].item.removeData("sortable-item");

    return this;
  },

  _mouseCapture: function(event, overrideHandle) {

    if (this.reverting) {
      return false;
    }

    if(this.options.disabled || this.options.type == 'static') return false;

    //We have to refresh the items data once first
    this._refreshItems(event);

    //Find out if the clicked node (or one of its parents) is a actual item in this.items
    var currentItem = null, self = this, nodes = $(event.target).parents().each(function() {
      if($.data(this, 'sortable-item') == self) {
        currentItem = $(this);
        return false;
      }
    });
    if($.data(event.target, 'sortable-item') == self) currentItem = $(event.target);

    if(!currentItem) return false;
    if(this.options.handle && !overrideHandle) {
      var validHandle = false;

      $(this.options.handle, currentItem).find("*").andSelf().each(function() { if(this == event.target) validHandle = true; });
      if(!validHandle) return false;
    }

    this.currentItem = currentItem;
    this._removeCurrentsFromItems();
    return true;

  },

  _mouseStart: function(event, overrideHandle, noActivation) {

    var o = this.options, self = this;
    this.currentContainer = this;

    //We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
    this.refreshPositions();

    //Create and append the visible helper
    this.helper = this._createHelper(event);

    //Cache the helper size
    this._cacheHelperProportions();

    /*
     * - Position generation -
     * This block generates everything position related - it's the core of draggables.
     */

    //Cache the margins of the original element
    this._cacheMargins();

    //Get the next scrolling parent
    this.scrollParent = this.helper.scrollParent();

    //The element's absolute position on the page minus margins
    this.offset = this.currentItem.offset();
    this.offset = {
      top: this.offset.top - this.margins.top,
      left: this.offset.left - this.margins.left
    };

    // Only after we got the offset, we can change the helper's position to absolute
    // TODO: Still need to figure out a way to make relative sorting possible
    this.helper.css("position", "absolute");
    this.cssPosition = this.helper.css("position");

    $.extend(this.offset, {
      click: { //Where the click happened, relative to the element
        left: event.pageX - this.offset.left,
        top: event.pageY - this.offset.top
      },
      parent: this._getParentOffset(),
      relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
    });

    //Generate the original position
    this.originalPosition = this._generatePosition(event);
    this.originalPageX = event.pageX;
    this.originalPageY = event.pageY;

    //Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
    (o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt));

    //Cache the former DOM position
    this.domPosition = { prev: this.currentItem.prev()[0], parent: this.currentItem.parent()[0] };

    //If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
    if(this.helper[0] != this.currentItem[0]) {
      this.currentItem.hide();
    }

    //Create the placeholder
    this._createPlaceholder();

    //Set a containment if given in the options
    if(o.containment)
      this._setContainment();

    if(o.cursor) { // cursor option
      if ($('body').css("cursor")) this._storedCursor = $('body').css("cursor");
      $('body').css("cursor", o.cursor);
    }

    if(o.opacity) { // opacity option
      if (this.helper.css("opacity")) this._storedOpacity = this.helper.css("opacity");
      this.helper.css("opacity", o.opacity);
    }

    if(o.zIndex) { // zIndex option
      if (this.helper.css("zIndex")) this._storedZIndex = this.helper.css("zIndex");
      this.helper.css("zIndex", o.zIndex);
    }

    //Prepare scrolling
    if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML')
      this.overflowOffset = this.scrollParent.offset();

    //Call callbacks
    this._trigger("start", event, this._uiHash());

    //Recache the helper size
    if(!this._preserveHelperProportions)
      this._cacheHelperProportions();


    //Post 'activate' events to possible containers
    if(!noActivation) {
       for (var i = this.containers.length - 1; i >= 0; i--) { this.containers[i]._trigger("activate", event, self._uiHash(this)); }
    }

    //Prepare possible droppables
    if($.ui.ddmanager)
      $.ui.ddmanager.current = this;

    if ($.ui.ddmanager && !o.dropBehaviour)
      $.ui.ddmanager.prepareOffsets(this, event);

    this.dragging = true;

    this.helper.addClass("ui-sortable-helper");
    this._mouseDrag(event); //Execute the drag once - this causes the helper not to be visible before getting its correct position
    return true;

  },

  _mouseDrag: function(event) {

    //Compute the helpers position
    this.position = this._generatePosition(event);
    this.positionAbs = this._convertPositionTo("absolute");

    if (!this.lastPositionAbs) {
      this.lastPositionAbs = this.positionAbs;
    }

    //Do scrolling
    if(this.options.scroll) {
      var o = this.options, scrolled = false;
      if(this.scrollParent[0] != document && this.scrollParent[0].tagName != 'HTML') {

        if((this.overflowOffset.top + this.scrollParent[0].offsetHeight) - event.pageY < o.scrollSensitivity)
          this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop + o.scrollSpeed;
        else if(event.pageY - this.overflowOffset.top < o.scrollSensitivity)
          this.scrollParent[0].scrollTop = scrolled = this.scrollParent[0].scrollTop - o.scrollSpeed;

        if((this.overflowOffset.left + this.scrollParent[0].offsetWidth) - event.pageX < o.scrollSensitivity)
          this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft + o.scrollSpeed;
        else if(event.pageX - this.overflowOffset.left < o.scrollSensitivity)
          this.scrollParent[0].scrollLeft = scrolled = this.scrollParent[0].scrollLeft - o.scrollSpeed;

      } else {

        if(event.pageY - $(document).scrollTop() < o.scrollSensitivity)
          scrolled = $(document).scrollTop($(document).scrollTop() - o.scrollSpeed);
        else if($(window).height() - (event.pageY - $(document).scrollTop()) < o.scrollSensitivity)
          scrolled = $(document).scrollTop($(document).scrollTop() + o.scrollSpeed);

        if(event.pageX - $(document).scrollLeft() < o.scrollSensitivity)
          scrolled = $(document).scrollLeft($(document).scrollLeft() - o.scrollSpeed);
        else if($(window).width() - (event.pageX - $(document).scrollLeft()) < o.scrollSensitivity)
          scrolled = $(document).scrollLeft($(document).scrollLeft() + o.scrollSpeed);

      }

      if(scrolled !== false && $.ui.ddmanager && !o.dropBehaviour)
        $.ui.ddmanager.prepareOffsets(this, event);
    }

    //Regenerate the absolute position used for position checks
    this.positionAbs = this._convertPositionTo("absolute");

    //Set the helper position
    if(!this.options.axis || this.options.axis != "y") this.helper[0].style.left = this.position.left+'px';
    if(!this.options.axis || this.options.axis != "x") this.helper[0].style.top = this.position.top+'px';

    //Rearrange
    for (var i = this.items.length - 1; i >= 0; i--) {

      //Cache variables and intersection, continue if no intersection
      var item = this.items[i], itemElement = item.item[0], intersection = this._intersectsWithPointer(item);
      if (!intersection) continue;

      if(itemElement != this.currentItem[0] //cannot intersect with itself
        &&  this.placeholder[intersection == 1 ? "next" : "prev"]()[0] != itemElement //no useless actions that have been done before
        &&  !$.ui.contains(this.placeholder[0], itemElement) //no action if the item moved is the parent of the item checked
        && (this.options.type == 'semi-dynamic' ? !$.ui.contains(this.element[0], itemElement) : true)
        //&& itemElement.parentNode == this.placeholder[0].parentNode // only rearrange items within the same container
      ) {

        this.direction = intersection == 1 ? "down" : "up";

        if (this.options.tolerance == "pointer" || this._intersectsWithSides(item)) {
          this._rearrange(event, item);
        } else {
          break;
        }

        this._trigger("change", event, this._uiHash());
        break;
      }
    }

    //Post events to containers
    this._contactContainers(event);

    //Interconnect with droppables
    if($.ui.ddmanager) $.ui.ddmanager.drag(this, event);

    //Call callbacks
    this._trigger('sort', event, this._uiHash());

    this.lastPositionAbs = this.positionAbs;
    return false;

  },

  _mouseStop: function(event, noPropagation) {

    if(!event) return;

    //If we are using droppables, inform the manager about the drop
    if ($.ui.ddmanager && !this.options.dropBehaviour)
      $.ui.ddmanager.drop(this, event);

    if(this.options.revert) {
      var self = this;
      var cur = self.placeholder.offset();

      self.reverting = true;

      $(this.helper).animate({
        left: cur.left - this.offset.parent.left - self.margins.left + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollLeft),
        top: cur.top - this.offset.parent.top - self.margins.top + (this.offsetParent[0] == document.body ? 0 : this.offsetParent[0].scrollTop)
      }, parseInt(this.options.revert, 10) || 500, function() {
        self._clear(event);
      });
    } else {
      this._clear(event, noPropagation);
    }

    return false;

  },

  cancel: function() {

    var self = this;

    if(this.dragging) {

      this._mouseUp();

      if(this.options.helper == "original")
        this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
      else
        this.currentItem.show();

      //Post deactivating events to containers
      for (var i = this.containers.length - 1; i >= 0; i--){
        this.containers[i]._trigger("deactivate", null, self._uiHash(this));
        if(this.containers[i].containerCache.over) {
          this.containers[i]._trigger("out", null, self._uiHash(this));
          this.containers[i].containerCache.over = 0;
        }
      }

    }

    //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
    if(this.placeholder[0].parentNode) this.placeholder[0].parentNode.removeChild(this.placeholder[0]);
    if(this.options.helper != "original" && this.helper && this.helper[0].parentNode) this.helper.remove();

    $.extend(this, {
      helper: null,
      dragging: false,
      reverting: false,
      _noFinalSort: null
    });

    if(this.domPosition.prev) {
      $(this.domPosition.prev).after(this.currentItem);
    } else {
      $(this.domPosition.parent).prepend(this.currentItem);
    }

    return this;

  },

  serialize: function(o) {

    var items = this._getItemsAsjQuery(o && o.connected);
    var str = []; o = o || {};

    $(items).each(function() {
      var res = ($(o.item || this).attr(o.attribute || 'id') || '').match(o.expression || (/(.+)[-=_](.+)/));
      if(res) str.push((o.key || res[1]+'[]')+'='+(o.key && o.expression ? res[1] : res[2]));
    });

    return str.join('&');

  },

  toArray: function(o) {

    var items = this._getItemsAsjQuery(o && o.connected);
    var ret = []; o = o || {};

    items.each(function() { ret.push($(o.item || this).attr(o.attribute || 'id') || ''); });
    return ret;

  },

  /* Be careful with the following core functions */
  _intersectsWith: function(item) {

    var x1 = this.positionAbs.left,
      x2 = x1 + this.helperProportions.width,
      y1 = this.positionAbs.top,
      y2 = y1 + this.helperProportions.height;

    var l = item.left,
      r = l + item.width,
      t = item.top,
      b = t + item.height;

    var dyClick = this.offset.click.top,
      dxClick = this.offset.click.left;

    var isOverElement = (y1 + dyClick) > t && (y1 + dyClick) < b && (x1 + dxClick) > l && (x1 + dxClick) < r;

    if(     this.options.tolerance == "pointer"
      || this.options.forcePointerForContainers
      || (this.options.tolerance != "pointer" && this.helperProportions[this.floating ? 'width' : 'height'] > item[this.floating ? 'width' : 'height'])
    ) {
      return isOverElement;
    } else {

      return (l < x1 + (this.helperProportions.width / 2) // Right Half
        && x2 - (this.helperProportions.width / 2) < r // Left Half
        && t < y1 + (this.helperProportions.height / 2) // Bottom Half
        && y2 - (this.helperProportions.height / 2) < b ); // Top Half

    }
  },

  _intersectsWithPointer: function(item) {

    var isOverElementHeight = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top, item.height),
      isOverElementWidth = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left, item.width),
      isOverElement = isOverElementHeight && isOverElementWidth,
      verticalDirection = this._getDragVerticalDirection(),
      horizontalDirection = this._getDragHorizontalDirection();

    if (!isOverElement)
      return false;

    return this.floating ?
      ( ((horizontalDirection && horizontalDirection == "right") || verticalDirection == "down") ? 2 : 1 )
      : ( verticalDirection && (verticalDirection == "down" ? 2 : 1) );

  },

  _intersectsWithSides: function(item) {

    var isOverBottomHalf = $.ui.isOverAxis(this.positionAbs.top + this.offset.click.top, item.top + (item.height/2), item.height),
      isOverRightHalf = $.ui.isOverAxis(this.positionAbs.left + this.offset.click.left, item.left + (item.width/2), item.width),
      verticalDirection = this._getDragVerticalDirection(),
      horizontalDirection = this._getDragHorizontalDirection();

    if (this.floating && horizontalDirection) {
      return ((horizontalDirection == "right" && isOverRightHalf) || (horizontalDirection == "left" && !isOverRightHalf));
    } else {
      return verticalDirection && ((verticalDirection == "down" && isOverBottomHalf) || (verticalDirection == "up" && !isOverBottomHalf));
    }

  },

  _getDragVerticalDirection: function() {
    var delta = this.positionAbs.top - this.lastPositionAbs.top;
    return delta != 0 && (delta > 0 ? "down" : "up");
  },

  _getDragHorizontalDirection: function() {
    var delta = this.positionAbs.left - this.lastPositionAbs.left;
    return delta != 0 && (delta > 0 ? "right" : "left");
  },

  refresh: function(event) {
    this._refreshItems(event);
    this.refreshPositions();
    return this;
  },

  _connectWith: function() {
    var options = this.options;
    return options.connectWith.constructor == String
      ? [options.connectWith]
      : options.connectWith;
  },

  _getItemsAsjQuery: function(connected) {

    var self = this;
    var items = [];
    var queries = [];
    var connectWith = this._connectWith();

    if(connectWith && connected) {
      for (var i = connectWith.length - 1; i >= 0; i--){
        var cur = $(connectWith[i]);
        for (var j = cur.length - 1; j >= 0; j--){
          var inst = $.data(cur[j], 'sortable');
          if(inst && inst != this && !inst.options.disabled) {
            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element) : $(inst.options.items, inst.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), inst]);
          }
        };
      };
    }

    queries.push([$.isFunction(this.options.items) ? this.options.items.call(this.element, null, { options: this.options, item: this.currentItem }) : $(this.options.items, this.element).not(".ui-sortable-helper").not('.ui-sortable-placeholder'), this]);

    for (var i = queries.length - 1; i >= 0; i--){
      queries[i][0].each(function() {
        items.push(this);
      });
    };

    return $(items);

  },

  _removeCurrentsFromItems: function() {

    var list = this.currentItem.find(":data(sortable-item)");

    for (var i=0; i < this.items.length; i++) {

      for (var j=0; j < list.length; j++) {
        if(list[j] == this.items[i].item[0])
          this.items.splice(i,1);
      };

    };

  },

  _refreshItems: function(event) {

    this.items = [];
    this.containers = [this];
    var items = this.items;
    var self = this;
    var queries = [[$.isFunction(this.options.items) ? this.options.items.call(this.element[0], event, { item: this.currentItem }) : $(this.options.items, this.element), this]];
    var connectWith = this._connectWith();

    if(connectWith) {
      for (var i = connectWith.length - 1; i >= 0; i--){
        var cur = $(connectWith[i]);
        for (var j = cur.length - 1; j >= 0; j--){
          var inst = $.data(cur[j], 'sortable');
          if(inst && inst != this && !inst.options.disabled) {
            queries.push([$.isFunction(inst.options.items) ? inst.options.items.call(inst.element[0], event, { item: this.currentItem }) : $(inst.options.items, inst.element), inst]);
            this.containers.push(inst);
          }
        };
      };
    }

    for (var i = queries.length - 1; i >= 0; i--) {
      var targetData = queries[i][1];
      var _queries = queries[i][0];

      for (var j=0, queriesLength = _queries.length; j < queriesLength; j++) {
        var item = $(_queries[j]);

        item.data('sortable-item', targetData); // Data for target checking (mouse manager)

        items.push({
          item: item,
          instance: targetData,
          width: 0, height: 0,
          left: 0, top: 0
        });
      };
    };

  },

  refreshPositions: function(fast) {

    //This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
    if(this.offsetParent && this.helper) {
      this.offset.parent = this._getParentOffset();
    }

    for (var i = this.items.length - 1; i >= 0; i--){
      var item = this.items[i];

      var t = this.options.toleranceElement ? $(this.options.toleranceElement, item.item) : item.item;

      if (!fast) {
        item.width = t.outerWidth();
        item.height = t.outerHeight();
      }

      var p = t.offset();
      item.left = p.left;
      item.top = p.top;
    };

    if(this.options.custom && this.options.custom.refreshContainers) {
      this.options.custom.refreshContainers.call(this);
    } else {
      for (var i = this.containers.length - 1; i >= 0; i--){
        var p = this.containers[i].element.offset();
        this.containers[i].containerCache.left = p.left;
        this.containers[i].containerCache.top = p.top;
        this.containers[i].containerCache.width  = this.containers[i].element.outerWidth();
        this.containers[i].containerCache.height = this.containers[i].element.outerHeight();
      };
    }

    return this;
  },

  _createPlaceholder: function(that) {

    var self = that || this, o = self.options;

    if(!o.placeholder || o.placeholder.constructor == String) {
      var className = o.placeholder;
      o.placeholder = {
        element: function() {

          var el = $(document.createElement(self.currentItem[0].nodeName))
            .addClass(className || self.currentItem[0].className+" ui-sortable-placeholder")
            .removeClass("ui-sortable-helper")[0];

          if(!className)
            el.style.visibility = "hidden";

          return el;
        },
        update: function(container, p) {

          // 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
          // 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
          if(className && !o.forcePlaceholderSize) return;

          //If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
          if(!p.height()) { p.height(self.currentItem.innerHeight() - parseInt(self.currentItem.css('paddingTop')||0, 10) - parseInt(self.currentItem.css('paddingBottom')||0, 10)); };
          if(!p.width()) { p.width(self.currentItem.innerWidth() - parseInt(self.currentItem.css('paddingLeft')||0, 10) - parseInt(self.currentItem.css('paddingRight')||0, 10)); };
        }
      };
    }

    //Create the placeholder
    self.placeholder = $(o.placeholder.element.call(self.element, self.currentItem));

    //Append it after the actual current item
    self.currentItem.after(self.placeholder);

    //Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
    o.placeholder.update(self, self.placeholder);

  },

  _contactContainers: function(event) {

    // get innermost container that intersects with item
    var innermostContainer = null, innermostIndex = null;


    for (var i = this.containers.length - 1; i >= 0; i--){

      // never consider a container that's located within the item itself
      if($.ui.contains(this.currentItem[0], this.containers[i].element[0]))
        continue;

      if(this._intersectsWith(this.containers[i].containerCache)) {

        // if we've already found a container and it's more "inner" than this, then continue
        if(innermostContainer && $.ui.contains(this.containers[i].element[0], innermostContainer.element[0]))
          continue;

        innermostContainer = this.containers[i];
        innermostIndex = i;

      } else {
        // container doesn't intersect. trigger "out" event if necessary
        if(this.containers[i].containerCache.over) {
          this.containers[i]._trigger("out", event, this._uiHash(this));
          this.containers[i].containerCache.over = 0;
        }
      }

    }

    // if no intersecting containers found, return
    if(!innermostContainer) return;

    // move the item into the container if it's not there already
    if(this.currentContainer != this.containers[innermostIndex]) {

      //When entering a new container, we will find the item with the least distance and append our item near it
      var dist = 10000; var itemWithLeastDistance = null; var base = this.positionAbs[this.containers[innermostIndex].floating ? 'left' : 'top'];
      for (var j = this.items.length - 1; j >= 0; j--) {
        if(!$.ui.contains(this.containers[innermostIndex].element[0], this.items[j].item[0])) continue;
        var cur = this.items[j][this.containers[innermostIndex].floating ? 'left' : 'top'];
        if(Math.abs(cur - base) < dist) {
          dist = Math.abs(cur - base); itemWithLeastDistance = this.items[j];
        }
      }

      if(!itemWithLeastDistance && !this.options.dropOnEmpty) //Check if dropOnEmpty is enabled
        return;

      this.currentContainer = this.containers[innermostIndex];
      itemWithLeastDistance ? this._rearrange(event, itemWithLeastDistance, null, true) : this._rearrange(event, null, this.containers[innermostIndex].element, true);
      this._trigger("change", event, this._uiHash());
      this.containers[innermostIndex]._trigger("change", event, this._uiHash(this));

      //Update the placeholder
      this.options.placeholder.update(this.currentContainer, this.placeholder);

      this.containers[innermostIndex]._trigger("over", event, this._uiHash(this));
      this.containers[innermostIndex].containerCache.over = 1;
    }


  },

  _createHelper: function(event) {

    var o = this.options;
    var helper = $.isFunction(o.helper) ? $(o.helper.apply(this.element[0], [event, this.currentItem])) : (o.helper == 'clone' ? this.currentItem.clone() : this.currentItem);

    if(!helper.parents('body').length) //Add the helper to the DOM if that didn't happen already
      $(o.appendTo != 'parent' ? o.appendTo : this.currentItem[0].parentNode)[0].appendChild(helper[0]);

    if(helper[0] == this.currentItem[0])
      this._storedCSS = { width: this.currentItem[0].style.width, height: this.currentItem[0].style.height, position: this.currentItem.css("position"), top: this.currentItem.css("top"), left: this.currentItem.css("left") };

    if(helper[0].style.width == '' || o.forceHelperSize) helper.width(this.currentItem.width());
    if(helper[0].style.height == '' || o.forceHelperSize) helper.height(this.currentItem.height());

    return helper;

  },

  _adjustOffsetFromHelper: function(obj) {
    if (typeof obj == 'string') {
      obj = obj.split(' ');
    }
    if ($.isArray(obj)) {
      obj = {left: +obj[0], top: +obj[1] || 0};
    }
    if ('left' in obj) {
      this.offset.click.left = obj.left + this.margins.left;
    }
    if ('right' in obj) {
      this.offset.click.left = this.helperProportions.width - obj.right + this.margins.left;
    }
    if ('top' in obj) {
      this.offset.click.top = obj.top + this.margins.top;
    }
    if ('bottom' in obj) {
      this.offset.click.top = this.helperProportions.height - obj.bottom + this.margins.top;
    }
  },

  _getParentOffset: function() {


    //Get the offsetParent and cache its position
    this.offsetParent = this.helper.offsetParent();
    var po = this.offsetParent.offset();

    // This is a special case where we need to modify a offset calculated on start, since the following happened:
    // 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
    // 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
    //    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
    if(this.cssPosition == 'absolute' && this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) {
      po.left += this.scrollParent.scrollLeft();
      po.top += this.scrollParent.scrollTop();
    }

    if((this.offsetParent[0] == document.body) //This needs to be actually done for all browsers, since pageX/pageY includes this information
    || (this.offsetParent[0].tagName && this.offsetParent[0].tagName.toLowerCase() == 'html' && $.browser.msie)) //Ugly IE fix
      po = { top: 0, left: 0 };

    return {
      top: po.top + (parseInt(this.offsetParent.css("borderTopWidth"),10) || 0),
      left: po.left + (parseInt(this.offsetParent.css("borderLeftWidth"),10) || 0)
    };

  },

  _getRelativeOffset: function() {

    if(this.cssPosition == "relative") {
      var p = this.currentItem.position();
      return {
        top: p.top - (parseInt(this.helper.css("top"),10) || 0) + this.scrollParent.scrollTop(),
        left: p.left - (parseInt(this.helper.css("left"),10) || 0) + this.scrollParent.scrollLeft()
      };
    } else {
      return { top: 0, left: 0 };
    }

  },

  _cacheMargins: function() {
    this.margins = {
      left: (parseInt(this.currentItem.css("marginLeft"),10) || 0),
      top: (parseInt(this.currentItem.css("marginTop"),10) || 0)
    };
  },

  _cacheHelperProportions: function() {
    this.helperProportions = {
      width: this.helper.outerWidth(),
      height: this.helper.outerHeight()
    };
  },

  _setContainment: function() {

    var o = this.options;
    if(o.containment == 'parent') o.containment = this.helper[0].parentNode;
    if(o.containment == 'document' || o.containment == 'window') this.containment = [
      0 - this.offset.relative.left - this.offset.parent.left,
      0 - this.offset.relative.top - this.offset.parent.top,
      $(o.containment == 'document' ? document : window).width() - this.helperProportions.width - this.margins.left,
      ($(o.containment == 'document' ? document : window).height() || document.body.parentNode.scrollHeight) - this.helperProportions.height - this.margins.top
    ];

    if(!(/^(document|window|parent)$/).test(o.containment)) {
      var ce = $(o.containment)[0];
      var co = $(o.containment).offset();
      var over = ($(ce).css("overflow") != 'hidden');

      this.containment = [
        co.left + (parseInt($(ce).css("borderLeftWidth"),10) || 0) + (parseInt($(ce).css("paddingLeft"),10) || 0) - this.margins.left,
        co.top + (parseInt($(ce).css("borderTopWidth"),10) || 0) + (parseInt($(ce).css("paddingTop"),10) || 0) - this.margins.top,
        co.left+(over ? Math.max(ce.scrollWidth,ce.offsetWidth) : ce.offsetWidth) - (parseInt($(ce).css("borderLeftWidth"),10) || 0) - (parseInt($(ce).css("paddingRight"),10) || 0) - this.helperProportions.width - this.margins.left,
        co.top+(over ? Math.max(ce.scrollHeight,ce.offsetHeight) : ce.offsetHeight) - (parseInt($(ce).css("borderTopWidth"),10) || 0) - (parseInt($(ce).css("paddingBottom"),10) || 0) - this.helperProportions.height - this.margins.top
      ];
    }

  },

  _convertPositionTo: function(d, pos) {

    if(!pos) pos = this.position;
    var mod = d == "absolute" ? 1 : -1;
    var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

    return {
      top: (
        pos.top                                  // The absolute mouse position
        + this.offset.relative.top * mod                    // Only for relative positioned nodes: Relative offset from element to offset parent
        + this.offset.parent.top * mod                      // The offsetParent's offset without borders (offset + border)
        - ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ) * mod)
      ),
      left: (
        pos.left                                // The absolute mouse position
        + this.offset.relative.left * mod                    // Only for relative positioned nodes: Relative offset from element to offset parent
        + this.offset.parent.left * mod                      // The offsetParent's offset without borders (offset + border)
        - ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ) * mod)
      )
    };

  },

  _generatePosition: function(event) {

    var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);

    // This is another very weird special case that only happens for relative elements:
    // 1. If the css position is relative
    // 2. and the scroll parent is the document or similar to the offset parent
    // we have to refresh the relative offset during the scroll so there are no jumps
    if(this.cssPosition == 'relative' && !(this.scrollParent[0] != document && this.scrollParent[0] != this.offsetParent[0])) {
      this.offset.relative = this._getRelativeOffset();
    }

    var pageX = event.pageX;
    var pageY = event.pageY;

    /*
     * - Position constraining -
     * Constrain the position to a mix of grid, containment.
     */

    if(this.originalPosition) { //If we are not dragging yet, we won't check for options

      if(this.containment) {
        if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
        if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
        if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
        if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
      }

      if(o.grid) {
        var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
        pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

        var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
        pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
      }

    }

    return {
      top: (
        pageY                                // The absolute mouse position
        - this.offset.click.top                          // Click offset (relative to the element)
        - this.offset.relative.top                        // Only for relative positioned nodes: Relative offset from element to offset parent
        - this.offset.parent.top                        // The offsetParent's offset without borders (offset + border)
        + ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
      ),
      left: (
        pageX                                // The absolute mouse position
        - this.offset.click.left                        // Click offset (relative to the element)
        - this.offset.relative.left                        // Only for relative positioned nodes: Relative offset from element to offset parent
        - this.offset.parent.left                        // The offsetParent's offset without borders (offset + border)
        + ($.browser.safari && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
      )
    };

  },

  _rearrange: function(event, i, a, hardRefresh) {

    a ? a[0].appendChild(this.placeholder[0]) : i.item[0].parentNode.insertBefore(this.placeholder[0], (this.direction == 'down' ? i.item[0] : i.item[0].nextSibling));

    //Various things done here to improve the performance:
    // 1. we create a setTimeout, that calls refreshPositions
    // 2. on the instance, we have a counter variable, that get's higher after every append
    // 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
    // 4. this lets only the last addition to the timeout stack through
    this.counter = this.counter ? ++this.counter : 1;
    var self = this, counter = this.counter;

    window.setTimeout(function() {
      if(counter == self.counter) self.refreshPositions(!hardRefresh); //Precompute after each DOM insertion, NOT on mousemove
    },0);

  },

  _clear: function(event, noPropagation) {

    this.reverting = false;
    // We delay all events that have to be triggered to after the point where the placeholder has been removed and
    // everything else normalized again
    var delayedTriggers = [], self = this;

    // We first have to update the dom position of the actual currentItem
    // Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
    if(!this._noFinalSort && this.currentItem[0].parentNode) this.placeholder.before(this.currentItem);
    this._noFinalSort = null;

    if(this.helper[0] == this.currentItem[0]) {
      for(var i in this._storedCSS) {
        if(this._storedCSS[i] == 'auto' || this._storedCSS[i] == 'static') this._storedCSS[i] = '';
      }
      this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");
    } else {
      this.currentItem.show();
    }

    if(this.fromOutside && !noPropagation) delayedTriggers.push(function(event) { this._trigger("receive", event, this._uiHash(this.fromOutside)); });
    if((this.fromOutside || this.domPosition.prev != this.currentItem.prev().not(".ui-sortable-helper")[0] || this.domPosition.parent != this.currentItem.parent()[0]) && !noPropagation) delayedTriggers.push(function(event) { this._trigger("update", event, this._uiHash()); }); //Trigger update callback if the DOM position has changed
    if(!$.ui.contains(this.element[0], this.currentItem[0])) { //Node was moved out of the current element
      if(!noPropagation) delayedTriggers.push(function(event) { this._trigger("remove", event, this._uiHash()); });
      for (var i = this.containers.length - 1; i >= 0; i--){
        if($.ui.contains(this.containers[i].element[0], this.currentItem[0]) && !noPropagation) {
          delayedTriggers.push((function(c) { return function(event) { c._trigger("receive", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
          delayedTriggers.push((function(c) { return function(event) { c._trigger("update", event, this._uiHash(this));  }; }).call(this, this.containers[i]));
        }
      };
    };

    //Post events to containers
    for (var i = this.containers.length - 1; i >= 0; i--){
      if(!noPropagation) delayedTriggers.push((function(c) { return function(event) { c._trigger("deactivate", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
      if(this.containers[i].containerCache.over) {
        delayedTriggers.push((function(c) { return function(event) { c._trigger("out", event, this._uiHash(this)); };  }).call(this, this.containers[i]));
        this.containers[i].containerCache.over = 0;
      }
    }

    //Do what was originally in plugins
    if(this._storedCursor) $('body').css("cursor", this._storedCursor); //Reset cursor
    if(this._storedOpacity) this.helper.css("opacity", this._storedOpacity); //Reset opacity
    if(this._storedZIndex) this.helper.css("zIndex", this._storedZIndex == 'auto' ? '' : this._storedZIndex); //Reset z-index

    this.dragging = false;
    if(this.cancelHelperRemoval) {
      if(!noPropagation) {
        this._trigger("beforeStop", event, this._uiHash());
        for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
        this._trigger("stop", event, this._uiHash());
      }
      return false;
    }

    if(!noPropagation) this._trigger("beforeStop", event, this._uiHash());

    //$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
    this.placeholder[0].parentNode.removeChild(this.placeholder[0]);

    if(this.helper[0] != this.currentItem[0]) this.helper.remove(); this.helper = null;

    if(!noPropagation) {
      for (var i=0; i < delayedTriggers.length; i++) { delayedTriggers[i].call(this, event); }; //Trigger all delayed events
      this._trigger("stop", event, this._uiHash());
    }

    this.fromOutside = false;
    return true;

  },

  _trigger: function() {
    if ($.Widget.prototype._trigger.apply(this, arguments) === false) {
      this.cancel();
    }
  },

  _uiHash: function(inst) {
    var self = inst || this;
    return {
      helper: self.helper,
      placeholder: self.placeholder || $([]),
      position: self.position,
      originalPosition: self.originalPosition,
      offset: self.positionAbs,
      item: self.currentItem,
      sender: inst ? inst.element : null
    };
  }

});

$.extend($.ui.sortable, {
  version: "1.8rc3"
});

})(jQuery);

/*
 *  Tabby jQuery plugin version 0.12
 *
 *  Ted Devito - http://teddevito.com/demos/textarea.html
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Easy Widgets. If not, see <http://www.gnu.org/licenses/>
 *
 *  Plugin development pattern based on:  http://www.learningjquery.com/2007/10/a-plugin-development-pattern
 *
 */

// create closure

(function($) {

  // plugin definition

  $.fn.tabby = function(options) {
    //debug(this);
    // build main options before element iteration
    var opts = $.extend({}, $.fn.tabby.defaults, options);
    var pressed = $.fn.tabby.pressed;

    // iterate and reformat each matched element
    return this.each(function() {
      $this = $(this);

      // build element specific options
      var options = $.meta ? $.extend({}, opts, $this.data()) : opts;

      $this.bind('keydown',function (e) {
        var kc = $.fn.tabby.catch_kc(e);
        if (16 == kc) pressed.shft = true;
        /*
        because both CTRL+TAB and ALT+TAB default to an event (changing tab/window) that
        will prevent js from capturing the keyup event, we'll set a timer on releasing them.
        */
        if (17 == kc) {pressed.ctrl = true;  setTimeout("$.fn.tabby.pressed.ctrl = false;",1000);}
        if (18 == kc) {pressed.alt = true;   setTimeout("$.fn.tabby.pressed.alt = false;",1000);}

        if (9 == kc && !pressed.ctrl && !pressed.alt) {
          e.preventDefault(); // does not work in O9.63 ??
          pressed.last = kc;  setTimeout("$.fn.tabby.pressed.last = null;",0);
          process_keypress ($(e.target).get(0), pressed.shft, options);
          return false;
        }

      }).bind('keyup',function (e) {
        if (16 == $.fn.tabby.catch_kc(e)) pressed.shft = false;
      }).bind('blur',function (e) { // workaround for Opera -- http://www.webdeveloper.com/forum/showthread.php?p=806588
        if (9 == pressed.last) $(e.target).one('focus',function (e) {pressed.last = null;}).get(0).focus();
      });

    });
  };

  // define and expose any extra methods
  $.fn.tabby.catch_kc = function(e) { return e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which; };
  $.fn.tabby.pressed = {shft : false, ctrl : false, alt : false, last: null};

  // private function for debugging
  function debug($obj) {
    if (window.console && window.console.log)
    window.console.log('textarea count: ' + $obj.size());
  };

  function process_keypress (o,shft,options) {
    var scrollTo = o.scrollTop;
    //var tabString = String.fromCharCode(9);

    // gecko; o.setSelectionRange is only available when the text box has focus
    if (o.setSelectionRange) gecko_tab (o, shft, options);

    // ie; document.selection is always available
    else if (document.selection) ie_tab (o, shft, options);

    o.scrollTop = scrollTo;
  }

  // plugin defaults
  $.fn.tabby.defaults = {tabString : String.fromCharCode(9)};

  function gecko_tab (o, shft, options) {
    var ss = o.selectionStart;
    var es = o.selectionEnd;

    // when there's no selection and we're just working with the caret, we'll add/remove the tabs at the caret, providing more control
    if(ss == es) {
      // SHIFT+TAB
      if (shft) {
        // check to the left of the caret first
        if ("\t" == o.value.substring(ss-options.tabString.length, ss)) {
          o.value = o.value.substring(0, ss-options.tabString.length) + o.value.substring(ss); // put it back together omitting one character to the left
          o.focus();
          o.setSelectionRange(ss - options.tabString.length, ss - options.tabString.length);
        }
        // then check to the right of the caret
        else if ("\t" == o.value.substring(ss, ss + options.tabString.length)) {
          o.value = o.value.substring(0, ss) + o.value.substring(ss + options.tabString.length); // put it back together omitting one character to the right
          o.focus();
          o.setSelectionRange(ss,ss);
        }
      }
      // TAB
      else {
        o.value = o.value.substring(0, ss) + options.tabString + o.value.substring(ss);
        o.focus();
          o.setSelectionRange(ss + options.tabString.length, ss + options.tabString.length);
      }
    }
    // selections will always add/remove tabs from the start of the line
    else {
      // split the textarea up into lines and figure out which lines are included in the selection
      var lines = o.value.split("\n");
      var indices = new Array();
      var sl = 0; // start of the line
      var el = 0; // end of the line
      var sel = false;
      for (var i in lines) {
        el = sl + lines[i].length;
        indices.push({start: sl, end: el, selected: (sl <= ss && el > ss) || (el >= es && sl < es) || (sl > ss && el < es)});
        sl = el + 1;// for "\n"
      }

      // walk through the array of lines (indices) and add tabs where appropriate
      var modifier = 0;
      for (var i in indices) {
        if (indices[i].selected) {
          var pos = indices[i].start + modifier; // adjust for tabs already inserted/removed
          // SHIFT+TAB
          if (shft && options.tabString == o.value.substring(pos,pos+options.tabString.length)) { // only SHIFT+TAB if there's a tab at the start of the line
            o.value = o.value.substring(0,pos) + o.value.substring(pos + options.tabString.length); // omit the tabstring to the right
            modifier -= options.tabString.length;
          }
          // TAB
          else if (!shft) {
            o.value = o.value.substring(0,pos) + options.tabString + o.value.substring(pos); // insert the tabstring
            modifier += options.tabString.length;
          }
        }
      }
      o.focus();
      var ns = ss + ((modifier > 0) ? options.tabString.length : (modifier < 0) ? -options.tabString.length : 0);
      var ne = es + modifier;
      o.setSelectionRange(ns,ne);
    }
  }

  function ie_tab (o, shft, options) {
    var range = document.selection.createRange();

    if (o == range.parentElement()) {
      // when there's no selection and we're just working with the caret, we'll add/remove the tabs at the caret, providing more control
      if ('' == range.text) {
        // SHIFT+TAB
        if (shft) {
          var bookmark = range.getBookmark();
          //first try to the left by moving opening up our empty range to the left
            range.moveStart('character', -options.tabString.length);
            if (options.tabString == range.text) {
              range.text = '';
            } else {
              // if that didn't work then reset the range and try opening it to the right
              range.moveToBookmark(bookmark);
              range.moveEnd('character', options.tabString.length);
              if (options.tabString == range.text)
                range.text = '';
            }
            // move the pointer to the start of them empty range and select it
            range.collapse(true);
          range.select();
        }

        else {
          // very simple here. just insert the tab into the range and put the pointer at the end
          range.text = options.tabString;
          range.collapse(false);
          range.select();
        }
      }
      // selections will always add/remove tabs from the start of the line
      else {

        var selection_text = range.text;
        var selection_len = selection_text.length;
        var selection_arr = selection_text.split("\r\n");

        var before_range = document.body.createTextRange();
        before_range.moveToElementText(o);
        before_range.setEndPoint("EndToStart", range);
        var before_text = before_range.text;
        var before_arr = before_text.split("\r\n");
        var before_len = before_text.length; // - before_arr.length + 1;

        var after_range = document.body.createTextRange();
        after_range.moveToElementText(o);
        after_range.setEndPoint("StartToEnd", range);
        var after_text = after_range.text; // we can accurately calculate distance to the end because we're not worried about MSIE trimming a \r\n

        var end_range = document.body.createTextRange();
        end_range.moveToElementText(o);
        end_range.setEndPoint("StartToEnd", before_range);
        var end_text = end_range.text; // we can accurately calculate distance to the end because we're not worried about MSIE trimming a \r\n

        var check_html = $(o).html();
        $("#r3").text(before_len + " + " + selection_len + " + " + after_text.length + " = " + check_html.length);
        if((before_len + end_text.length) < check_html.length) {
          before_arr.push("");
          before_len += 2; // for the \r\n that was trimmed
          if (shft && options.tabString == selection_arr[0].substring(0,options.tabString.length))
            selection_arr[0] = selection_arr[0].substring(options.tabString.length);
          else if (!shft) selection_arr[0] = options.tabString + selection_arr[0];
        } else {
          if (shft && options.tabString == before_arr[before_arr.length-1].substring(0,options.tabString.length))
            before_arr[before_arr.length-1] = before_arr[before_arr.length-1].substring(options.tabString.length);
          else if (!shft) before_arr[before_arr.length-1] = options.tabString + before_arr[before_arr.length-1];
        }

        for (var i = 1; i < selection_arr.length; i++) {
          if (shft && options.tabString == selection_arr[i].substring(0,options.tabString.length))
            selection_arr[i] = selection_arr[i].substring(options.tabString.length);
          else if (!shft) selection_arr[i] = options.tabString + selection_arr[i];
        }

        if (1 == before_arr.length && 0 == before_len) {
          if (shft && options.tabString == selection_arr[0].substring(0,options.tabString.length))
            selection_arr[0] = selection_arr[0].substring(options.tabString.length);
          else if (!shft) selection_arr[0] = options.tabString + selection_arr[0];
        }

        if ((before_len + selection_len + after_text.length) < check_html.length) {
          selection_arr.push("");
          selection_len += 2; // for the \r\n that was trimmed
        }

        before_range.text = before_arr.join("\r\n");
        range.text = selection_arr.join("\r\n");

        var new_range = document.body.createTextRange();
        new_range.moveToElementText(o);

        if (0 < before_len)  new_range.setEndPoint("StartToEnd", before_range);
        else new_range.setEndPoint("StartToStart", before_range);
        new_range.setEndPoint("EndToEnd", range);

        new_range.select();

      }
    }
  }

// end of closure
})(jQuery);

/*
 * jSwipe - jQuery Plugin
 * http://plugins.jquery.com/project/swipe
 * http://www.ryanscherf.com/demos/swipe/
 *
 * Copyright (c) 2009 Ryan Scherf (www.ryanscherf.com)
 * Licensed under the MIT license
 *
 * $Date: 2009-07-14 (Tue, 14 Jul 2009) $
 * $version: 0.1
 *
 * This jQuery plugin will only run on devices running Mobile Safari
 * on iPhone or iPod Touch devices running iPhone OS 2.0 or later.
 * http://developer.apple.com/iphone/library/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW5
 */
(function($) {
  $.fn.swipe = function(options) {
    // Default thresholds & swipe functions
    var defaults = {
      threshold: {
        x: 30,
        y: 10
      },
      swipeLeft: function() { alert('swiped left') },
      swipeRight: function() { alert('swiped right') },
      preventDefaultEvents: true
    };

    var options = $.extend(defaults, options);

    if (!this) return false;

    return this.each(function() {

      var $self = $(this);

      // Private variables for each element
      var originalCoord = { x: 0, y: 0 };
      var finalCoord = { x: 0, y: 0 };

      // Screen touched, store the original coordinate
      function touchStart(event) {
        console.log('Starting swipe gesture...')
        originalCoord.x = event.targetTouches[0].pageX;
        originalCoord.y = event.targetTouches[0].pageY;
      }

      // Store coordinates as finger is swiping
      function touchMove(event) {
        if (defaults.preventDefaultEvents)
            event.preventDefault();
        finalCoord.x = event.targetTouches[0].pageX; // Updated X,Y coordinates
        finalCoord.y = event.targetTouches[0].pageY;
      }

      // Done Swiping
      // Swipe should only be on X axis, ignore if swipe on Y axis
      // Calculate if the swipe was left or right
      function touchEnd(event) {
        var changeY = ((originalCoord.y - finalCoord.y) / $self.height()) * 100,
            changeX = ((originalCoord.x - finalCoord.x) / $self.width()) * 100;

        console.log('Ending swipe gesture ' + changeX + ' ' + changeY);
        if(changeY < defaults.threshold.y && changeY > (defaults.threshold.y*-1)) {
          if(changeX > defaults.threshold.x) {
            options.swipeLeft();
          }
          if(changeX < (defaults.threshold.x*-1)) {
            options.swipeRight();
          }
        }
      }

      // Swipe was canceled
      function touchCancel(event) {
        console.log('Canceling swipe gesture...')
      }

      // Add gestures to all swipable areas
      this.addEventListener("touchstart", touchStart, false);
      this.addEventListener("touchmove", touchMove, false);
      this.addEventListener("touchend", touchEnd, false);
      this.addEventListener("touchcancel", touchCancel, false);

    });
  };
})(jQuery);

// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview
 * some functions for browser-side pretty printing of code contained in html.
 * <p>
 *
 * For a fairly comprehensive set of languages see the
 * <a href="http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs">README</a>
 * file that came with this source.  At a minimum, the lexer should work on a
 * number of languages including C and friends, Java, Python, Bash, SQL, HTML,
 * XML, CSS, Javascript, and Makefiles.  It works passably on Ruby, PHP and Awk
 * and a subset of Perl, but, because of commenting conventions, doesn't work on
 * Smalltalk, Lisp-like, or CAML-like languages without an explicit lang class.
 * <p>
 * Usage: <ol>
 * <li> include this source file in an html page via
 *   {@code <script type="text/javascript" src="/path/to/prettify.js"></script>}
 * <li> define style rules.  See the example page for examples.
 * <li> mark the {@code <pre>} and {@code <code>} tags in your source with
 *    {@code class=prettyprint.}
 *    You can also use the (html deprecated) {@code <xmp>} tag, but the pretty
 *    printer needs to do more substantial DOM manipulations to support that, so
 *    some css styles may not be preserved.
 * </ol>
 * That's it.  I wanted to keep the API as simple as possible, so there's no
 * need to specify which language the code is in, but if you wish, you can add
 * another class to the {@code <pre>} or {@code <code>} element to specify the
 * language, as in {@code <pre class="prettyprint lang-java">}.  Any class that
 * starts with "lang-" followed by a file extension, specifies the file type.
 * See the "lang-*.js" files in this directory for code that implements
 * per-language file handlers.
 * <p>
 * Change log:<br>
 * cbeust, 2006/08/22
 * <blockquote>
 *   Java annotations (start with "@") are now captured as literals ("lit")
 * </blockquote>
 * @requires console
 * @overrides window
 */

// JSLint declarations
/*global console, document, navigator, setTimeout, window */

/**
 * Split {@code prettyPrint} into multiple timeouts so as not to interfere with
 * UI events.
 * If set to {@code false}, {@code prettyPrint()} is synchronous.
 */
window['PR_SHOULD_USE_CONTINUATION'] = true;

/** the number of characters between tab columns */
window['PR_TAB_WIDTH'] = 8;

/** Walks the DOM returning a properly escaped version of innerHTML.
  * @param {Node} node
  * @param {Array.<string>} out output buffer that receives chunks of HTML.
  */
window['PR_normalizedHtml']

/** Contains functions for creating and registering new language handlers.
  * @type {Object}
  */
  = window['PR']

/** Pretty print a chunk of code.
  *
  * @param {string} sourceCodeHtml code as html
  * @return {string} code as html, but prettier
  */
  = window['prettyPrintOne']
/** Find all the {@code <pre>} and {@code <code>} tags in the DOM with
  * {@code class=prettyprint} and prettify them.
  * @param {Function?} opt_whenDone if specified, called when the last entry
  *     has been finished.
  */
  = window['prettyPrint'] = void 0;

/** browser detection. @extern @returns false if not IE, otherwise the major version. */
window['_pr_isIE6'] = function () {
  var ieVersion = navigator && navigator.userAgent &&
      navigator.userAgent.match(/\bMSIE ([678])\./);
  ieVersion = ieVersion ? +ieVersion[1] : false;
  window['_pr_isIE6'] = function () { return ieVersion; };
  return ieVersion;
};


(function () {
  // Keyword lists for various languages.
  var FLOW_CONTROL_KEYWORDS =
      "break continue do else for if return while ";
  var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + "auto case char const default " +
      "double enum extern float goto int long register short signed sizeof " +
      "static struct switch typedef union unsigned void volatile ";
  var COMMON_KEYWORDS = C_KEYWORDS + "catch class delete false import " +
      "new operator private protected public this throw true try typeof ";
  var CPP_KEYWORDS = COMMON_KEYWORDS + "alignof align_union asm axiom bool " +
      "concept concept_map const_cast constexpr decltype " +
      "dynamic_cast explicit export friend inline late_check " +
      "mutable namespace nullptr reinterpret_cast static_assert static_cast " +
      "template typeid typename using virtual wchar_t where ";
  var JAVA_KEYWORDS = COMMON_KEYWORDS +
      "abstract boolean byte extends final finally implements import " +
      "instanceof null native package strictfp super synchronized throws " +
      "transient ";
  var CSHARP_KEYWORDS = JAVA_KEYWORDS +
      "as base by checked decimal delegate descending event " +
      "fixed foreach from group implicit in interface internal into is lock " +
      "object out override orderby params partial readonly ref sbyte sealed " +
      "stackalloc string select uint ulong unchecked unsafe ushort var ";
  var JSCRIPT_KEYWORDS = COMMON_KEYWORDS +
      "debugger eval export function get null set undefined var with " +
      "Infinity NaN ";
  var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for " +
      "goto if import last local my next no our print package redo require " +
      "sub undef unless until use wantarray while BEGIN END ";
  var PYTHON_KEYWORDS = FLOW_CONTROL_KEYWORDS + "and as assert class def del " +
      "elif except exec finally from global import in is lambda " +
      "nonlocal not or pass print raise try with yield " +
      "False True None ";
  var RUBY_KEYWORDS = FLOW_CONTROL_KEYWORDS + "alias and begin case class def" +
      " defined elsif end ensure false in module next nil not or redo rescue " +
      "retry self super then true undef unless until when yield BEGIN END ";
  var SH_KEYWORDS = FLOW_CONTROL_KEYWORDS + "case done elif esac eval fi " +
      "function in local set then until ";
  var ALL_KEYWORDS = (
      CPP_KEYWORDS + CSHARP_KEYWORDS + JSCRIPT_KEYWORDS + PERL_KEYWORDS +
      PYTHON_KEYWORDS + RUBY_KEYWORDS + SH_KEYWORDS);

  // token style names.  correspond to css classes
  /** token style for a string literal */
  var PR_STRING = 'str';
  /** token style for a keyword */
  var PR_KEYWORD = 'kwd';
  /** token style for a comment */
  var PR_COMMENT = 'com';
  /** token style for a type */
  var PR_TYPE = 'typ';
  /** token style for a literal value.  e.g. 1, null, true. */
  var PR_LITERAL = 'lit';
  /** token style for a punctuation string. */
  var PR_PUNCTUATION = 'pun';
  /** token style for a punctuation string. */
  var PR_PLAIN = 'pln';

  /** token style for an sgml tag. */
  var PR_TAG = 'tag';
  /** token style for a markup declaration such as a DOCTYPE. */
  var PR_DECLARATION = 'dec';
  /** token style for embedded source. */
  var PR_SOURCE = 'src';
  /** token style for an sgml attribute name. */
  var PR_ATTRIB_NAME = 'atn';
  /** token style for an sgml attribute value. */
  var PR_ATTRIB_VALUE = 'atv';

  /**
   * A class that indicates a section of markup that is not code, e.g. to allow
   * embedding of line numbers within code listings.
   */
  var PR_NOCODE = 'nocode';

  /** A set of tokens that can precede a regular expression literal in
    * javascript.
    * http://www.mozilla.org/js/language/js20/rationale/syntax.html has the full
    * list, but I've removed ones that might be problematic when seen in
    * languages that don't support regular expression literals.
    *
    * <p>Specifically, I've removed any keywords that can't precede a regexp
    * literal in a syntactically legal javascript program, and I've removed the
    * "in" keyword since it's not a keyword in many languages, and might be used
    * as a count of inches.
    *
    * <p>The link a above does not accurately describe EcmaScript rules since
    * it fails to distinguish between (a=++/b/i) and (a++/b/i) but it works
    * very well in practice.
    *
    * @private
    */
  var REGEXP_PRECEDER_PATTERN = function () {
      var preceders = [
          "!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=",
          "&=", "(", "*", "*=", /* "+", */ "+=", ",", /* "-", */ "-=",
          "->", /*".", "..", "...", handled below */ "/", "/=", ":", "::", ";",
          "<", "<<", "<<=", "<=", "=", "==", "===", ">",
          ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[",
          "^", "^=", "^^", "^^=", "{", "|", "|=", "||",
          "||=", "~" /* handles =~ and !~ */,
          "break", "case", "continue", "delete",
          "do", "else", "finally", "instanceof",
          "return", "throw", "try", "typeof"
          ];
      var pattern = '(?:^^|[+-]';
      for (var i = 0; i < preceders.length; ++i) {
        pattern += '|' + preceders[i].replace(/([^=<>:&a-z])/g, '\\$1');
      }
      pattern += ')\\s*';  // matches at end, and matches empty string
      return pattern;
      // CAVEAT: this does not properly handle the case where a regular
      // expression immediately follows another since a regular expression may
      // have flags for case-sensitivity and the like.  Having regexp tokens
      // adjacent is not valid in any language I'm aware of, so I'm punting.
      // TODO: maybe style special characters inside a regexp as punctuation.
    }();

  // Define regexps here so that the interpreter doesn't have to create an
  // object each time the function containing them is called.
  // The language spec requires a new object created even if you don't access
  // the $1 members.
  var pr_amp = /&/g;
  var pr_lt = /</g;
  var pr_gt = />/g;
  var pr_quot = /\"/g;
  /** like textToHtml but escapes double quotes to be attribute safe. */
  function attribToHtml(str) {
    return str.replace(pr_amp, '&amp;')
        .replace(pr_lt, '&lt;')
        .replace(pr_gt, '&gt;')
        .replace(pr_quot, '&quot;');
  }

  /** escapest html special characters to html. */
  function textToHtml(str) {
    return str.replace(pr_amp, '&amp;')
        .replace(pr_lt, '&lt;')
        .replace(pr_gt, '&gt;');
  }


  var pr_ltEnt = /&lt;/g;
  var pr_gtEnt = /&gt;/g;
  var pr_aposEnt = /&apos;/g;
  var pr_quotEnt = /&quot;/g;
  var pr_ampEnt = /&amp;/g;
  var pr_nbspEnt = /&nbsp;/g;
  /** unescapes html to plain text. */
  function htmlToText(html) {
    var pos = html.indexOf('&');
    if (pos < 0) { return html; }
    // Handle numeric entities specially.  We can't use functional substitution
    // since that doesn't work in older versions of Safari.
    // These should be rare since most browsers convert them to normal chars.
    for (--pos; (pos = html.indexOf('&#', pos + 1)) >= 0;) {
      var end = html.indexOf(';', pos);
      if (end >= 0) {
        var num = html.substring(pos + 3, end);
        var radix = 10;
        if (num && num.charAt(0) === 'x') {
          num = num.substring(1);
          radix = 16;
        }
        var codePoint = parseInt(num, radix);
        if (!isNaN(codePoint)) {
          html = (html.substring(0, pos) + String.fromCharCode(codePoint) +
                  html.substring(end + 1));
        }
      }
    }

    return html.replace(pr_ltEnt, '<')
        .replace(pr_gtEnt, '>')
        .replace(pr_aposEnt, "'")
        .replace(pr_quotEnt, '"')
        .replace(pr_nbspEnt, ' ')
        .replace(pr_ampEnt, '&');
  }

  /** is the given node's innerHTML normally unescaped? */
  function isRawContent(node) {
    return 'XMP' === node.tagName;
  }

  var newlineRe = /[\r\n]/g;
  /**
   * Are newlines and adjacent spaces significant in the given node's innerHTML?
   */
  function isPreformatted(node, content) {
    // PRE means preformatted, and is a very common case, so don't create
    // unnecessary computed style objects.
    if ('PRE' === node.tagName) { return true; }
    if (!newlineRe.test(content)) { return true; }  // Don't care
    var whitespace = '';
    // For disconnected nodes, IE has no currentStyle.
    if (node.currentStyle) {
      whitespace = node.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) {
      // Firefox makes a best guess if node is disconnected whereas Safari
      // returns the empty string.
      whitespace = window.getComputedStyle(node, null).whiteSpace;
    }
    return !whitespace || whitespace === 'pre';
  }

  function normalizedHtml(node, out) {
    switch (node.nodeType) {
      case 1:  // an element
        var name = node.tagName.toLowerCase();
        out.push('<', name);
        for (var i = 0; i < node.attributes.length; ++i) {
          var attr = node.attributes[i];
          if (!attr.specified) { continue; }
          out.push(' ');
          normalizedHtml(attr, out);
        }
        out.push('>');
        for (var child = node.firstChild; child; child = child.nextSibling) {
          normalizedHtml(child, out);
        }
        if (node.firstChild || !/^(?:br|link|img)$/.test(name)) {
          out.push('<\/', name, '>');
        }
        break;
      case 2: // an attribute
        out.push(node.name.toLowerCase(), '="', attribToHtml(node.value), '"');
        break;
      case 3: case 4: // text
        out.push(textToHtml(node.nodeValue));
        break;
    }
  }

  /**
   * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
   * matches the union o the sets o strings matched d by the input RegExp.
   * Since it matches globally, if the input strings have a start-of-input
   * anchor (/^.../), it is ignored for the purposes of unioning.
   * @param {Array.<RegExp>} regexs non multiline, non-global regexs.
   * @return {RegExp} a global regex.
   */
  function combinePrefixPatterns(regexs) {
    var capturedGroupIndex = 0;

    var needToFoldCase = false;
    var ignoreCase = false;
    for (var i = 0, n = regexs.length; i < n; ++i) {
      var regex = regexs[i];
      if (regex.ignoreCase) {
        ignoreCase = true;
      } else if (/[a-z]/i.test(regex.source.replace(
                     /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
        needToFoldCase = true;
        ignoreCase = false;
        break;
      }
    }

    function decodeEscape(charsetPart) {
      if (charsetPart.charAt(0) !== '\\') { return charsetPart.charCodeAt(0); }
      switch (charsetPart.charAt(1)) {
        case 'b': return 8;
        case 't': return 9;
        case 'n': return 0xa;
        case 'v': return 0xb;
        case 'f': return 0xc;
        case 'r': return 0xd;
        case 'u': case 'x':
          return parseInt(charsetPart.substring(2), 16)
              || charsetPart.charCodeAt(1);
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7':
          return parseInt(charsetPart.substring(1), 8);
        default: return charsetPart.charCodeAt(1);
      }
    }

    function encodeEscape(charCode) {
      if (charCode < 0x20) {
        return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
      }
      var ch = String.fromCharCode(charCode);
      if (ch === '\\' || ch === '-' || ch === '[' || ch === ']') {
        ch = '\\' + ch;
      }
      return ch;
    }

    function caseFoldCharset(charSet) {
      var charsetParts = charSet.substring(1, charSet.length - 1).match(
          new RegExp(
              '\\\\u[0-9A-Fa-f]{4}'
              + '|\\\\x[0-9A-Fa-f]{2}'
              + '|\\\\[0-3][0-7]{0,2}'
              + '|\\\\[0-7]{1,2}'
              + '|\\\\[\\s\\S]'
              + '|-'
              + '|[^-\\\\]',
              'g'));
      var groups = [];
      var ranges = [];
      var inverse = charsetParts[0] === '^';
      for (var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i) {
        var p = charsetParts[i];
        switch (p) {
          case '\\B': case '\\b':
          case '\\D': case '\\d':
          case '\\S': case '\\s':
          case '\\W': case '\\w':
            groups.push(p);
            continue;
        }
        var start = decodeEscape(p);
        var end;
        if (i + 2 < n && '-' === charsetParts[i + 1]) {
          end = decodeEscape(charsetParts[i + 2]);
          i += 2;
        } else {
          end = start;
        }
        ranges.push([start, end]);
        // If the range might intersect letters, then expand it.
        if (!(end < 65 || start > 122)) {
          if (!(end < 65 || start > 90)) {
            ranges.push([Math.max(65, start) | 32, Math.min(end, 90) | 32]);
          }
          if (!(end < 97 || start > 122)) {
            ranges.push([Math.max(97, start) & ~32, Math.min(end, 122) & ~32]);
          }
        }
      }

      // [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
      // -> [[1, 12], [14, 14], [16, 17]]
      ranges.sort(function (a, b) { return (a[0] - b[0]) || (b[1]  - a[1]); });
      var consolidatedRanges = [];
      var lastRange = [NaN, NaN];
      for (var i = 0; i < ranges.length; ++i) {
        var range = ranges[i];
        if (range[0] <= lastRange[1] + 1) {
          lastRange[1] = Math.max(lastRange[1], range[1]);
        } else {
          consolidatedRanges.push(lastRange = range);
        }
      }

      var out = ['['];
      if (inverse) { out.push('^'); }
      out.push.apply(out, groups);
      for (var i = 0; i < consolidatedRanges.length; ++i) {
        var range = consolidatedRanges[i];
        out.push(encodeEscape(range[0]));
        if (range[1] > range[0]) {
          if (range[1] + 1 > range[0]) { out.push('-'); }
          out.push(encodeEscape(range[1]));
        }
      }
      out.push(']');
      return out.join('');
    }

    function allowAnywhereFoldCaseAndRenumberGroups(regex) {
      // Split into character sets, escape sequences, punctuation strings
      // like ('(', '(?:', ')', '^'), and runs of characters that do not
      // include any of the above.
      var parts = regex.source.match(
          new RegExp(
              '(?:'
              + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // a character set
              + '|\\\\u[A-Fa-f0-9]{4}'  // a unicode escape
              + '|\\\\x[A-Fa-f0-9]{2}'  // a hex escape
              + '|\\\\[0-9]+'  // a back-reference or octal escape
              + '|\\\\[^ux0-9]'  // other escape sequence
              + '|\\(\\?[:!=]'  // start of a non-capturing group
              + '|[\\(\\)\\^]'  // start/emd of a group, or line start
              + '|[^\\x5B\\x5C\\(\\)\\^]+'  // run of other characters
              + ')',
              'g'));
      var n = parts.length;

      // Maps captured group numbers to the number they will occupy in
      // the output or to -1 if that has not been determined, or to
      // undefined if they need not be capturing in the output.
      var capturedGroups = [];

      // Walk over and identify back references to build the capturedGroups
      // mapping.
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        var p = parts[i];
        if (p === '(') {
          // groups are 1-indexed, so max group index is count of '('
          ++groupIndex;
        } else if ('\\' === p.charAt(0)) {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex) {
            capturedGroups[decimalValue] = -1;
          }
        }
      }

      // Renumber groups and reduce capturing groups to non-capturing groups
      // where possible.
      for (var i = 1; i < capturedGroups.length; ++i) {
        if (-1 === capturedGroups[i]) {
          capturedGroups[i] = ++capturedGroupIndex;
        }
      }
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        var p = parts[i];
        if (p === '(') {
          ++groupIndex;
          if (capturedGroups[groupIndex] === undefined) {
            parts[i] = '(?:';
          }
        } else if ('\\' === p.charAt(0)) {
          var decimalValue = +p.substring(1);
          if (decimalValue && decimalValue <= groupIndex) {
            parts[i] = '\\' + capturedGroups[groupIndex];
          }
        }
      }

      // Remove any prefix anchors so that the output will match anywhere.
      // ^^ really does mean an anchored match though.
      for (var i = 0, groupIndex = 0; i < n; ++i) {
        if ('^' === parts[i] && '^' !== parts[i + 1]) { parts[i] = ''; }
      }

      // Expand letters to groupts to handle mixing of case-sensitive and
      // case-insensitive patterns if necessary.
      if (regex.ignoreCase && needToFoldCase) {
        for (var i = 0; i < n; ++i) {
          var p = parts[i];
          var ch0 = p.charAt(0);
          if (p.length >= 2 && ch0 === '[') {
            parts[i] = caseFoldCharset(p);
          } else if (ch0 !== '\\') {
            // TODO: handle letters in numeric escapes.
            parts[i] = p.replace(
                /[a-zA-Z]/g,
                function (ch) {
                  var cc = ch.charCodeAt(0);
                  return '[' + String.fromCharCode(cc & ~32, cc | 32) + ']';
                });
          }
        }
      }

      return parts.join('');
    }

    var rewritten = [];
    for (var i = 0, n = regexs.length; i < n; ++i) {
      var regex = regexs[i];
      if (regex.global || regex.multiline) { throw new Error('' + regex); }
      rewritten.push(
          '(?:' + allowAnywhereFoldCaseAndRenumberGroups(regex) + ')');
    }

    return new RegExp(rewritten.join('|'), ignoreCase ? 'gi' : 'g');
  }

  var PR_innerHtmlWorks = null;
  function getInnerHtml(node) {
    // inner html is hopelessly broken in Safari 2.0.4 when the content is
    // an html description of well formed XML and the containing tag is a PRE
    // tag, so we detect that case and emulate innerHTML.
    if (null === PR_innerHtmlWorks) {
      var testNode = document.createElement('PRE');
      testNode.appendChild(
          document.createTextNode('<!DOCTYPE foo PUBLIC "foo bar">\n<foo />'));
      PR_innerHtmlWorks = !/</.test(testNode.innerHTML);
    }

    if (PR_innerHtmlWorks) {
      var content = node.innerHTML;
      // XMP tags contain unescaped entities so require special handling.
      if (isRawContent(node)) {
        content = textToHtml(content);
      } else if (!isPreformatted(node, content)) {
        content = content.replace(/(<br\s*\/?>)[\r\n]+/g, '$1')
            .replace(/(?:[\r\n]+[ \t]*)+/g, ' ');
      }
      return content;
    }

    var out = [];
    for (var child = node.firstChild; child; child = child.nextSibling) {
      normalizedHtml(child, out);
    }
    return out.join('');
  }

  /** returns a function that expand tabs to spaces.  This function can be fed
    * successive chunks of text, and will maintain its own internal state to
    * keep track of how tabs are expanded.
    * @return {function (string) : string} a function that takes
    *   plain text and return the text with tabs expanded.
    * @private
    */
  function makeTabExpander(tabWidth) {
    var SPACES = '                ';
    var charInLine = 0;

    return function (plainText) {
      // walk over each character looking for tabs and newlines.
      // On tabs, expand them.  On newlines, reset charInLine.
      // Otherwise increment charInLine
      var out = null;
      var pos = 0;
      for (var i = 0, n = plainText.length; i < n; ++i) {
        var ch = plainText.charAt(i);

        switch (ch) {
          case '\t':
            if (!out) { out = []; }
            out.push(plainText.substring(pos, i));
            // calculate how much space we need in front of this part
            // nSpaces is the amount of padding -- the number of spaces needed
            // to move us to the next column, where columns occur at factors of
            // tabWidth.
            var nSpaces = tabWidth - (charInLine % tabWidth);
            charInLine += nSpaces;
            for (; nSpaces >= 0; nSpaces -= SPACES.length) {
              out.push(SPACES.substring(0, nSpaces));
            }
            pos = i + 1;
            break;
          case '\n':
            charInLine = 0;
            break;
          default:
            ++charInLine;
        }
      }
      if (!out) { return plainText; }
      out.push(plainText.substring(pos));
      return out.join('');
    };
  }

  var pr_chunkPattern = new RegExp(
      '[^<]+'  // A run of characters other than '<'
      + '|<\!--[\\s\\S]*?--\>'  // an HTML comment
      + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'  // a CDATA section
      // a probable tag that should not be highlighted
      + '|<\/?[a-zA-Z](?:[^>\"\']|\'[^\']*\'|\"[^\"]*\")*>'
      + '|<',  // A '<' that does not begin a larger chunk
      'g');
  var pr_commentPrefix = /^<\!--/;
  var pr_cdataPrefix = /^<!\[CDATA\[/;
  var pr_brPrefix = /^<br\b/i;
  var pr_tagNameRe = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/;

  /** split markup into chunks of html tags (style null) and
    * plain text (style {@link #PR_PLAIN}), converting tags which are
    * significant for tokenization (<br>) into their textual equivalent.
    *
    * @param {string} s html where whitespace is considered significant.
    * @return {Object} source code and extracted tags.
    * @private
    */
  function extractTags(s) {
    // since the pattern has the 'g' modifier and defines no capturing groups,
    // this will return a list of all chunks which we then classify and wrap as
    // PR_Tokens
    var matches = s.match(pr_chunkPattern);
    var sourceBuf = [];
    var sourceBufLen = 0;
    var extractedTags = [];
    if (matches) {
      for (var i = 0, n = matches.length; i < n; ++i) {
        var match = matches[i];
        if (match.length > 1 && match.charAt(0) === '<') {
          if (pr_commentPrefix.test(match)) { continue; }
          if (pr_cdataPrefix.test(match)) {
            // strip CDATA prefix and suffix.  Don't unescape since it's CDATA
            sourceBuf.push(match.substring(9, match.length - 3));
            sourceBufLen += match.length - 12;
          } else if (pr_brPrefix.test(match)) {
            // <br> tags are lexically significant so convert them to text.
            // This is undone later.
            sourceBuf.push('\n');
            ++sourceBufLen;
          } else {
            if (match.indexOf(PR_NOCODE) >= 0 && isNoCodeTag(match)) {
              // A <span class="nocode"> will start a section that should be
              // ignored.  Continue walking the list until we see a matching end
              // tag.
              var name = match.match(pr_tagNameRe)[2];
              var depth = 1;
              var j;
              end_tag_loop:
              for (j = i + 1; j < n; ++j) {
                var name2 = matches[j].match(pr_tagNameRe);
                if (name2 && name2[2] === name) {
                  if (name2[1] === '/') {
                    if (--depth === 0) { break end_tag_loop; }
                  } else {
                    ++depth;
                  }
                }
              }
              if (j < n) {
                extractedTags.push(
                    sourceBufLen, matches.slice(i, j + 1).join(''));
                i = j;
              } else {  // Ignore unclosed sections.
                extractedTags.push(sourceBufLen, match);
              }
            } else {
              extractedTags.push(sourceBufLen, match);
            }
          }
        } else {
          var literalText = htmlToText(match);
          sourceBuf.push(literalText);
          sourceBufLen += literalText.length;
        }
      }
    }
    return { source: sourceBuf.join(''), tags: extractedTags };
  }

  /** True if the given tag contains a class attribute with the nocode class. */
  function isNoCodeTag(tag) {
    return !!tag
        // First canonicalize the representation of attributes
        .replace(/\s(\w+)\s*=\s*(?:\"([^\"]*)\"|'([^\']*)'|(\S+))/g,
                 ' $1="$2$3$4"')
        // Then look for the attribute we want.
        .match(/[cC][lL][aA][sS][sS]=\"[^\"]*\bnocode\b/);
  }

  /**
   * Apply the given language handler to sourceCode and add the resulting
   * decorations to out.
   * @param {number} basePos the index of sourceCode within the chunk of source
   *    whose decorations are already present on out.
   */
  function appendDecorations(basePos, sourceCode, langHandler, out) {
    if (!sourceCode) { return; }
    var job = {
      source: sourceCode,
      basePos: basePos
    };
    langHandler(job);
    out.push.apply(out, job.decorations);
  }

  /** Given triples of [style, pattern, context] returns a lexing function,
    * The lexing function interprets the patterns to find token boundaries and
    * returns a decoration list of the form
    * [index_0, style_0, index_1, style_1, ..., index_n, style_n]
    * where index_n is an index into the sourceCode, and style_n is a style
    * constant like PR_PLAIN.  index_n-1 <= index_n, and style_n-1 applies to
    * all characters in sourceCode[index_n-1:index_n].
    *
    * The stylePatterns is a list whose elements have the form
    * [style : string, pattern : RegExp, DEPRECATED, shortcut : string].
    *
    * Style is a style constant like PR_PLAIN, or can be a string of the
    * form 'lang-FOO', where FOO is a language extension describing the
    * language of the portion of the token in $1 after pattern executes.
    * E.g., if style is 'lang-lisp', and group 1 contains the text
    * '(hello (world))', then that portion of the token will be passed to the
    * registered lisp handler for formatting.
    * The text before and after group 1 will be restyled using this decorator
    * so decorators should take care that this doesn't result in infinite
    * recursion.  For example, the HTML lexer rule for SCRIPT elements looks
    * something like ['lang-js', /<[s]cript>(.+?)<\/script>/].  This may match
    * '<script>foo()<\/script>', which would cause the current decorator to
    * be called with '<script>' which would not match the same rule since
    * group 1 must not be empty, so it would be instead styled as PR_TAG by
    * the generic tag rule.  The handler registered for the 'js' extension would
    * then be called with 'foo()', and finally, the current decorator would
    * be called with '<\/script>' which would not match the original rule and
    * so the generic tag rule would identify it as a tag.
    *
    * Pattern must only match prefixes, and if it matches a prefix, then that
    * match is considered a token with the same style.
    *
    * Context is applied to the last non-whitespace, non-comment token
    * recognized.
    *
    * Shortcut is an optional string of characters, any of which, if the first
    * character, gurantee that this pattern and only this pattern matches.
    *
    * @param {Array} shortcutStylePatterns patterns that always start with
    *   a known character.  Must have a shortcut string.
    * @param {Array} fallthroughStylePatterns patterns that will be tried in
    *   order if the shortcut ones fail.  May have shortcuts.
    *
    * @return {function (Object)} a
    *   function that takes source code and returns a list of decorations.
    */
  function createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns) {
    var shortcuts = {};
    var tokenizer;
    (function () {
      var allPatterns = shortcutStylePatterns.concat(fallthroughStylePatterns);
      var allRegexs = [];
      var regexKeys = {};
      for (var i = 0, n = allPatterns.length; i < n; ++i) {
        var patternParts = allPatterns[i];
        var shortcutChars = patternParts[3];
        if (shortcutChars) {
          for (var c = shortcutChars.length; --c >= 0;) {
            shortcuts[shortcutChars.charAt(c)] = patternParts;
          }
        }
        var regex = patternParts[1];
        var k = '' + regex;
        if (!regexKeys.hasOwnProperty(k)) {
          allRegexs.push(regex);
          regexKeys[k] = null;
        }
      }
      allRegexs.push(/[\0-\uffff]/);
      tokenizer = combinePrefixPatterns(allRegexs);
    })();

    var nPatterns = fallthroughStylePatterns.length;
    var notWs = /\S/;

    /**
     * Lexes job.source and produces an output array job.decorations of style
     * classes preceded by the position at which they start in job.source in
     * order.
     *
     * @param {Object} job an object like {@code
     *    source: {string} sourceText plain text,
     *    basePos: {int} position of job.source in the larger chunk of
     *        sourceCode.
     * }
     */
    var decorate = function (job) {
      var sourceCode = job.source, basePos = job.basePos;
      /** Even entries are positions in source in ascending order.  Odd enties
        * are style markers (e.g., PR_COMMENT) that run from that position until
        * the end.
        * @type {Array.<number|string>}
        */
      var decorations = [basePos, PR_PLAIN];
      var pos = 0;  // index into sourceCode
      var tokens = sourceCode.match(tokenizer) || [];
      var styleCache = {};

      for (var ti = 0, nTokens = tokens.length; ti < nTokens; ++ti) {
        var token = tokens[ti];
        var style = styleCache[token];
        var match = void 0;

        var isEmbedded;
        if (typeof style === 'string') {
          isEmbedded = false;
        } else {
          var patternParts = shortcuts[token.charAt(0)];
          if (patternParts) {
            match = token.match(patternParts[1]);
            style = patternParts[0];
          } else {
            for (var i = 0; i < nPatterns; ++i) {
              patternParts = fallthroughStylePatterns[i];
              match = token.match(patternParts[1]);
              if (match) {
                style = patternParts[0];
                break;
              }
            }

            if (!match) {  // make sure that we make progress
              style = PR_PLAIN;
            }
          }

          isEmbedded = style.length >= 5 && 'lang-' === style.substring(0, 5);
          if (isEmbedded && !(match && typeof match[1] === 'string')) {
            isEmbedded = false;
            style = PR_SOURCE;
          }

          if (!isEmbedded) { styleCache[token] = style; }
        }

        var tokenStart = pos;
        pos += token.length;

        if (!isEmbedded) {
          decorations.push(basePos + tokenStart, style);
        } else {  // Treat group 1 as an embedded block of source code.
          var embeddedSource = match[1];
          var embeddedSourceStart = token.indexOf(embeddedSource);
          var embeddedSourceEnd = embeddedSourceStart + embeddedSource.length;
          if (match[2]) {
            // If embeddedSource can be blank, then it would match at the
            // beginning which would cause us to infinitely recurse on the
            // entire token, so we catch the right context in match[2].
            embeddedSourceEnd = token.length - match[2].length;
            embeddedSourceStart = embeddedSourceEnd - embeddedSource.length;
          }
          var lang = style.substring(5);
          // Decorate the left of the embedded source
          appendDecorations(
              basePos + tokenStart,
              token.substring(0, embeddedSourceStart),
              decorate, decorations);
          // Decorate the embedded source
          appendDecorations(
              basePos + tokenStart + embeddedSourceStart,
              embeddedSource,
              langHandlerForExtension(lang, embeddedSource),
              decorations);
          // Decorate the right of the embedded section
          appendDecorations(
              basePos + tokenStart + embeddedSourceEnd,
              token.substring(embeddedSourceEnd),
              decorate, decorations);
        }
      }
      job.decorations = decorations;
    };
    return decorate;
  }

  /** returns a function that produces a list of decorations from source text.
    *
    * This code treats ", ', and ` as string delimiters, and \ as a string
    * escape.  It does not recognize perl's qq() style strings.
    * It has no special handling for double delimiter escapes as in basic, or
    * the tripled delimiters used in python, but should work on those regardless
    * although in those cases a single string literal may be broken up into
    * multiple adjacent string literals.
    *
    * It recognizes C, C++, and shell style comments.
    *
    * @param {Object} options a set of optional parameters.
    * @return {function (Object)} a function that examines the source code
    *     in the input job and builds the decoration list.
    */
  function sourceDecorator(options) {
    var shortcutStylePatterns = [], fallthroughStylePatterns = [];
    if (options['tripleQuotedStrings']) {
      // '''multi-line-string''', 'single-line-string', and double-quoted
      shortcutStylePatterns.push(
          [PR_STRING,  /^(?:\'\'\'(?:[^\'\\]|\\[\s\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\"\"\"(?:[^\"\\]|\\[\s\S]|\"{1,2}(?=[^\"]))*(?:\"\"\"|$)|\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$))/,
           null, '\'"']);
    } else if (options['multiLineStrings']) {
      // 'multi-line-string', "multi-line-string"
      shortcutStylePatterns.push(
          [PR_STRING,  /^(?:\'(?:[^\\\']|\\[\s\S])*(?:\'|$)|\"(?:[^\\\"]|\\[\s\S])*(?:\"|$)|\`(?:[^\\\`]|\\[\s\S])*(?:\`|$))/,
           null, '\'"`']);
    } else {
      // 'single-line-string', "single-line-string"
      shortcutStylePatterns.push(
          [PR_STRING,
           /^(?:\'(?:[^\\\'\r\n]|\\.)*(?:\'|$)|\"(?:[^\\\"\r\n]|\\.)*(?:\"|$))/,
           null, '"\'']);
    }
    if (options['verbatimStrings']) {
      // verbatim-string-literal production from the C# grammar.  See issue 93.
      fallthroughStylePatterns.push(
          [PR_STRING, /^@\"(?:[^\"]|\"\")*(?:\"|$)/, null]);
    }
    if (options['hashComments']) {
      if (options['cStyleComments']) {
        // Stop C preprocessor declarations at an unclosed open comment
        shortcutStylePatterns.push(
            [PR_COMMENT, /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\r\n]*)/,
             null, '#']);
        fallthroughStylePatterns.push(
            [PR_STRING,
             /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/,
             null]);
      } else {
        shortcutStylePatterns.push([PR_COMMENT, /^#[^\r\n]*/, null, '#']);
      }
    }
    if (options['cStyleComments']) {
      fallthroughStylePatterns.push([PR_COMMENT, /^\/\/[^\r\n]*/, null]);
      fallthroughStylePatterns.push(
          [PR_COMMENT, /^\/\*[\s\S]*?(?:\*\/|$)/, null]);
    }
    if (options['regexLiterals']) {
      var REGEX_LITERAL = (
          // A regular expression literal starts with a slash that is
          // not followed by * or / so that it is not confused with
          // comments.
          '/(?=[^/*])'
          // and then contains any number of raw characters,
          + '(?:[^/\\x5B\\x5C]'
          // escape sequences (\x5C),
          +    '|\\x5C[\\s\\S]'
          // or non-nesting character sets (\x5B\x5D);
          +    '|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+'
          // finally closed by a /.
          + '/');
      fallthroughStylePatterns.push(
          ['lang-regex',
           new RegExp('^' + REGEXP_PRECEDER_PATTERN + '(' + REGEX_LITERAL + ')')
           ]);
    }

    var keywords = options['keywords'].replace(/^\s+|\s+$/g, '');
    if (keywords.length) {
      fallthroughStylePatterns.push(
          [PR_KEYWORD,
           new RegExp('^(?:' + keywords.replace(/\s+/g, '|') + ')\\b'), null]);
    }

    shortcutStylePatterns.push([PR_PLAIN,       /^\s+/, null, ' \r\n\t\xA0']);
    fallthroughStylePatterns.push(
        // TODO(mikesamuel): recognize non-latin letters and numerals in idents
        [PR_LITERAL,     /^@[a-z_$][a-z_$@0-9]*/i, null],
        [PR_TYPE,        /^@?[A-Z]+[a-z][A-Za-z_$@0-9]*/, null],
        [PR_PLAIN,       /^[a-z_$][a-z_$@0-9]*/i, null],
        [PR_LITERAL,
         new RegExp(
             '^(?:'
             // A hex number
             + '0x[a-f0-9]+'
             // or an octal or decimal number,
             + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
             // possibly in scientific notation
             + '(?:e[+\\-]?\\d+)?'
             + ')'
             // with an optional modifier like UL for unsigned long
             + '[a-z]*', 'i'),
         null, '0123456789'],
        [PR_PUNCTUATION, /^.[^\s\w\.$@\'\"\`\/\#]*/, null]);

    return createSimpleLexer(shortcutStylePatterns, fallthroughStylePatterns);
  }

  var decorateSource = sourceDecorator({
        'keywords': ALL_KEYWORDS,
        'hashComments': true,
        'cStyleComments': true,
        'multiLineStrings': true,
        'regexLiterals': true
      });

  /** Breaks {@code job.source} around style boundaries in
    * {@code job.decorations} while re-interleaving {@code job.extractedTags},
    * and leaves the result in {@code job.prettyPrintedHtml}.
    * @param {Object} job like {
    *    source: {string} source as plain text,
    *    extractedTags: {Array.<number|string>} extractedTags chunks of raw
    *                   html preceded by their position in {@code job.source}
    *                   in order
    *    decorations: {Array.<number|string} an array of style classes preceded
    *                 by the position at which they start in job.source in order
    * }
    * @private
    */
  function recombineTagsAndDecorations(job) {
    var sourceText = job.source;
    var extractedTags = job.extractedTags;
    var decorations = job.decorations;

    var html = [];
    // index past the last char in sourceText written to html
    var outputIdx = 0;

    var openDecoration = null;
    var currentDecoration = null;
    var tagPos = 0;  // index into extractedTags
    var decPos = 0;  // index into decorations
    var tabExpander = makeTabExpander(window['PR_TAB_WIDTH']);

    var adjacentSpaceRe = /([\r\n ]) /g;
    var startOrSpaceRe = /(^| ) /gm;
    var newlineRe = /\r\n?|\n/g;
    var trailingSpaceRe = /[ \r\n]$/;
    var lastWasSpace = true;  // the last text chunk emitted ended with a space.

    // A helper function that is responsible for opening sections of decoration
    // and outputing properly escaped chunks of source
    function emitTextUpTo(sourceIdx) {
      if (sourceIdx > outputIdx) {
        if (openDecoration && openDecoration !== currentDecoration) {
          // Close the current decoration
          html.push('</span>');
          openDecoration = null;
        }
        if (!openDecoration && currentDecoration) {
          openDecoration = currentDecoration;
          html.push('<span class="', openDecoration, '">');
        }
        // This interacts badly with some wikis which introduces paragraph tags
        // into pre blocks for some strange reason.
        // It's necessary for IE though which seems to lose the preformattedness
        // of <pre> tags when their innerHTML is assigned.
        // http://stud3.tuwien.ac.at/~e0226430/innerHtmlQuirk.html
        // and it serves to undo the conversion of <br>s to newlines done in
        // chunkify.
        var htmlChunk = textToHtml(
            tabExpander(sourceText.substring(outputIdx, sourceIdx)))
            .replace(lastWasSpace
                     ? startOrSpaceRe
                     : adjacentSpaceRe, '$1&nbsp;');
        // Keep track of whether we need to escape space at the beginning of the
        // next chunk.
        lastWasSpace = trailingSpaceRe.test(htmlChunk);
        // IE collapses multiple adjacient <br>s into 1 line break.
        // Prefix every <br> with '&nbsp;' can prevent such IE's behavior.
        var lineBreakHtml = window['_pr_isIE6']() ? '&nbsp;<br />' : '<br />';
        html.push(htmlChunk.replace(newlineRe, lineBreakHtml));
        outputIdx = sourceIdx;
      }
    }

    while (true) {
      // Determine if we're going to consume a tag this time around.  Otherwise
      // we consume a decoration or exit.
      var outputTag;
      if (tagPos < extractedTags.length) {
        if (decPos < decorations.length) {
          // Pick one giving preference to extractedTags since we shouldn't open
          // a new style that we're going to have to immediately close in order
          // to output a tag.
          outputTag = extractedTags[tagPos] <= decorations[decPos];
        } else {
          outputTag = true;
        }
      } else {
        outputTag = false;
      }
      // Consume either a decoration or a tag or exit.
      if (outputTag) {
        emitTextUpTo(extractedTags[tagPos]);
        if (openDecoration) {
          // Close the current decoration
          html.push('</span>');
          openDecoration = null;
        }
        html.push(extractedTags[tagPos + 1]);
        tagPos += 2;
      } else if (decPos < decorations.length) {
        emitTextUpTo(decorations[decPos]);
        currentDecoration = decorations[decPos + 1];
        decPos += 2;
      } else {
        break;
      }
    }
    emitTextUpTo(sourceText.length);
    if (openDecoration) {
      html.push('</span>');
    }
    job.prettyPrintedHtml = html.join('');
  }

  /** Maps language-specific file extensions to handlers. */
  var langHandlerRegistry = {};
  /** Register a language handler for the given file extensions.
    * @param {function (Object)} handler a function from source code to a list
    *      of decorations.  Takes a single argument job which describes the
    *      state of the computation.   The single parameter has the form
    *      {@code {
    *        source: {string} as plain text.
    *        decorations: {Array.<number|string>} an array of style classes
    *                     preceded by the position at which they start in
    *                     job.source in order.
    *                     The language handler should assigned this field.
    *        basePos: {int} the position of source in the larger source chunk.
    *                 All positions in the output decorations array are relative
    *                 to the larger source chunk.
    *      } }
    * @param {Array.<string>} fileExtensions
    */
  function registerLangHandler(handler, fileExtensions) {
    for (var i = fileExtensions.length; --i >= 0;) {
      var ext = fileExtensions[i];
      if (!langHandlerRegistry.hasOwnProperty(ext)) {
        langHandlerRegistry[ext] = handler;
      } else if ('console' in window) {
        console.warn('cannot override language handler %s', ext);
      }
    }
  }
  function langHandlerForExtension(extension, source) {
    if (!(extension && langHandlerRegistry.hasOwnProperty(extension))) {
      // Treat it as markup if the first non whitespace character is a < and
      // the last non-whitespace character is a >.
      extension = /^\s*</.test(source)
          ? 'default-markup'
          : 'default-code';
    }
    return langHandlerRegistry[extension];
  }
  registerLangHandler(decorateSource, ['default-code']);
  registerLangHandler(
      createSimpleLexer(
          [],
          [
           [PR_PLAIN,       /^[^<?]+/],
           [PR_DECLARATION, /^<!\w[^>]*(?:>|$)/],
           [PR_COMMENT,     /^<\!--[\s\S]*?(?:-\->|$)/],
           // Unescaped content in an unknown language
           ['lang-',        /^<\?([\s\S]+?)(?:\?>|$)/],
           ['lang-',        /^<%([\s\S]+?)(?:%>|$)/],
           [PR_PUNCTUATION, /^(?:<[%?]|[%?]>)/],
           ['lang-',        /^<xmp\b[^>]*>([\s\S]+?)<\/xmp\b[^>]*>/i],
           // Unescaped content in javascript.  (Or possibly vbscript).
           ['lang-js',      /^<script\b[^>]*>([\s\S]*?)(<\/script\b[^>]*>)/i],
           // Contains unescaped stylesheet content
           ['lang-css',     /^<style\b[^>]*>([\s\S]*?)(<\/style\b[^>]*>)/i],
           ['lang-in.tag',  /^(<\/?[a-z][^<>]*>)/i]
          ]),
      ['default-markup', 'htm', 'html', 'mxml', 'xhtml', 'xml', 'xsl']);
  registerLangHandler(
      createSimpleLexer(
          [
           [PR_PLAIN,        /^[\s]+/, null, ' \t\r\n'],
           [PR_ATTRIB_VALUE, /^(?:\"[^\"]*\"?|\'[^\']*\'?)/, null, '\"\'']
           ],
          [
           [PR_TAG,          /^^<\/?[a-z](?:[\w.:-]*\w)?|\/?>$/i],
           [PR_ATTRIB_NAME,  /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i],
           ['lang-uq.val',   /^=\s*([^>\'\"\s]*(?:[^>\'\"\s\/]|\/(?=\s)))/],
           [PR_PUNCTUATION,  /^[=<>\/]+/],
           ['lang-js',       /^on\w+\s*=\s*\"([^\"]+)\"/i],
           ['lang-js',       /^on\w+\s*=\s*\'([^\']+)\'/i],
           ['lang-js',       /^on\w+\s*=\s*([^\"\'>\s]+)/i],
           ['lang-css',      /^style\s*=\s*\"([^\"]+)\"/i],
           ['lang-css',      /^style\s*=\s*\'([^\']+)\'/i],
           ['lang-css',      /^style\s*=\s*([^\"\'>\s]+)/i]
           ]),
      ['in.tag']);
  registerLangHandler(
      createSimpleLexer([], [[PR_ATTRIB_VALUE, /^[\s\S]+/]]), ['uq.val']);
  registerLangHandler(sourceDecorator({
          'keywords': CPP_KEYWORDS,
          'hashComments': true,
          'cStyleComments': true
        }), ['c', 'cc', 'cpp', 'cxx', 'cyc', 'm']);
  registerLangHandler(sourceDecorator({
          'keywords': 'null true false'
        }), ['json']);
  registerLangHandler(sourceDecorator({
          'keywords': CSHARP_KEYWORDS,
          'hashComments': true,
          'cStyleComments': true,
          'verbatimStrings': true
        }), ['cs']);
  registerLangHandler(sourceDecorator({
          'keywords': JAVA_KEYWORDS,
          'cStyleComments': true
        }), ['java']);
  registerLangHandler(sourceDecorator({
          'keywords': SH_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true
        }), ['bsh', 'csh', 'sh']);
  registerLangHandler(sourceDecorator({
          'keywords': PYTHON_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'tripleQuotedStrings': true
        }), ['cv', 'py']);
  registerLangHandler(sourceDecorator({
          'keywords': PERL_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'regexLiterals': true
        }), ['perl', 'pl', 'pm']);
  registerLangHandler(sourceDecorator({
          'keywords': RUBY_KEYWORDS,
          'hashComments': true,
          'multiLineStrings': true,
          'regexLiterals': true
        }), ['rb']);
  registerLangHandler(sourceDecorator({
          'keywords': JSCRIPT_KEYWORDS,
          'cStyleComments': true,
          'regexLiterals': true
        }), ['js']);
  registerLangHandler(
      createSimpleLexer([], [[PR_STRING, /^[\s\S]+/]]), ['regex']);

  function applyDecorator(job) {
    var sourceCodeHtml = job.sourceCodeHtml;
    var opt_langExtension = job.langExtension;

    // Prepopulate output in case processing fails with an exception.
    job.prettyPrintedHtml = sourceCodeHtml;

    try {
      // Extract tags, and convert the source code to plain text.
      var sourceAndExtractedTags = extractTags(sourceCodeHtml);
      /** Plain text. @type {string} */
      var source = sourceAndExtractedTags.source;
      job.source = source;
      job.basePos = 0;

      /** Even entries are positions in source in ascending order.  Odd entries
        * are tags that were extracted at that position.
        * @type {Array.<number|string>}
        */
      job.extractedTags = sourceAndExtractedTags.tags;

      // Apply the appropriate language handler
      langHandlerForExtension(opt_langExtension, source)(job);
      // Integrate the decorations and tags back into the source code to produce
      // a decorated html string which is left in job.prettyPrintedHtml.
      recombineTagsAndDecorations(job);
    } catch (e) {
      if ('console' in window) {
        console.log(e);
        console.trace();
      }
    }
  }

  function prettyPrintOne(sourceCodeHtml, opt_langExtension) {
    var job = {
      sourceCodeHtml: sourceCodeHtml,
      langExtension: opt_langExtension
    };
    applyDecorator(job);
    return job.prettyPrintedHtml;
  }

  function prettyPrint(opt_whenDone) {
    var isIE678 = window['_pr_isIE6']();
    var ieNewline = isIE678 === 6 ? '\r\n' : '\r';
    // See bug 71 and http://stackoverflow.com/questions/136443/why-doesnt-ie7-

    // fetch a list of nodes to rewrite
    var codeSegments = [
        document.getElementsByTagName('pre'),
        document.getElementsByTagName('code'),
        document.getElementsByTagName('xmp') ];
    var elements = [];
    for (var i = 0; i < codeSegments.length; ++i) {
      for (var j = 0, n = codeSegments[i].length; j < n; ++j) {
        elements.push(codeSegments[i][j]);
      }
    }
    codeSegments = null;

    var clock = Date;
    if (!clock['now']) {
      clock = { 'now': function () { return (new Date).getTime(); } };
    }

    // The loop is broken into a series of continuations to make sure that we
    // don't make the browser unresponsive when rewriting a large page.
    var k = 0;
    var prettyPrintingJob;

    function doWork() {
      var endTime = (window['PR_SHOULD_USE_CONTINUATION'] ?
                     clock.now() + 250 /* ms */ :
                     Infinity);
      for (; k < elements.length && clock.now() < endTime; k++) {
        var cs = elements[k];
        if (cs.className && cs.className.indexOf('prettyprint') >= 0) {
          // If the classes includes a language extensions, use it.
          // Language extensions can be specified like
          //     <pre class="prettyprint lang-cpp">
          // the language extension "cpp" is used to find a language handler as
          // passed to PR_registerLangHandler.
          var langExtension = cs.className.match(/\blang-(\w+)\b/);
          if (langExtension) { langExtension = langExtension[1]; }

          // make sure this is not nested in an already prettified element
          var nested = false;
          for (var p = cs.parentNode; p; p = p.parentNode) {
            if ((p.tagName === 'pre' || p.tagName === 'code' ||
                 p.tagName === 'xmp') &&
                p.className && p.className.indexOf('prettyprint') >= 0) {
              nested = true;
              break;
            }
          }
          if (!nested) {
            // fetch the content as a snippet of properly escaped HTML.
            // Firefox adds newlines at the end.
            var content = getInnerHtml(cs);
            content = content.replace(/(?:\r\n?|\n)$/, '');

            // do the pretty printing
            prettyPrintingJob = {
              sourceCodeHtml: content,
              langExtension: langExtension,
              sourceNode: cs
            };
            applyDecorator(prettyPrintingJob);
            replaceWithPrettyPrintedHtml();
          }
        }
      }
      if (k < elements.length) {
        // finish up in a continuation
        setTimeout(doWork, 250);
      } else if (opt_whenDone) {
        opt_whenDone();
      }
    }

    function replaceWithPrettyPrintedHtml() {
      var newContent = prettyPrintingJob.prettyPrintedHtml;
      if (!newContent) { return; }
      var cs = prettyPrintingJob.sourceNode;

      // push the prettified html back into the tag.
      if (!isRawContent(cs)) {
        // just replace the old html with the new
        cs.innerHTML = newContent;
      } else {
        // we need to change the tag to a <pre> since <xmp>s do not allow
        // embedded tags such as the span tags used to attach styles to
        // sections of source code.
        var pre = document.createElement('PRE');
        for (var i = 0; i < cs.attributes.length; ++i) {
          var a = cs.attributes[i];
          if (a.specified) {
            var aname = a.name.toLowerCase();
            if (aname === 'class') {
              pre.className = a.value;  // For IE 6
            } else {
              pre.setAttribute(a.name, a.value);
            }
          }
        }
        pre.innerHTML = newContent;

        // remove the old
        cs.parentNode.replaceChild(pre, cs);
        cs = pre;
      }

      // Replace <br>s with line-feeds so that copying and pasting works
      // on IE 6.
      // Doing this on other browsers breaks lots of stuff since \r\n is
      // treated as two newlines on Firefox, and doing this also slows
      // down rendering.
      if (isIE678 && cs.tagName === 'PRE') {
        var lineBreaks = cs.getElementsByTagName('br');
        for (var j = lineBreaks.length; --j >= 0;) {
          var lineBreak = lineBreaks[j];
          lineBreak.parentNode.replaceChild(
              document.createTextNode(ieNewline), lineBreak);
        }
      }
    }

    doWork();
  }

  window['PR_normalizedHtml'] = normalizedHtml;
  window['prettyPrintOne'] = prettyPrintOne;
  window['prettyPrint'] = prettyPrint;
  window['PR'] = {
        'combinePrefixPatterns': combinePrefixPatterns,
        'createSimpleLexer': createSimpleLexer,
        'registerLangHandler': registerLangHandler,
        'sourceDecorator': sourceDecorator,
        'PR_ATTRIB_NAME': PR_ATTRIB_NAME,
        'PR_ATTRIB_VALUE': PR_ATTRIB_VALUE,
        'PR_COMMENT': PR_COMMENT,
        'PR_DECLARATION': PR_DECLARATION,
        'PR_KEYWORD': PR_KEYWORD,
        'PR_LITERAL': PR_LITERAL,
        'PR_NOCODE': PR_NOCODE,
        'PR_PLAIN': PR_PLAIN,
        'PR_PUNCTUATION': PR_PUNCTUATION,
        'PR_SOURCE': PR_SOURCE,
        'PR_STRING': PR_STRING,
        'PR_TAG': PR_TAG,
        'PR_TYPE': PR_TYPE
      };
})();

/*
   A A L        Source code at:
   T C A   <http://www.attacklab.net/>
   T K B
*/

var Showdown={};
Showdown.converter=function(){
var _1;
var _2;
var _3;
var _4=0;
this.makeHtml=function(_5){
_1=new Array();
_2=new Array();
_3=new Array();
_5=_5.replace(/~/g,"~T");
_5=_5.replace(/\$/g,"~D");
_5=_5.replace(/\r\n/g,"\n");
_5=_5.replace(/\r/g,"\n");
_5="\n\n"+_5+"\n\n";
_5=_6(_5);
_5=_5.replace(/^[ \t]+$/mg,"");
_5=_7(_5);
_5=_8(_5);
_5=_9(_5);
_5=_a(_5);
_5=_5.replace(/~D/g,"$$");
_5=_5.replace(/~T/g,"~");
return _5;
};
var _8=function(_b){
var _b=_b.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm,function(_c,m1,m2,m3,m4){
m1=m1.toLowerCase();
_1[m1]=_11(m2);
if(m3){
return m3+m4;
}else{
if(m4){
_2[m1]=m4.replace(/"/g,"&quot;");
}
}
return "";
});
return _b;
};
var _7=function(_12){
_12=_12.replace(/\n/g,"\n\n");
var _13="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del";
var _14="p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";
_12=_12.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,_15);
_12=_12.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,_15);
_12=_12.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,_15);
_12=_12.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,_15);
_12=_12.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,_15);
_12=_12.replace(/\n\n/g,"\n");
return _12;
};
var _15=function(_16,m1){
var _18=m1;
_18=_18.replace(/\n\n/g,"\n");
_18=_18.replace(/^\n/,"");
_18=_18.replace(/\n+$/g,"");
_18="\n\n~K"+(_3.push(_18)-1)+"K\n\n";
return _18;
};
var _9=function(_19){
_19=_1a(_19);
var key=_1c("<hr />");
_19=_19.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key);
_19=_19.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key);
_19=_19.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key);
_19=_1d(_19);
_19=_1e(_19);
_19=_1f(_19);
_19=_7(_19);
_19=_20(_19);
return _19;
};
var _21=function(_22){
_22=_23(_22);
_22=_24(_22);
_22=_25(_22);
_22=_26(_22);
_22=_27(_22);
_22=_28(_22);
_22=_11(_22);
_22=_29(_22);
_22=_22.replace(/  +\n/g," <br />\n");
return _22;
};
var _24=function(_2a){
var _2b=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;
_2a=_2a.replace(_2b,function(_2c){
var tag=_2c.replace(/(.)<\/?code>(?=.)/g,"$1`");
tag=_2e(tag,"\\`*_");
return tag;
});
return _2a;
};
var _27=function(_2f){
_2f=_2f.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,_30);
_2f=_2f.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,_30);
_2f=_2f.replace(/(\[([^\[\]]+)\])()()()()()/g,_30);
return _2f;
};
var _30=function(_31,m1,m2,m3,m4,m5,m6,m7){
if(m7==undefined){
m7="";
}
var _39=m1;
var _3a=m2;
var _3b=m3.toLowerCase();
var url=m4;
var _3d=m7;
if(url==""){
if(_3b==""){
_3b=_3a.toLowerCase().replace(/ ?\n/g," ");
}
url="#"+_3b;
if(_1[_3b]!=undefined){
url=_1[_3b];
if(_2[_3b]!=undefined){
_3d=_2[_3b];
}
}else{
if(_39.search(/\(\s*\)$/m)>-1){
url="";
}else{
return _39;
}
}
}
url=_2e(url,"*_");
var _3e="<a href=\""+url+"\"";
if(_3d!=""){
_3d=_3d.replace(/"/g,"&quot;");
_3d=_2e(_3d,"*_");
_3e+=" title=\""+_3d+"\"";
}
_3e+=">"+_3a+"</a>";
return _3e;
};
var _26=function(_3f){
_3f=_3f.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,_40);
_3f=_3f.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,_40);
return _3f;
};
var _40=function(_41,m1,m2,m3,m4,m5,m6,m7){
var _49=m1;
var _4a=m2;
var _4b=m3.toLowerCase();
var url=m4;
var _4d=m7;
if(!_4d){
_4d="";
}
if(url==""){
if(_4b==""){
_4b=_4a.toLowerCase().replace(/ ?\n/g," ");
}
url="#"+_4b;
if(_1[_4b]!=undefined){
url=_1[_4b];
if(_2[_4b]!=undefined){
_4d=_2[_4b];
}
}else{
return _49;
}
}
_4a=_4a.replace(/"/g,"&quot;");
url=_2e(url,"*_");
var _4e="<img src=\""+url+"\" alt=\""+_4a+"\"";
_4d=_4d.replace(/"/g,"&quot;");
_4d=_2e(_4d,"*_");
_4e+=" title=\""+_4d+"\"";
_4e+=" />";
return _4e;
};
var _1a=function(_4f){
_4f=_4f.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,function(_50,m1){
return _1c("<h1>"+_21(m1)+"</h1>");
});
_4f=_4f.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(_52,m1){
return _1c("<h2>"+_21(m1)+"</h2>");
});
_4f=_4f.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(_54,m1,m2){
var _57=m1.length;
return _1c("<h"+_57+">"+_21(m2)+"</h"+_57+">");
});
return _4f;
};
var _58;
var _1d=function(_59){
_59+="~0";
var _5a=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
if(_4){
_59=_59.replace(_5a,function(_5b,m1,m2){
var _5e=m1;
var _5f=(m2.search(/[*+-]/g)>-1)?"ul":"ol";
_5e=_5e.replace(/\n{2,}/g,"\n\n\n");
var _60=_58(_5e);
_60=_60.replace(/\s+$/,"");
_60="<"+_5f+">"+_60+"</"+_5f+">\n";
return _60;
});
}else{
_5a=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g;
_59=_59.replace(_5a,function(_61,m1,m2,m3){
var _65=m1;
var _66=m2;
var _67=(m3.search(/[*+-]/g)>-1)?"ul":"ol";
var _66=_66.replace(/\n{2,}/g,"\n\n\n");
var _68=_58(_66);
_68=_65+"<"+_67+">\n"+_68+"</"+_67+">\n";
return _68;
});
}
_59=_59.replace(/~0/,"");
return _59;
};
_58=function(_69){
_4++;
_69=_69.replace(/\n{2,}$/,"\n");
_69+="~0";
_69=_69.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,function(_6a,m1,m2,m3,m4){
var _6f=m4;
var _70=m1;
var _71=m2;
if(_70||(_6f.search(/\n{2,}/)>-1)){
_6f=_9(_72(_6f));
}else{
_6f=_1d(_72(_6f));
_6f=_6f.replace(/\n$/,"");
_6f=_21(_6f);
}
return "<li>"+_6f+"</li>\n";
});
_69=_69.replace(/~0/g,"");
_4--;
return _69;
};
var _1e=function(_73){
_73+="~0";
_73=_73.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,function(_74,m1,m2){
var _77=m1;
var _78=m2;
_77=_79(_72(_77));
_77=_6(_77);
_77=_77.replace(/^\n+/g,"");
_77=_77.replace(/\n+$/g,"");
_77="<pre><code>"+_77+"\n</code></pre>";
return _1c(_77)+_78;
});
_73=_73.replace(/~0/,"");
return _73;
};
var _1c=function(_7a){
_7a=_7a.replace(/(^\n+|\n+$)/g,"");
return "\n\n~K"+(_3.push(_7a)-1)+"K\n\n";
};
var _23=function(_7b){
_7b=_7b.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(_7c,m1,m2,m3,m4){
var c=m3;
c=c.replace(/^([ \t]*)/g,"");
c=c.replace(/[ \t]*$/g,"");
c=_79(c);
return m1+"<code>"+c+"</code>";
});
return _7b;
};
var _79=function(_82){
_82=_82.replace(/&/g,"&amp;");
_82=_82.replace(/</g,"&lt;");
_82=_82.replace(/>/g,"&gt;");
_82=_2e(_82,"*_{}[]\\",false);
return _82;
};
var _29=function(_83){
_83=_83.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,"<strong>$2</strong>");
_83=_83.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,"<em>$2</em>");
return _83;
};
var _1f=function(_84){
_84=_84.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(_85,m1){
var bq=m1;
bq=bq.replace(/^[ \t]*>[ \t]?/gm,"~0");
bq=bq.replace(/~0/g,"");
bq=bq.replace(/^[ \t]+$/gm,"");
bq=_9(bq);
bq=bq.replace(/(^|\n)/g,"$1  ");
bq=bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(_88,m1){
var pre=m1;
pre=pre.replace(/^  /mg,"~0");
pre=pre.replace(/~0/g,"");
return pre;
});
return _1c("<blockquote>\n"+bq+"\n</blockquote>");
});
return _84;
};
var _20=function(_8b){
_8b=_8b.replace(/^\n+/g,"");
_8b=_8b.replace(/\n+$/g,"");
var _8c=_8b.split(/\n{2,}/g);
var _8d=new Array();
var end=_8c.length;
for(var i=0;i<end;i++){
var str=_8c[i];
if(str.search(/~K(\d+)K/g)>=0){
_8d.push(str);
}else{
if(str.search(/\S/)>=0){
str=_21(str);
str=str.replace(/^([ \t]*)/g,"<p>");
str+="</p>";
_8d.push(str);
}
}
}
end=_8d.length;
for(var i=0;i<end;i++){
while(_8d[i].search(/~K(\d+)K/)>=0){
var _91=_3[RegExp.$1];
_91=_91.replace(/\$/g,"$$$$");
_8d[i]=_8d[i].replace(/~K\d+K/,_91);
}
}
return _8d.join("\n\n");
};
var _11=function(_92){
_92=_92.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;");
_92=_92.replace(/<(?![a-z\/?\$!])/gi,"&lt;");
return _92;
};
var _25=function(_93){
_93=_93.replace(/\\(\\)/g,_94);
_93=_93.replace(/\\([`*_{}\[\]()>#+-.!])/g,_94);
return _93;
};
var _28=function(_95){
_95=_95.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,"<a href=\"$1\">$1</a>");
_95=_95.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,function(_96,m1){
return _98(_a(m1));
});
return _95;
};
var _98=function(_99){
function char2hex(ch){
var _9b="0123456789ABCDEF";
var dec=ch.charCodeAt(0);
return (_9b.charAt(dec>>4)+_9b.charAt(dec&15));
}
var _9d=[function(ch){
return "&#"+ch.charCodeAt(0)+";";
},function(ch){
return "&#x"+char2hex(ch)+";";
},function(ch){
return ch;
}];
_99="mailto:"+_99;
_99=_99.replace(/./g,function(ch){
if(ch=="@"){
ch=_9d[Math.floor(Math.random()*2)](ch);
}else{
if(ch!=":"){
var r=Math.random();
ch=(r>0.9?_9d[2](ch):r>0.45?_9d[1](ch):_9d[0](ch));
}
}
return ch;
});
_99="<a href=\""+_99+"\">"+_99+"</a>";
_99=_99.replace(/">.+:/g,"\">");
return _99;
};
var _a=function(_a3){
_a3=_a3.replace(/~E(\d+)E/g,function(_a4,m1){
var _a6=parseInt(m1);
return String.fromCharCode(_a6);
});
return _a3;
};
var _72=function(_a7){
_a7=_a7.replace(/^(\t|[ ]{1,4})/gm,"~0");
_a7=_a7.replace(/~0/g,"");
return _a7;
};
var _6=function(_a8){
_a8=_a8.replace(/\t(?=\t)/g,"    ");
_a8=_a8.replace(/\t/g,"~A~B");
_a8=_a8.replace(/~B(.+?)~A/g,function(_a9,m1,m2){
var _ac=m1;
var _ad=4-_ac.length%4;
for(var i=0;i<_ad;i++){
_ac+=" ";
}
return _ac;
});
_a8=_a8.replace(/~A/g,"    ");
_a8=_a8.replace(/~B/g,"");
return _a8;
};
var _2e=function(_af,_b0,_b1){
var _b2="(["+_b0.replace(/([\[\]\\])/g,"\\$1")+"])";
if(_b1){
_b2="\\\\"+_b2;
}
var _b3=new RegExp(_b2,"g");
_af=_af.replace(_b3,_94);
return _af;
};
var _94=function(_b4,m1){
var _b6=m1.charCodeAt(0);
return "~E"+_b6+"E";
};
};


// name: sammy
// version: 0.5.1

(function($) {

  var Sammy,
      PATH_REPLACER = "([^\/]+)",
      PATH_NAME_MATCHER = /:([\w\d]+)/g,
      QUERY_STRING_MATCHER = /\?([^#]*)$/,
      _decode = decodeURIComponent,
      _routeWrapper = function(verb) {
        return function(path, callback) { return this.route.apply(this, [verb, path, callback]); };
      },
      loggers = [];


  // <tt>Sammy</tt> (also aliased as $.sammy) is not only the namespace for a
  // number of prototypes, its also a top level method that allows for easy
  // creation/management of <tt>Sammy.Application</tt> instances. There are a
  // number of different forms for <tt>Sammy()</tt> but each returns an instance
  // of <tt>Sammy.Application</tt>. When a new instance is created using
  // <tt>Sammy</tt> it is added to an Object called <tt>Sammy.apps</tt>. This
  // provides for an easy way to get at existing Sammy applications. Only one
  // instance is allowed per <tt>element_selector</tt> so when calling
  // <tt>Sammy('selector')</tt> multiple times, the first time will create
  // the application and the following times will extend the application
  // already added to that selector.
  //
  // === Example
  //
  //      // returns the app at #main or a new app
  //      Sammy('#main')
  //
  //      // equivilent to "new Sammy.Application", except appends to apps
  //      Sammy();
  //      Sammy(function() { ... });
  //
  //      // extends the app at '#main' with function.
  //      Sammy('#main', function() { ... });
  //
  Sammy = function() {
    var args = $.makeArray(arguments),
        app, selector;
    Sammy.apps = Sammy.apps || {};
    if (args.length === 0 || args[0] && $.isFunction(args[0])) { // Sammy()
      return Sammy.apply(Sammy, ['body'].concat(args));
    } else if (typeof (selector = args.shift()) == 'string') { // Sammy('#main')
      app = Sammy.apps[selector] || new Sammy.Application();
      app.element_selector = selector;
      if (args.length > 0) {
        $.each(args, function(i, plugin) {
          app.use(plugin);
        });
      }
      // if the selector changes make sure the refrence in Sammy.apps changes
      if (app.element_selector != selector) {
        delete Sammy.apps[selector];
      }
      Sammy.apps[app.element_selector] = app;
      return app;
    }
  };

  Sammy.VERSION = '0.5.1';

  // Add to the global logger pool. Takes a function that accepts an
  // unknown number of arguments and should print them or send them somewhere
  // The first argument is always a timestamp.
  Sammy.addLogger = function(logger) {
    loggers.push(logger);
  };

  // Sends a log message to each logger listed in the global
  // loggers pool. Can take any number of arguments.
  // Also prefixes the arguments with a timestamp.
  Sammy.log = function()  {
    var args = $.makeArray(arguments);
    args.unshift("[" + Date() + "]");
    $.each(loggers, function(i, logger) {
      logger.apply(Sammy, args);
    });
  };

  if (typeof window.console != 'undefined') {
    if ($.isFunction(console.log.apply)) {
      Sammy.addLogger(function() {
        window.console.log.apply(console, arguments);
      });
    } else {
      Sammy.addLogger(function() {
        window.console.log(arguments);
      });
    }
  } else if (typeof console != 'undefined') {
    Sammy.addLogger(function() {
      console.log.apply(console, arguments);
    });
  }

  // Sammy.Object is the base for all other Sammy classes. It provides some useful
  // functionality, including cloning, iterating, etc.
  Sammy.Object = function(obj) { // constructor
    return $.extend(this, obj || {});
  };

  $.extend(Sammy.Object.prototype, {

    // Returns a copy of the object with Functions removed.
    toHash: function() {
      var json = {};
      $.each(this, function(k,v) {
        if (!$.isFunction(v)) {
          json[k] = v;
        }
      });
      return json;
    },

    // Renders a simple HTML version of this Objects attributes.
    // Does not render functions.
    // For example. Given this Sammy.Object:
    //
    //    var s = new Sammy.Object({first_name: 'Sammy', last_name: 'Davis Jr.'});
    //    s.toHTML() //=> '<strong>first_name</strong> Sammy<br /><strong>last_name</strong> Davis Jr.<br />'
    //
    toHTML: function() {
      var display = "";
      $.each(this, function(k, v) {
        if (!$.isFunction(v)) {
          display += "<strong>" + k + "</strong> " + v + "<br />";
        }
      });
      return display;
    },

    // Generates a unique identifing string. Used for application namespaceing.
    uuid: function() {
      if (typeof this._uuid == 'undefined' || !this._uuid) {
        this._uuid = (new Date()).getTime() + '-' + parseInt(Math.random() * 1000, 10);
      }
      return this._uuid;
    },

    // Returns an array of keys for this object. If <tt>attributes_only</tt>
    // is true will not return keys that map to a <tt>function()</tt>
    keys: function(attributes_only) {
      var keys = [];
      for (var property in this) {
        if (!$.isFunction(this[property]) || !attributes_only) {
          keys.push(property);
        }
      }
      return keys;
    },

    // Checks if the object has a value at <tt>key</tt> and that the value is not empty
    has: function(key) {
      return this[key] && $.trim(this[key].toString()) != '';
    },

    // convenience method to join as many arguments as you want
    // by the first argument - useful for making paths
    join: function() {
      var args = $.makeArray(arguments);
      var delimiter = args.shift();
      return args.join(delimiter);
    },

    // Shortcut to Sammy.log
    log: function() {
      Sammy.log.apply(Sammy, arguments);
    },

    // Returns a string representation of this object.
    // if <tt>include_functions</tt> is true, it will also toString() the
    // methods of this object. By default only prints the attributes.
    toString: function(include_functions) {
      var s = [];
      $.each(this, function(k, v) {
        if (!$.isFunction(v) || include_functions) {
          s.push('"' + k + '": ' + v.toString());
        }
      });
      return "Sammy.Object: {" + s.join(',') + "}";
    }
  });

  // The HashLocationProxy is the default location proxy for all Sammy applications.
  // A location proxy is a prototype that conforms to a simple interface. The purpose
  // of a location proxy is to notify the Sammy.Application its bound to when the location
  // or 'external state' changes. The HashLocationProxy considers the state to be
  // changed when the 'hash' (window.location.hash / '#') changes. It does this in two
  // different ways depending on what browser you are using. The newest browsers
  // (IE, Safari > 4, FF >= 3.6) support a 'onhashchange' DOM event, thats fired whenever
  // the location.hash changes. In this situation the HashLocationProxy just binds
  // to this event and delegates it to the application. In the case of older browsers
  // a poller is set up to track changes to the hash. Unlike Sammy 0.3 or earlier,
  // the HashLocationProxy allows the poller to be a global object, eliminating the
  // need for multiple pollers even when thier are multiple apps on the page.
  Sammy.HashLocationProxy = function(app, run_interval_every) {
    this.app = app;

    // check for native hash support
    if ('onhashchange' in window) {
      Sammy.log('native hash change exists, using');
      this.is_native = true;
    } else {
      Sammy.log('no native hash change, falling back to polling');
      this.is_native = false;
      this._startPolling(run_interval_every);
    }
  };

  Sammy.HashLocationProxy.prototype = {
    // bind the proxy events to the current app.
    bind: function() {
      var app = this.app;
      $(window).bind('hashchange.' + this.app.eventNamespace(), function() {
        app.trigger('location-changed');
      });
    },
    // unbind the proxy events from the current app
    unbind: function() {
      $(window).die('hashchange.' + this.app.eventNamespace());
    },
    // get the current location from the hash.
    getLocation: function() {
     // Bypass the `window.location.hash` attribute.  If a question mark
      // appears in the hash IE6 will strip it and all of the following
      // characters from `window.location.hash`.
      var matches = window.location.toString().match(/^[^#]*(#.+)$/);
      return matches ? matches[1] : '';
    },
    // set the current location to <tt>new_location</tt>
    setLocation: function(new_location) {
      return (window.location = new_location);
    },

    _startPolling: function(every) {
      // set up interval
      var proxy = this;
      if (!Sammy.HashLocationProxy._interval) {
        if (!every) { every = 10; }
        var hashCheck = function() {
          current_location = proxy.getLocation();
          // Sammy.log('getLocation', current_location);
          if (!Sammy.HashLocationProxy._last_location ||
            current_location != Sammy.HashLocationProxy._last_location) {
            setTimeout(function() {
              $(window).trigger('hashchange');
            }, 1);
          }
          Sammy.HashLocationProxy._last_location = current_location;
        };
        hashCheck();
        Sammy.HashLocationProxy._interval = setInterval(hashCheck, every);
        $(window).bind('beforeunload', function() {
          clearInterval(Sammy.HashLocationProxy._interval);
        });
      }
    }
  };

  // The DataLocationProxy is an optional location proxy prototype. As opposed to
  // the <tt>HashLocationProxy</tt> it gets its location from a jQuery.data attribute
  // tied to the application's element. You can set the name of the attribute by
  // passing a string as the second argument to the constructor. The default attribute
  // name is 'sammy-location'. To read more about location proxies, check out the
  // documentation for <tt>Sammy.HashLocationProxy</tt>
  Sammy.DataLocationProxy = function(app, data_name) {
    this.app = app;
    this.data_name = data_name || 'sammy-location';
  };

  Sammy.DataLocationProxy.prototype = {
    bind: function() {
      var proxy = this;
      this.app.$element().bind('setData', function(e, key) {
        if (key == proxy.data_name) {
          proxy.app.trigger('location-changed');
        }
      });
    },

    unbind: function() {
      this.app.$element().die('setData');
    },

    getLocation: function() {
      return this.app.$element().data(this.data_name);
    },

    setLocation: function(new_location) {
      return this.app.$element().data(this.data_name, new_location);
    }
  };

  // Sammy.Application is the Base prototype for defining 'applications'.
  // An 'application' is a collection of 'routes' and bound events that is
  // attached to an element when <tt>run()</tt> is called.
  // The only argument an 'app_function' is evaluated within the context of the application.
  Sammy.Application = function(app_function) {
    var app = this;
    this.routes            = {};
    this.listeners         = new Sammy.Object({});
    this.arounds           = [];
    this.befores           = [];
    this.namespace         = this.uuid();
    this.context_prototype = function() { Sammy.EventContext.apply(this, arguments); };
    this.context_prototype.prototype = new Sammy.EventContext();

    if ($.isFunction(app_function)) {
      app_function.apply(this, [this]);
    }
    // set the location proxy if not defined to the default (HashLocationProxy)
    if (!this.location_proxy) {
      this.location_proxy = new Sammy.HashLocationProxy(app, this.run_interval_every);
    }
    if (this.debug) {
      this.bindToAllEvents(function(e, data) {
        app.log(app.toString(), e.cleaned_type, data || {});
      });
    }
  };

  Sammy.Application.prototype = $.extend({}, Sammy.Object.prototype, {

    // the four route verbs
    ROUTE_VERBS: ['get','post','put','delete'],

    // An array of the default events triggered by the
    // application during its lifecycle
    APP_EVENTS: ['run','unload','lookup-route','run-route','route-found','event-context-before','event-context-after','changed','error','check-form-submission','redirect'],

    _last_route: null,
    _running: false,

    // Defines what element the application is bound to. Provide a selector
    // (parseable by <tt>jQuery()</tt>) and this will be used by <tt>$element()</tt>
    element_selector: 'body',

    // When set to true, logs all of the default events using <tt>log()</tt>
    debug: false,

    // When set to true, and the error() handler is not overriden, will actually
    // raise JS errors in routes (500) and when routes can't be found (404)
    raise_errors: false,

    // The time in milliseconds that the URL is queried for changes
    run_interval_every: 50,

    // The location proxy for the current app. By default this is set to a new
    // <tt>Sammy.HashLocationProxy</tt> on initialization. However, you can set
    // the location_proxy inside you're app function to give youre app a custom
    // location mechanism
    location_proxy: null,

    // The default template engine to use when using <tt>partial()</tt> in an
    // <tt>EventContext</tt>. <tt>template_engine</tt> can either be a string that
    // corresponds to the name of a method/helper on EventContext or it can be a function
    // that takes two arguments, the content of the unrendered partial and an optional
    // JS object that contains interpolation data. Template engine is only called/refered
    // to if the extension of the partial is null or unknown. See <tt>partial()</tt>
    // for more information
    template_engine: null,

    // //=> Sammy.Application: body
    toString: function() {
      return 'Sammy.Application:' + this.element_selector;
    },

    // returns a jQuery object of the Applications bound element.
    $element: function() {
      return $(this.element_selector);
    },

    // <tt>use()</tt> is the entry point for including Sammy plugins.
    // The first argument to use should be a function() that is evaluated
    // in the context of the current application, just like the <tt>app_function</tt>
    // argument to the <tt>Sammy.Application</tt> constructor.
    //
    // Any additional arguments are passed to the app function sequentially.
    //
    // For much more detail about plugins, check out:
    // http://code.quirkey.com/sammy/doc/plugins.html
    //
    // === Example
    //
    //      var MyPlugin = function(app, prepend) {
    //
    //        this.helpers({
    //          myhelper: function(text) {
    //            alert(prepend + " " + text);
    //          }
    //        });
    //
    //      };
    //
    //      var app = $.sammy(function() {
    //
    //        this.use(MyPlugin, 'This is my plugin');
    //
    //        this.get('#/', function() {
    //          this.myhelper('and dont you forget it!');
    //          //=> Alerts: This is my plugin and dont you forget it!
    //        });
    //
    //      });
    //
    use: function() {
      // flatten the arguments
      var args = $.makeArray(arguments);
      var plugin = args.shift();
      try {
        args.unshift(this);
        plugin.apply(this, args);
      } catch(e) {
        if (typeof plugin == 'undefined') {
          this.error("Plugin Error: called use() but plugin is not defined", e);
        } else if (!$.isFunction(plugin)) {
          this.error("Plugin Error: called use() but '" + plugin.toString() + "' is not a function", e);
        } else {
          this.error("Plugin Error", e);
        }
      }
      return this;
    },

    // <tt>route()</tt> is the main method for defining routes within an application.
    // For great detail on routes, check out: http://code.quirkey.com/sammy/doc/routes.html
    //
    // This method also has aliases for each of the different verbs (eg. <tt>get()</tt>, <tt>post()</tt>, etc.)
    //
    // === Arguments
    //
    // +verb+::     A String in the set of ROUTE_VERBS or 'any'. 'any' will add routes for each
    //              of the ROUTE_VERBS. If only two arguments are passed,
    //              the first argument is the path, the second is the callback and the verb
    //              is assumed to be 'any'.
    // +path+::     A Regexp or a String representing the path to match to invoke this verb.
    // +callback+:: A Function that is called/evaluated whent the route is run see: <tt>runRoute()</tt>.
    //              It is also possible to pass a string as the callback, which is looked up as the name
    //              of a method on the application.
    //
    route: function(verb, path, callback) {
      var app = this, param_names = [], add_route;

      // if the method signature is just (path, callback)
      // assume the verb is 'any'
      if (!callback && $.isFunction(path)) {
        path = verb;
        callback = path;
        verb = 'any';
      }

      verb = verb.toLowerCase(); // ensure verb is lower case

      // if path is a string turn it into a regex
      if (path.constructor == String) {

        // Needs to be explicitly set because IE will maintain the index unless NULL is returned,
        // which means that with two consecutive routes that contain params, the second set of params will not be found and end up in splat instead of params
        // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/RegExp/lastIndex
        PATH_NAME_MATCHER.lastIndex = 0;

        // find the names
        while ((path_match = PATH_NAME_MATCHER.exec(path)) !== null) {
          param_names.push(path_match[1]);
        }
        // replace with the path replacement
        path = new RegExp("^" + path.replace(PATH_NAME_MATCHER, PATH_REPLACER) + "$");
      }
      // lookup callback
      if (typeof callback == 'string') {
        callback = app[callback];
      }

      add_route = function(with_verb) {
        var r = {verb: with_verb, path: path, callback: callback, param_names: param_names};
        // add route to routes array
        app.routes[with_verb] = app.routes[with_verb] || [];
        // place routes in order of definition
        app.routes[with_verb].push(r);
      };

      if (verb === 'any') {
        $.each(this.ROUTE_VERBS, function(i, v) { add_route(v); });
      } else {
        add_route(verb);
      }

      // return the app
      return this;
    },

    // Alias for route('get', ...)
    get: _routeWrapper('get'),

    // Alias for route('post', ...)
    post: _routeWrapper('post'),

    // Alias for route('put', ...)
    put: _routeWrapper('put'),

    // Alias for route('delete', ...)
    del: _routeWrapper('delete'),

    // Alias for route('any', ...)
    any: _routeWrapper('any'),

    // <tt>mapRoutes</tt> takes an array of arrays, each array being passed to route()
    // as arguments, this allows for mass definition of routes. Another benefit is
    // this makes it possible/easier to load routes via remote JSON.
    //
    // === Example
    //
    //    var app = $.sammy(function() {
    //
    //      this.mapRoutes([
    //          ['get', '#/', function() { this.log('index'); }],
    //          // strings in callbacks are looked up as methods on the app
    //          ['post', '#/create', 'addUser'],
    //          // No verb assumes 'any' as the verb
    //          [/dowhatever/, function() { this.log(this.verb, this.path)}];
    //        ]);
    //    })
    //
    mapRoutes: function(route_array) {
      var app = this;
      $.each(route_array, function(i, route_args) {
        app.route.apply(app, route_args);
      });
      return this;
    },

    // A unique event namespace defined per application.
    // All events bound with <tt>bind()</tt> are automatically bound within this space.
    eventNamespace: function() {
      return ['sammy-app', this.namespace].join('-');
    },

    // Works just like <tt>jQuery.fn.bind()</tt> with a couple noteable differences.
    //
    // * It binds all events to the application element
    // * All events are bound within the <tt>eventNamespace()</tt>
    // * Events are not actually bound until the application is started with <tt>run()</tt>
    // * callbacks are evaluated within the context of a Sammy.EventContext
    //
    // See http://code.quirkey.com/sammy/docs/events.html for more info.
    //
    bind: function(name, data, callback) {
      var app = this;
      // build the callback
      // if the arity is 2, callback is the second argument
      if (typeof callback == 'undefined') { callback = data; }
      var listener_callback =  function() {
        // pull off the context from the arguments to the callback
        var e, context, data;
        e       = arguments[0];
        data    = arguments[1];
        if (data && data.context) {
          context = data.context;
          delete data.context;
        } else {
          context = new app.context_prototype(app, 'bind', e.type, data);
        }
        e.cleaned_type = e.type.replace(app.eventNamespace(), '');
        callback.apply(context, [e, data]);
      };

      // it could be that the app element doesnt exist yet
      // so attach to the listeners array and then run()
      // will actually bind the event.
      if (!this.listeners[name]) { this.listeners[name] = []; }
      this.listeners[name].push(listener_callback);
      if (this.isRunning()) {
        // if the app is running
        // *actually* bind the event to the app element
        this._listen(name, listener_callback);
      }
      return this;
    },

    // Triggers custom events defined with <tt>bind()</tt>
    //
    // === Arguments
    //
    // +name+::     The name of the event. Automatically prefixed with the <tt>eventNamespace()</tt>
    // +data+::     An optional Object that can be passed to the bound callback.
    // +context+::  An optional context/Object in which to execute the bound callback.
    //              If no context is supplied a the context is a new <tt>Sammy.EventContext</tt>
    //
    trigger: function(name, data) {
      this.$element().trigger([name, this.eventNamespace()].join('.'), [data]);
      return this;
    },

    // Reruns the current route
    refresh: function() {
      this.last_location = null;
      this.trigger('location-changed');
      return this;
    },

    // Takes a single callback that is pushed on to a stack.
    // Before any route is run, the callbacks are evaluated in order within
    // the current <tt>Sammy.EventContext</tt>
    //
    // If any of the callbacks explicitly return false, execution of any
    // further callbacks and the route itself is halted.
    //
    // You can also provide a set of options that will define when to run this
    // before based on the route it proceeds.
    //
    // === Example
    //
    //      var app = $.sammy(function() {
    //
    //        // will run at #/route but not at #/
    //        this.before('#/route', function() {
    //          //...
    //        });
    //
    //        // will run at #/ but not at #/route
    //        this.before({except: {path: '#/route'}}, function() {
    //          this.log('not before #/route');
    //        });
    //
    //        this.get('#/', function() {});
    //
    //        this.get('#/route', function() {});
    //
    //      });
    //
    // See <tt>contextMatchesOptions()</tt> for a full list of supported options
    //
    before: function(options, callback) {
      if ($.isFunction(options)) {
        callback = options;
        options = {};
      }
      this.befores.push([options, callback]);
      return this;
    },

    // A shortcut for binding a callback to be run after a route is executed.
    // After callbacks have no guarunteed order.
    after: function(callback) {
      return this.bind('event-context-after', callback);
    },


    // Adds an around filter to the application. around filters are functions
    // that take a single argument <tt>callback</tt> which is the entire route
    // execution path wrapped up in a closure. This means you can decide whether
    // or not to proceed with execution by not invoking <tt>callback</tt> or,
    // more usefuly wrapping callback inside the result of an asynchronous execution.
    //
    // === Example
    //
    // The most common use case for around() is calling a _possibly_ async function
    // and executing the route within the functions callback:
    //
    //      var app = $.sammy(function() {
    //
    //        var current_user = false;
    //
    //        function checkLoggedIn(callback) {
    //          // /session returns a JSON representation of the logged in user
    //          // or an empty object
    //          if (!current_user) {
    //            $.getJSON('/session', function(json) {
    //              if (json.login) {
    //                // show the user as logged in
    //                current_user = json;
    //                // execute the route path
    //                callback();
    //              } else {
    //                // show the user as not logged in
    //                current_user = false;
    //                // the context of aroundFilters is an EventContext
    //                this.redirect('#/login');
    //              }
    //            });
    //          } else {
    //            // execute the route path
    //            callback();
    //          }
    //        };
    //
    //        this.around(checkLoggedIn);
    //
    //      });
    //
    around: function(callback) {
      this.arounds.push(callback);
      return this;
    },

    // Returns a boolean of weather the current application is running.
    isRunning: function() {
      return this._running;
    },

    // Helpers extends the EventContext prototype specific to this app.
    // This allows you to define app specific helper functions that can be used
    // whenever you're inside of an event context (templates, routes, bind).
    //
    // === Example
    //
    //    var app = $.sammy(function() {
    //
    //      helpers({
    //        upcase: function(text) {
    //         return text.toString().toUpperCase();
    //        }
    //      });
    //
    //      get('#/', function() { with(this) {
    //        // inside of this context I can use the helpers
    //        $('#main').html(upcase($('#main').text());
    //      }});
    //
    //    });
    //
    //
    // === Arguments
    //
    // +extensions+:: An object collection of functions to extend the context.
    //
    helpers: function(extensions) {
      $.extend(this.context_prototype.prototype, extensions);
      return this;
    },

    // Helper extends the event context just like <tt>helpers()</tt> but does it
    // a single method at a time. This is especially useful for dynamically named
    // helpers
    //
    // === Example
    //
    //     // Trivial example that adds 3 helper methods to the context dynamically
    //     var app = $.sammy(function(app) {
    //
    //       $.each([1,2,3], function(i, num) {
    //         app.helper('helper' + num, function() {
    //           this.log("I'm helper number " + num);
    //         });
    //       });
    //
    //       this.get('#/', function() {
    //         this.helper2(); //=> I'm helper number 2
    //       });
    //     });
    //
    // === Arguments
    //
    // +name+:: The name of the method
    // +method+:: The function to be added to the prototype at <tt>name</tt>
    //
    helper: function(name, method) {
      this.context_prototype.prototype[name] = method;
      return this;
    },

    // Actually starts the application's lifecycle. <tt>run()</tt> should be invoked
    // within a document.ready block to ensure the DOM exists before binding events, etc.
    //
    // === Example
    //
    //    var app = $.sammy(function() { ... }); // your application
    //    $(function() { // document.ready
    //        app.run();
    //     });
    //
    // === Arguments
    //
    // +start_url+::  "value", Optionally, a String can be passed which the App will redirect to
    //                after the events/routes have been bound.
    run: function(start_url) {
      if (this.isRunning()) { return false; }
      var app = this;

      // actually bind all the listeners
      $.each(this.listeners.toHash(), function(name, callbacks) {
        $.each(callbacks, function(i, listener_callback) {
          app._listen(name, listener_callback);
        });
      });

      this.trigger('run', {start_url: start_url});
      this._running = true;
      // set last location
      this.last_location = null;
      if (this.getLocation() == '' && typeof start_url != 'undefined') {
        this.setLocation(start_url);
      }
      // check url
      this._checkLocation();
      this.location_proxy.bind();
      this.bind('location-changed', function() {
        app._checkLocation();
      });

      // bind to submit to capture post/put/delete routes
      this.bind('submit', function(e) {
        var returned = app._checkFormSubmission($(e.target).closest('form'));
        return (returned === false) ? e.preventDefault() : false;
      });

      // bind unload to body unload
      $(window).bind('beforeunload', function() {
        app.unload();
      });

      // trigger html changed
      return this.trigger('changed');
    },

    // The opposite of <tt>run()</tt>, un-binds all event listeners and intervals
    // <tt>run()</tt> Automaticaly binds a <tt>onunload</tt> event to run this when
    // the document is closed.
    unload: function() {
      if (!this.isRunning()) { return false; }
      var app = this;
      this.trigger('unload');
      // clear interval
      this.location_proxy.unbind();
      // unbind form submits
      this.$element().unbind('submit').removeClass(app.eventNamespace());
      // unbind all events
      $.each(this.listeners.toHash() , function(name, listeners) {
        $.each(listeners, function(i, listener_callback) {
          app._unlisten(name, listener_callback);
        });
      });
      this._running = false;
      return this;
    },

    // Will bind a single callback function to every event that is already
    // being listened to in the app. This includes all the <tt>APP_EVENTS</tt>
    // as well as any custom events defined with <tt>bind()</tt>.
    //
    // Used internally for debug logging.
    bindToAllEvents: function(callback) {
      var app = this;
      // bind to the APP_EVENTS first
      $.each(this.APP_EVENTS, function(i, e) {
        app.bind(e, callback);
      });
      // next, bind to listener names (only if they dont exist in APP_EVENTS)
      $.each(this.listeners.keys(true), function(i, name) {
        if (app.APP_EVENTS.indexOf(name) == -1) {
          app.bind(name, callback);
        }
      });
      return this;
    },

    // Returns a copy of the given path with any query string after the hash
    // removed.
    routablePath: function(path) {
      return path.replace(QUERY_STRING_MATCHER, '');
    },

    // Given a verb and a String path, will return either a route object or false
    // if a matching route can be found within the current defined set.
    lookupRoute: function(verb, path) {
      var app = this, routed = false;
      this.trigger('lookup-route', {verb: verb, path: path});
      if (typeof this.routes[verb] != 'undefined') {
        $.each(this.routes[verb], function(i, route) {
          if (app.routablePath(path).match(route.path)) {
            routed = route;
            return false;
          }
        });
      }
      return routed;
    },

    // First, invokes <tt>lookupRoute()</tt> and if a route is found, parses the
    // possible URL params and then invokes the route's callback within a new
    // <tt>Sammy.EventContext</tt>. If the route can not be found, it calls
    // <tt>notFound()</tt>. If <tt>raise_errors</tt> is set to <tt>true</tt> and
    // the <tt>error()</tt> has not been overriden, it will throw an actual JS
    // error.
    //
    // You probably will never have to call this directly.
    //
    // === Arguments
    //
    // +verb+:: A String for the verb.
    // +path+:: A String path to lookup.
    // +params+:: An Object of Params pulled from the URI or passed directly.
    //
    // === Returns
    //
    // Either returns the value returned by the route callback or raises a 404 Not Found error.
    //
    runRoute: function(verb, path, params) {
      var app = this,
          route = this.lookupRoute(verb, path),
          context,
          wrapped_route,
          arounds,
          around,
          befores,
          before,
          callback_args,
          final_returned;

      this.log('runRoute', [verb, path].join(' '));
      this.trigger('run-route', {verb: verb, path: path, params: params});
      if (typeof params == 'undefined') { params = {}; }

      $.extend(params, this._parseQueryString(path));

      if (route) {
        this.trigger('route-found', {route: route});
        // pull out the params from the path
        if ((path_params = route.path.exec(this.routablePath(path))) !== null) {
          // first match is the full path
          path_params.shift();
          // for each of the matches
          $.each(path_params, function(i, param) {
            // if theres a matching param name
            if (route.param_names[i]) {
              // set the name to the match
              params[route.param_names[i]] = _decode(param);
            } else {
              // initialize 'splat'
              if (!params.splat) { params.splat = []; }
              params.splat.push(_decode(param));
            }
          });
        }

        // set event context
        context  = new this.context_prototype(this, verb, path, params);
        // ensure arrays
        arounds = this.arounds.slice(0);
        befores = this.befores.slice(0);
        // set the callback args to the context + contents of the splat
        callback_args = [context].concat(params.splat);
        // wrap the route up with the before filters
        wrapped_route = function() {
          var returned;
          while (befores.length > 0) {
            before = befores.shift();
            // check the options
            if (app.contextMatchesOptions(context, before[0])) {
              returned = before[1].apply(context, [context]);
              if (returned === false) { return false; }
            }
          }
          app.last_route = route;
          context.trigger('event-context-before', {context: context});
          returned = route.callback.apply(context, callback_args);
          context.trigger('event-context-after', {context: context});
          return returned;
        };
        $.each(arounds.reverse(), function(i, around) {
          var last_wrapped_route = wrapped_route;
          wrapped_route = function() { return around.apply(context, [last_wrapped_route]); };
        });
        try {
          final_returned = wrapped_route();
        } catch(e) {
          this.error(['500 Error', verb, path].join(' '), e);
        }
        return final_returned;
      } else {
        return this.notFound(verb, path);
      }
    },

    // Matches an object of options against an <tt>EventContext</tt> like object that
    // contains <tt>path</tt> and <tt>verb</tt> attributes. Internally Sammy uses this
    // for matching <tt>before()</tt> filters against specific options. You can set the
    // object to _only_ match certain paths or verbs, or match all paths or verbs _except_
    // those that match the options.
    //
    // === Example
    //
    //     var app = $.sammy(),
    //         context = {verb: 'get', path: '#/mypath'};
    //
    //     // match against a path string
    //     app.contextMatchesOptions(context, '#/mypath'); //=> true
    //     app.contextMatchesOptions(context, '#/otherpath'); //=> false
    //     // equivilent to
    //     app.contextMatchesOptions(context, {only: {path:'#/mypath'}}); //=> true
    //     app.contextMatchesOptions(context, {only: {path:'#/otherpath'}}); //=> false
    //     // match against a path regexp
    //     app.contextMatchesOptions(context, /path/); //=> true
    //     app.contextMatchesOptions(context, /^path/); //=> false
    //     // match only a verb
    //     app.contextMatchesOptions(context, {only: {verb:'get'}}); //=> true
    //     app.contextMatchesOptions(context, {only: {verb:'post'}}); //=> false
    //     // match all except a verb
    //     app.contextMatchesOptions(context, {except: {verb:'post'}}); //=> true
    //     app.contextMatchesOptions(context, {except: {verb:'get'}}); //=> false
    //     // match all except a path
    //     app.contextMatchesOptions(context, {except: {path:'#/otherpath'}}); //=> true
    //     app.contextMatchesOptions(context, {except: {path:'#/mypath'}}); //=> false
    //
    contextMatchesOptions: function(context, match_options, positive) {
      // empty options always match
      var options = match_options;
      if (typeof options === 'undefined' || options == {}) {
        return true;
      }
      if (typeof positive === 'undefined') {
        positive = true;
      }
      // normalize options
      if (typeof options === 'string' || $.isFunction(options.test)) {
        options = {path: options};
      }
      if (options.only) {
        return this.contextMatchesOptions(context, options.only, true);
      } else if (options.except) {
        return this.contextMatchesOptions(context, options.except, false);
      }
      var path_matched = true, verb_matched = true;
      if (options.path) {
        // wierd regexp test
        if ($.isFunction(options.path.test)) {
          path_matched = options.path.test(context.path);
        } else {
          path_matched = (options.path.toString() === context.path);
        }
      }
      if (options.verb) {
        verb_matched = options.verb === context.verb;
      }
      return positive ? (verb_matched && path_matched) : !(verb_matched && path_matched);
    },


    // Delegates to the <tt>location_proxy</tt> to get the current location.
    // See <tt>Sammy.HashLocationProxy</tt> for more info on location proxies.
    getLocation: function() {
      return this.location_proxy.getLocation();
    },

    // Delegates to the <tt>location_proxy</tt> to set the current location.
    // See <tt>Sammy.HashLocationProxy</tt> for more info on location proxies.
    //
    // === Arguments
    //
    // +new_location+:: A new location string (e.g. '#/')
    //
    setLocation: function(new_location) {
      return this.location_proxy.setLocation(new_location);
    },

    // Swaps the content of <tt>$element()</tt> with <tt>content</tt>
    // You can override this method to provide an alternate swap behavior
    // for <tt>EventContext.partial()</tt>.
    //
    // === Example
    //
    //    var app = $.sammy(function() {
    //
    //      // implements a 'fade out'/'fade in'
    //      this.swap = function(content) {
    //        this.$element().hide('slow').html(content).show('slow');
    //      }
    //
    //      get('#/', function() {
    //        this.partial('index.html.erb') // will fade out and in
    //      });
    //
    //    });
    //
    swap: function(content) {
      return this.$element().html(content);
    },

    // This thows a '404 Not Found' error by invoking <tt>error()</tt>.
    // Override this method or <tt>error()</tt> to provide custom
    // 404 behavior (i.e redirecting to / or showing a warning)
    notFound: function(verb, path) {
      var ret = this.error(['404 Not Found', verb, path].join(' '));
      return (verb === 'get') ? ret : true;
    },

    // The base error handler takes a string <tt>message</tt> and an <tt>Error</tt>
    // object. If <tt>raise_errors</tt> is set to <tt>true</tt> on the app level,
    // this will re-throw the error to the browser. Otherwise it will send the error
    // to <tt>log()</tt>. Override this method to provide custom error handling
    // e.g logging to a server side component or displaying some feedback to the
    // user.
    error: function(message, original_error) {
      if (!original_error) { original_error = new Error(); }
      original_error.message = [message, original_error.message].join(' ');
      this.trigger('error', {message: original_error.message, error: original_error});
      if (this.raise_errors) {
        throw(original_error);
      } else {
        this.log(original_error.message, original_error);
      }
    },

    _checkLocation: function() {
      var location, returned;
      // get current location
      location = this.getLocation();
      // compare to see if hash has changed
      if (location != this.last_location) {
        // lookup route for current hash
        returned = this.runRoute('get', location);
      }
      // reset last location
      this.last_location = location;
      return returned;
    },

    _checkFormSubmission: function(form) {
      var $form, path, verb, params, returned;
      this.trigger('check-form-submission', {form: form});
      $form = $(form);
      path  = $form.attr('action');
      verb  = $.trim($form.attr('method').toString().toLowerCase());
      if (!verb || verb == '') { verb = 'get'; }
      this.log('_checkFormSubmission', $form, path, verb);
      params = $.extend({}, this._parseFormParams($form), {'$form': $form});
      returned = this.runRoute(verb, path, params);
      return (typeof returned == 'undefined') ? false : returned;
    },

    _parseFormParams: function($form) {
      var params = {};
      $.each($form.serializeArray(), function(i, field) {
        if (params[field.name]) {
          if ($.isArray(params[field.name])) {
            params[field.name].push(field.value);
          } else {
            params[field.name] = [params[field.name], field.value];
          }
        } else {
          params[field.name] = field.value;
        }
      });
      return params;
    },

    _parseQueryString: function(path) {
      var query = {}, parts, pairs, pair, i;

      parts = path.match(QUERY_STRING_MATCHER);
      if (parts) {
        pairs = parts[1].split('&');
        for (i = 0; i < pairs.length; i += 1) {
          pair = pairs[i].split('=');
          query[pair[0]] = _decode(pair[1]);
        }
      }

      return query;
    },

    _listen: function(name, callback) {
      return this.$element().bind([name, this.eventNamespace()].join('.'), callback);
    },

    _unlisten: function(name, callback) {
      return this.$element().unbind([name, this.eventNamespace()].join('.'), callback);
    }

  });

  // <tt>Sammy.EventContext</tt> objects are created every time a route is run or a
  // bound event is triggered. The callbacks for these events are evaluated within a <tt>Sammy.EventContext</tt>
  // This within these callbacks the special methods of <tt>EventContext</tt> are available.
  //
  // === Example
  //
  //  $.sammy(function() { with(this) {
  //    // The context here is this Sammy.Application
  //    get('#/:name', function() { with(this) {
  //      // The context here is a new Sammy.EventContext
  //      if (params['name'] == 'sammy') {
  //        partial('name.html.erb', {name: 'Sammy'});
  //      } else {
  //        redirect('#/somewhere-else')
  //      }
  //    }});
  //  }});
  //
  // Initialize a new EventContext
  //
  // === Arguments
  //
  // +app+::    The <tt>Sammy.Application</tt> this event is called within.
  // +verb+::   The verb invoked to run this context/route.
  // +path+::   The string path invoked to run this context/route.
  // +params+:: An Object of optional params to pass to the context. Is converted
  //            to a <tt>Sammy.Object</tt>.
  Sammy.EventContext = function(app, verb, path, params) {
    this.app    = app;
    this.verb   = verb;
    this.path   = path;
    this.params = new Sammy.Object(params);
  };

  Sammy.EventContext.prototype = $.extend({}, Sammy.Object.prototype, {

    // A shortcut to the app's <tt>$element()</tt>
    $element: function() {
      return this.app.$element();
    },

    // Used for rendering remote templates or documents within the current application/DOM.
    // By default Sammy and <tt>partial()</tt> know nothing about how your templates
    // should be interpeted/rendered. This is easy to change, though. <tt>partial()</tt> looks
    // for a method in <tt>EventContext</tt> that matches the extension of the file you're
    // fetching (e.g. 'myfile.template' will look for a template() method, 'myfile.haml' => haml(), etc.)
    // If no matching render method is found it just takes the file contents as is.
    //
    // If you're templates have different (or no) extensions, and you want to render them all
    // through the same engine, you can set the default/fallback template engine on the app level
    // by setting <tt>app.template_engine</tt> to the name of the engine or a <tt>function() {}</tt>
    //
    // === Caching
    //
    // If you use the <tt>Sammy.Cache</tt> plugin, remote requests will be automatically cached unless
    // you explicitly set <tt>cache_partials</tt> to <tt>false</tt>
    //
    // === Example
    //
    // There are a couple different ways to use <tt>partial()</tt>:
    //
    //      partial('doc.html');
    //      //=> Replaces $element() with the contents of doc.html
    //
    //      use(Sammy.Template);
    //      //=> includes the template() method
    //      partial('doc.template', {name: 'Sammy'});
    //      //=> Replaces $element() with the contents of doc.template run through <tt>template()</tt>
    //
    //      partial('doc.html', function(data) {
    //        // data is the contents of the template.
    //        $('.other-selector').html(data);
    //      });
    //
    // === Iteration/Arrays
    //
    // If the data object passed to <tt>partial()</tt> is an Array, <tt>partial()</tt>
    // will itterate over each element in data calling the callback with the
    // results of interpolation and the index of the element in the array.
    //
    //    use(Sammy.Template);
    //    // item.template => "<li>I'm an item named <%= name %></li>"
    //    partial('item.template', [{name: "Item 1"}, {name: "Item 2"}])
    //    //=> Replaces $element() with:
    //    // <li>I'm an item named Item 1</li><li>I'm an item named Item 2</li>
    //    partial('item.template', [{name: "Item 1"}, {name: "Item 2"}], function(rendered, i) {
    //      rendered; //=> <li>I'm an item named Item 1</li> // for each element in the Array
    //      i; // the 0 based index of the itteration
    //    });
    //
    partial: function(path, data, callback) {
      var file_data,
          wrapped_callback,
          engine,
          data_array,
          cache_key = 'partial:' + path,
          context = this;

      // engine setup
      if ((engine = path.match(/\.([^\.]+)$/))) { engine = engine[1]; }
      // set the engine to the default template engine if no match is found
      if ((!engine || !$.isFunction(context[engine])) && this.app.template_engine) {
        engine = this.app.template_engine;
      }
      if (engine && !$.isFunction(engine) && $.isFunction(context[engine])) {
        engine = context[engine];
      }
      if (!callback && $.isFunction(data)) {
        // callback is in the data position
        callback = data;
        data = {};
      }
      data_array = ($.isArray(data) ? data : [data || {}]);
      wrapped_callback = function(response) {
        var new_content = response,
            all_content =  "";
        $.each(data_array, function(i, idata) {
          // extend the data object with the context
          $.extend(idata, context);
          if ($.isFunction(engine)) {
            new_content = engine.apply(context, [response, idata]);
          }
          // collect the content
          all_content += new_content;
          // if callback exists call it for each iteration
          if (callback) {
            // return the result of the callback
            // (you can bail the loop by returning false)
            return callback.apply(context, [new_content, i]);
          }
        });
        if (!callback) { context.swap(all_content); }
        context.trigger('changed');
      };
      if (this.app.cache_partials && this.cache(cache_key)) {
        // try to load the template from the cache
        wrapped_callback.apply(context, [this.cache(cache_key)]);
      } else {
        // the template wasnt cached, we need to fetch it
        $.get(path, function(response) {
          if (context.app.cache_partials) { context.cache(cache_key, response); }
          wrapped_callback.apply(context, [response]);
        });
      }
    },

    // Changes the location of the current window. If <tt>to</tt> begins with
    // '#' it only changes the document's hash. If passed more than 1 argument
    // redirect will join them together with forward slashes.
    //
    // === Example
    //
    //      redirect('#/other/route');
    //      // equivilent to
    //      redirect('#', 'other', 'route');
    //
    redirect: function() {
      var to, args = $.makeArray(arguments),
          current_location = this.app.getLocation();
      if (args.length > 1) {
        args.unshift('/');
        to = this.join.apply(this, args);
      } else {
        to = args[0];
      }
      this.trigger('redirect', {to: to});
      this.app.last_location = this.path;
      this.app.setLocation(to);
      if (current_location == to) {
        this.app.trigger('location-changed');
      }
    },

    // Triggers events on <tt>app</tt> within the current context.
    trigger: function(name, data) {
      if (typeof data == 'undefined') { data = {}; }
      if (!data.context) { data.context = this; }
      return this.app.trigger(name, data);
    },

    // A shortcut to app's <tt>eventNamespace()</tt>
    eventNamespace: function() {
      return this.app.eventNamespace();
    },

    // A shortcut to app's <tt>swap()</tt>
    swap: function(contents) {
      return this.app.swap(contents);
    },

    // Raises a possible <tt>notFound()</tt> error for the current path.
    notFound: function() {
      return this.app.notFound(this.verb, this.path);
    },

    // //=> Sammy.EventContext: get #/ {}
    toString: function() {
      return "Sammy.EventContext: " + [this.verb, this.path, this.params].join(' ');
    }

  });

  // An alias to Sammy
  $.sammy = window.Sammy = Sammy;

})(jQuery);
(function($) {

  Sammy = Sammy || {};

  // Sammy.Store is an abstract adapter class that wraps the multitude of in
  // browser data storage into a single common set of methods for storing and
  // retreiving data. The JSON library is used (through the inclusion of the
  // Sammy.JSON) plugin, to automatically convert objects back and forth from
  // stored strings.
  //
  // Sammy.Store can be used directly, but within a Sammy.Application it is much
  // easier to use the <tt>Sammy.Storage</tt> plugin and its helper methods.
  //
  // Sammy.Store also supports the KVO pattern, by firing DOM/jQuery Events when
  // a key is set.
  //
  // === Example
  //
  //      // create a new store named 'mystore', tied to the #main element, using HTML5 localStorage
  //      // Note: localStorage only works on browsers that support it
  //      var store = new Sammy.Store({name: 'mystore', element: '#element', type: 'local'});
  //      store.set('foo', 'bar');
  //      store.get('foo'); //=> 'bar'
  //      store.set('json', {obj: 'this is an obj'});
  //      store.get('json'); //=> {obj: 'this is an obj'}
  //      store.keys(); //=> ['foo','json']
  //      store.clear('foo');
  //      store.keys(); //=> ['json']
  //      store.clearAll();
  //      store.keys(); //=> []
  //
  // === Arguments
  //
  // The constructor takes a single argument which is a Object containing these possible options.
  //
  // +name+::     The name/namespace of this store. Stores are unique by name/type. (default 'store')
  // +element+::  A selector for the element that the store is bound to. (default 'body')
  // +type+::     The type of storage/proxy to use (default 'memory')
  //
  // Extra options are passed to the storage constructor.
  // Sammy.Store supports the following methods of storage:
  //
  // +memory+::   Basic object storage
  // +data+::     jQuery.data DOM Storage
  // +cookie+::   Access to document.cookie. Limited to 2K
  // +local+::    HTML5 DOM localStorage, browswer support is currently limited.
  // +session+::  HTML5 DOM sessionStorage, browswer support is currently limited.
  //
  Sammy.Store = function(options) {
    this.options  = options || {};
    this.name     = this.options.name || 'store';
    this.element  = this.options.element || 'body';
    this.$element = $(this.element);
    this.type     = this.options.type || 'memory';
    this.meta_key = this.options.meta_key || '__keys__';
    this.storage  = new Sammy.Store[Sammy.Store.stores[this.type]](this.name, this.element, this.options);
  };

  Sammy.Store.stores = {
    'memory': 'Memory',
    'data': 'Data',
    'local': 'LocalStorage',
    'session': 'SessionStorage',
    'cookie': 'Cookie'
  };

  $.extend(Sammy.Store.prototype, {
    // Checks for the availability of the current storage type in the current browser/config.
    isAvailable: function() {
      if ($.isFunction(this.storage.isAvailable)) {
        return this.storage.isAvailable();
      } else {
        true;
      }
    },
    // Checks for the existance of <tt>key</tt> in the current store. Returns a boolean.
    exists: function(key) {
      return this.storage.exists(key);
    },
    // Sets the value of <tt>key<tt> with <tt>value</tt>. If <tt>value<tt> is an
    // object, it is turned to and stored as a string with <tt>JSON.stringify</tt>.
    // It also tries to conform to the KVO pattern triggering jQuery events on the
    // element that the store is bound to.
    //
    // === Example
    //
    //      var store = new Sammy.Store({name: 'kvo'});
    //      $('body').bind('set-kvo.foo', function(e, data) {
    //        Sammy.log(data.key + ' changed to ' + data.value);
    //      });
    //      store.set('foo', 'bar'); // logged: foo changed to bar
    //
    set: function(key, value) {
      var string_value = (typeof value == 'string') ? value : JSON.stringify(value);
      key = key.toString();
      this.storage.set(key, string_value);
      if (key != this.meta_key) {
        this._addKey(key);
        this.$element.trigger('set-' + this.name + '.' + key, {key: key, value: value});
      };
      // always return the original value
      return value;
    },
    // Returns the set value at <tt>key</tt>, parsing with <tt>JSON.parse</tt> and
    // turning into an object if possible
    get: function(key) {
      var value = this.storage.get(key);
      if (typeof value == 'undefined' || value == null || value == '') {
        return value;
      }
      try {
        return JSON.parse(value);
      } catch(e) {
        return value;
      }
    },
    // Removes the value at <tt>key</tt> from the current store
    clear: function(key) {
      this._removeKey(key);
      return this.storage.clear(key);
    },
    // Clears all the values for the current store.
    clearAll: function() {
      var self = this;
      $.each(this.keys(), function(i, key) {
        self.clear(key);
      });
    },
    // Returns the all the keys set for the current store as an array.
    // Internally Sammy.Store keeps this array in a 'meta_key' for easy access.
    keys: function() {
      return this.get(this.meta_key) || [];
    },
    // Returns the value at <tt>key</tt> if set, otherwise, runs the callback
    // and sets the value to the value returned in the callback.
    //
    // === Example
    //
    //    var store = new Sammy.Store;
    //    store.exists('foo'); //=> false
    //    store.fetch('foo', function() {
    //      return 'bar!';
    //    }); //=> 'bar!'
    //    store.get('foo') //=> 'bar!'
    //    store.fetch('foo', function() {
    //      return 'baz!';
    //    }); //=> 'bar!
    //
    fetch: function(key, callback) {
      if (!this.exists(key)) {
        return this.set(key, callback.apply(this));
      } else {
        return this.get(key);
      }
    },
    // loads the response of a request to <tt>path</tt> into <tt>key</tt>.
    //
    // === Example
    //
    // In /mytemplate.tpl:
    //
    //    My Template
    //
    // In app.js:
    //
    //    var store = new Sammy.Store;
    //    store.load('mytemplate', '/mytemplate.tpl', function() {
    //      s.get('mytemplate') //=> My Template
    //    });
    //
    load: function(key, path, callback) {
      var s = this;
      $.get(path, function(response) {
        s.set(key, response);
        if (callback) { callback.apply(this, [response]); }
      });
    },
    _addKey: function(key) {
      var keys = this.keys();
      if ($.inArray(key, keys) == -1) { keys.push(key); }
      this.set(this.meta_key, keys);
    },
    _removeKey: function(key) {
      var keys = this.keys();
      var index = $.inArray(key, keys);
      if (index != -1) { keys.splice(index, 1); }
      this.set(this.meta_key, keys);
    }
  });

  // Tests if the type of storage is available/works in the current browser/config.
  // Especially useful for testing the availability of the awesome, but not widely
  // supported HTML5 DOM storage
  Sammy.Store.isAvailable = function(type) {
    try {
      return Sammy.Store[Sammy.Store.stores[type]].prototype.isAvailable();
    } catch(e) {
      return false;
    }
  };

  // Memory ('memory') is the basic/default store. It stores data in a global
  // JS object. Data is lost on refresh.
  Sammy.Store.Memory = function(name, element) {
    this.name  = name;
    this.element = element;
    this.namespace = [this.element, this.name].join('.');
    Sammy.Store.Memory.store = Sammy.Store.Memory.store || {};
    Sammy.Store.Memory.store[this.namespace] = Sammy.Store.Memory.store[this.namespace] || {};
    this.store = Sammy.Store.Memory.store[this.namespace];
  };
  $.extend(Sammy.Store.Memory.prototype, {
    isAvailable: function() { return true; },
    exists: function(key) {
      return (typeof this.store[key] != "undefined");
    },
    set: function(key, value) {
      return this.store[key] = value;
    },
    get: function(key) {
      return this.store[key];
    },
    clear: function(key) {
      delete this.store[key];
    }
  });

  // Data ('data') stores objects using the jQuery.data() methods. This has the advantadge
  // of scoping the data to the specific element. Like the 'memory' store its data
  // will only last for the length of the current request (data is lost on refresh/etc).
  Sammy.Store.Data = function(name, element) {
    this.name = name;
    this.element = element;
    this.$element = $(element);
  };
  $.extend(Sammy.Store.Data.prototype, {
    isAvailable: function() { return true; },
    exists: function(key) {
      return (typeof this.$element.data(this._key(key)) != "undefined");
    },
    set: function(key, value) {
      return this.$element.data(this._key(key), value);
    },
    get: function(key) {
      return this.$element.data(this._key(key));
    },
    clear: function(key) {
      this.$element.removeData(this._key(key));
    },
    _key: function(key) {
      return ['store', this.name, key].join('.');
    }
  });

  // LocalStorage ('local') makes use of HTML5 DOM Storage, and the window.localStorage
  // object. The great advantage of this method is that data will persist beyond
  // the current request. It can be considered a pretty awesome replacement for
  // cookies accessed via JS. The great disadvantage, though, is its only available
  // on the latest and greatest browsers.
  //
  // For more info on DOM Storage:
  // [https://developer.mozilla.org/en/DOM/Storage]
  // [http://www.w3.org/TR/2009/WD-webstorage-20091222/]
  //
  Sammy.Store.LocalStorage = function(name, element) {
    this.name = name;
    this.element = element;
  };
  $.extend(Sammy.Store.LocalStorage.prototype, {
    isAvailable: function() {
      return ('localStorage' in window) && (window.location.protocol != 'file:');
    },
    exists: function(key) {
      return (this.get(key) != null);
    },
    set: function(key, value) {
      return window.localStorage.setItem(this._key(key), value);
    },
    get: function(key) {
      return window.localStorage.getItem(this._key(key));
    },
    clear: function(key) {
      window.localStorage.removeItem(this._key(key));;
    },
    _key: function(key) {
      return ['store', this.element, this.name, key].join('.');
    }
  });

  // .SessionStorage ('session') is similar to LocalStorage (part of the same API)
  // and shares similar browser support/availability. The difference is that
  // SessionStorage is only persistant through the current 'session' which is defined
  // as the length that the current window is open. This means that data will survive
  // refreshes but not close/open or multiple windows/tabs. For more info, check out
  // the <tt>LocalStorage</tt> documentation and links.
  Sammy.Store.SessionStorage = function(name, element) {
    this.name = name;
    this.element = element;
  };
  $.extend(Sammy.Store.SessionStorage.prototype, {
    isAvailable: function() {
      return ('sessionStorage' in window) &&
      (window.location.protocol != 'file:') &&
      ($.isFunction(window.sessionStorage.setItem));
    },
    exists: function(key) {
      return (this.get(key) != null);
    },
    set: function(key, value) {
      return window.sessionStorage.setItem(this._key(key), value);
    },
    get: function(key) {
      var value = window.sessionStorage.getItem(this._key(key));
      if (value && typeof value.value != "undefined") { value = value.value }
      return value;
    },
    clear: function(key) {
      window.sessionStorage.removeItem(this._key(key));;
    },
    _key: function(key) {
      return ['store', this.element, this.name, key].join('.');
    }
  });

  // .Cookie ('cookie') storage uses browser cookies to store data. JavaScript
  // has access to a single document.cookie variable, which is limited to 2Kb in
  // size. Cookies are also considered 'unsecure' as the data can be read easily
  // by other sites/JS. Cookies do have the advantage, though, of being widely
  // supported and persistent through refresh and close/open. Where available,
  // HTML5 DOM Storage like LocalStorage and SessionStorage should be used.
  //
  // .Cookie can also take additional options:
  // +expires_in+:: Number of seconds to keep the cookie alive (default 2 weeks).
  // +path+::       The path to activate the current cookie for (default '/').
  //
  // For more information about document.cookie, check out the pre-eminint article
  // by ppk: [http://www.quirksmode.org/js/cookies.html]
  //
  Sammy.Store.Cookie = function(name, element, options) {
    this.name = name;
    this.element = element;
    this.options = options || {};
    this.path = this.options.path || '/';
    // set the expires in seconds or default 14 days
    this.expires_in = this.options.expires_in || (14 * 24 * 60 * 60);
  };
  $.extend(Sammy.Store.Cookie.prototype, {
    isAvailable: function() {
      return ('cookie' in document) && (window.location.protocol != 'file:');
    },
    exists: function(key) {
      return (this.get(key) != null);
    },
    set: function(key, value) {
      return this._setCookie(key, value);
    },
    get: function(key) {
      return this._getCookie(key);
    },
    clear: function(key) {
      this._setCookie(key, "", -1);
    },
    _key: function(key) {
      return ['store', this.element, this.name, key].join('.');
    },
    _getCookie: function(key) {
      var escaped = this._key(key).replace(/(\.|\*|\(|\)|\[|\])/g, '\\$1');
      var match = document.cookie.match("(^|;\\s)" + escaped + "=([^;]*)(;|$)")
      return (match ? match[2] : null);
    },
    _setCookie: function(key, value, expires) {
      if (!expires) { expires = (this.expires_in * 1000) }
      var date = new Date();
      date.setTime(date.getTime() + expires);
      var set_cookie = [
        this._key(key), "=", value,
        "; expires=", date.toGMTString(),
        "; path=", this.path
      ].join('');
      document.cookie = set_cookie;
    }
  });

  // Sammy.Storage is a plugin that provides shortcuts for creating and using
  // Sammy.Store objects. Once included it provides the <tt>store()</tt> app level
  // and helper methods. Depends on Sammy.JSON (or json2.js).
  Sammy.Storage = function(app) {
    this.use(Sammy.JSON);

    this.stores = this.stores || {};

    // <tt>store()</tt> creates and looks up existing <tt>Sammy.Store</tt> objects
    // for the current application. The first time used for a given <tt>'name'</tt>
    // initializes a <tt>Sammy.Store</tt> and also creates a helper under the store's
    // name.
    //
    // === Example
    //
    //      var app = $.sammy(function() {
    //        this.use(Sammy.Storage);
    //
    //        // initializes the store on app creation.
    //        this.store('mystore', {type: 'cookie'});
    //
    //        this.get('#/', function() {
    //          // returns the Sammy.Store object
    //          this.store('mystore');
    //          // sets 'foo' to 'bar' using the shortcut/helper
    //          // equivilent to this.store('mystore').set('foo', 'bar');
    //          this.mystore('foo', 'bar');
    //          // returns 'bar'
    //          // equivilent to this.store('mystore').get('foo');
    //          this.mystore('foo');
    //          // returns 'baz!'
    //          // equivilent to:
    //          // this.store('mystore').fetch('foo!', function() {
    //          //   return 'baz!';
    //          // })
    //          this.mystore('foo!', function() {
    //            return 'baz!';
    //          });
    //
    //          this.clearMystore();
    //          // equivilent to:
    //          // this.store('mystore').clearAll()
    //        });
    //
    //      });
    //
    // === Arguments
    //
    // +name+::     The name of the store and helper. the name must be unique per application.
    // +options+::  A JS object of options that can be passed to the Store constuctor on initialization.
    //
    this.store = function(name, options) {
      // if the store has not been initialized
      if (typeof this.stores[name] == 'undefined') {
        // create initialize the store
        var clear_method_name = "clear" + name.substr(0,1).toUpperCase() + name.substr(1);
        this.stores[name] = new Sammy.Store($.extend({
          name: name,
          element: this.element_selector
        }, options || {}));
        // app.name()
        this[name] = function(key, value) {
          if (typeof value == 'undefined') {
            return this.stores[name].get(key);
          } else if ($.isFunction(value)) {
            return this.stores[name].fetch(key, value);
          } else {
            return this.stores[name].set(key, value)
          }
        };
        // app.clearName();
        this[clear_method_name] = function() {
          return this.stores[name].clearAll();
        }
        // context.name()
        this.helper(name, function() {
          return this.app[name].apply(this.app, arguments);
        });
        // context.clearName();
        this.helper(clear_method_name, function() {
          return this.app[clear_method_name]();
        });
      }
      return this.stores[name];
    };

    this.helpers({
      store: function() {
        return this.app.store.apply(this.app, arguments);
      }
    });
  };

  // Sammy.Session is an additional plugin for creating a common 'session' store
  // for the given app. It is a very simple wrapper around <tt>Sammy.Storage</tt>
  // that provides a simple fallback mechanism for trying to provide the best
  // possible storage type for the session. This means, <tt>LocalStorage</tt>
  // if available, otherwise <tt>Cookie</tt>, otherwise <tt>Memory</tt>.
  // It provides the <tt>session()</tt> helper through <tt>Sammy.Storage#store()</tt>.
  //
  // See the <tt>Sammy.Storage</tt> plugin for full documentation.
  //
  Sammy.Session = function(app, options) {
    this.use(Sammy.Storage);
    // check for local storage, then cookie storage, then just use memory
    var type = 'memory';
    if (Sammy.Store.isAvailable('local')) {
      type = 'local';
    } else if (Sammy.Store.isAvailable('cookie')) {
      type = 'cookie';
    }
    this.store('session', $.extend({type: type}, options));
  };

  // Sammy.Cache provides helpers for caching data within the lifecycle of a
  // Sammy app. The plugin provides two main methods on <tt>Sammy.Application<tt>,
  // <tt>cache</tt> and <tt>clearCache</tt>. Each app has its own cache store so that
  // you dont have to worry about collisions. As of 0.5 the original Sammy.Cache module
  // has been deprecated in favor of this one based on Sammy.Storage. The exposed
  // API is almost identical, but Sammy.Storage provides additional backends including
  // HTML5 Storage. <tt>Sammy.Cache</tt> will try to use these backends when available
  // (in this order) <tt>LocalStorage</tt>, <tt>SessionStorage</tt>, and <tt>Memory</tt>
  Sammy.Cache = function(app, options) {
    this.use(Sammy.Storage);
    // set cache_partials to true
    this.cache_partials = true;
    // check for local storage, then session storage, then just use memory
    var type = 'memory';
    if (Sammy.Store.isAvailable('local')) {
      type = 'local';
    } else if (Sammy.Store.isAvailable('session')) {
      type = 'session';
    }
    this.store('cache', $.extend({type: type}, options));
  };

})(jQuery);
(function($) {

  // Simple JavaScript Templating
  // John Resig - http://ejohn.org/ - MIT Licensed
  // adapted from: http://ejohn.org/blog/javascript-micro-templating/
  // originally $.srender by Greg Borenstein http://ideasfordozens.com in Feb 2009
  // modified for Sammy by Aaron Quint for caching templates by name
  var srender_cache = {};
  var srender = function(name, template, data) {
    // target is an optional element; if provided, the result will be inserted into it
    // otherwise the result will simply be returned to the caller
    var fn, fn_text;
    if (srender_cache[name]) {
      fn = srender_cache[name];
    } else {
      if (typeof template == 'undefined') {
        // was a cache check, return false
        return false;
      }
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      try {

        fn_text = "var p=[],print=function(){p.push.apply(p,arguments);};";

        // Introduce the data as local variables using with(){}
        fn_text += "with(obj){p.push(\"";

        // Convert the template into pure JavaScript

        fn_text += template
            .replace(/[\r\t\n]/g, " ")
            .replace(/\"/g, '\\"')
            .split("<%").join("\t")
            .replace(/((^|%>)[^\t]*)/g, "$1\r")
            .replace(/\t=(.*?)%>/g, "\",$1,\"")
            .split("\t").join("\");")
            .split("%>").join("p.push(\"")
            .split("\r").join("");

        fn_text += "\");}return p.join('');";
        fn = srender_cache[name] = new Function("obj", fn_text);
      } catch(e) {
        Sammy.log(e);
      }
    }

    if (typeof data != 'undefined') {
      return fn(data);
    } else {
      return fn;
    }
  };

  Sammy = Sammy || {};

  // <tt>Sammy.Template</tt> is a simple plugin that provides a way to create
  // and render client side templates. The rendering code is based on John Resig's
  // quick templates and Greg Borenstien's srender plugin.
  // This is also a great template/boilerplate for Sammy plugins.
  //
  // Templates use <% %> tags to denote embedded javascript.
  //
  // === Examples
  //
  // Here is an example template (user.template):
  //
  //      <div class="user">
  //        <div class="user-name"><%= user.name %></div>
  //        <% if (user.photo_url) { %>
  //          <div class="photo"><img src="<%= user.photo_url %>" /></div>
  //        <% } %>
  //      </div>
  //
  // Given that is a publicly accesible file, you would render it like:
  //
  //       $.sammy(function() {
  //         // include the plugin
  //         this.use(Sammy.Template);
  //
  //         this.get('#/', function() {
  //           // the template is rendered in the current context.
  //           this.user = {name: 'Aaron Quint'};
  //           // partial calls template() because of the file extension
  //           this.partial('user.template');
  //         })
  //       });
  //
  // You can also pass a second argument to use() that will alias the template
  // method and therefore allow you to use a different extension for template files
  // in <tt>partial()</tt>
  //
  //      // alias to 'tpl'
  //      this.use(Sammy.Template, 'tpl');
  //
  //      // now .tpl files will be run through srender
  //      this.get('#/', function() {
  //        this.partial('myfile.tpl');
  //      });
  //
  Sammy.Template = function(app, method_alias) {

    // *Helper:* Uses simple templating to parse ERB like templates.
    //
    // === Arguments
    //
    // +template+:: A String template. '<% %>' tags are evaluated as Javascript and replaced with the elements in data.
    // +data+::     An Object containing the replacement values for the template.
    //              data is extended with the <tt>EventContext</tt> allowing you to call its methods within the template.
    // +name+::     An optional String name to cache the template.
    //
    var template = function(template, data, name) {
      // use name for caching
      if (typeof name == 'undefined') name = template;
      return srender(name, template, $.extend({}, this, data));
    };

    // set the default method name/extension
    if (!method_alias) method_alias = 'template';
    // create the helper at the method alias
    app.helper(method_alias, template);

  };

})(jQuery);
(function($) {

  Sammy = Sammy || {};

  function parseValue(value) {
    value = unescape(value);
    if (value === "true") {
      return true;
    } else if (value === "false") {
      return false;
    } else {
      return value;
    }
  };

  function parseNestedParam(field_value, field_name, params) {
    var match, name, rest;

    if (field_name.match(/^[^\[]+$/)) {
      // basic value
      params[field_name] = parseValue(field_value);
    } else if (match = field_name.match(/^([^\[]+)\[\](.*)$/)) {
      // array
      name = match[1];
      rest = match[2];

      if(params[name] && !$.isArray(params[name])) { throw('400 Bad Request'); }

      if (rest) {
        // array is not at the end of the parameter string
        match = rest.match(/^\[([^\]]+)\](.*)$/);
        if(!match) { throw('400 Bad Request'); }

        if (params[name]) {
          if(params[name][params[name].length - 1][match[1]]) {
            params[name].push(parseNestedParam(field_value, match[1] + match[2], {}));
          } else {
            $.extend(true, params[name][params[name].length - 1], parseNestedParam(field_value, match[1] + match[2], {}));
          }
        } else {
          params[name] = [parseNestedParam(field_value, match[1] + match[2], {})];
        }
      } else {
        // array is at the end of the parameter string
        if (params[name]) {
          params[name].push(parseValue(field_value));
        } else {
          params[name] = [parseValue(field_value)];
        }
      }
    } else if (match = field_name.match(/^([^\[]+)\[([^\[]+)\](.*)$/)) {
      // hash
      name = match[1];
      rest = match[2] + match[3];

      if (params[name] && $.isArray(params[name])) { throw('400 Bad Request'); }

      if (params[name]) {
        $.extend(true, params[name], parseNestedParam(field_value, rest, params[name]));
      } else {
        params[name] = parseNestedParam(field_value, rest, {});
      }
    }
    return params;
  };


  // <tt>Sammy.NestedParams</tt> overrides the default form parsing behavior to provide
  // extended functionality for parsing Rack/Rails style form name/value pairs into JS
  // Objects. In fact it passes the same suite of tests as Rack's nested query parsing.
  // The code and tests were ported to JavaScript/Sammy by http://github.com/endor
  //
  // This allows you to translate a form with properly named inputs into a JSON object.
  //
  // === Example
  //
  // Given an HTML form like so:
  //
  //     <form action="#/parse_me" method="post">
  //       <input type="text" name="obj[first]" />
  //       <input type="text" name="obj[second]" />
  //       <input type="text" name="obj[hash][first]" />
  //       <input type="text" name="obj[hash][second]" />
  //     </form>
  //
  // And a Sammy app like:
  //
  //     var app = $.sammy(function(app) {
  //       this.use(Sammy.NestedParams);
  //
  //       this.post('#/parse_me', function(context) {
  //         $.log(this.params);
  //       });
  //     });
  //
  // If you filled out the form with some values and submitted it, you would see something
  // like this in your log:
  //
  //     {
  //       'obj': {
  //         'first': 'value',
  //         'second': 'value',
  //         'hash': {
  //           'first': 'value',
  //           'second': 'value'
  //         }
  //       }
  //       '$form': .. jQuery ..
  //     }
  //
  // It supports creating arrays with [] and other niceities. Check out the tests for
  // full specs.
  //
  Sammy.NestedParams = function(app) {

    $.extend(app, {
      _parseFormParams: function($form) {
        var params = {};
        $.each($form.serializeArray(), function(i, field) {
          $.extend(true, params, parseNestedParam(field.value, field.name, params));
        });

        return params;
      }
    });

  };

})(jQuery);

(function($) {

  Sammy = Sammy || {};

  function getStringContent(object, content) {
    if (typeof content === 'undefined') {
      return '';
    } else if ($.isFunction(content)) {
      content = content.apply(object);
    }
    return content.toString();
  };

  function simple_element(tag, attributes, content) {
    var html = "<";
    html += tag;
    if (typeof attributes != 'undefined') {
      $.each(attributes, function(key, value) {
        if (value != null) {
          html += " " + key + "='";
          html += getStringContent(attributes, value).replace(/\'/g, "\'");
          html += "'";
        }
      });
    }
    if (content === false) {
      html += ">";
    } else if (typeof content != 'undefined') {
      html += ">";
      html += getStringContent(this, content);
      html += "</" + tag + ">";
    } else {
      html += " />";
    }
    return html;
  };

  // Sammy.FormBuilder is based very closely on the Rails FormBuilder classes.
  // Its goal is to make it easy to create HTML forms for creating and editing
  // JavaScript objects. It eases the process by auto-populating existing values
  // into form inputs and creating input names suitable for parsing by
  // Sammy.NestedParams and other backend frameworks.
  //
  // You initialize a Sammy.FormBuilder by passing the 'name' of the object and
  // the object itself. Once initialized you create form elements with the object's
  // prototype methods. Each of these methods returns a string of HTML suitable for
  // appending through a template or directly with jQuery.
  //
  // === Example
  //
  //      var item = {
  //        name: 'My Item',
  //        price: '$25.50',
  //        meta: {
  //          id: '123'
  //        }
  //      };
  //      var form = new Sammy.FormBuilder('item', item);
  //      form.text('name');
  //      //=> <input type='text' name='item[form]' value='My Item' />
  //
  // Nested attributes can be accessed/referred to by a 'keypath' which is
  // basically a string representation of the dot notation.
  //
  //      form.hidden('meta.id');
  //      //=> <input type='hidden' name='item[meta][id]' value='123' />
  //
  Sammy.FormBuilder = function(name, object) {
    this.name   = name;
    this.object = object;
  };

  $.extend(Sammy.FormBuilder.prototype, {

    // creates the open <form> tag with the object attributes
    open: function(attributes) {
      return simple_element('form', $.extend({'method': 'post', 'action': '#/' + this.name + 's'}, attributes), false);
    },

    // closes the <form>
    close: function() {
      return '</form>';
    },

    // creates a label for @keypath@ with the text @content
    // with an optional @attributes@ object
    label: function(keypath, content, attributes) {
      var attrs = {'for': this._attributesForKeyPath(keypath).name};
      return simple_element('label', $.extend(attrs, attributes), content);
    },

    // creates a hidden <input> for @keypath@ with an optional @attributes@ object
    hidden: function(keypath, attributes) {
      attributes = $.extend({type: 'hidden'}, this._attributesForKeyPath(keypath), attributes);
      return simple_element('input', attributes);
    },

    // creates a text <input> for @keypath@ with an optional @attributes@ object
    text: function(keypath, attributes) {
      attributes = $.extend({type: 'text'}, this._attributesForKeyPath(keypath), attributes);
      return simple_element('input', attributes);
    },

    // creates a <textarea> for @keypath@ with an optional @attributes@ object
    textarea: function(keypath, attributes) {
      var current;
      attributes = $.extend(this._attributesForKeyPath(keypath), attributes);
      current = attributes.value;
      delete attributes['value'];
      return simple_element('textarea', attributes, current);
    },

    // creates a password <input> for @keypath@ with an optional @attributes@ object
    password: function(keypath, attributes) {
      return this.text(keypath, $.extend({type: 'password'}, attributes));
    },

    // creates a <select> element for @keypath@ with the <option> elements
    // specified by an array in @options@. If @options@ is an array of arrays,
    // the first element in each subarray becomes the text of the option and the
    // second becomes the value.
    //
    // === Example
    //
    //     var options = [
    //       ['Small', 's'],
    //       ['Medium', 'm'],
    //       ['Large', 'l']
    //     ];
    //     form.select('size', options);
    //     //=> <select name='item[size]'><option value='s'>Small</option> ...
    //
    //
    select: function(keypath, options, attributes) {
      var option_html = "", selected;
      attributes = $.extend(this._attributesForKeyPath(keypath), attributes);
      selected = attributes.value;
      delete attributes['value'];
      $.each(options, function(i, option) {
        var value, text, option_attrs;
        if ($.isArray(option)) {
          value = option[1], text = option[0];
        } else {
          value = option, text = option;
        }
        option_attrs = {value: getStringContent(this.object, value)};
        // select the correct option
        if (value === selected) { option_attrs.selected = 'selected'; }
        option_html += simple_element('option', option_attrs, text);
      });
      return simple_element('select', attributes, option_html);
    },

    // creates a radio <input> for keypath with the value @value@. Multiple
    // radios can be created with different value, if @value@ equals the
    // current value of the key of the form builder's object the attribute
    // checked='checked' will be added.
    radio: function(keypath, value, attributes) {
      var selected;
      attributes = $.extend(this._attributesForKeyPath(keypath), attributes);
      selected = attributes.value;
      attributes.value = getStringContent(this.object, value);
      if (selected == attributes.value) {
        attributes.checked = 'checked';
      }
      return simple_element('input', $.extend({type:'radio'}, attributes));
    },

    // creates a checkbox <input> for keypath with the value @value@. Multiple
    // checkboxes can be created with different value, if @value@ equals the
    // current value of the key of the form builder's object the attribute
    // checked='checked' will be added.
    //
    // By default @checkbox()@ also generates a hidden element whose value is
    // the inverse of the value given. This is known hack to get around a common
    // gotcha where browsers and jQuery itself does not include 'unchecked'
    // elements in the list of submittable inputs. This ensures that a value
    // should always be passed to Sammy and hence the server. You can disable
    // the creation of the hidden element by setting the @hidden_element@ attribute
    // to @false@
    checkbox: function(keypath, value, attributes) {
      var content = "";
      if (!attributes) { attributes = {}; }
      if (attributes.hidden_element !== false) {
        content += this.hidden(keypath, {'value': !value});
      }
      delete attributes['hidden_element'];
      content += this.radio(keypath, value, $.extend({type: 'checkbox'}, attributes));
      return content;
    },

    // creates a submit <input> for @keypath@ with an optional @attributes@ object
    submit: function(attributes) {
      return simple_element('input', $.extend({'type': 'submit'}, attributes));
    },

    _attributesForKeyPath: function(keypath) {
      var builder    = this,
          keys       = $.isArray(keypath) ? keypath : keypath.split(/\./),
          name       = builder.name,
          value      = builder.object,
          class_name = builder.name;

      $.each(keys, function(i, key) {
        if ((typeof value === 'undefined') || value == '') {
          value = ''
        } else if (typeof key == 'number' || key.match(/^\d+$/)) {
          value = value[parseInt(key, 10)];
        } else {
          value = value[key];
        }
        name += "[" + key + "]";
        class_name += "-" + key;
      });
      return {'name': name,
              'value': getStringContent(builder.object, value),
              'class': class_name};
    }
  });

  // Sammy.Form is a Sammy plugin that adds form building helpers to a
  // Sammy.Application
  Sammy.Form = function(app) {

    app.helpers({
      // simple_element is a simple helper for creating HTML tags.
      //
      // === Arguments
      //
      // +tag+::        the HTML tag to generate e.g. input, p, etc/
      // +attributes+:: an object representing the attributes of the element as
      //                key value pairs. e.g. {class: 'element-class'}
      // +content+::    an optional string representing the content for the
      //                the element. If ommited, the element becomes self closing
      //
      simple_element: simple_element,

      // formFor creates a Sammy.Form builder object with the passed @name@
      // and @object@ and passes it as an argument to the @content_callback@.
      // This is a shortcut for creating FormBuilder objects for use within
      // templates.
      //
      // === Example
      //
      //      // in item_form.template
      //
      //      <% formFor('item', item, function(f) { %>
      //        <%= f.open({action: '#/items'}) %>
      //        <p>
      //          <%= f.label('name') %>
      //          <%= f.text('name') %>
      //        </p>
      //        <p>
      //          <%= f.submit() %>
      //        </p>
      //        <%= f.close() %>
      //      <% }); %>
      //
      formFor: function(name, object, content_callback) {
        var builder;
        // define a form with just a name
        if ($.isFunction(object)) {
          content_callback = object;
          object = this[name];
        }
        builder = new Sammy.FormBuilder(name, object),
        content_callback.apply(this, [builder]);
        return builder;
      }
    });

  };

})(jQuery);
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
