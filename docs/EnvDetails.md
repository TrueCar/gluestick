# Environment details

## Deployment & Production
To run a gluestick application in production mode, simple set `NODE_ENV`
envrionment variable to `production`.
For example: `NODE_ENV=production gluestick start`

GlueStick will serve assets for you in production mode but it is recommended
you serve assets from a Content Delivery Network. To do that, simply run
`gluestick build` and it will generate a folder named `build` in your project
root. This folder will contain all of the assets needed to run your app.

Finally, you need to update your application config file
(src/config/application.js) to define the asset path for production.  You can hardcode the value or you can just use the `ASSET_URL` environment variable to specify the base uri of your production assets.

## Hot Loading
GlueStick's development environment utilizing hot loading so your changes will
show up in the browser as you go. This is sort of experimental but it works
great most of the time. However, sometimes you will still need to refresh the
browser for certain changes.

### Port Overriding
If you need to override the port in production, just set the environment variable `PORT` to whatever you need it to be.
