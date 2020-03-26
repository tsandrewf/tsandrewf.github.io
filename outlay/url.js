// Beg https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
export function getQueryVar(varName) {
  // Grab and unescape the query string - appending an '&' keeps the RegExp simple
  // for the sake of this example.
  //let queryStr = unescape(window.location.search) + "&";
  let queryStr = unescape(window.location.hash) + "&";

  // Dynamic replacement RegExp
  //let regex = new RegExp(".*?[&\\?]" + varName + "=(.*?)&.*");
  let regex = new RegExp(".*?[#&\\?]" + varName + "=(.*?)&.*");

  // Apply RegExp to the query string
  let val = queryStr.replace(regex, "$1");

  // If the string is the same, we didn't find a match - return false
  return val == queryStr ? null : val;
}
// End https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
