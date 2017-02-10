const renderToStaticMarkup = require('react-dom/server').renderToStaticMarkup;
const React = require('react');

export default ({ Component, reducer, routes }) => {
  const componentToRender = <Component />;
  return (renderToStaticMarkup(componentToRender));
};
