import React from 'react';
import { StyleRoot } from 'radium';

const plugin = (component, rootWrapperOptions) => {
  return (
    <StyleRoot radiumConfig={{ userAgent: rootWrapperOptions.userAgent }}>
      {component}
    </StyleRoot>
  );
};

const meta = { wrapper: true };

export default {
  meta,
  plugin,
};
