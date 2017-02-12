const React = require('react');
const { RouterContext } = require('react-router');
const { renderToString, renderToStaticMarkup } = require('react-dom/server');

module.exports = async (
  { config, logger },
  req,
  { EntryPoint, store, routes },
  renderProps,
  entryWrapperConfig,
  envVariables,
  { EntryWrapper, BodyWrapper },
) => {
  const routerContext = <RouterContext {...renderProps} />;
  const entryWrapper = (
    <EntryWrapper
      store={store}
      routerContext={routerContext}
      config={entryWrapperConfig}
      getRoutes={routes}
    />
  );

  // grab the react generated body stuff. This includes the
  // script tag that hooks up the client side react code.
  const currentState = store.getState();

  const bodyWrapperContent = renderToString(entryWrapper);

  const bodyWrapper = (
    <BodyWrapper
      html={bodyWrapperContent}
      initialState={currentState}
      isEmail={false}
      envVariables={envVariables}
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
  const rootElement = <EntryPoint body={bodyWrapper} head={null} req={req} />;

  const responseString = renderToStaticMarkup(rootElement);
  return {
    responseString,

    // The following is returned for testing
    rootElement,
  };
};
