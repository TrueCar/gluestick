export default {
  development: {
    assetPath: "http://localhost:8888/assets"
  },
  production: {
    // This should be a CDN in development
    assetPath: process.env.ASSET_URL || "http://localhost:8888/assets"
  }
}

