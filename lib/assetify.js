var _ = require('underscore')
  , querystring = require('querystring');


/**
 * Retorna uma função que gera a url para o arquivo estático.
 *
 * @param {string} baseUri A base para as URIs retornadas pela função.
 * @param {object=} opt_baseQuery Um objeto que servirá de base para criar
 *    a querystring que será anexada à URI.
 *
 * @return {function(path:string, query:object):string} Retorna uma função que recebe um
 *    path e uma query como parâmetro e retorna a URI absoluta para o arquivo estático
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
 * Cria uma função para gerar URIs para arquivos com uma URL base e
 * registra sub-funções, utilizadas para criar URIs para sub-diretórios
 * da URL base.
 *
 * A diferença entre utilizar sub-funções ao invés de passar os sub-
 * diretórios no path do arquivo é que as sub-funções permitem uma
 * estrutura diferente para ambiente de desenvolvimento e de produção,
 * além de facilitar no caso de estruturas de diretórios de diversos
 * níveis, como "css/0.1/dev/main.css", por exemplo.
 *
 * @param {string} baseUri A URI base para os assets criados pela função
 *    retornada ou o path anexado à baseUri no caso de sub-funções.
 * @param {object=} opt_subAssets Objeto descrevendo sub-funções que
 *    retornam URIs para sub-diretórios da baseUri.
 *
 * @return {function} Função retornada por {@code getUriBuilder()},
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
 * Registra uma função para gerar URIs em uma app do express.
 *
 * @param {Application} app Applicação do Express.js para a qual as URIs devem
 *    ser geradas.
 * @param {function} assetsObj Objeto (uma function, na verdade) retornado
 *    por {@code assets}, o qual será registrado na app.
 */
assetify.setup = function (app, assetsObj) {
  app.assets = app.locals.assets = assetsObj;
};
