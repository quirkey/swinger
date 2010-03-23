# Swinger

Swinger is a couchapp for creating and showing Presentations. Think Keynote, stored in CouchDB, run via Javascript and Sammy.js.

A free hosted version of the application lives at [http://swinger.quirkey.com](http://swinger.quirkey.com)

# !NOTE!

The codebase is currently in flux while I'm working out authentication stuff. Unfortunately, the CouchDB's new authentication features are slated for version 0.11 but only available in CouchDB trunk. Therefore, the current state of swinger only works on CouchDB trunk. If you're on OSX you can easily [grab the latest CouchDBX nightly](http://couch.lstoll.net/nightly/).

## About

This was created as a Demo for my talk at jQuery Conf 2009 about Sammy.js, however, its usefulness might outlast my talk. We'll see.

## Requirements

* A running CouchDB server (>= 0.11)
* [CouchApp](http://github.com/couchapp/couchapp) - You need the latest and greatest couchapp for the push to work without errors. Follow [these instructions](http://wiki.github.com/couchapp/couchapp/manual-2) to install from source

## Usage

All you need to do to get up and running after the requirements are installed is:

    $ couchapp push . http://localhost:5984/swinger
    
It should print out instructions of where you can view it.

You can also set up a .couchapprc file that looks something like this:

    {
      "env": { 
        "default": {
          "db": "http://admin:password@localhost:5984/swinger"
        }
      }
    }

Once that is set up you can just do:

    $ couchapp push


## Acknowledgments

Swinger was greatly inspired by Pat Nakajima's [Slidedown](http://github.com/nakajima/slidedown). 

### Technologies/Projects used

* [Sammy.js](http://code.quirkey.com/sammy) for frontend controller/routing
* [CouchApp](http://github.com/couchapp/couchapp) for hosting the app in CouchDB
* [Aristo CSS](http://github.com/maccman/aristo/tree/master) for base buttons/styles
* [Showdown](http://attacklab.net/showdown/) for Markdown
* [Prettify](http://code.google.com/p/google-code-prettify/) for Code higlighting