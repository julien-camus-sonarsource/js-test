/** format helpers */
function padLeft(str, len, ch = " ") { while (str.length < len) str = ch + str; return str; }
function padRight(str, len, ch = " ") { while (str.length < len) str = str + ch; return str; }
module.exports = { padLeft, padRight };
