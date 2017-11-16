import React from 'react';
import { render } from 'react-dom';

function ErrorOverlay({ message, filename }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        height: '100%',
        padding: '30px',
      }}
    >
      <pre
        style={{
          color: '#ff3030',
          maxHeight: '50%',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          fontSize: '16px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          border: '0',
        }}
      >
        Error: {message}
      </pre>
      {filename &&
        <h4
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '18px',
            marginLeft: '30px',
          }}
        >
          in file: {filename}
        </h4>}
      <div style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px' }}>
        Please check the console for stack trace.
      </div>
      <div style={{ textAlign: 'right', marginTop: '30px' }}>
        <button
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '18px',
            backgroundColor: 'transparent',
            textDecoration: 'underline',
            border: '0',
          }}
          onClick={dismissErrorOverlay}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

let awaitingErrors = [];
let currentError = null;
let errorRoot = null;
const logError = console.error.bind(console);

function getErrorRoot() {
  if (!errorRoot) {
    const element = window.document.createElement('div');
    element.setAttribute(
      'style',
      'position: fixed; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; z-index: 2147483647',
    );

    errorRoot = element;
    window.document.body.appendChild(errorRoot);
  }

  return errorRoot;
}

function dismissErrorOverlay() {
  currentError = null;
  if (awaitingErrors.length) {
    crash();
  } else if (errorRoot) {
    errorRoot.style.display = 'none';
  }
}

function showErrorOverlay() {
  errorRoot.style.display = 'block';
}

function crash(newError?: Error, filename: ?string) {
  if (newError) {
    awaitingErrors.push({ message: newError.message, filename });
  }

  if (awaitingErrors.length && !currentError) {
    currentError = awaitingErrors.pop();
    awaitingErrors = awaitingErrors.filter(
      ({ message }) => message !== currentError.message,
    );
    const root = getErrorRoot();
    render(
      <ErrorOverlay
        message={currentError.message}
        filename={currentError.filename}
      />,
      root,
      () => {
        showErrorOverlay();
      },
    );
  }
}

function reportBuildError(error: Error) {
  logError(error);
  const [, trace] = error.stack.split('\n');
  const filename = trace.match(/webpack-internal:\/{3}([^:]+)/)[1];
  crash(error, filename);
}

function stopReportingRuntimeErrors() {
  window.removeEventListener('error', crash);
  window.removeEventListener('unhandledrejection', crash);
}

function startReportingRuntimeErrors() {
  console.error = value => {
    logError(value);
    crash(value instanceof Error ? value : { message: value.toString() });
  };

  window.addEventListener('error', crash);
  window.addEventListener('unhandledrejection', crash);
}

export function runWithErrorUtils(startApp: Function) {
  if (typeof window === 'undefined') {
    startApp();
  } else {
    dismissErrorOverlay();
    stopReportingRuntimeErrors();

    try {
      startApp();
    } catch (error) {
      reportBuildError(error);
    }

    startReportingRuntimeErrors();
  }
}
