/* @flow */

export function getDisplayName(Component: any) {
  return Component ? Component.displayName || Component.name || '' : '';
}
