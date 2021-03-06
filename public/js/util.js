/*global d3*/

function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}
var inheritsFrom = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};
// var extendObj = function(childObj, parentObj) {
//     childObj.prototype = parentObj.prototype;
// };

function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
}


Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function getprogressbar(id){
    return `
            <div class="progress bar">
              <div class="progress-bar progress-bar-success {0}" role="progressbar" aria-valuenow="0"
              aria-valuemin="0" aria-valuemax="100" style="width:0%">
                0% Complete
              </div>
            </div>
            <div class="progresstext {0}"></div>
            `.format(id);
}

function range(n){
  return Array.from(new Array(n), (x,i) => i);
}

// String formatter
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

const formatLegend=function(x){
    var formatSi = d3.format(".2s");
    var formate = d3.format(".1e");
    var formatf = d3.format(".4n");
    var s = formatSi(x);
    if(x==0)return s;
    if (x< 0.001)return formate(x);
    return s;
    
  }
const formatTotal=function(x,language='en'){
    var formatSi = d3.format(".6s");
    var formate = d3.format(".1e");
    var formatf = d3.format(".4n");
   
    const locale=d3.locale({"decimal": ".",
  "thousands": " ",
  "grouping": [3],
  "currency": ["$", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%m/%d/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    }
)
    const formatn = locale.numberFormat(",.0f");
    const formatn2 = locale.numberFormat(",.1f");
    // var NL = d3.formatLocale ({"thousands": ","})
    var s = formatSi(x);
    var s = formatn(x);
    
    // if(language =='en'){
    //   switch (s[s.length - 1]) {
    //     case "k": return s.slice(0, -1) + " thousand";
    //     case "M": return s.slice(0, -1) + " million";
    //     case "G": return s.slice(0, -1) + " billion";
    //     case "T": return s.slice(0, -1) + " trillion";
    //     case "m": return formatf(x);
    // }
    // } else {
    //   switch (s[s.length - 1]) {
    //     case "k": return s.slice(0, -1) + " mille";
    //     case "M": return s.slice(0, -1) + " million";
    //     case "G": return s.slice(0, -1) + " milliard";
    //     case "T": return s.slice(0, -1) + " billion";
    //     case "m": return formatf(x);
    // }
    // }
     if(x==0){return s;}
     if (x< 0.001){return formate(x);}
      if (x< 10){return formatn2(x);}
     return s;
  }