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
      <h3 style={{ color: '#ff3030' }}>
        Error: {message}
      </h3>
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
    </div>
  );
}

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
  if (errorRoot) {
    errorRoot.style.display = 'none';
  }
}

function showErrorOverlay() {
  errorRoot.style.display = 'block';
}

function crash(error: Error, filename: ?string) {
  const root = getErrorRoot();
  render(
    <ErrorOverlay message={error.message} filename={filename} />,
    root,
    () => {
      showErrorOverlay();
    },
  );
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
