import { searchPhoto } from './js/api';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

let searchNamePhoto = '';

// параметри для Intersection Observer
let options = {
  root: null,
  rootMargin: '500px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(loadMore, options);

let lightbox = new SimpleLightbox('.img-wrapper a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const perPage = 40;
let page = 1;

elements.form.addEventListener('submit', onSubmitForm);

// Вішаєм сабміт на форму та рендеримо кртки
function onSubmitForm(event) {
  event.preventDefault();
  // Довелось добавити анобсерв бо коли робив пошук 1 раз а потім ще раз
  // то другий раз відправляло відразу 2 запити через це що елемент за яким стежив обсервер пригав
  observer.unobserve(elements.btnLoadMore);

  elements.gallery.innerHTML = '';
  page = 1;
  const { searchQuery } = event.currentTarget.elements;
  searchNamePhoto = searchQuery.value.trim();

  if (searchNamePhoto === '') {
    Notify.info('Enter your request!');
    return;
  }

  searchPhoto(searchNamePhoto, page, perPage)
    .then(data => {
      const arrPhotos = data.hits;
      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.info(`Hooray! We found ${data.totalHits} images.`);
        createMarkup(arrPhotos);
        observer.observe(elements.btnLoadMore);
        lightbox.refresh();
      }
    })
    .catch(error =>
      Notify.failure(
        'Oops! Something went wrong! Try reloading the page or make another choice!'
      )
    );

  event.currentTarget.reset();
}

function createMarkup(arr) {
  const markup = arr.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      return `<div class="photo-cards">
        <div class="img-wrapper">
            <a class="gallery-link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" width="300" loading="lazy" />
            </a>
        </div>
        <div class="info">
            <p class="info-item">
            <b>Likes</b>${likes}
            </p>
            <p class="info-item">
            <b>Views</b>${views}
            </p>
            <p class="info-item">
            <b>Comments</b>${comments}
            </p>
            <p class="info-item">
            <b>Downloads</b>${downloads}
            </p>
        </div>
        </div>`;
    }
  );
  elements.gallery.insertAdjacentHTML('beforeend', markup.join(''));
}

function loadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      searchPhoto(searchNamePhoto, page, perPage)
        .then(data => {
          const arrPhotos = data.hits;
          const pageNumber = Math.ceil(data.totalHits / perPage);

          createMarkup(arrPhotos);

          if (page === pageNumber) {
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
            observer.unobserve(elements.btnLoadMore);
          }
          lightbox.refresh();
        })
        .catch(error =>
          Notify.failure(
            'Oops! Something went wrong! Try reloading the page or make another choice!'
          )
        );
    }
  });
}
