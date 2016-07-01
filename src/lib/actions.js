export const RENDER_STATUS = "RENDER_STATUS";

export function render404 (message) {
  return renderStatus (404, message);
}

export function renderStatus (statusCode, message) {
  return {
    type: RENDER_STATUS,
    statusCode: statusCode,
    message: message
  };
}
