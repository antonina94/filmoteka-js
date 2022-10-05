import NewsApiServise from './api-service';
import handlerPagination from './pagination';
import debounce from 'lodash.debounce';
import themeChanger from './theme';

const newsApiServise = new NewsApiServise();
const pagination = document.querySelector('.pagination-thumb');
const movies = document.querySelector('.movies-home');
const spinner = document.querySelector('.sk-circle');
const swicher = document.querySelector('.theme-switch__toggle');
const mainInput = document.querySelector('.header-input');
const allertMovie = document.querySelector('.allert');
const errorImg = document.querySelector('.error_box');
const filterInput = document.querySelectorAll('.filter-input');
const filter = document.querySelector('.filter-section');
const genrePicker = document.querySelector('#genrepicker');
const yearPicker = document.querySelector('#yearpicker');

let genre;
let currentPage = 1;
let dataRender = '';

let yearValue = '';
let genreValue = '';

filterInput.forEach(item => {
  item.addEventListener('change', e => {
    yearValue = yearPicker.value;
    genreValue = genrePicker.value;
    createCard(genreValue, yearValue, currentPage);
  });
});

function createCard(genres, year, currentPage) {
  mainInput.value = '';
  allertMovie.classList.add('visually-hidden');
  spinner.classList.remove('visually-hidden');
  newsApiServise.fetchMovies(genres, year).then(res => {
    newsApiServise.resetPage();
    renderSearchMovie(res);
    const totalResult = res.total_results;
    currentPage = res.page;

    const instance = handlerPagination();
    instance.setItemsPerPage(20);
    instance.setTotalItems(totalResult);

    instance.movePageTo(currentPage);

    instance.on('afterMove', event => {
      newsApiServise.page = event.page;
      currentPage = newsApiServise.page;
      createCard(genres, year, currentPage);
    });

    setTimeout(() => {
      spinner.classList.add('visually-hidden');
    }, 500);
  });
}
yearPickerMenu();
function yearPickerMenu() {
  let startYear = 1900;
  let endYear = new Date().getFullYear();
  let years = [];

  yearPicker.insertAdjacentHTML('beforeend', '<option value="">Year</option>');
  for (let i = endYear; i > startYear; i--) {
    years.push(`<option value="${i}">${i}</option>`);
  }
  yearPicker.insertAdjacentHTML('beforeend', years);
}

swicher.addEventListener('change', themeChanger);
GenreWriteLocalStorage();

export default function renderTrendMovies(currentPage) {
  spinner.classList.remove('visually-hidden');
  newsApiServise.getTrendMovies(currentPage).then(response => {
    newsApiServise.resetPage();

    const totalResult = response.total_results;
    currentPage = response.page;

    const instance = handlerPagination();
    instance.setItemsPerPage(20);
    instance.setTotalItems(totalResult);

    instance.movePageTo(currentPage);

    instance.on('afterMove', event => {
      newsApiServise.page = event.page;
      currentPage = newsApiServise.page;
      renderTrendMovies(currentPage);
    });

    const markup = response.results
      .map(
        ({
          poster_path,
          original_title,
          release_date,
          genre_ids,
          vote_average,
          id,
          src = poster_path === null
            ? 'https://d2j1wkp1bavyfs.cloudfront.net/legacy/assets/mf-no-poster-available-v2.png'
            : `https://image.tmdb.org/t/p/w500${poster_path}`,
        }) => {
          getGenreName(genre_ids);
          dateRelise(release_date);
          return `<div class="movie-card" data-movieId=${id}>
                 <img class="movie-img" src="${src}" alt="card">
            
                 <div class="movie-info">
                     <h2 class="movie-title">${original_title}</h2>
                    <h3 class="span-title">${genre.join(
                      ',  '
                    )} | ${dataRender}</h3>
                     </div>
                 </div>`;
        }
      )
      .join('');
    movies.innerHTML = markup;
    setTimeout(() => {
      spinner.classList.add('visually-hidden');
    }, 500);
  });
}

//dateRelise(undefined)

function dateRelise(relase) {
  if (relase === undefined || relase === '') {
    dataRender = 'N/A';
  } else {
    dataRender = relase.slice(0, 4);
  }
}

renderTrendMovies(currentPage);

function GenreWriteLocalStorage() {
  newsApiServise.getGenres().then(res => {
    localStorage.setItem('genresArray', JSON.stringify(res));
  });
}

function getGenreName(genre_ids) {
  genre = [];
  if (genre_ids === null) {
    return;
  } else {
    genre_ids.forEach(id => {
      JSON.parse(localStorage.getItem('genresArray')).forEach(elem => {
        if (id === elem.id) {
          genre.push(elem.name);
        }
      });
    });
    if (genre.length === 2 || genre.length === 1) {
      genre;
    }
    if (genre.length >= 3) {
      genre.splice(2, 3, 'Other');
    }
    if (genre.length === 0) {
      genre.push('N/A');
    }
  }
}

function searchOurMovie(currentPage) {
  const ourMovie = mainInput.value;
  if (ourMovie === '') {
    allertMovie.classList.add('visually-hidden');
    return renderTrendMovies(currentPage);
  }

  spinner.classList.remove('visually-hidden');
  newsApiServise
    .searchMovie(ourMovie)
    .then(resp => {
      newsApiServise.resetPage();
      renderSearchMovie(resp);
      setTimeout(() => {
        spinner.classList.add('visually-hidden');
      }, 500);
      const totalResult = resp.total_results;
      currentPage = resp.page;

      const instance = handlerPagination();

      instance.setItemsPerPage(20);
      instance.setTotalItems(totalResult);
      instance.movePageTo(currentPage);
      instance.on('afterMove', event => {
        newsApiServise.page = event.page;
        currentPage = newsApiServise.page;

        searchOurMovie(currentPage);
      });
    })
    .catch(error => error);
}

function renderSearchMovie(resp) {
  const newMarkup = resp.results
    .map(
      ({
        poster_path,
        original_title,
        release_date,
        genre_ids,
        id,
        src = poster_path === null
          ? 'https://d2j1wkp1bavyfs.cloudfront.net/legacy/assets/mf-no-poster-available-v2.png'
          : `https://image.tmdb.org/t/p/w500${poster_path}`,
      }) => {
        getGenreName(genre_ids);

        dateRelise(release_date);

        return `<div class="movie-card" data-movieId=${id}>
                 <img class="movie-img" src="${src}" alt="card">
            
                 <div class="movie-info">
                     <h2 class="movie-title">${original_title}</h2>
                    <h3 class="span-title">${genre.join(
                      ',  '
                    )} |  ${dataRender}</h3>
                     </div>
                 </div>`;
      }
    )
    .join('');

  movies.innerHTML = newMarkup;
  if (resp.results.length === 0) {
    allertMovie.classList.remove('visually-hidden');
    renderTrendMovies(currentPage);
  } else {
    allertMovie.classList.add('visually-hidden');
  }
}

mainInput.addEventListener('input', debounce(searchOurMovie, 600));

// function chooseGenre(genre, year) {
//   newsApiServise.fetchMovies(genre, year).then(res => {
//     console.log(res)
//   })

// }
//  chooseGenre('28', '2022')
