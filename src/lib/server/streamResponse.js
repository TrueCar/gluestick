import zlib from "zlib";

export default function streamResponse (req, res, {status, responseStream}, z=zlib/* included for test mock*/) {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const other = {
    "Content-Type": "text/html; charset=utf-8"
  };
  if (acceptEncoding.match(/\bdeflate\b/)) {
    res.writeHead(status, {"Content-Encoding": "deflate", ...other});
    responseStream.pipe(z.createDeflate()).pipe(res);
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    res.writeHead(status, {"Content-Encoding": "gzip", ...other});
    responseStream.pipe(z.createGzip()).pipe(res);
  }
  else {
    res.writeHead(status, {...other});
    responseStream.pipe(res);
  }
}

