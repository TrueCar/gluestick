import { Transform } from "stream";

class DoctypeStream extends Transform {
  constructor (doctype) {
    super();
    this.doctype = doctype;
    this.started = false;
  }

  _transform (chunk, enc, cb) {
    if (!this.started) {
      this.push(Buffer.from(this.doctype, "utf8"));
      this.started = true;
    }

    this.push(chunk);
    cb();
  }
}

export default DoctypeStream;
