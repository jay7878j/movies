let userInputEl = document.querySelector("#searchBox");
let searchResultsSection = document.querySelector("#searchResultsSection");
let carouselList1El = document.querySelector("#carouselList1");
let carouselList2El = document.querySelector("#carouselList2");
let searchText = document.querySelector("#searchText");

let favtList = [];

function addFavMovie(favtMovie, genereNames) {
  //   console.log(favtMovie);
  let findObj = favtList.find((each) => each.id === favtMovie.id);
  if (findObj === undefined) {
    favtList.push({ ...favtMovie, genereNames });
  } else {
    favtList = favtList.filter((each) => each.id !== favtMovie.id);
  }

  localStorage.setItem("favList", JSON.stringify(favtList));

  let localData = localStorage.getItem("favList");

  if (localData === null) {
    favtList = [];
  } else {
    favtList = JSON.parse(localData);
  }
  //   console.log(localData, "local");

  renderCarousel(favtList, splide2, carouselList2El);
}

function renderCarousel(recMovieList, splide, listEl) {
  listEl.textContent = "";
  recMovieList.forEach(async (eachMovie) => {
    searchText.textContent = "";

    // console.log(eachMovie);
    const { genre_ids, title, poster_path, release_date, overview, id } =
      eachMovie;

    const movieDetail = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=2ad18877c2ecce5382256b80fefda964`
    );
    const res = await movieDetail.json();
    // console.log(res);
    const { genres } = res;

    let genereNames = "";
    genres.forEach((each) => {
      genereNames += each.name + " ";
    });

    // console.log(genereNames);

    splide.destroy();
    let listItem = document.createElement("li");
    listItem.classList.add("splide__slide");
    listEl.appendChild(listItem);

    let heartEL = document.createElement("i");
    heartEL.classList.add("fa-solid", "fa-heart", "heart-icon");
    heartEL.addEventListener("click", () => {
      heartEL.classList.toggle("red-heart");
      addFavMovie(eachMovie, genereNames);
    });
    listItem.appendChild(heartEL);

    let imgEl = document.createElement("img");
    imgEl.classList.add("carousel-img");
    imgEl.src = `https://image.tmdb.org/t/p/w500/${poster_path}`;
    listItem.appendChild(imgEl);

    let movieTitle = document.createElement("p");
    movieTitle.classList.add("movie-title");
    movieTitle.textContent = title;
    listItem.appendChild(movieTitle);

    let genreEl = document.createElement("p");
    genreEl.classList.add("genre-para");
    genreEl.textContent = genereNames;
    listItem.appendChild(genreEl);
    splide.mount();
  });
}

async function renderSearchMovie(movie) {
  const { genre_ids, title, poster_path, release_date, overview, id } = movie;
  const movieDetail = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?api_key=2ad18877c2ecce5382256b80fefda964`
  );
  const res = await movieDetail.json();
  //   console.log(res);
  const { genres } = res;

  let genereNames = "";
  genres.forEach((each) => {
    genereNames += each.name + " ";
  });

  //   console.log(genereNames);

  const getRecommended = await fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=2ad18877c2ecce5382256b80fefda964&with_genres=${genre_ids.join(
      ","
    )}`
  );

  const recommendedData = await getRecommended.json();
  //   console.log(recommendedData);

  const { results } = recommendedData;
  //   console.log(results);

  renderCarousel(results, splide1, carouselList1El);
  searchResultsSection.innerHTML = `
    <img class="search-movie" src=https://image.tmdb.org/t/p/w500/${poster_path} alt=${title} />
    <div class="search-movie-content">
    <h1 class="search-movie-title">${title}</h1>
    <p class="genere">${genereNames}</p>
    <p class="search-movie-release-date">Release Date: ${release_date}</p>
    <p class="search-movie-description">${overview}</p>
    </div>
    `;
}

async function getUserValue() {
  console.log(this.value);
  const apiUrl = `https://api.themoviedb.org/3/search/movie?query=${this.value}&api_key=2ad18877c2ecce5382256b80fefda964`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyYWQxODg3N2MyZWNjZTUzODIyNTZiODBmZWZkYTk2NCIsInN1YiI6IjY1YjIzMjY1NmVlY2VlMDBjOTMzZjA2NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L1aSTQjDzIQ1BAH2OCc2A0kqegYT53YPtUNQHT2FD40`,
    },
  };

  const responseData = await fetch(apiUrl, options);
  const data = await responseData.json();
  //   console.log(data);
  const { results } = data;
  console.log(results);

  const firstMovieData = results[0];
  renderSearchMovie(firstMovieData);
}

const fetchData = () => {
  userInputEl.addEventListener("change", getUserValue);
};

let splide1 = new Splide("#carousel1", {
  type: "loop",
  perPage: 4,
  gap: "30px",
  breakpoints: {
    768: {
      perPage: 2,
    },
  },
});

let splide2 = new Splide("#carousel2", {
  perPage: 4,
  gap: "30px",
  breakpoints: {
    768: {
      perPage: 2,
      gap: "20px",
    },
  },
});
fetchData();
renderCarousel(favtList, splide2, carouselList2El);
