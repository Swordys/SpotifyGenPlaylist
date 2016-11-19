const app = {}
app.apiUrl = "https://api.spotify.com/v1";


// Main functions
app.events = function () {
    var from = document.querySelector(".from-main");
    from.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = document.querySelector(".btn");
        btn.classList.toggle("bnNew");
        var inputValue = document.querySelector(".input");
        let artistNames = inputValue.value.split(',').map(c => c.replace(/(^(\s)*)|((\s)*$)/g, ''));
        if (artistNames[0].length > 0) {
            if (artistNames.length < 2) {
                artistNames.push(artistNames[0]);
            }
            let search = artistNames.map(c => app.searchArtist(c));
            app.getArtistInfo(search);

        }
    });
};


//CALL ARTISTS
app.searchArtist = (artistName) => $.ajax({
    url: `${app.apiUrl}/search`,
    method: "GET",
    dataType: "json",
    data: {
        q: artistName,
        type: "artist"
    }
});

//CALL ALBUMS
app.getAlbums = (artistId) => $.ajax({
    url: `${app.apiUrl}/artists/${artistId}/albums`,
    method: "GET",
    dataType: "json",
    data: {
        album_type: "album"
    }
});


//CALL SONGS
app.getSongs = (albumsId) => $.ajax({
    url: `${app.apiUrl}/albums/${albumsId}/tracks`,
    method: "GET",
    dataType: "json"

});



// get albums from artist object
app.getArtistInfo = function (search) {

    $.when(...search).then((...results) => {
        result = results
            .map((itm) => itm[0].artists.items[0].id)
            .map(id => app.getAlbums(id));
        app.getTracks(result);
    });

}


// get tracks from albums object
app.getTracks = function (artistAlbums) {
    $.when(...artistAlbums).then((...albums) => {
        albumids = albums
            .map(c => c[0].items)
            .reduce(function (a, b) {
                return a.concat(b);
            })
            .map(c => c.id)
            .map(song => app.getSongs(song));

        app.buildMyList(albumids);
    });
};


//get song ids from song object 
app.buildMyList = function (albumids) {
    $.when(...albumids).then((...tracks) => {
        trackIds = tracks
            .map(c => c[0].items)
            .reduce(function (a, b) {
                return a.concat(b)
            }).map(sngId => sngId.id);

        randTracks = app.randomList(trackIds).join();
        const baseUrl = `https://embed.spotify.com/?theme=white&uri=spotify:trackset:My Playlist:${randTracks}`;
        const finElement = `<iframe src="${baseUrl}" height="400"></iframe>`;

        document.querySelector(".playlist-wrap").innerHTML = finElement;
    });
}



// get first 20 random tracks from track list
app.randomList = function (trackIdList) {
    let counter = 0;
    for (let i = 0; i < trackIdList.length; i++) {
        let rand = Math.floor(Math.random() * (i + 1));
        let temp = trackIdList[i];
        trackIdList[i] = trackIdList[rand];
        trackIdList[rand] = temp;
        counter++;
    }

    return trackIdList.slice(0, 30);
}

// Combine and Call from here
app.init = function () {
    app.events();
};

app.init();