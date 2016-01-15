import React, { Component } from "react";

export default (config) => {
  return [
    <link key={0} rel="stylesheet" type="text/css" href={`${config.assetPath}/main.css`} />
  ];
};

