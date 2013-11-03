d3.json("omdb_with_posters.json", function (err, omdb) {
  var grid = d3.select(".grid").selectAll(".movie")
    .data(omdb);

  grid.enter().append("div")
    .attr("class", "movie")
    .append("img")
    .attr("src", function(d) { return "posters/" + d.Poster; });
  console.log(omdb);
});
