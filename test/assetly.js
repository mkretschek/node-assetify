
/* globals describe : true, it : true, before : true */

(function () {
  'use strict';

  var expect = require('expect.js'),
    express = require('express'),
    assetly = require('../');


  describe('assetly', function () {
    it('is accessible', function () {
      expect(assetly).not.to.be(undefined);
    });


    it('is a function', function () {
      expect(assetly).to.be.a('function');
    });


    describe('uri formatting', function () {
      it('accepts `null` as base uri', function () {
        var a = assetly(null);
        expect(a).to.be.a('function');
        expect(a('foo.jpg')).to.be('foo.jpg');
      });


      it('works without params', function () {
        var a = assetly();
        expect(a).to.be.a('function');
        expect(a('foo')).to.be('foo');
      });


      it('appends a filename to a base uri', function () {
        var a = assetly('//base.uri');
        expect(a('filename.ext')).to.be('//base.uri/filename.ext');
      });


      it('handles missing trailing slashes', function () {
        var a = assetly('//base.uri');
        expect(a()).to.be('//base.uri');
        expect(a('path')).to.be('//base.uri/path');
        expect(a('/path')).to.be('//base.uri/path');
        expect(a('/')).to.be('//base.uri/');
        expect(a('')).to.be('//base.uri/');
      });
    });


    describe('querystrings', function () {
      var a;

      before(function () {
        a = assetly('//base.uri', {v : 1});
      });


      it('allows defining base querystrings', function () {
        expect(a()).to.be('//base.uri?v=1');
        expect(a('path')).to.be('//base.uri/path?v=1');
      });


      it('extends base querystrings on calls', function () {
        expect(a('path', {q : 'foo'})).to.be('//base.uri/path?v=1&q=foo');
        expect(a('path', {v : 2})).to.be('//base.uri/path?v=2');
      });


      it('sets an empty string to null querystring properties', function () {
        expect(a('path', {a : null})).to.be('//base.uri/path?v=1&a=');
      });


      it('inherits parent\'s querystrings', function () {
        a.provides('foo', 'f', {w : 2});
        expect(a.foo()).to.be('//base.uri/f?v=1&w=2');
      });


      it('won\'t show undefined querystring properties', function () {
        expect(a('path', {v : undefined})).to.be('//base.uri/path');
      });


      it('works with stringified querystrings', function () {
        var b = assetly('foo', 'v=1');
        b.provides('bar', 'bar', {v : 2});
        expect(b()).to.be('foo?v=1');
        expect(b.bar()).to.be('foo/bar?v=2');
        expect(b.bar('baz', 'v=3')).to.be('foo/bar/baz?v=3');
      });
    });


    describe('chaining', function () {
      var a;

      before(function () {
        a = assetly('//base.uri').provides('sub');
      });


      it('allows setting a chain of assetly functions', function () {
        expect(a).to.be.a('function');
        expect(a).to.have.property('sub');
        expect(a.sub).to.be.a('function');
      });


      it('concatenates all base uris along the chain', function () {
        expect(a.sub()).not.to.be('sub');
        expect(a.sub()).to.be('//base.uri/sub');
      });


      it('appends a filename to the concatenated base uri', function () {
        expect(a.sub('test.ext')).to.be('//base.uri/sub/test.ext');
      });


      describe('#provides()', function () {
        it('is accessible', function () {
          expect(a.provides).not.to.be(undefined);
        });

        it('is a function', function () {
          expect(a.provides).to.be.a('function');
        });

        it('sets a sub-builder', function () {
          expect(a).not.to.have.property('foo');
          a.provides('foo');
          expect(a).to.have.property('foo');
          expect(a.foo).to.be.a('function');
          expect(a.foo()).to.be('//base.uri/foo');
        });


        it('uses the sub-builder\'s name if the second argument is omitted',
          function () {
            // a.foo was defined in the previous test
            expect(a.foo()).to.be('//base.uri/foo');
          });


        it('accepts an optional path param', function () {
          a.provides('bar', 'b');
          expect(a.bar()).to.be('//base.uri/b');
        });


        it('accepts an optional querystring param', function () {
          a.provides('baz', null, {v : 1});
          expect(a.baz()).to.be('//base.uri?v=1');
          expect(a.baz('file.ext')).to.be('//base.uri/file.ext?v=1');
        });


        it('allows the path param to be an assetly object', function () {
          var hoo = assetly('hoopath', {w : 2});
          a.provides('woo', null, {v : 1});
          a.woo.provides('hoo', hoo);
          expect(a.woo.hoo()).to.be('//base.uri/hoopath?v=1&w=2');
        });
      });
    });


    describe('#express()', function () {
      var a;

      before(function () {
        a = assetly('//base.uri');
      });


      it('is accessible', function () {
        expect(a.express).not.to.be(undefined);
      });


      it('is a function', function () {
        expect(a.express).to.be.a('function');
      });


      it('defines the `assets` property in the express application',
        function () {
          var app = express();
          expect(app).not.to.have.property('assets');
          a.express(app);
          expect(app).to.have.property('assets');
          expect(app.assets).to.be(a);
        });


      it('defines the `assets` property in application\'s locals',
        function () {
          var app = express();
          expect(app.locals).not.to.have.property('assets');
          a.express(app);
          expect(app.locals).to.have.property('assets');
          expect(app.locals.assets).to.be(a);
        });


      it('allows the property name to be changed through the options hash',
        function () {
          var app = express();
          expect(app).not.to.have.property('static');
          expect(app.locals).not.to.have.property('static');

          a.express(app, {propertyName : 'static'});

          expect(app).to.have.property('static');
          expect(app.locals).to.have.property('static');
          expect(app.static).to.be(a);
          expect(app.locals.static).to.be(a);

          expect(app).not.to.have.property('assets');
          expect(app.locals).not.to.have.property('assets');
        });
    });
  });
})();
