/**
 * Simple string formatting helpers.
 */

function padLeft(str, length, char = ' ') {
  while (str.length < length) {
    str = char + str;
  }
  return str;
}

function padRight(str, length, char = ' ') {
  while (str.length < length) {
    str = str + char;
  }
  return str;
}

function center(str, length, char = ' ') {
  const pad = Math.max(0, length - str.length);
  const left = Math.floor(pad / 2);
  return char.repeat(left) + str + char.repeat(pad - left);
}

function repeat(str, times) {
  return str.repeat(Math.max(0, times));
}

module.exports = { padLeft, padRight, center, repeat };
