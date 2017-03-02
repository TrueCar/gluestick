import React from 'react';
import { StyleRoot } from 'radium';

export default (component, rootWrapperOptions) => {
  return (
    <StyleRoot
      radiumConfig={{ userAgent: rootWrapperOptions.userAgent }}
    >
      {component}
    </StyleRoot>
  );
};
