/**
 * @fileoverview Defines the assetly function for creating URI builders
 *  for handling assets' paths during development.
 * @see {@link http://github.com/mkretschek/node-assetly|Assetify}
 * @author Mathias Kretschek <mathias@kretschek.com.br>
 */
var _ = require('underscore'),
  querystring = require('querystring');


(function () {
  'use strict';

  var proto, configExpressOptions;


  /**
   * Prototype for meta objects used to store data used by the URI
   * builders.
   */
  proto = {
    /**
     * Builder's name. Used only when extending a builder with
     * sub-builders.
     * @type {string|null}
     */
    name : null,

    /**
     * Builder's base path. Defines the path difference between the
     * builder the meta object belongs to and its parent.
     * @type {string|null}
     */
    base : null,

    /**
     * Data used to create the querystring portion for this builder.
     * @type {object|null}
     */
    query : null,

    /**
     * Complete path for this builder. A complete path means a string
     * containing the base of all parent builders, from the current all
     * the way up to the root builder.
     * @type {string|null}
     */
    path : null
  };

  
  /**
   * Default options for the `express` configuration function.
   * @type {object}
   */
  configExpressOptions = {
    /**
     * The name of the property to be added to the `express` application
     * and its `locals` object.
     * @type {string}
     */
    propertyName : 'assets'
  };


  /**
   * Creates a meta object for a builder.
   *
   * @param {object=} parent This meta's parent meta object.
   * @param {string=} name Builder's name. Required only for sub-builders.
   * @param {string=} base Builder's base path.
   * @param {string|object=} query Builder's querystring data.
   *
   * @return {object} A meta object for a builder.
   */
  function createMeta(parent, name, base, query) {
    var meta, path;

    if (base === undefined) { base = name; }
    else if (typeof base === 'string' && base.slice(-1) === '/') {
      base = base.slice(0, -1);
    }

    query = getQuery(parent, query);
    path = getPath(parent, base);

    meta = Object.create(proto);
    if (name) { meta.name = name; }
    if (base) { meta.base = base; }
    if (path) { meta.path = path; }
    if (query) { meta.query = query; }

    return meta;
  }


  /**
   * Gets the full path for a builder.
   *
   * @param {object=} parent Builder parent's meta object.
   * @param {string=} base Builder's base path.
   *
   * @return {string} Builder's full path.
   */
  function getPath(parent, base) {
    if (parent && parent.path) {
      return base ? parent.path + '/' + base : parent.path;
    }
    return base;
  }


  /**
   * Gets a complete query object, inheriting all values from parent
   * builders.
   *
   * IMPORTANT: this copies values from parent builders over to a new
   * object. Changes to the parent querystring values will not be available
   * to sub-builders.
   *
   * @param {object=} parent Builder parent's meta object.
   * @param {string|object=} query Builder's querystring data.
   *
   * @return {object} Builders complete querystring object.
   */
  function getQuery(parent, query) {
    if (typeof query === 'string') {
      if (query[0] === '?') { query = query.slice(1); }
      query = querystring.parse(query);
    }

    if (parent && parent.query) {
      query = query ?
        _.extend({}, parent.query, query) :
        parent.query;
    }

    return query;
  }


  /**
   * Creates the builder function.
   *
   * @param {object} meta Builder's meta data object as returned by
   *  {@code createMeta()}.
   *
   * @return {function} A builder function.
   */
  function createBuilder(meta) {
    var builder;
    builder = buildUri.bind(null, meta);
    builder.meta_ = meta;
    builder.provides = addExtension.bind(null, meta, builder);
    return builder;
  }


  /**
   * Builds a complete URI for a builder.
   *
   * @param {object} meta Builder's meta data.
   * @param {string=} filename The filename to be appended to the
   *  builder's full path.
   * @param {string|object=} query Querystring data for the URI.
   *
   * @return {string} A complete URI for the asset.
   */
  function buildUri(meta, filename, query) {
    var uri = '',
      qs = {};

    if (meta.path) { uri += meta.path; }

    if (filename === null) { filename = ''; }
    if (filename !== undefined) {
      if (filename && filename[0] === '/') {
        filename = filename.slice(1);
      }
      uri += (uri ? '/' : '') + filename;
    }

    if (meta.query) { _.extend(qs, meta.query); }

    if (query) {
      if (typeof query === 'string') {
        if (query[0] === '?') { query = query.slice(1); }
        query = querystring.parse(query);
      }
      _.extend(qs, query);
    }

    removeUndefined(qs);
    qs = querystring.stringify(qs);
    if (qs) { uri += '?' + qs; }

    return uri;
  }


  // TODO: since we keep a reference to the meta data in the builder
  // itself, we could remove the first argument for this function. In this
  // case, maybe we should consider only to pass the builder arround in
  // all function.
  /**
   * Extends a specific builder with the given sub-builder. Sub-builders
   * allow to build deeper URIs.
   *
   * @param {object} parentMeta Parent builder's meta object.
   * @param {function} parentBuilder Parent builder function.
   * @param {string} name Sub-builder's name.
   * @param {string=} base Sub-builder's base path.
   * @param {string|object=} query Builder's querystring data.
   *
   * @return {function} The parent builder function itself, allowing to
   *  chain multiple calls to the {@code .provides()} method.
   */
  function addExtension(parentMeta, parentBuilder, name, base, query) {
    var builder, meta, baseType;

    baseType = typeof base;

    if ((baseType === 'object' && base !== null) ||
        (baseType === 'string' && ~base.indexOf('='))) {
      query = base;
      base = undefined;
    }

    if (baseType === 'string' || !base) {
      meta = createMeta(parentMeta, name, base, query);
      builder = createBuilder(meta);
    } else if (baseType === 'function' && base.meta_) {
      builder = base;
      builder.meta_.path = getPath(parentMeta, builder.meta_.base);
      builder.meta_.query = getQuery(parentMeta, builder.meta_.query);
    }

    parentBuilder[name] = builder;
    return parentBuilder; // allow chaining
  }


  /**
   * Creates a root builder.
   *
   * @param {string|array=} base The base path for the builder. Usually
   *  this is the base URI for your assets. If an array is given, the
   *  first element should be a string, while the second a string or
   *  object containing querystring data passed to all sub-builders.
   *
   * @param {string|object=} query Querystring data for the builder.
   *
   * @return {function} A builder function.
   */
  function assetly(base, query) {
    var builder, meta;
    if ((typeof base === 'object' && base !== null) ||
        (typeof base === 'string' && ~base.indexOf('='))) {
      query = base;
      base = undefined;
    }
    meta = createMeta(null, null, base, query);
    builder = createBuilder(meta);
    builder.express = configExpress.bind(null, builder);
    return builder;
  }


  /**
   * Configures an {@code express} application adding the given builder
   * to a property in the application object and its locals.
   *
   * @param {function} builder The builder to be attached to the express
   *  app.
   * @param {object} app Express app to be configured.
   * @param {object} options Options regarding the application
   *  configuration. Currently only one option is supported:
   *    * parameterName {string}: defines the parameter to be used to
   *        store the builder function in the application object and in
   *        {@code application.locals}.
   */
  function configExpress(builder, app, options) {
    options = options ?
      _.extend({}, configExpressOptions, options) :
      configExpressOptions;
    app[options.propertyName] = builder;
    app.locals[options.propertyName] = builder;
  }


  /**
   * Deletes properties set to {@code undefined} from the given object.
   * Changes are made in place.
   *
   * @param {object} obj The object to be filtered.
   * @return {object} The filtered object.
   */
  function removeUndefined(obj) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] === undefined) {
          delete obj[key];
        }
      }
    }
    return obj;
  }


  module.exports = assetly;
})();
