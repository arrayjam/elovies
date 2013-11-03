var fs = require("fs"),
  http = require("http"),
  async = require("async");

fs.readFile("omdb.json", function (err, file) {
  var movies = JSON.parse(file);
  movies = movies.filter(function(d) { return d.Response === 'True'; });
  movies = movies.filter(function(d) { return d.Poster.indexOf("http") !== -1; });

  //movies = movies.slice(0, 2);

  async.mapSeries(
    movies.map(function(d) { return d; }),
    function (movie, callback) {
      var filename = movie.imdbID + ".jpg";
      var path = "posters/" + filename;
      fs.exists(path, function (exists) {
        console.log("do we have", path);
        if (!exists) {
          console.log("Getting", movie.Title);
          console.log("URL is", movie.Poster);
          var file = fs.createWriteStream(path);
          setTimeout(function() {
            http.get(movie.Poster, function(response) {
              response.pipe(file);
              console.log("Got " + movie.Title);
              movie.Poster = filename;
              return callback(null, movie);
            });
          }, 1000);
        } else {
          console.log("Have " + movie.Title);
          movie.Poster = filename;
          return callback(null, movie);
        }
      });
    },
    function (err, results) {
      fs.writeFile("omdb_with_posters.json", JSON.stringify(results, null, 2));
    }
  );
});
