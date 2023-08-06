import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38684276-74d27d96c2f2eaa25be337554';

async function searchPhoto(q, page, perPage) {
  const url = `${BASE_URL}?key=${API_KEY}&q=${q}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  const response = await axios.get(url);
  return response.data;
}

export { searchPhoto };
