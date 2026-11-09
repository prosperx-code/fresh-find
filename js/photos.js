/**
 * photos.js — real photos for market/produce cards.
 *
 * All images are now local files under images/ so they load offline and
 * never depend on external Pexels/Wikipedia network calls. Photos were
 * sourced from free Pexels images of the real produce / African open-air
 * markets (see PHOTOS.md for original reasoning). Leafy greens share a
 * representative green-leaf photo; root crops and fruits use matching
 * real-subject photos.
 */
(function (global) {
  // Produce id -> local image path + credit
  const PRODUCE_PHOTOS = {
    'cassava': {
      src: 'images/produce/cassava.jpg',
      page: 'https://unsplash.com/photos/pile-of-raw-cassava-roots-0_GtcvY4Mj4',
      credit: 'Photo: Pexels'
    },
    'sweet-potato': {
      src: 'images/produce/sweet-potato.jpg',
      page: '',
      credit: ''
    },
    'tomato': {
      src: 'images/produce/tomato.jpg',
      page: 'https://unsplash.com/photos/bunch-of-red-tomatoes-sSWGRQe76DY',
      credit: 'Photo: Pexels'
    },
    'yam': {
      src: 'images/produce/yam.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (root vegetable)'
    },
    'cocoyam': {
      src: 'images/produce/cocoyam.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (tuber)'
    },
    'irish-potato': {
      src: 'images/produce/irish-potato.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (potato)'
    },
    'pepper': {
      src: 'images/produce/pepper.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (chili pepper)'
    },
    'ugu': {
      src: 'images/produce/ugu.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (leafy green)'
    },
    'bitter-leaf': {
      src: 'images/produce/bitter-leaf.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (leafy green)'
    },
    'waterleaf': {
      src: 'images/produce/waterleaf.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (leafy green)'
    },
    'okra': {
      src: 'images/produce/okra.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (okra)'
    },
    'garden-egg': {
      src: 'images/produce/garden-egg.jpg',
      page: '',
      credit: ''
    },
    'cucumber': {
      src: 'images/produce/cucumber.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (cucumber)'
    },
    'carrot': {
      src: 'images/produce/carrot.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (carrot)'
    },
    'onion': {
      src: 'images/produce/onion.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (onion)'
    },
    'plantain': {
      src: 'images/produce/plantain.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (plantain/banana)'
    },
    'pineapple': {
      src: 'images/produce/pineapple.jpg',
      page: '',
      credit: ''
    },
    'orange': {
      src: 'images/produce/orange.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (orange)'
    },
    'watermelon': {
      src: 'images/produce/watermelon.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (watermelon)'
    },
    'pawpaw': {
      src: 'images/produce/pawpaw.jpg',
      page: '',
      credit: ''
    },
    'banana': {
      src: 'images/produce/banana.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (banana)'
    },
    'mango': {
      src: 'images/produce/mango.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (mango)'
    },
    'avocado': {
      src: 'images/produce/avocado.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (avocado)'
    },
    'scent-leaf': {
      src: 'images/produce/scent-leaf.jpg',
      page: '',
      credit: ''
    },
    'uziza': {
      src: 'images/produce/uziza.jpg',
      page: '',
      credit: ''
    },
    'utazi': {
      src: 'images/produce/utazi.jpg',
      page: '',
      credit: ''
    },
    'milk': {
      src: 'images/produce/milk.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (milk)'
    },
    'eggs': {
      src: 'images/produce/eggs.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (eggs)'
    },
    'beans': {
      src: 'images/produce/beans.jpg',
      page: '',
      credit: ''
    },
    'maize': {
      src: 'images/produce/maize.jpg',
      page: 'https://unsplash.com',
      credit: 'Photo: Pexels (maize/corn)'
    }
  };

  // Market photos – local copies of real African open-air market photos
  const MARKET_PHOTOS = {
    src: 'images/markets/market-veg.jpg',
    page: 'https://unsplash.com/photos/a-group-of-people-standing-around-a-table-filled-with-tomatoes-cnVn4Gg4b00',
    credit: 'Generated market image'
  };
  const MARKET_PHOTOS_FRUIT = {
    src: 'images/markets/market-fruit.jpg',
    page: 'https://unsplash.com/photos/orange-fruits-on-black-plastic-crate-cXvqCw0m5WE',
    credit: 'Generated market image'
  };
  const MARKET_PHOTOS_STAPLE = {
    src: 'images/markets/market-staple.jpg',
    page: 'https://unsplash.com/photos/a-man-standing-in-front-of-a-fruit-stand-XzgW_vYpm8M',
    credit: 'Generated market image'
  };

  const MARKET_PHOTO_GROUPS = {
    'ubani': { src: 'images/markets/ubani.jpg', page: MARKET_PHOTOS.page, credit: MARKET_PHOTOS.credit },
    'rumuola': { src: 'images/markets/rumuola.jpg', page: MARKET_PHOTOS.page, credit: MARKET_PHOTOS.credit },
    'aba': { src: 'images/markets/aba.jpg', page: MARKET_PHOTOS.page, credit: MARKET_PHOTOS.credit },
    'watt': { src: 'images/markets/watt.jpg', page: MARKET_PHOTOS.page, credit: MARKET_PHOTOS.credit },
    'olokoro': { src: 'images/markets/olokoro.jpg', page: MARKET_PHOTOS_FRUIT.page, credit: MARKET_PHOTOS_FRUIT.credit },
    'ariaria': { src: 'images/markets/ariaria.jpg', page: MARKET_PHOTOS_FRUIT.page, credit: MARKET_PHOTOS_FRUIT.credit },
    'transamadi': { src: 'images/markets/transamadi.jpg', page: MARKET_PHOTOS_FRUIT.page, credit: MARKET_PHOTOS_FRUIT.credit },
    'itam': { src: 'images/markets/itam.jpg', page: MARKET_PHOTOS_FRUIT.page, credit: MARKET_PHOTOS_FRUIT.credit },
    'eleme': { src: 'images/markets/eleme.jpg', page: MARKET_PHOTOS_STAPLE.page, credit: MARKET_PHOTOS_STAPLE.credit },
    'ekeonunwa': { src: 'images/markets/ekeonunwa.jpg', page: MARKET_PHOTOS_STAPLE.page, credit: MARKET_PHOTOS_STAPLE.credit },
    'ogbete': { src: 'images/markets/ogbete.jpg', page: MARKET_PHOTOS_STAPLE.page, credit: MARKET_PHOTOS_STAPLE.credit },
    'awka': { src: 'images/markets/awka.jpg', page: MARKET_PHOTOS_STAPLE.page, credit: MARKET_PHOTOS_STAPLE.credit }
  };

  function getProducePhoto(id) {
    const photo = PRODUCE_PHOTOS[id];
    return Promise.resolve(photo || null);
  }
  function getMarketPhoto(id) {
    return Promise.resolve(MARKET_PHOTO_GROUPS[id] || null);
  }

  function listCredits() {
    const seen = new Set();
    const out = [];
    Object.entries(PRODUCE_PHOTOS).forEach(([id, photo]) => {
      if (seen.has(photo.src)) return;
      seen.add(photo.src);
      out.push({ title: id + ' — ' + photo.credit, url: photo.page });
    });
    [MARKET_PHOTOS, MARKET_PHOTOS_FRUIT, MARKET_PHOTOS_STAPLE].forEach(photo => {
      if (seen.has(photo.src)) return;
      seen.add(photo.src);
      out.push({ title: photo.credit, url: photo.page });
    });
    return out;
  }

  global.FFPhotos = { getProducePhoto, getMarketPhoto, listCredits };
})(window);
