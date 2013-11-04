var request = require("request"),
  async = require("async"),
  d3 = require("d3"),
  fs = require("fs"),
  jsdom = require("jsdom");

read();

function read() {
  async.map(
    d3.range(5),
    function(d, callback) {
      var ids = [];
      fs.readFile(d + ".html", { encoding: "utf8" }, function(error, file) {
        jsdom.env(file, ["./vendor/jquery/jquery.js"], function (errors, window) {
          var $ = window.$;
          $(".results .title a").each(function() { ids.push($(this).attr("href")); });
          window.close();
          callback(null, ids);
        });
      });
    },
    function (error, results) {
      console.log(results);
    }
  );






}










function download() {
  async.mapSeries(
    d3.range(5).map(link),
    function (url, callback) {
      request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          return callback(error, body);
        } else {
          return callback(error);
        }
      });
    },
    function(error, results) {
      results.forEach(function(d, i) {
        fs.writeFile(i + ".html", d);
      });
    }
  );

  function link(page) {
    return "http://www.imdb.com/search/title?at=0&groups=top_1000&sort=user_rating,desc&start=" + page + "01&view=simple";
  }
}
