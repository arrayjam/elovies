var async = require("async"),
  d3 = require("d3"),
  jsdom = require("jsdom"),
  fs = require("fs");

async.mapSeries(
  d3.range(5).map(link),
  function(url, callback) {
    var ids = [];
    jsdom.env(url, ["http://code.jquery.com/jquery.js"], function (errors, window) {
      var $ = window.$;
      $(".results .title a").each(function() { ids.push($(this).attr("href")); });
      window.close();
      callback(null, ids);
    });
  },
  function (error, results) {
    results = results
    .reduce(function(prev, curr) { return prev.concat(curr); }, [])
    .map(function(d) { return d.slice(7, 16); });

    var json = JSON.stringify(results);
    fs.writeFile("tmp/top_500_movie_imdbIDs.json", json);
    process.stdout.write(json, "utf-8");
  }
);

function link(page) {
  return "http://www.imdb.com/search/title?at=0&groups=top_1000&sort=user_rating,desc&start=" + page + "01&view=simple";
}
