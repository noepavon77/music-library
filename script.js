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
        let item = document.createElement("div");
        item.classList.add("carousel-item");
        item.style.transform = `rotateY(${index * angle}deg) translateZ(300px)`;
        item.innerHTML = `<img src="${artist.image}" alt="${artist.name}">`;
        carouselInner.appendChild(item);
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
    } else if (e.keyCode === 13) { // Si la tecla presionada es Enter
        e.preventDefault();
        if (selectedIndex > -1) {
            input.value = items[selectedIndex].textContent;
            clearSuggestion();
            clearDropdown();
        } else if (suggestion.textContent !== "") {
            input.value = input.value + suggestion.textContent.trim();
            clearSuggestion();
            clearDropdown();
        }
        // Simular clic en el botón de búsqueda
        searchButton.click();
    } else if (e.keyCode === 32 || e.keyCode === 39) { // Espacio o flecha derecha
        e.preventDefault();
        if (suggestion.textContent !== "") {
            input.value = input.value + suggestion.textContent.trim();
            clearSuggestion();
            clearDropdown();
        }
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
    
    if (query.length === 0) {
        results.innerHTML = "Please enter a valid search query."
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

// Definición del objeto MusicApp para encapsular las funciones y variables relacionadas
const MusicApp = {
    input: document.getElementById("input"),
    searchButton: document.getElementById("searchButton"),
    results: document.getElementById("results"),
    artistInfo: document.getElementById("artistInfo"),
    dropdown: document.getElementById("dropdown"),
    suggestion: document.getElementById("suggestion"),
    selectedIndex: -1,
    artists: [],
    words: [],

    init: function() {
        this.input.value = "";
        this.clearResults();
        this.clearArtistInfo();
        this.fetchData();
        this.setupEventListeners();
    },

    fetchData: function() {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                this.artists = data;
                this.buildWordsList();
                this.populateCarousel();
            })
            .catch(error => console.error('Error fetching the JSON data:', error));
    },

    buildWordsList: function() {
        this.artists.forEach(artist => {
            this.words.push(artist.name.toLowerCase());
            artist.albums.forEach(album => {
                this.words.push(album.title.toLowerCase());
                album.songs.forEach(song => {
                    this.words.push(song.title.toLowerCase());
                });
            });
        });
    },

    populateCarousel: function() {
        let carouselInner = document.querySelector(".carousel-inner");
        let angle = 360 / this.artists.length;
        this.artists.forEach((artist, index) => {
            let item = document.createElement("div");
            item.classList.add("carousel-item");
            item.style.transform = `rotateY(${index * angle}deg) translateZ(300px)`;
            item.innerHTML = `<img src="${artist.image}" alt="${artist.name}">`;
            carouselInner.appendChild(item);
        });
    },

    setupEventListeners: function() {
        this.input.addEventListener("input", this.handleInput.bind(this));
        this.input.addEventListener("keydown", this.handleInputKeydown.bind(this));
        this.searchButton.addEventListener("click", this.handleSearch.bind(this));
        document.addEventListener("click", this.handleClickOutside.bind(this));
        this.input.addEventListener("focus", this.handleInputFocus.bind(this));
    },

    clearResults: function() {
        this.results.innerHTML = "";
        this.results.style.display = "none";
    },

    clearArtistInfo: function() {
        this.artistInfo.innerHTML = "";
        this.artistInfo.style.display = "none";
    },

    clearSuggestion: function() {
        this.suggestion.innerHTML = "";
        this.suggestion.style.display = "none";
    },

    clearDropdown: function() {
        this.dropdown.innerHTML = "";
        this.dropdown.classList.remove("show");
        this.selectedIndex = -1;
    },

    handleInput: function(e) {
        this.clearDropdown();
        this.clearResults();
        this.clearArtistInfo();

        let query = this.input.value.toLowerCase().trim();

        if (query.length === 0) {
            this.clearSuggestion();
            return;
        }

        let regex = new RegExp("^" + query, "i");
        let matches = this.words.filter(word => regex.test(word) && word !== query);

        if (matches.length > 0) {
            let closestMatch = matches[0];
            let highlightedSuggestion = closestMatch.substring(query.length);
            this.suggestion.innerHTML = highlightedSuggestion;
            this.suggestion.style.display = "block";
            this.showDropdown(matches);
        } else {
            this.clearSuggestion();
        }
    },

    showDropdown: function(matches) {
        this.dropdown.innerHTML = "";
    
        matches.forEach((word, index) => {
            let item = document.createElement("div");
            item.classList.add("dropdown-item");
            item.textContent = word;
            item.addEventListener("click", () => {
                this.input.value = word;
                this.clearSuggestion();
                this.clearDropdown();
            });
    
            // Manejar la navegación por teclado
            item.addEventListener("keydown", (e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    let currentIndex = matches.indexOf(word);
                    let nextIndex;
                    
                    if (e.key === "ArrowDown") {
                        nextIndex = (currentIndex + 1) % matches.length;
                    } else { // ArrowUp
                        nextIndex = (currentIndex - 1 + matches.length) % matches.length;
                    }
    
                    let nextItem = this.dropdown.querySelectorAll(".dropdown-item")[nextIndex];
                    if (nextItem) {
                        nextItem.focus();
                    }
                }
            });
    
            this.dropdown.appendChild(item);
        });
    
        this.dropdown.classList.add("show");
    },
    

    handleInputKeydown: function(e) {
        let items = document.querySelectorAll(".dropdown-item");

        if (e.keyCode === 40) {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % items.length;
            this.updateActiveItem(items);
        } else if (e.keyCode === 38) {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
            this.updateActiveItem(items);
        } else if (e.keyCode === 13) { // Si la tecla presionada es Enter
            e.preventDefault();
            if (this.selectedIndex > -1) {
                this.input.value = items[this.selectedIndex].textContent;
                this.clearSuggestion();
                this.clearDropdown();
            } else if (this.suggestion.textContent !== "") {
                this.input.value = this.input.value + this.suggestion.textContent.trim();
                this.clearSuggestion();
                this.clearDropdown();
            }
            // Simular clic en el botón de búsqueda
            this.searchButton.click();
        } else if (e.keyCode === 32 || e.keyCode === 39) { // Espacio o flecha derecha
            e.preventDefault();
            if (this.suggestion.textContent !== "") {
                this.input.value = this.input.value + this.suggestion.textContent.trim();
                this.clearSuggestion();
                this.clearDropdown();
            }
        }
    },

    updateActiveItem: function(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });
    },

    handleClickOutside: function(e) {
        if (!e.target.matches("#input") && !e.target.matches(".dropdown-item")) {
            this.clearDropdown();
        }
    },

    handleInputFocus: function() {
        this.input.value = "";
        this.clearSuggestion();
        this.clearDropdown();
    },

    handleSearch: function() {
        this.clearResults();
        this.clearArtistInfo();
        this.clearSuggestion();
        this.clearDropdown();

        let query = this.input.value.toLowerCase().trim();

        if (query.length === 0) {
            this.results.innerHTML = "Please enter a valid search query.";
            this.results.style.display = "block";
            return;
        }

        let foundArtist = this.artists.find(artist => artist.name.toLowerCase() === query);
        if (foundArtist) {
            this.displayArtistInfo(foundArtist);
            return;
        }

        let foundAlbum = this.findAlbum(query);
        if (foundAlbum) {
            this.displayAlbumInfo(foundAlbum);
            return;
        }

        let foundSong = this.findSong(query);
        if (foundSong) {
            this.displaySongInfo(foundSong);
            return;
        }

        this.results.innerHTML = "No matching artist, album, or song found.";
        this.results.style.display = "block";
    },

    findSong: function(query) {
        for (let artist of this.artists) {
            for (let album of artist.albums) {
                let foundSong = album.songs.find(song => song.title.toLowerCase() === query);
                if (foundSong) {
                    return { artist: artist.name, album: album, song: foundSong };
                }
            }
        }
        return null;
    },

    findAlbum: function(query) {
        for (let artist of this.artists) {
            let foundAlbum = artist.albums.find(album => album.title.toLowerCase() === query);
            if (foundAlbum) {
                return { artist: artist.name, album: foundAlbum };
            }
        }
        return null;
    },

    displayArtistInfo: function(artist) {
        this.artistInfo.innerHTML = `<h1 class="header__title">${artist.name}</h1>`;
        artist.albums.forEach(album => {
            this.artistInfo.innerHTML += `
                <div class="card-container">
                    <div class="card-container">
                        <div class="card">
                            <div class="card-face card-front">
                                <img src="${album.coverImage}" alt="${album.title} cover"/>
                                <div>
                                    <span class="album-description">${album.description}</span>
                                </div>
                            </div>
                            <div class="card-face card-back">
                                <h1>Songs</h1>
                                ${album.songs.map(song => `
                                    <div class="song-info">
                                        <span class="song-title">${song.title}</span>
                                        <span class="song-length">${song.length}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        this.artistInfo.style.display = "block";
    },

    displayAlbumInfo: function(album) {
        this.artistInfo.innerHTML = `
            <h1 class="header__title">Album</h1>
            <div class="music-card">
                <div class="album-info">
                    <h1 class="album-title">${album.album.title}</h1>
                </div>
                <img src="${album.album.coverImage}" />
                <div>
                    <span class="album-description">${album.album.description}</span>
                    <span class="artist-name">by ${album.artist}</span>
                </div>
                ${album.album.songs.map(song => `
                    <div class="song-info">
                        <span class="song-title">${song.title}</span>
                        <span class="song-length">${song.length}</span>
                    </div>
                `).join('')}
            </div>`;
        this.artistInfo.style.display = "block";
    },

    displaySongInfo: function(song) {
        this.artistInfo.innerHTML = `
            <h1 class="header__title">Song</h1>
            <div class="music-card">
                <div class="album-info">
                    <h1 class="header__title">${song.song.title}</h1>
                </div>
                <img src="${song.album.coverImage}" class="album-cover" />
                <div class="song-info">
                    <span class="artist-name">by ${song.artist}</span>
                </div>
                <h2 class="song-title">Album</h2>
                <div class="song-info">
                    <h1 class="album-title">${song.album.title}</h1> 
                </div>
                <div class="album-description">
                    <p>${song.album.description}</p> 
                </div>
            </div>`;
        this.artistInfo.style.display = "block";
    }
};

// Inicialización de la aplicación al cargar la página
window.onload = () => {
    MusicApp.init();
};
