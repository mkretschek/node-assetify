
0.1.0 / 2013-08-29
==================

Complete rewrite with significant changes to the API.
First version published to the npm registry.

* add: license;
* add: documentation in the README file;
* add: travis-ci integration;
* add: `#express()` for configuring an express app;
* add: `#provides()` for defining sub-builders. This is a new method
  for defining sub-builders. The previous method is no longer supported;
* changed: `assetled()` signature, now taking a base path and a string or
  object with query string data. It NO LONGER accepts an object defining
  sub-builders;
