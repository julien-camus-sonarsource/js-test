/**
 * Simple string formatting helpers.
 */

function padLeft(str, length, char = ' ') {
  while (str.length < length) {
    str = char + str;
  }
  return str;
}

module.exports = { padLeft };
