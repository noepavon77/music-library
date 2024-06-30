let input = document.getElementById("input");
let searchButton = document.getElementById("searchButton");
let results = document.getElementById("results");
let artistInfo = document.getElementById("artistInfo");
let dropdown = document.getElementById("dropdown");
let suggestion = document.getElementById("suggestion");
let selectedIndex = -1;
let artists = [];
let words = [];

window.onload = () => {
    input.value = "";
    clearResults();
    clearArtistInfo();
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            artists = data;
            artists.forEach(artist => {
                words.push(artist.name.toLowerCase());
                artist.albums.forEach(album => {
                    words.push(album.title.toLowerCase());
                    album.songs.forEach(song => {
                        words.push(song.title.toLowerCase());
                    });
                });
            });
            populateCarousel(artists);
        })
        .catch(error => console.error('Error fetching the JSON data:', error));
};

const clearResults = () => {
    results.innerHTML = "";
    results.style.display = "none";
};

const clearArtistInfo = () => {
    artistInfo.innerHTML = "";
    artistInfo.style.display = "none";
};

const clearSuggestion = () => {
    suggestion.innerHTML = "";
    suggestion.style.display = "none";
};

const clearDropdown = () => {
    dropdown.innerHTML = "";
    dropdown.classList.remove("show");
    selectedIndex = -1;
};

const populateCarousel = (artists) => {
    let carouselInner = document.querySelector(".carousel-inner");
    let angle = 360 / artists.length;
    artists.forEach((artist, index) => {
        artist.albums.forEach(album => {
            let item = document.createElement("div");
            item.classList.add("carousel-item");
            item.style.transform = `rotateY(${index * angle}deg) translateZ(300px)`;
            item.innerHTML = `<img src="${album.coverImage}" alt="${album.title}">`;
            carouselInner.appendChild(item);
        });
    });
};

input.addEventListener("input", (e) => {
    clearDropdown();
    clearResults();
    clearArtistInfo();

    let query = input.value.toLowerCase().trim();

    if (query.length === 0) {
        clearSuggestion();
        return;
    }

    let regex = new RegExp("^" + query, "i");
    let matches = words.filter(word => regex.test(word) && word !== query);

    if (matches.length > 0) {
        let closestMatch = matches[0];
        let highlightedSuggestion = closestMatch.substring(query.length);
        suggestion.innerHTML = highlightedSuggestion;
        suggestion.style.display = "block";
        showDropdown(matches);
    } else {
        clearSuggestion();
    }
});

const showDropdown = (matches) => {
    dropdown.innerHTML = "";
    matches.forEach((word, index) => {
        let item = document.createElement("div");
        item.classList.add("dropdown-item");
        item.textContent = word;
        item.addEventListener("click", () => {
            input.value = word;
            clearSuggestion();
            clearDropdown();
        });
        dropdown.appendChild(item);
    });
    dropdown.classList.add("show");
};

input.addEventListener("keydown", (e) => {
    let items = document.querySelectorAll(".dropdown-item");

    if (e.keyCode === 40) {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateActiveItem(items);
    } else if (e.keyCode === 38) {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
    } else if (e.keyCode == 13 && selectedIndex > -1) {
        e.preventDefault();
        input.value = items[selectedIndex].textContent;
        clearSuggestion();
        clearDropdown();
    } else if ((e.keyCode == 13 || e.keyCode == 32 || e.keyCode == 39) && suggestion.textContent !== "") {
        e.preventDefault();
        input.value = input.value + suggestion.textContent.trim();
        clearSuggestion();
        clearDropdown();
    }
});

const updateActiveItem = (items) => {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
};

document.addEventListener("click", (e) => {
    if (!e.target.matches("#input") && !e.target.matches(".dropdown-item")) {
        clearDropdown();
    }
});

input.addEventListener("focus", (e) => {
    input.value = "";
    clearSuggestion();
    clearDropdown();
});

searchButton.addEventListener("click", () => {
    clearResults();
    clearArtistInfo();
    clearSuggestion();
    clearDropdown();

    let query = input.value.toLowerCase().trim();

    let foundArtist = artists.find(artist => artist.name.toLowerCase() === query);
    if (foundArtist) {
        displayArtistInfo(foundArtist);
        return;
    }

    let foundAlbum = findAlbum(query);
    if (foundAlbum) {
        displayAlbumInfo(foundAlbum);
        return;
    }

    let foundSong = findSong(query);
    if (foundSong) {
        displaySongInfo(foundSong);
        return;
    }

    results.innerHTML = "No matching artist, album, or song found.";
    results.style.display = "block";
});

const findSong = (query) => {
    for (let artist of artists) {
        for (let album of artist.albums) {
            let foundSong = album.songs.find(song => song.title.toLowerCase() === query);
            if (foundSong) {
                return { artist: artist.name, album: album, song: foundSong };
            }
        }
    }
    return null;
};

const findAlbum = (query) => {
    for (let artist of artists) {
        let foundAlbum = artist.albums.find(album => album.title.toLowerCase() === query);
        if (foundAlbum) {
            return { artist: artist.name, album: foundAlbum };
        }
    }
    return null;
};

const displayArtistInfo = (artist) => {
    artistInfo.innerHTML = `<h1 class="header__title">${artist.name}</h1>`;
    artist.albums.forEach(album => {
        artistInfo.innerHTML += `
        <div class="music-card">
            <img src="${album.coverImage}" alt="${album.title}" />
            <div>
                <h3>${album.title}</h3>
                <p>${album.description}</p>
            </div>
            ${album.songs.map(song => `
                <div class="song-info">
                    <span class="song-title">${song.title}</span>
                    <span class="song-length">${song.length}</span>
                </div>
            `).join('')}
        </div>`;
    });
    artistInfo.style.display = "block";
};

const displayAlbumInfo = (album) => {
    artistInfo.innerHTML = `
    <div class="music-card">
        <div class="album-info">
            <h1 class="album-title">${album.album.title}</h1> 
            <span class="artist-name">by ${album.artist}</span>
        </div>
        <img src="${album.album.coverImage}" />
        <div>
            <p>${album.album.description}</p>
        </div>
        ${album.album.songs.map(song => `
            <div class="song-info">
                <span class="song-title">${song.title}</span>
                <span class="song-length">${song.length}</span>
            </div>
        `).join('')}
    </div>`;
    artistInfo.style.display = "block";
};

const displaySongInfo = (song) => {
    artistInfo.innerHTML = `
    <div class="music-card">
        <div class="album-info">
            <h1 class="album-title">${song.album.title}</h1> 
            <span class="artist-name">by ${song.artist}</span>
        </div>
        <img src="${song.album.coverImage}" class="album-cover" />
        <div class="album-description">
            <p>${song.album.description}</p> 
        </div>
        <div class="song-info">
            <span class="song-title">${song.song.title}</span>
            <span class="song-length">${song.song.length}</span>
        </div>
    </div>`;
    artistInfo.style.display = "block";
};