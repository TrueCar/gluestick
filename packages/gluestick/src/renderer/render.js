const React = require('react');
const { RouterContext } = require('react-router');
const Oy = require('oy-vey');
const { renderToString, renderToStaticMarkup } = require('react-dom/server');
const linkAssets = require('./helpers/linkAssets');

module.exports = async (
  { config, logger },
  req,
  { EntryPoint, entryName, store, routes },
  renderProps,
  entryWrapperConfig,
  envVariables,
  { EntryWrapper, BodyWrapper },
  assets,
  httpClient,
  cacheManager,
  currentRoute,
) => {
  const { styleTags, scriptTags } = linkAssets(config, entryName, assets);
  const isEmail = currentRoute.email || false;
  const routerContext = <RouterContext {...renderProps} />;
  const entryWrapper = (
    <EntryWrapper
      store={store}
      routerContext={routerContext}
      config={entryWrapperConfig}
      getRoutes={routes}
      httpClient={httpClient}
    />
  );

  // grab the react generated body stuff. This includes the
  // script tag that hooks up the client side react code.
  const currentState = store.getState();

  const bodyWrapperContent = isEmail ?
    renderToStaticMarkup(entryWrapper) : renderToString(entryWrapper);

  const bodyWrapper = (
    <BodyWrapper
      html={bodyWrapperContent}
      initialState={currentState}
      isEmail={isEmail}
      envVariables={envVariables}
      scriptTags={scriptTags}
    />
  );

  // const head =
  //   isEmail
  //     ? headContent : getHead(config, fileName, headContent, _webpackIsomorphicTools.assets());

  // Grab the html from the project which is stored in the root
  // folder named Index.js. Pass the body and the head to that
  // component. `head` includes stuff that we want the server to
  // always add inside the <head> tag.
  //
  // Bundle it all up into a string, add the doctype and deliver
  const rootElement = <EntryPoint body={bodyWrapper} head={styleTags} req={req} />;

  let responseString;
  if (isEmail) {
    const generateCustomTemplate = ({ bodyContent }) => { return `${bodyContent}`; };
    responseString = Oy.renderTemplate(rootElement, {}, generateCustomTemplate);
  } else {
    responseString = renderToStaticMarkup(rootElement);
  }

  cacheManager.setCacheIfProd(req, responseString);
  return {
    responseString,

    // The following is returned for testing
    rootElement,
  };
};
