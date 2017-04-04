const webpack = require('webpack');
const { throttle } = require('../../utils');

let lineCaretPosition: number = 0;
const clearToLineStart = (nextMessage: string): void => {
  let str = '';
  for (; lineCaretPosition > nextMessage.length; lineCaretPosition--) {
    str += '\b \b';
  }
  for (let i = 0; i < lineCaretPosition; i++) {
    str += '\b';
  }
  lineCaretPosition = nextMessage.length;
  if (str) process.stderr.write(str);
};

const mutedCompilations: { [key:string]: boolean } = {};
const toggleMute = (compilationName: string) => {
  mutedCompilations[compilationName] = !mutedCompilations[compilationName];
};

const handler = (compilationName: string) => throttle((
  value: number, message: string, ...details: string[]
) => {
  if (mutedCompilations[compilationName]) {
    return;
  }

  let statusMsg = message;
  if (value < 1) {
    const percentage = Math.floor(value * 100);
    statusMsg = `${percentage}% ${message}`;
    if (percentage < 100) {
      statusMsg = ` ${message}`;
    }
    statusMsg = details.reduce((msg: string, detail: ?string): string => {
      return detail
        ? msg.concat(` ${detail.length > 40 ? `...${detail.substr(detail.length - 37)}` : detail}`)
        : msg;
    }, statusMsg);
  }
  const lineToPrint = `${compilationName} ${statusMsg}`;
  clearToLineStart(lineToPrint);
  process.stdout.write(lineToPrint);
}, 250);

module.exports = {
  plugin: (compilationName: string) => {
    return new webpack.ProgressPlugin({ handler: handler(compilationName) });
  },
  toggleMute,
};

