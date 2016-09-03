/*global describe it*/
import { expect } from "chai";
import { Writable } from "stream";
import DoctypeStream from "../../../src/lib/server/DoctypeStream";
import fs from "fs";
import path from "path";

class WriteStream extends Writable {
  constructor () {
    super();
    this.data = [];
  }

  _write (chunk, enc, cb) {
    this.data.push(chunk);
    cb();
  }
}

describe("lib/server/DoctypeStream", function () {
  it("should prepend the doctype in a stream", (done) => {
    const readStream = fs.createReadStream(path.join(__dirname, "/DoctypeStream.sample.txt"));
    const writeStream = new WriteStream();

    writeStream.on("finish", function () {
      expect(this.data[0].toString("utf8")).to.equal("<!DOCTYPE html>");
      expect(this.data.join("")).to.contain("<!DOCTYPE html>");
      done();
    });

    const doctypeStream = new DoctypeStream("<!DOCTYPE html>");

    readStream.pipe(doctypeStream).pipe(writeStream, {end: true});
  });
});

