d3.json("data/movies.json", function (err, omdb) {

  // To test with a small subset
  // omdb = d3.shuffle(omdb).slice(0, 50);
  omdb.forEach(function(movie) { movie.score = 1600; });
  window.db = omdb;

  var log = [];
  window.log = log;

  var width = 960,
    xImages = 10,
    imageWidth = width / xImages,
    imageHeight = imageWidth * 1.5,
    gridHeight = omdb.length / xImages,
    id = function(d) { return d.imdb.id; };

  var x = d3.scale.linear()
    .domain([0, xImages])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, gridHeight])
    .range([0, gridHeight * imageHeight]);

  var grid = d3.select(".grid").selectAll(".movie")
    .data(omdb, id);

  grid.enter().append("div")
      .attr("class", "movie")
    .append("img")
      .attr("src", function(d) { return "posters/" + d.imdb.id + ".jpg"; })
      .style("width", imageWidth + "px")
      .style("height", imageHeight + "px");


  var choose = d3.selectAll(".choose").selectAll([".left", ".right"]);
  console.log(choose);

  var side = choose.data(randomMovies());
  update();

  d3.select(document.body).on("keydown", function() {
    switch (d3.event.keyIdentifier) {
      case "Left": return chooseLeft();
      case "Right": return chooseRight();
      default: return;
    }
  });

  d3.selectAll(".left").on("click", chooseLeft);
  d3.selectAll(".right").on("click", chooseRight);

  d3.select(".save").on("click", function() {
    // First we get a reference to the location of the user’s name data:
    var moviesRef = new Firebase("https://elo-movies.firebaseio.com/elo-movies");
    var newSessionRef = moviesRef.push();

    // Set some data to the generated location
    // newPushRef.set({user_id: 'wilma', text: 'Hello'});
    newSessionRef.set({
      log: log,
      movies: omdb.map(function(d) {
        return {
          score: d.score,
          imdbID: d.imdb.id
        };
      })
    });
  });

  function update() {
    side.select(".title").text(function(d) { return d.title; });
    side.select(".year").text(function(d) { return d.year; });
    side.select(".poster").attr("src", function(d) { return "posters/" + d.imdb.id + ".jpg"; });
    side.select(".genre").text(function(d) { return d.genre; });
    side.select(".plot").text(function(d) { return d.plot; });

    d3.select(".counter").text(log.length);
    grid.data(omdb.sort(function(a, b) { return b.score - a.score; }), id)
      .transition()
      .style("left", function (d, i) { return x(i % xImages) + 10 + "px"; })
      .style("top", function (d, i) { return y(~~(i / xImages)) + 10 + "px"; });
  }

  function randomMovie() {
    return omdb[omdb.length * Math.random() | 0];
  }

  function randomMovies() {
    var a = randomMovie(), b = randomMovie();
    return (a.imdb.id === b.imdb.id) ? randomMovies() : [a, b];
  }

  function chooseLeft() {
    chooseMovie(d3.select(".left").datum(), d3.select(".right").datum());
  }

  function chooseRight() {
    chooseMovie(d3.select(".right").datum(), d3.select(".left").datum());
  }

  function chooseMovie(winner, loser) {
    var k = 120;
    var winner_prob = 1 / Math.pow(10, ((loser.score - winner.score) / 400) + 1);
    var loser_prob = 1 / Math.pow(10, ((winner.score - loser.score) / 400) + 1);
    winner.score = winner.score + (k * (1 - winner_prob));
    loser.score = loser.score + (k * (0 - winner_prob));
    logChoice(winner, loser);
    choose.data(randomMovies());
    update();
  }

  function logChoice(winner, loser) {
    log.push({
      winner: winner.imdb.id,
      loser: loser.imdb.id,
      time: Date.now()
    });
  }
});
