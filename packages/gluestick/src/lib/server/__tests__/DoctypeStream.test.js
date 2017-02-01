import { Writable } from 'stream';
import fs from 'fs';
import path from 'path';
import DoctypeStream from '../DoctypeStream';

class WriteStream extends Writable {
  data = [];

  async _write(chunk) {
    await this.data.push(chunk);
  }
}

describe('lib/server/DoctypeStream', () => {
  it('should prepend the doctype in a stream', async () => {
    const readStream = fs.createReadStream(path.join(__dirname, '/DoctypeStream.sample.txt'));
    const writeStream = new WriteStream();

    await writeStream.on('finish', () => {
      expect(this.data[0].toString('utf8')).toEqual('<!DOCTYPE html>');
      expect(this.data.join('')).toContain('<!DOCTYPE html>');
    });

    const doctypeStream = new DoctypeStream('<!DOCTYPE html>');

    readStream.pipe(doctypeStream).pipe(writeStream, { end: true });
  });
});

