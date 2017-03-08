import { StyleSheet, css } from 'aphrodite';
import React from 'react';
import gluestickPluginAphrodite from '../server.js';

const styles = StyleSheet.create({ red: { backgroundColor: 'red' } });
const element = <div className={css(styles.red)}>DIV</div>;

test('Aphrodite plugin should return body, styles and rehydrate script', () => {
  const results = gluestickPluginAphrodite().renderMethod(element);
  expect(results.body).toContain('DIV');
  expect(results.head).not.toBeNull();
  expect(results.additionalScript).not.toBeNull();
});
