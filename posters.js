var fs = require("fs"),
  http = require("http"),
  async = require("async");

process.stdin.resume();
process.stdin.setEncoding('utf8');

var json = "";
process.stdin.on('data', function(chunk) {
  json += chunk;
});

process.stdin.on('end', function() {
  getPosters(JSON.parse(json));
});

function getPosters(movies) {
  async.mapSeries(
    movies,
    function (movie, callback) {
      var filename = movie.imdb.id + ".jpg";
      var path = "posters/" + filename;
      fs.exists(path, function (exists) {
        if (!exists) {
          console.log("Getting: ", movie.title);
          var file = fs.createWriteStream(path);
          http.get(movie.poster, function(response) {
            response.pipe(file);
            console.log("Got: " + movie.title);
            return callback(null, movie);
          });
        } else {
          console.log("Have: " + movie.title);
          return callback(null, movie);
        }
      });
    },
    function (err, results) {
      console.log("Done!");
      console.log(results.length + " posters fetched.");
    }
  );
}
