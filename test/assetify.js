var expect = require('expect.js')
  , express = require('express')
  , assetify = require('../');



describe('assetify', function () {

  it('is accessible', function () {
    expect(assetify).not.to.be(undefined);
  });


  it('is a function', function () {
    expect(assetify).to.be.a('function');
  });


  it('allows baseUri to be null', function () {
    var a = assetify(null);
    expect(a('foo.txt')).to.be('foo.txt');

    var a = assetify('//foo.bar', {
      baz : assetify(null)
    });
    expect(a.baz('/foo.txt')).to.be('//foo.bar/foo.txt');
  });


  describe('returned value', function () {
    it('is a function', function () {
      var a = assetify('//foo.bar');
      expect(a).to.be.a('function');
    });

    
    it('returns a URI', function () {
      var a = assetify('//foo.bar');
      expect(a('/baz.txt')).to.be('//foo.bar/baz.txt');
    });


    it('accepts querystring values', function () {
      var a = assetify('//foo.bar');
      expect(a('/baz.txt', {v : 1})).to.be('//foo.bar/baz.txt?v=1');
    });


    it('extends base querystring values', function () {
      var a = assetify(['//foo.bar', {v : 1}]);
      expect(a('/baz.txt', {q : 'foobar'})).to.be('//foo.bar/baz.txt?v=1&q=foobar');
      expect(a('/baz.txt', {v : 2})).to.be('//foo.bar/baz.txt?v=2');
    });
  }); // returned value


  describe('sub-assets', function () {
    it('registers sub-assets', function () {
      var a = assetify('//foo.bar', {
        baz : assetify('/baz')
      });

      expect(a.baz).not.to.be(undefined);
      expect(a.baz).to.be.a('function');
    });


    it('extends the base assetify URI', function () {
      var a = assetify('//foo.bar', {
        baz : assetify('/baz')
      });

      expect(a.baz.base).to.be('//foo.bar/baz');
      expect(a.baz('/foo.txt')).to.be('//foo.bar/baz/foo.txt');
    });
  }); // sub-assets
}); // assetify


describe('assetify.setup', function () {
  it('is accessible', function () {
    expect(assetify.setup).not.to.be(undefined);
  });


  it('is a function', function () {
    expect(assetify.setup).to.be.a('function');
  });


  it('defines the "assets" property in an express app', function () {
    var app = express();

    assetify.setup(app, assetify('//foo.bar'));
    expect(app).to.have.property('assets');
    expect(app.assets).not.to.be(undefined);
    expect(app.assets).to.be.a('function');
  });


  it('adds assets to app locals', function () {
    var app = express();
    assetify.setup(app, assetify('//foo.bar'));
    expect(app.locals).to.have.property('assets');
    expect(app.locals.assets).to.be(app.assets);
  });

}); // assetify.setup

