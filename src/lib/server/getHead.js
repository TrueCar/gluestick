/*eslint-disable react/no-danger*/
import React from "react";
import serialize from "serialize-javascript";
import process from "process";
import getAssetPath from "../getAssetPath";
import getAssetPathForFile from "../getAssetPathForFile";

const isProduction = process.env.NODE_ENV === "production";

// eslint-disable-next-line no-unused-vars
export default (config, entryPoint, headContent, assets) => {
  const tags = [];
  let key = 0;
  const assetPath = getAssetPath(config);

  if (isProduction) {
    tags.push(<link key={key++} rel="stylesheet" type="text/css" href={getAssetPathForFile(`${entryPoint}`, "styles")} />);
  }

  tags.push(
    <script key={key++} type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__GS_PUBLIC_PATH__ = ${serialize(assetPath)}; window.__GS_ENVIRONMENT__ = ${serialize(process.env.NODE_ENV)}`}}></script>
  );
  const loadjsDefault = {before: () => { }};
  const scriptPaths = {
    vendor: getAssetPathForFile("vendor", "javascript"),
    entryPoint: getAssetPathForFile(entryPoint, "javascript"),
    loadjsConfig: Object.assign(loadjsDefault, config.server.loadjs)
  };

  tags.push(headContent);

  tags.push(getScriptLoader(scriptPaths));

  return tags;
};

function getScriptLoader ({vendor, entryPoint, loadjsConfig}:Object) {
  // eslint-disable-next-line quotes
  const scriptLoader = `
    var config = ${serialize(loadjsConfig)};
    loadjs=loadjs=function(){function e(e,n){e=e.push?e:[e];var t,r,o,i,c=[],s=e.length,h=s;for(t=function(e,t){t.length&&c.push(e),h--,h||n(c)};s--;)r=e[s],o=u[r],o?t(r,o):(i=f[r]=f[r]||[],i.push(t))}function n(e,n){if(e){var t=f[e];if(u[e]=n,t)for(;t.length;)t[0](e,n),t.splice(0,1)}}function t(e,n,r,o){var c,u,f=document,s=r.async,h=(r.numRetries||0)+1,a=r.before||i;o=o||0,/\.css$/.test(e)?(c=!0,u=f.createElement("link"),u.rel="stylesheet",u.href=e):(u=f.createElement("script"),u.src=e,u.async=void 0===s||s),u.onload=u.onerror=u.onbeforeload=function(i){var f=i.type[0];if(c&&"hideFocus"in u)try{u.sheet.cssText.length||(f="e")}catch(e){f="e"}return"e"==f&&(o+=1,o<h)?t(e,n,r,o):void n(e,f,i.defaultPrevented)},a(e,u),f.head.appendChild(u)}function r(e,n,r){e=e.push?e:[e];var o,i,c=e.length,u=c,f=[];for(o=function(e,t,r){if("e"==t&&f.push(e),"b"==t){if(!r)return;f.push(e)}c--,c||n(f)},i=0;i<u;i++)t(e[i],o,r)}function o(e,t,o){var u,f;if(t&&t.trim&&(u=t),f=(u?o:t)||{},u){if(u in c)throw new Error("LoadJS");c[u]=!0}r(e,function(e){e.length?(f.error||i)(e):(f.success||i)(),n(u,e)},f)}var i=function(){},c={},u={},f={};return o.ready=function(n,t){return e(n,function(e){e.length?(t.error||i)(e):(t.success||i)()}),o},o.done=function(e){n(e,[])},o}();

    var loadEntryPoint = function() {
      loadjs("${entryPoint}", {
        before: config.before,
        error: function() { throw new Error("Failed to load ${entryPoint}"); },
        numRetries: 10
      });
    };

    var loadVendorThenEntry = function() {
      loadjs("${vendor}", {
        before: config.before,
        success: loadEntryPoint,
        error: function() { throw new Error("Failed to load ${vendor}"); },
        numRetries: 10
      });
    };

    document.addEventListener("DOMContentLoaded", function() {
      loadVendorThenEntry();
    });
  `;
  return <script key="script-loader" type="text/javascript" dangerouslySetInnerHTML={{__html: scriptLoader}} />;
}
