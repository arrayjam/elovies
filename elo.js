d3.json("data/movies.json", function (err, omdb) {

  var userKey = "elo-movies-user";
  var userExists = Cookies.get(userKey) !== undefined;


  var userId, userRef, logRef, scoresRef, count = 0;
  var rootRef = new Firebase("https://elo-movies.firebaseio.com/");
  if (userExists) {
    userId = Cookies.get(userKey);
    userRef = rootRef.child(userId);
    logRef = userRef.child("log");
    logRef.once("value", function(dataSnapshot) {
      count = d3.values(dataSnapshot.val()).length;
      d3.select(".counter").text(count);
    });
    scoresRef = userRef.child("scores");
    scoresRef.once('value', function(dataSnapshot) {
      var scores = dataSnapshot.val();
      omdb.forEach(function(movie) {
        movie.score = scores[movie.imdb.id];
      });
      start();
    });
  } else {
    userId = randomString(6);
    Cookies.set(userKey, userId, { expires: new Date(2016, 0, 1) });
    userRef = rootRef.child(userId);

    logRef = userRef.child("log");

    // The object we'll use in firebase. We'll keep this synced so we don't use too much bandwidth per score.
    var o = {};
    omdb.forEach(function(movie) { movie.score = 1600; o[movie.imdb.id] = 1600; });
    scoresRef = userRef.child("scores");
    scoresRef.set(o);
    start();
  }

  function start () {
    d3.select(".user_id").text(userId);

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

    d3.select(".reset").on("click", function() {
      if (confirm("Are you sure you want to reset your scores?")) {
        Cookies.set(userKey, undefined);
        window.location.reload();
      }
    });

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

    function update() {
      side.select(".title").text(function(d) { return d.title; });
      side.select(".year").text(function(d) { return d.year; });
      side.select(".poster").attr("src", function(d) { return "posters/" + d.imdb.id + ".jpg"; });
      side.select(".genre").text(function(d) { return d.genres.join(", "); });
      side.select(".plot").text(function(d) { return d.plot; });

      d3.select(".counter").text(count);
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
      scoresRef.child(winner.imdb.id).set(winner.score);
      scoresRef.child(loser.imdb.id).set(loser.score);
      logRef.push({
        winner: winner.imdb.id,
        loser: loser.imdb.id,
        time: Date.now()
      });
      count += 1;
    }
  }

  function randomString(length) {
    var chars = "abcdefghijklmnopqrstuvwxyz";
    return d3.range(length)
      .map(function(d) { return chars[Math.random() * chars.length | 0]; })
      .join("");
  }
});
