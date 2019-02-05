const path = require('path');
const colors = require('colors/safe');

class Utility {
  static log(type, message) {
    if (type === 'I') {
      console.info(colors.blue(message));
    } else if (type === 'S') {
      console.info(colors.green(message));
    } else if (type === 'W') {
      console.warn(colors.yellow(message));
    } else if (type === 'E') {
      console.error(colors.red(message));
    }
  }

  static extractBasename(url) {
    return path.basename(url);
  }

  static removeHash(text) {
    return text.replace(/( )?\(#.*\)/, '');
  }
}

module.exports = Utility;
