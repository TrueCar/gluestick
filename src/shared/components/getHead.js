import React, { Component } from "react";
import serialize from "serialize-javascript";

export default (config) => {
  return [
    <link key={0} rel="stylesheet" type="text/css" href={`${config.assetPath}/main.css`} />,
    <script type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__GS_ENVIRONMENT__ = ${serialize(process.env.NODE_ENV)}`}}></script>
  ];
};

