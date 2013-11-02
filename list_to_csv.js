var fs = require("fs"),
  d3 = require("d3"),
  request = require("request"),
  async = require("async");


var boundaries = {
  distribution: [0, 16],
  votes: [17, 26],
  rating: [27, 32],
  title: [32]
};

fs.readFile("movie_ratings.list", "utf8", function(err, data) {
  var lines = data.split("\n");
  var ratings = lines
    .filter(function(line) { return line; })
    .map(function(line) {
    var distribution = line.slice(boundaries.distribution[0], boundaries.distribution[1]).trim();
    var votes = line.slice(boundaries.votes[0], boundaries.votes[1]).trim();
    var rating = line.slice(boundaries.rating[0], boundaries.rating[1]).trim();
    var titleYear = line.slice(boundaries.title[0]).trim();
    var game = titleYear.indexOf("(VG)") !== -1;
    var tv = titleYear.indexOf("(TV)") !== -1;
    var tv_movie = titleYear.indexOf("(V)") !== -1;
    var match = titleYear.match(/(.+)\(([\d]{4})[/IVX]*\)/);
    if (!match) match = ["no year!?!??!", titleYear, 0];
    var title = match[1].trim();
    var year = match[2];
    return {
      distribution: distribution,
      votes: +votes,
      rating: +rating,
      title: title,
      year: parseInt(year, 10),
      game: game,
      tv: tv,
      tv_movie: tv_movie
    };
  });
  ratings = ratings.sort(byRating);
  ratings = ratings.filter(function(d) { return d.votes > 10000; });
  ratings = ratings.filter(function(d) { return !d.game && !d.tv; });
  var csv = d3.csv.format(ratings);
  fs.writeFile("movie_ratings.csv", csv);

  getOMDB(ratings.slice(0, 500));
});

function byRating(a, b) {
  if (a.rating < b.rating)
    return 1;
  if (a.rating > b.rating)
    return -1;
  return 0;
}

function getOMDB(ratings) {
  var omdbData = [];

  async.mapSeries(
    ratings.map(function(rating) { return link(rating.title, rating.year); }),
    function (url, callback) {
      omdb(url, function(data) {
        var omdb_data = JSON.parse(data);
        console.log(omdb_data);
        return callback(null, omdb_data);
      });
    },
    function (err, results) {
      console.log(results);
      fs.writeFile("omdb.json", JSON.stringify(results, null, 2));
    }
  );
}

function link(title, year) {
  return "http://www.omdbapi.com/?" +
    "t=" + encodeURIComponent(title) + "&" +
    "y=" + encodeURIComponent(year);
}

function omdb(link, callback) {
  request(link, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body);
    }
  });
}
