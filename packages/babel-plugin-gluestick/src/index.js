export default function ({ types: t }) {
  return {
    visitor: {
      MemberExpression(path) {
        const target = path.node;
        if (!!target.object && target.object.name === "process" && target.property.name === "env") {
          target.object.name = "window";
          target.property.name = "__GS_ENV_VARS__";
        }
      }
    }
  }
}

