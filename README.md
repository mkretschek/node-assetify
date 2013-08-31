node-assetly
=============

Utilities for working with assets, especially assets' URIs (right now, this
is all it does, heh).

[![Build Status](https://travis-ci.org/mkretschek/node-assetly.png?branch=master)](https://travis-ci.org/mkretschek/node-assetly)
[![NPM version](https://badge.fury.io/js/assetly.png)](http://badge.fury.io/js/assetly)
[![Dependency Status](https://www.versioneye.com/user/projects/52204ed2632bac6ce0002ab9/badge.png)](https://www.versioneye.com/user/projects/52204ed2632bac6ce0002ab9)


If you want an easier way to set your assets' URIs, being able to change
them in a single place, `assetly` may come in handy. It helps creating
builder functions for generating URIs. Like this:

```js
var assets;

assets = assetly('//cdn.example.net')
  .provides('js')
  .provides('css')
  .provides('img');

assets.img.provides('brand', 'b');

assets.express(app);
```

Then in your [jade](http://jade-lang.com) templates you could use:

```jade
html
  head
    title= Example
    script(src=assets.js('main.js'))
    link(type='text/css', rel='stylesheet', href=assets.css('base.css'))
  body
    img(src=assets.img.brand('logo-md.png'), alt='Example')
```

Giving you...

```html
<html>
  <head>
    <title>Example</title>
    <script src="//cdn.example.com/js/main.js"></script>
    <link type="text/css" rel="stylesheet" href="//cdn.example.com/css/base.css" />
  </head>
  <body>
    <img src="//cdn.example.com/img/b/logo-md.png" alt="Example" />
  </body>
</html>
```

Should you ever need to change your assets folders, all you have to do is
change your `assetly` setup.


Installation
------------

From NPM.

    npm install assetly

Usage
-----

Require it.

```js
var assetly = require('assetly');
```

Creating a builder is very straightforward. A simple builder would look
like this:

```js
var assets = assetly('//cdn.example.com');

assets('main.js'); // '//cdn.example.com/main.js'
assets('css/base.css'); // '//cdn.example.com/css/base.css'
```

You can see more complex examples in under "Sub-builders", read on.


### Sub-builders

Usually you'll want to organize your assets in sub-directories or some
file structure. To help you handle this, `assetly` supports sub-builders.
They append to their parent's path, going deeper into your folder
structure.

But it is NOT required that a sub-builder advances to a deeper folder in
your file structure. If you pass `null` as your sub-builder base path, it
will stay in the same folder as its parent.

Note that there's a difference between setting `null` and `undefined` as
your sub-buider's base path: the former will make it use the same path as
its parent, while the later makes the new builder use a folder with the
same name as the builder.

```js
var assets = assetly('//cdn.example.com');

assets
  .provides('scripts', null)     // stays in the same folder
  .provides('styles', 'css')     // advances to the 'css' folder
  .provides('images');           // advances to the 'images' folder

assets.scripts('main.min.js'); // '//cdn.example.com/main.min.js'
assets.styles('base.min.css'); // '//cdn.example.com/css/base.min.css'
assets.images('foo.jpg'); // '//cdn.example.com/img/foo.jpg'
```

You can use sub-builders to set a multi-root structure by starting with a
call to `assetly()` with no args.

```js
assets = assetly();

assets
  .provides('scripts', '//s.example.com')
  .provides('images', '//img.example.com');

assets.scripts('base.js'); // '//s.example.com/base.js'
assets.images('logo.png'); // '//img.example.com/logo.png'
```

Builders can be nested as needed:

```js
var assets = assetly('//example.com');
assets.provides('sub');
assets.sub.provides('subsub');

assets.sub.subsub('subsubsub.txt'); // '//example.com/sub/subsub/subsubsub.txt'
```


### Querystrings

`assetly` allows you to set query string data in your builders. This way
you don't need to set it to every URI and, when a query param changes, you
can update your code very quickly.

```js
var assets = assetly('//cdn.example.com', {v : 1, s : 'm'});

assets('foo.jpg'); // '//cdn.example.com/foo.jpg?v=1&s=m'

// Query data can be updated on a case by case basis.
assets('bar.jpg', {v : 2}); // '//cdn.example.com/bar.jpg?v=2&s=m'

// If you need to unset a previously defined query param, set it to
// undefined.
assets('baz.jpg', {s : undefined}); // '//cdn.example.com/baz.jpg?v=1'
```

Note that query string data defined in the root builder, will be
inheritted by all sub-builders.

```js
var assets = assetly('//cdn.example.com', {v : 1});

// Inherits {v : 1} from assets.
assets.provides('js');
assets.js('main.js'); // '//cdn.example.com/js/main.js?v=1'


// Inherits 'v' from parent and sets new data
assets.provides('css', {min : true});
assets.css('base.css'); // '//cdn.example.com/css/base.css?v=1&min=true'

// Updates 'v'
assets.provides('img', {v : 3});
assets(img('logo.png')); // '//cdn.example.com/img/logo.png?v=3'
```


### express.js

If you are working with [express][], there's a helper method for making
your root builder available to your application and in your templates.

```js
var assets = assetly('//cdn.example.com');

assets.express(app);

app.assets === assets; // true
app.locals.assets === assets; // true
```

Now your builder is available in your templates thanks to the `locals`
object:

```jade
img(src=assets('logo.png'))
```

If you think 'assets' is not a good property, you can change it with the
`propertyName` option of `#express()`:

```js
var assets = assetly('//cdn.example.com');
assets.express(app, {propertyName : 'static'});

app.static === assets; // true
app.locals.static === assets; // true
```

And in your templates:

```jade
img(src=static('logo.png'))
```

Testing
-------

Testing should be as simple as running:

    npm test


Contributing
------------

All contributions are welcome. If you find any bugs or grammar mistakes,
please, [open an issue][issue]. Any kind of help to improve this code or
documentation is greatly appreciated.

Feel free to submit pull requests too, for both code and grammar. I
promess I'll check it as quick as possible (usually in a few days). When 
submitting a patch, please, add your name + contact to the authors
section below.


Authors
-------

Created by [Mathias Kretschek][mathias] ([mkretschek][]).


[express]: https://github.com/visionmedia/express
[issue]: https://github.com/mkretschek/node-assetly/issues
[mathias]: http://mathias.ms
[mkretschek]: https://github.com/mkretschek
