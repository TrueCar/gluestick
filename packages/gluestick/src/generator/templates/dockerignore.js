module.exports = (createTemplate) => {
  const template = createTemplate`
    node_modules #required for gluestick dockerizing, DO NOT REMOVE
    .git
    .gitignore
  `;
  return template;
};

