// WARNING: The contents of this file _including process.env variables_ will be
// exposed in the client code.
const config = {
  development: {
    assetPath: "http://localhost:8888/assets"
  },
  production: {
    // This should be a CDN in development
    assetPath: process.env.ASSET_URL || "http://localhost:8888/assets"
  }
};

export default (config[process.env.NODE_ENV] || config["development"])

