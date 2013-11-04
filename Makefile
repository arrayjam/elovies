all: movies.json posters/.done

movies.json:
	mkdir tmp
	node top_500_movie_imdbIDs.js | node omdb_imdbID.js > $@

posters/.done: movies.json
	mkdir -p posters
	cat $^ | node posters.js
	touch $@

