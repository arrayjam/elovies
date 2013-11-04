#!/usr/bin/env node
var omdb = require("omdb"),
  async = require("async"),
  fs = require("fs");

process.stdin.resume();
process.stdin.setEncoding('utf8');

var json = "";
process.stdin.on('data', function(chunk) {
  json += chunk;
});

process.stdin.on('end', function() {
  getMovies(JSON.parse(json));
});

function getMovies(IDlist) {
  async.mapSeries(
    IDlist,
    function(id, callback) {
      omdb.get({ imdb: id }, function(error, movie) {
        callback(error, movie);
      });
    },
    function(error, movies) {
      var json = JSON.stringify(movies);
      fs.writeFile("tmp/omdb_imdbID.json", json);
      process.stdout.write(json, "utf-8");
    }
  );
}
