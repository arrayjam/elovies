all: data/movies.json posters/.done

clean:
	rm -r posters/.done
	rm data/movies.json

data/movies.json:
	mkdir -p tmp
	node top_500_movie_imdbIDs.js | node omdb_imdbID.js > $@

posters/.done: data/movies.json
	mkdir -p posters
	cat $^ | node posters.js
	touch $@

