/** format helpers */
function padLeft(str, len, ch) { while (str.length < len) str = ch + str; return str; }
module.exports = { padLeft };
