let userInputEl = document.querySelector("#searchBox");
let searchResultsSection = document.querySelector("#searchResultsSection");
let carouselList1El = document.querySelector("#carouselList1");
let carouselList2El = document.querySelector("#carouselList2");
let dropDownEl = document.querySelector("#dropDown");

let favtMoviesList = [];
let recommendedMoviesList = [];

// Rendering User Searched Movie
async function renderSearchedMovie(movieData) {
  const { title, overview, genres, poster_path, release_date, id } = movieData;

  let release_date_formate = release_date.split("-");
  const genereNames = await getGenreNames(id);

  searchResultsSection.innerHTML = `
  <img class="search-movie" src= https://image.tmdb.org/t/p/w500/${poster_path} alt=${title} />
  <div class="search-movie-content">
  <h1 class="search-movie-title">${title}</h1>
  <p class="genere">${genereNames}</p>
  <p class="search-movie-release-date">Release Date: ${release_date_formate[2]}/${release_date_formate[1]}/${release_date_formate[0]}</p>
  <p class="search-movie-description">${overview}</p>
  </div>
  `;
}

// Adding Movie Into Favorites List
function addFavMovie(favtMovie, genereNames) {
  let findObj = favtMoviesList.find((each) => each.id === favtMovie.id);
  if (findObj === undefined) {
    favtMoviesList.push({ ...favtMovie, genereNames, isFavt: true });
    recommendedMoviesList = recommendedMoviesList.filter(
      (each) => each.id !== favtMovie.id
    );
  } else {
    favtMoviesList = favtMoviesList.filter((each) => each.id !== favtMovie.id);
  }

  localStorage.setItem("favtMovies", JSON.stringify(favtMoviesList));
  renderCarousel(recommendedMoviesList, carouselList1El, splide1);
  renderCarousel(favtMoviesList, carouselList2El, splide2);
}

// Render Movies Carousel
async function renderCarousel(movieList, listEl, splide) {
  listEl.textContent = "";
  movieList.forEach(async (each) => {
    const { genre_ids, title, poster_path, id } = each;
    const genereNames = await getGenreNames(id);

    splide.destroy();
    let listItem = document.createElement("li");
    listItem.classList.add("splide__slide");
    listEl.appendChild(listItem);

    let heartElContainer = document.createElement("div");
    heartElContainer.classList.add("favt-heart-icon-container");
    listItem.appendChild(heartElContainer);

    let heartColor = each.isFavt !== undefined && "red-heart";

    let heartEL = document.createElement("i");
    heartEL.classList.add("fa-solid", "fa-heart", "heart-icon", heartColor);
    heartEL.addEventListener("click", () => {
      addFavMovie(each, genereNames);
    });
    heartElContainer.appendChild(heartEL);

    let imgEl = document.createElement("img");
    imgEl.classList.add("carousel-img");
    imgEl.src = `https://image.tmdb.org/t/p/w500/${poster_path}`;
    listItem.appendChild(imgEl);

    let splideMovieContent = document.createElement("div");
    splideMovieContent.classList.add("carousel-movie-content");
    listItem.appendChild(splideMovieContent);

    let movieTitle = document.createElement("p");
    movieTitle.classList.add("movie-title");
    movieTitle.textContent = title;
    splideMovieContent.appendChild(movieTitle);

    let genreEl = document.createElement("p");
    genreEl.classList.add("genre-para");
    genreEl.textContent = genereNames;
    splideMovieContent.appendChild(genreEl);

    splide.mount();
  });
}

// Get Genre Names Based on Genre Ids
async function getGenreNames(id) {
  const responseMovie = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=2ad18877c2ecce5382256b80fefda964`
  );

  const movieData = await responseMovie.json();
  const { genres } = movieData;
  let genereNames = genres.map((each) => each.name);

  return genereNames.join(",");
}

// Fetching Movies Data
async function fetchData(e, movieName) {
  let userInputElvalue = movieName === undefined ? e.target.value : movieName;

  const responseDetails = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${userInputElvalue}&api_key=2ad18877c2ecce5382256b80fefda964`
  );

  const responseMovieData = await responseDetails.json();
  const { genre_ids } = responseMovieData.results[0];

  const responseRecommended = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=2ad18877c2ecce5382256b80fefda964&with_genres=${genre_ids.join(
      ","
    )}`
  );

  const recommendedMovies = await responseRecommended.json();
  recommendedMoviesList = recommendedMovies.results;
  // console.log(recommendedMoviesList);

  const localFavtMovies = localStorage.getItem("favtMovies");
  if (localFavtMovies === null) {
    favtMoviesList = [];
  } else {
    favtMoviesList = JSON.parse(localFavtMovies);
  }

  recommendedMoviesList = recommendedMoviesList.filter(
    (recommendedMovie) =>
      !favtMoviesList.some(
        (favoriteMovie) => favoriteMovie.id === recommendedMovie.id
      )
  );
  // console.log("filter", recommendedMoviesList);

  renderSearchedMovie(responseMovieData.results[0]);
  renderCarousel(recommendedMoviesList, carouselList1El, splide1);
  renderCarousel(favtMoviesList, carouselList2El, splide2);
}

// Filter Based on Dropdown Option
function optionChange() {
  switch (this.value) {
    case "name":
      favtMoviesList.sort((a, b) => a.title.localeCompare(b.title));
      break;

    case "year":
      favtMoviesList.sort(
        (a, b) =>
          parseInt(a.release_date.split("-")[0]) -
          parseInt(b.release_date.split("-")[0])
      );
      break;

    case "sort":
      favtMoviesList = favtMoviesList;
      break;
  }

  renderCarousel(favtMoviesList, carouselList2El, splide2);
}

let splide1 = new Splide("#carousel1", {
  pagination: false,
  perPage: 5,
  gap: "20px",
  breakpoints: {
    425: {
      perPage: 2,
    },
    768: {
      perPage: 3,
    },
  },
});

let splide2 = new Splide("#carousel2", {
  pagination: false,
  perPage: 5,
  gap: "20px",
  breakpoints: {
    425: {
      perPage: 2,
    },
    768: {
      perPage: 3,
    },
  },
});

function getData() {
  fetchData(undefined, "avatar");
}

getData();

userInputEl.addEventListener("change", fetchData);
dropDownEl.addEventListener("change", optionChange);
