import { Writable } from 'stream';
import fs from 'fs';
import path from 'path';
import DoctypeStream from '../../../src/lib/server/DoctypeStream';

class WriteStream extends Writable {
  constructor() {
    super();
    this.data = [];
  }

  _write(chunk, enc, cb) {
    this.data.push(chunk);
    cb();
  }
}

describe('lib/server/DoctypeStream', () => {
  it('should prepend the doctype in a stream', (done) => {
    const readStream = fs.createReadStream(path.join(__dirname, '/DoctypeStream.sample.txt'));
    const writeStream = new WriteStream();

    writeStream.on('finish', () => {
      expect(this.data[0].toString('utf8')).toEqual('<!DOCTYPE html>');
      expect(this.data.join('')).toContain('<!DOCTYPE html>');
      done();
    });

    const doctypeStream = new DoctypeStream('<!DOCTYPE html>');

    readStream.pipe(doctypeStream).pipe(writeStream, { end: true });
  });
});
