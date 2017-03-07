import { StyleSheet } from 'aphrodite';

const plugin = () => {
  StyleSheet.rehydrate(window.renderedClassNames);
};
const meta = { hook: true };

export default {
  plugin,
  meta,
}
