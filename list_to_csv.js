var fs = require("fs"),
  d3 = require("d3");

var boundaries = {
  distribution: [0, 16],
  votes: [17, 26],
  rating: [27, 32],
  title: [32]
};

fs.readFile("movie_ratings.list", "utf8", function(err, data) {
  var lines = data.split("\n");
  var ratings = lines.map(function(line) {
    var distribution = line.slice(boundaries.distribution[0], boundaries.distribution[1]).trim();
    var votes = line.slice(boundaries.votes[0], boundaries.votes[1]).trim();
    var rating = line.slice(boundaries.rating[0], boundaries.rating[1]).trim();
    var title = line.slice(boundaries.title[0]).trim();
    var game = title.indexOf("(VG)") !== -1;
    var tv = title.indexOf("(TV)") !== -1;
    var tv_movie = title.indexOf("(V)") !== -1;
    return {
      distribution: distribution,
      votes: +votes,
      rating: +rating,
      title: title,
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
});

function byRating(a, b) {
  if (a.rating < b.rating)
    return 1;
  if (a.rating > b.rating)
    return -1;
  return 0;
}
