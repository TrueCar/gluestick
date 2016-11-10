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

  const scriptPaths = {
    vendor: getAssetPathForFile("vendor", "javascript"),
    entryPoint: getAssetPathForFile(entryPoint, "javascript")
  };

  tags.push(headContent);

  tags.push(getScriptLoader(scriptPaths));

  return tags;
};

function getScriptLoader ({vendor, entryPoint}:Object) {
  // eslint-disable-next-line quotes
  const scriptLoader = `
    loadjs=function(){function n(n,e){n=n.push?n:[n];var t,r,o,c,i=[],s=n.length,h=s;for(t=function(n,t){t.length&&i.push(n),h--,h||e(i)};s--;)r=n[s],o=u[r],o?t(r,o):(c=f[r]=f[r]||[],c.push(t))}function e(n,e){if(n){var t=f[n];if(u[n]=e,t)for(;t.length;)t[0](n,e),t.splice(0,1)}}function t(n,e,t){var r,o,c=document;/\.css$/.test(n)?(r=!0,o=c.createElement("link"),o.rel="stylesheet",o.href=n):(o=c.createElement("script"),o.src=n,o.async=void 0===t||t),o.onload=o.onerror=o.onbeforeload=function(t){var c=t.type[0];if(r&&"hideFocus"in o)try{o.sheet.cssText.length||(c="e")}catch(n){c="e"}e(n,c,t.defaultPrevented)},c.head.appendChild(o)}function r(n,e,r){n=n.push?n:[n];var o,c,i=n.length,u=i,f=[];for(o=function(n,t,r){if("e"==t&&f.push(n),"b"==t){if(!r)return;f.push(n)}i--,i||e(f)},c=0;c<u;c++)t(n[c],o,r)}function o(n,t,o){var u,f;if(t&&t.trim&&(u=t),f=(u?o:t)||{},u){if(u in i)throw new Error("LoadJS");i[u]=!0}r(n,function(n){n.length?(f.error||c)(n):(f.success||c)(),e(u,n)},f.async)}var c=function(){},i={},u={},f={};return o.ready=function(e,t){return n(e,function(n){n.length?(t.error||c)(n):(t.success||c)()}),o},o.done=function(n){e(n,[])},o}();
    loadjs(["${vendor}"], "vendor");
    var loadEntryPoint = function() {
      loadjs(["${entryPoint}"], {
        success: function() { window.__startGSApp(); },
        error: function() { throw new Error("Failed to load ${entryPoint}"); }
      });
    };
    document.addEventListener("DOMContentLoaded", function() {
      loadjs.ready("vendor", {
        success: loadEntryPoint,
        error: function() {
          // retry once for vendor bundle failures
          loadjs(["${vendor}"], {
            success: loadEntryPoint,
            error: function() { throw new Error("Failed to load ${vendor}"); }
          });
        }
      });
    });
  `;
  return <script key="script-loader" type="text/javascript" dangerouslySetInnerHTML={{__html: scriptLoader}} />;
}
