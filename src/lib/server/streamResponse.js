import zlib from "zlib";

export default function streamResponse (req, res, {status, responseStream}, z=zlib/* included for test mock*/) {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  if (acceptEncoding.match(/\bdeflate\b/)) {
    res.writeHead(status, {"Content-Encoding": "deflate"});
    responseStream.pipe(z.createDeflate()).pipe(res);
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    res.writeHead(status, {"Content-Encoding": "gzip"});
    responseStream.pipe(z.createGzip()).pipe(res);
  }
  else {
    res.writeHead(status, {});
    responseStream.pipe(res);
  }
}

