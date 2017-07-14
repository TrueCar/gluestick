/**
 * Source: https://www.npmjs.com/package/jest-environment-node-debug
 */

const FakeTimers = require('jest-util').FakeTimers;
const ModuleMocker = require('jest-mock');

function deepCopy(obj) {
  const newObj = {};
  let value;
  for (const key in obj) {
    value = obj[key];
    if (typeof value === 'object' && value !== null) {
      value = deepCopy(value);
    }
    newObj[key] = value;
  }
  return newObj;
}

class NodeDebugEnvironment {
  constructor(config) {
    // jest doesn't need full global before runScript,
    // but to reduce possible issues we create full copy here
    this.global = Object.assign({}, global, deepCopy(config.globals));
    this.moduleMocker = new ModuleMocker(global);
    this.fakeTimers = new FakeTimers(this, this.moduleMocker, config);
  }

  dispose() {
    if (this.fakeTimers) {
      this.fakeTimers.dispose();
    }
    this.fakeTimers = null;
  }

  runScript(script) {
    // we cannot set global.console to new value
    // (TypeError: Cannot set property console of #<Object> which has only a getter)
    const jestCustomConsole = this.global.console;
    if (jestCustomConsole !== null) {
      // but we can alter properties in any case
      Object.assign(global.console, jestCustomConsole);
      // delete because later we will apply all jest changes from this.global to global
      delete this.global.console;
    }

    Object.assign(global, this.global);
    // it seems Jest hold reference to this.global object and next
    // line doesn't affect, so, we restore console
    this.global.console = jestCustomConsole;
    // during runInThisContext global will be modified
    // (jasmine will set global.jasmineRequire), so, we must set this.global
    // to global (jest will not modify global anymore, so, it is safe)
    this.global = global;
    return script.runInThisContext();
  }
}

module.exports = NodeDebugEnvironment;
