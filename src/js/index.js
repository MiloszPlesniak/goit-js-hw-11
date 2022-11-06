const axios = require('axios').default;
import { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const debounce = require('lodash.debounce');

// URL variable
const API = 'https://pixabay.com/api/'
const API_KEY = '?key=30986553-a898811d242c2530c8a957c11'
const image_type = '&image_type=photo'
const orientation = '&orientation=horizontal'
const safesearch = '&safesearch=true'
const imageOnPage = 40
let numberOfPage = 1
//
// DOM variable
const inputSerch = document.querySelector('input')
// const btnSerch = document.querySelector('.btn-serch')
const gallery = document.querySelector('.gallery')
const loadMore = document.querySelector('#load-more')
const form = document.querySelector('#search-form')
//
let bigGallery = new SimpleLightbox('.gallery a');

const fetchData = async (serchWord) => {
  let url = API + API_KEY + '&q=' + serchWord + image_type + orientation + safesearch + "&per_page=" + imageOnPage + '&page=' + numberOfPage
  
try {
  const response = await (await axios.get(url))
  if (response.data.totalHits === 0) {
    console.log(response)
    Notify.failure("Sorry, there are no images matching your search query. Please try again.")
  } else {
    return response.data

  }
} catch (error) {
  Notify.failure("We're sorry, but you've reached the end of search results.")
  console.log(error.response.code)
}
}


// fetch more images
const infinityScroll = async () => {
  let screanHeight = document.documentElement.clientHeight;
  let scrollPosition = document.documentElement.scrollTop;
  let maxScrollPosition = document.documentElement.scrollHeight;
  if ((scrollPosition + screanHeight) > (maxScrollPosition - 5)) {
    numberOfPage += 1
    console.log(numberOfPage)
    await fetchData(inputSerch.value).then(async data => {
      if (data.hits.length === 0) {
        Notify.failure("We're sorry, but you've reached the end of search results.")
      } else {
        await buildDomElemets()
        await bigGallery.refresh()

        const { height: cardHeight } = document
          .querySelector(".gallery")
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: "smooth",
        });
      }
    })
  }

}
// fetch images
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  window.removeEventListener('scroll', infinityScroll);
  numberOfPage = 1
  if (inputSerch.value.length === 0) {
    gallery.innerHTML = ""
    // loadMore.classList.add('load-more')
  } else {
    gallery.innerHTML = ""
    await fetchData(inputSerch.value).then((data) => {
      Notify.success(`Hooray! We found ${data.totalHits} images.`)
    })
    await buildDomElemets()
    await bigGallery.refresh()
    const { height: cardHeight } = document
      .querySelector(".gallery")
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 0.2,
      behavior: "smooth",
    });
    window.addEventListener('scroll', debounce(infinityScroll, 500));
  }
})


const buildDomElemets = async () => {
  await fetchData(inputSerch.value).then(data => {
    data.hits.forEach(element => {
      const prevPhoto = element.webformatURL
      const largePhoto = element.largeImageURL
      const tags = element.tags
      const likes = element.likes
      const views = element.views
      const comments = element.comments
      const downloads = element.downloads
      const photoCard =
        `<div class="photo-card">
  <a href="${largePhoto}"><img src="${prevPhoto}" alt="${tags}" loading = "lazy" title="${tags}" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      <b>${likes}</b>
    </p>
    <p class="info-item">
      <b>Views</b>
      <b>${views}</b>
    </p>
    <p class="info-item">
      <b>Comments</b>
      <b>${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <b>${downloads}</b>
    </p>
  </div>
</div>`;
      gallery.insertAdjacentHTML("beforeend", photoCard)

    });
  })
  //   .then(() => {
  //   loadMore.classList.remove('load-more')
  //   if (gallery.children.length === 0) {
  //     loadMore.classList.add('load-more')
  //   }
  // })

}









