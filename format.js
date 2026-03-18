/** format helpers v6 */
function padLeft(str, len, ch = " ") { while (str.length < len) str = ch + str; return str; }
function padRight(str, len, ch = " ") { while (str.length < len) str = str + ch; return str; }
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
module.exports = { padLeft, padRight, capitalize };
