import { StyleSheetServer } from 'aphrodite';
import { renderToString } from 'react-dom/server';
import React from 'react';

export default (/*options, { logger }*/) => ({
  renderMethod: (root) => {
    const { css, html } = StyleSheetServer.renderStatic(() => {
      return renderToString(root);
    });
    const head = [<style key="aphrodite-styles" data-aphrodite>{`${css.content}`}</style>];
    const rehydrate = `window.renderedClassNames = ${JSON.stringify(css.renderedClassNames)};`;
    const additionalScript = [(<script key="aphrodite-rehydrate" dangerouslySetInnerHTML={{ __html: rehydrate }} />)];
    return { body: html, head, additionalScript };
  },
});
