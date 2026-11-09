/**
 * geolocation.js — thin wrapper around the browser Geolocation API.
 * FreshFind only ever uses this to sort the directory by distance.
 * If the user declines, callers should fall back to A–Z (handled in app.js).
 */
(function (global) {
  let cachedPosition = null;

  function requestLocation() {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      if (cachedPosition) {
        resolve(cachedPosition);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          cachedPosition = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          resolve(cachedPosition);
        },
        err => reject(err),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
      );
    });
  }

  global.FFGeo = { requestLocation, getCached: () => cachedPosition };
})(window);
