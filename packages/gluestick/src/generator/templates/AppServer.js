module.exports = (createTemplate) => {
  const template = createTemplate`
    export default {
    protocol: "http",
    host: "0.0.0.0",
    port: 8888,
    ssetPort: 8880
  };
  `;
  return template;
};
