var _ = require('underscore')
  , querystring = require('querystring');


/**
 * Retorna uma fun��o que gera a url para o arquivo est�tico.
 *
 * @param {string} baseUri A base para as URIs retornadas pela fun��o.
 * @param {object=} opt_baseQuery Um objeto que servir� de base para criar
 *    a querystring que ser� anexada � URI.
 *
 * @return {function(path:string, query:object):string} Retorna uma fun��o que recebe um
 *    path e uma query como par�metro e retorna a URI absoluta para o arquivo est�tico
 *    solicitado.
 */
function getUriBuilder(baseUri, opt_baseQuery) {
  function builder(opt_path, opt_query) {
    var uri = builder.base;
    uri += opt_path || '';

    var query;
    if (builder.query)
      query = opt_query ? _.extend({}, builder.query, opt_query) : builder.query;
    else if (opt_query)
      query = opt_query;

    if (query) uri += '?' + querystring.stringify(query);

    return uri;
  };

  builder.base = baseUri;
  builder.query = opt_baseQuery;

  return builder;
};


/**
 * Cria uma fun��o para gerar URIs para arquivos com uma URL base e
 * registra sub-fun��es, utilizadas para criar URIs para sub-diret�rios
 * da URL base.
 *
 * A diferen�a entre utilizar sub-fun��es ao inv�s de passar os sub-
 * diret�rios no path do arquivo � que as sub-fun��es permitem uma
 * estrutura diferente para ambiente de desenvolvimento e de produ��o,
 * al�m de facilitar no caso de estruturas de diret�rios de diversos
 * n�veis, como "css/0.1/dev/main.css", por exemplo.
 *
 * @param {string} baseUri A URI base para os assets criados pela fun��o
 *    retornada ou o path anexado � baseUri no caso de sub-fun��es.
 * @param {object=} opt_subAssets Objeto descrevendo sub-fun��es que
 *    retornam URIs para sub-diret�rios da baseUri.
 *
 * @return {function} Fun��o retornada por {@code getUriBuilder()},
 *
 * @module
 */
var assetify = module.exports = function (baseUri, opt_subAssets) {
  var subAssets, version;

  baseUri = baseUri || ''; // baseUri pode ser null

  if (_.isNumber(opt_subAssets)) {
    version = opt_subAssets;
    baseUri = baseUri + '/' + version;
  } else if (_.isObject(opt_subAssets)) subAssets = opt_subAssets;

  var builder = Array.isArray(baseUri) ?
    getUriBuilder.apply(null, baseUri) :
    getUriBuilder(baseUri);

  if (subAssets) {
    _.each(opt_subAssets, function (sub, key) {
      sub.base = builder.base + sub.base;
      builder[key] = sub;
    });
  }

  return builder;
}
  

/**
 * Registra uma fun��o para gerar URIs em uma app do express.
 *
 * @param {Application} app Applica��o do Express.js para a qual as URIs devem
 *    ser geradas.
 * @param {function} assetsObj Objeto (uma function, na verdade) retornado
 *    por {@code assets}, o qual ser� registrado na app.
 */
assetify.setup = function (app, assetsObj) {
  app.assets = app.locals.assets = assetsObj;
};
