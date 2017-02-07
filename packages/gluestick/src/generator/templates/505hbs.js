/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
    <!DOCTYPE html>
      <html>
        <head>
          <title>500 Error</title>
            <style type="text/css">
              body {
                color: #333;
                font-family: sans-serif; 
                background: #ECF3F7;
              }
              pre {
                background: #0D323C;
                color: #EEE;
                padding: 1em;
                border-radius: 0.5em;
              }
            </style>
        </head>
        <body>
          <h1>500 Error</h1>
          {{#notForProduction}}
            <pre>{{error.stack}}</pre>
          {{/notForProduction}}
        </body>
    </html>
`;
  return template;
};
