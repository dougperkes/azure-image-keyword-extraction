// import numeral from 'numeral';
import './index.css';

// const courseValue = numeral(1000).format('$0,0.00');
// console.log(`I would pay ${courseValue} for this awesome course!`);

var computerVisionApiKey; // eslint-disable-line no-unused-vars
window.onload = function() {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListenser);
    oReq.open("GET", '/computerVisionApiKey');
    oReq.send();
}

function reqListenser() {
    console.log(this.responseText);
    var res = JSON.parse(this.responseText);
    computerVisionApiKey = res.key;
}

var uploadfiles = document.querySelector('#imageToProcess');
uploadfiles.addEventListener('change', function () {
    var files = this.files;
    for(var i=0; i<files.length; i++){
        previewImage(this.files[i]);
    }

}, false);

function previewImage(file) {
    var galleryId = "gallery";

    var gallery = document.getElementById(galleryId);
    var imageType = /image.*/;

    if (!file.type.match(imageType)) {
        throw "File Type must be an image";
    }

    var thumb = document.createElement("div");
    thumb.classList.add('thumbnail'); // Add the class thumbnail to the created div

    var img = document.createElement("img");
    img.file = file;
    thumb.appendChild(img);
    gallery.appendChild(thumb);

    // Using FileReader to display the image content
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
}
