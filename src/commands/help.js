module.exports = function () {
    console.log(`
Available commands:
  gluestick new APP_NAME                        # Generate a new application
  gluestick generate container CONTAINER_NAME   # Generate a new container
  gluestick generate component COMPONENT_NAME   # Generate a new component and test file
  gluestick generate reducer REDUCER_NAME       # Generator used for creating things
  gluestick help                                # What you are seeing now
  gluestick start [options]                     # Start everything

Start Options:
  [--no-tests]  # Start servers without running tests
    `);
};

