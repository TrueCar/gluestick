import zlib from "zlib";
import { Readable } from "stream";
import DoctypeStream from "./DoctypeStream";

export default function streamResponse (req, res, {status, docType, responseString, responseStream}, R=Readable/*included for test mock*/, z=zlib/* included for test mock*/) {
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const other = {
    "Content-Type": "text/html; charset=utf-8"
  };

  if (!responseStream) {
    responseStream = new R();
    responseStream.setEncoding("utf8");
    responseStream.push(responseString);
    responseStream.push(null);
  }

  const doctypeStream = new DoctypeStream(docType);
  const head = {...other};
  let outputStream = responseStream.pipe(doctypeStream);
  if (acceptEncoding.match(/\bgzip\b/)) {
    head["Content-Encoding"] = "gzip";
    outputStream = outputStream.pipe(z.createGzip());
  }
  else if (acceptEncoding.match(/\bdeflate\b/)) {
    head["Content-Encoding"] = "deflate";
    outputStream = outputStream.pipe(z.createDeflate());
  }

  res.writeHead(status, head);
  outputStream.pipe(res);
}

