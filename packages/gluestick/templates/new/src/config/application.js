// WARNING: The contents of this file _including process.env variables_ will be
// exposed in the client code.

const headContent = {
  title: "My Gluestick App",
  titleTemplate: "%s | Gluestick Application",
  meta: [
    {name: "description", content: "Gluestick application"}
  ]
};

const config = {
  development: {
    assetPath: "/assets",
    head: headContent,
    logger: {
      pretty: true,
      level: "info"
    }
  },
  production: {
    // This should be a CDN in development
    assetPath: process.env.ASSET_URL || "/assets",
    head: headContent,
    logger: {
      pretty: false,
      level: "warn"
    }
  }
};

export default (config[process.env.NODE_ENV] || config["development"]);

