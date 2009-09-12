# Swinger

Swinger is a couchapp for creating and showing Presentations. Think Keynote, stored in CouchDB, run via Javascript and Sammy.js.

# About

This was created as a Demo for my talk at jQuery Conf 2009 about Sammy.js, however, its usefulness might outlast my talk. We'll see.

# Requirements

* A running CouchDB server
* [CouchApp]

# Usage

All you need to do to get up and running after the requirements are installed is:

    $ couchapp push http://localhost:5984/swinger
    
It should print out instructions of where you can view it.

## Acknowledgments

Swinger was greatly inspired by Pat Nakajima's [Slidedown]. 

### Technologies/Projects used

* [Sammy.js] for frontend controller/routing
* [CouchApp] for hosting the app in CouchDB
* [Aristo CSS] for base buttons/styles
* [Showdown] for Markdown
* [SHJS] for Code higlighting

[Sammy.js]: http://code.quirkey.com/sammy
[CouchApp]: http://github.com/couchapp/couchapp
[Aristo CSS]: http://github.com/maccman/aristo/tree/master
[Showdown]: http://attacklab.net/showdown/
[SHJS]: http://shjs.sourceforge.net/

