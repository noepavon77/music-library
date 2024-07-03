const input = document.getElementById("input");
input.setAttribute("autocomplete", "off"); // Desactivar autocompletado del navegador
const searchButton = document.getElementById("searchButton");
const results = document.getElementById("results");
const artistInfo = document.getElementById("artistInfo");
const dropdown = document.getElementById("dropdown");
const suggestion = document.getElementById("suggestion");
let selectedIndex = -1;
let artists = [];
let words = [];
// Load data from JSON file
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

// Routine functions
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

// Carousel main
const populateCarousel = (artists) => {
    const carouselInner = document.querySelector(".carousel-inner");
    if (!carouselInner) {
        console.error('carousel-inner element not found');
        return;
    }
    const angle = 360 / artists.length;
    artists.forEach((artist, index) => {
        const item = document.createElement("div");
        item.classList.add("carousel-item");
        item.style.transform = `rotateY(${index * angle}deg) translateZ(250px)`;
        item.innerHTML = `<img src="${artist.image}" alt="${artist.name}">`;
        carouselInner.appendChild(item);
    });
};
// Event handlers
searchButton.addEventListener("click", () => {
    clearSuggestion();
    clearDropdown();    
    const query = input.value.toLowerCase().trim();
    console.log("entro a click:", query);

    // Realizar la búsqueda con el valor actual del input
    performSearch(query);
});

dropdown.addEventListener("mouseover", (e) => {
    clearSuggestion();
    const target = e.target;
    if (target.classList.contains("dropdown-item")) {
        input.value = target.textContent.trim();
    }
});
//"receives the inputs".
input.addEventListener("input", (e) => {
    clearDropdown();
    clearResults();
    clearArtistInfo();

    const query = input.value.toLowerCase().trim();

    if (query.length === 0) {
        clearSuggestion();
        return;
    }
    const regex = new RegExp("^" + query, "i");
    const matches = words.filter(word => regex.test(word) && word !== query);

    if (matches.length > 0) {
        const closestMatch = matches[0];
        const highlightedSuggestion = closestMatch.substring(query.length);
        suggestion.innerHTML = highlightedSuggestion;
        suggestion.style.display = "block";
        showDropdown(matches);
    } else {
        clearSuggestion();
    }
});

const showDropdown = (matches) => {
    dropdown.innerHTML = "";
    matches.forEach((word) => {
        const item = document.createElement("div");
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
    const items = document.querySelectorAll(".dropdown-item");

    if (e.keyCode === 40 || e.keyCode === 38) { // Arrow down or up
        e.preventDefault();
        selectedIndex = (e.keyCode === 40) ? (selectedIndex + 1) % items.length : (selectedIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
        clearSuggestion();
        if (items[selectedIndex]) {
            input.value = items[selectedIndex].textContent;
            items[selectedIndex].scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    } else if (e.keyCode === 13) { // Enter
        e.preventDefault();
        if (selectedIndex > -1 && items[selectedIndex]) {
            input.value = items[selectedIndex].textContent;
            clearSuggestion();
            clearDropdown();
        } else if (suggestion.textContent !== "") {
            input.value += suggestion.textContent.trim();
            clearSuggestion();
            clearDropdown();
        }
        // Simulate search button click
        searchButton.click();
    } else if (e.keyCode === 39) { // Right arrow
        e.preventDefault();
        if (suggestion.textContent !== "") {
            input.value += suggestion.textContent.trim();
            clearSuggestion();
            clearDropdown();
        }
    }
});

const updateActiveItem = (items) => {
    items.forEach((item, index) => {
        item.classList.toggle("active", index === selectedIndex);
    });
};

document.addEventListener("click", (e) => {
    if (!e.target.matches("#input") && !e.target.matches(".dropdown-item")) {
        clearDropdown();
    }
});

input.addEventListener("focus", () => {
    clearSuggestion();
    clearDropdown();
});

// Search and display results
const performSearch = (query) => {
    clearResults();
    clearArtistInfo();

    if (query.length === 0) {
        results.innerHTML = "Please enter a valid search query.";
        results.style.display = "block";
        return;
    }
    
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

    // Handle no results found
    results.innerHTML = "No results found.";
    results.style.display = "block";
};

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
//This section is responsible for displaying the search results according to each option, artist, song, album
const displayArtistInfo = (artist) => {
    artistInfo.innerHTML = `<h1 class="header__title">${artist.name}</h1>`;
    artistInfo.innerHTML += `<div class="card-container"></div>`;
    const cardContainer = artistInfo.querySelector('.card-container');
    artist.albums.forEach(album => {
        cardContainer.innerHTML += `
            <div class="card">
                <div class="card-face card-front">
                    <img src="${album.coverImage}" alt="${album.title} cover"/>
                    <div>
                        <p class="album-description">${album.description}</p>
                    </div>
                </div>
                <div class="card-face card-back">
                    <h1>Song</h1>
                    ${album.songs.map(song => `
                        <div class="song-info">
                            <span class="song-title">${song.title}</span>
                            <span class="song-length">${song.length}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`;
});
    
artistInfo.style.display = "block";};
    const displayAlbumInfo = (album) => {
    artistInfo.innerHTML = `
        <div class="music-card">
            <div class="album-info">
                <h1 class="album-title">${album.album.title}</h1>
            </div>
            <img src="${album.album.coverImage}" />
            <div>
            <span class="artist-name">by ${album.artist}</span>
            <span class="album-description">${album.album.description}</span>
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
        <h1 class="header__title">Song</h1>
        <div class="music-card">
            <div class="album-info">
            <h1 class="header__title">${song.song.title}</h1>
            </div>
            <img src="${song.album.coverImage}" class="album-cover" />
            <div class="song-info">
            <span class="artist-name">by ${song.artist}</span>
            </div>
            <div class="song-info">
            <h1 class="album-title">${song.album.title}</h1> 
            </div>
            <div class="album-description">
                <p>${song.album.description}</p> 
            </div>
        </div>`;
    artistInfo.style.display = "block";
};
