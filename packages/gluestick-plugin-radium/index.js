import React from 'react';
import { StyleRoot } from 'radium';

const wrapper = (component, rootWrapperOptions) => {
  return (
    <StyleRoot
      radiumConfig={{ userAgent: rootWrapperOptions.userAgent }}
    >
      {component}
    </StyleRoot>
  );
};

wrapper.meta = { type: 'runtime' };

export default wrapper;
