require("babel-polyfill");
require("babel-core/register")({
  presets: [
    "es2015",
    "stage-0" 
  ],
  ignore: function(filename) {
    var node_modules = "node_modules";
    // We don't use path.join because the filename slashes use the Unix style
    // forward slashes on unix and on windows but path.join will give us the
    // filenames based on the system. This way we force forward slashes and it
    // works on Windows and Unix
    var gluestick_folder = [node_modules, "gluestick", "src"].join("/");

    // Make sure babel does not ignore 
    if (filename.includes(gluestick_folder)) return false;

    return filename.includes(node_modules);
  }
});

