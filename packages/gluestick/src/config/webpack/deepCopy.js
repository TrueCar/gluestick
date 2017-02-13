const deepClone = (obj: Object) => {
  const output: Object = {};
  for (const key in obj) {
    const value: any = obj[key];
    if (Array.isArray(value)) {
      output[key] = value.slice();
    } else {
      output[key] = (typeof value === 'object') ? deepClone(value) : value;
    }
  }
  return output;
};

module.exports = deepClone;
