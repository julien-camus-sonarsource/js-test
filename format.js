/** format helpers v5 */
function padLeft(str, len, ch = " ") { while (str.length < len) str = ch + str; return str; }
function padRight(str, len, ch = " ") { while (str.length < len) str = str + ch; return str; }
function trim(str) { return str.trim(); }
module.exports = { padLeft, padRight, trim };
