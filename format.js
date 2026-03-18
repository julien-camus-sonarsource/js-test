/** format helpers v4 */
function padLeft(str, len, ch = " ") { while (str.length < len) str = ch + str; return str; }
function trim(str) { return str.trim(); }
module.exports = { padLeft, trim };
