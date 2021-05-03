var apiKey = "28dc847dcca68c07d01a2d56c6567665";
var userId = "136485307@N06"
function setAlbum(defaultAlbum) {
var defaultAlbum = defaultAlbum
}
var getDefaultUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + apiKey + "&photoset_id=" + defaultAlbum + "&format=json&nojsoncallback=1";
var getSetUrl = getDefaultUrl;

function randomAlbum() {
	var getAlbumUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=" + apiKey + "&user_id=" + userId + "&format=json&nojsoncallback=1";
	$.get(AlbumUrl)
	var list = photosets.photoset.id;
	var randomAlbum = list[Math.floor(Math.random()*list.length)];
	var defaultAlbum = randomAlbum;
	
	$.get(AlbumUrl)
    .success(function(data) {
      if (data['stat'] === 'fail') {
        $('h4').show();
        getSetUrl = getAlbumUrl;
        updatePhoto(getSetUrl);
      } else {
        if (setUrl !== getAlbumUrl) { $('h4').hide(); }
        var albums = data.photosets.photoset;
        var randomAlbum = selectRandomAlbum(albums);
        setAlbum(defaultAlbum.id);
      }
    });
}

$(document).ready(function() {
  var albumNumberFromChrome = null;
  getAlbumNumberAndUpdatePhoto();
  randomAlbum();

  setInterval(function () {
    updatePhoto(getSetUrl);
  }, 30000);
});

function updatePhoto(setUrl) {
  $.get(setUrl)
    .success(function(data) {
      if (data['stat'] === 'fail') {
        $('h4').show();
        getSetUrl = getDefaultUrl;
        updatePhoto(getSetUrl);
      } else {
        if (setUrl !== getDefaultUrl) { $('h4').hide(); }
        var photos = data.photoset.photo;
        var randomPhoto = selectRandomPhoto(photos);
        replacePhoto(randomPhoto.id);
      }
    });
}

function replacePhoto(photoId) {
  var getPhotoUrl = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=" + apiKey + "&photo_id=" + photoId + "&format=json&nojsoncallback=1";
  $.get(getPhotoUrl)
    .success(function(data) {
      if (data.sizes.size[8]) {
        var photoSrc = data.sizes.size[8].source;
      } else if (data.sizes.size[7]) {
        var photoSrc = data.sizes.size[7].source;
      } else if (data.sizes.size[6]) {
        var photoSrc = data.sizes.size[6].source;
      } else if (data.sizes.size[5]) {
        var photoSrc = data.sizes.size[5].source;
      } else if (data.sizes.size[4]) {
        var photoSrc = data.sizes.size[4].source;
      } else if (data.sizes.size[3]) {
        var photoSrc = data.sizes.size[3].source;
      } else if (data.sizes.size[2]) {
        var photoSrc = data.sizes.size[2].source;
      } else {
        var photoSrc = data.sizes.size[1].source;
      }
      var imageTag = "<img src='" + photoSrc + "'>";
      $(".photo").html(imageTag);
    });
}

function selectRandomPhoto(photos) {
  return photos[Math.floor(Math.random()*photos.length)];
}

function selectRandomAlbum(albums) {
  return albums[Math.floor(Math.random()*albums.length)];
}

function getAlbumNumberAndUpdatePhoto() {
  chrome.storage.sync.get(['albumNumber'], function(response){
    var chromeObjest = response;
    albumNumberFromChrome = response['albumNumber'];
    if (albumNumberFromChrome) {
      $('[name=album_number]').val(albumNumberFromChrome);
      getSetUrl = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + apiKey + "&photoset_id=" + albumNumberFromChrome + "&format=json&nojsoncallback=1";
    } else {
      getSetUrl = getDefaultUrl;
    }
    updatePhoto(getSetUrl);
  });
}
