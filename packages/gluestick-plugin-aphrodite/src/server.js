import { StyleSheetServer } from 'aphrodite';
import { renderToString } from 'react-dom/server';
import React from 'react';

const aphroditePlugin = () => ({
  renderMethod: root => {
    const { css, html } = StyleSheetServer.renderStatic(() => {
      return renderToString(root);
    });
    const styles = () =>
      <style
        key="aphrodite-styles"
        data-aphrodite
        dangerouslySetInnerHTML={{ __html: css.content }}
      />;
    const rehydrate = `window.renderedClassNames = ${JSON.stringify(
      css.renderedClassNames,
    )};`;
    const additionalScript = [
      // eslint-disable-next-line react/no-danger
      <script
        key="aphrodite-rehydrate"
        dangerouslySetInnerHTML={{ __html: rehydrate }}
      />,
    ];
    return { body: html, styles, additionalScript };
  },
});

aphroditePlugin.meta = { name: 'gluestick-plugin-aphrodite' };

export default aphroditePlugin;
