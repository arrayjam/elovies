d3.json("omdb_with_posters.json", function (err, omdb) {

  var width = 600,
    xImages = 6,
    imageWidth = width / xImages,
    imageHeight = imageWidth * 1.5,
    gridHeight = omdb.length / xImages;

  var x = d3.scale.linear()
    .domain([0, xImages])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, gridHeight])
    .range([0, gridHeight * imageHeight]);

  var grid = d3.select(".grid").selectAll(".movie")
    .data(omdb);

  grid.enter().append("div")
    .attr("class", "movie")
    .style("left", function (d, i) { return x(i % xImages) + 10 + "px"; })
    .style("top", function (d, i) { return y(~~(i / xImages)) + 10 + "px"; })
    .append("img")
    .attr("src", function (d) { return "posters/" + d.Poster; })
    .style("width", imageWidth + "px")
    .style("height", imageHeight + "px");
  console.log(omdb);
});
