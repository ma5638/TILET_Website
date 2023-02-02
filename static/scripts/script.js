document.addEventListener("DOMContentLoaded", (e) => {
  menuButtonClickEvent();
  designBrowseLoader();
  shopBrowseLoader();
  slickNewArrivals();
  magnify("side-view-image", 1.5);
  imageErrorLoad();
  copyEmailButtonLoad();
});

// Email Copy
function copyEmailButtonLoad() {
  let emailButton = document.querySelector('.emailCopyClick');
  if (emailButton) {
    emailButton.addEventListener('click', e => {
      copy();
    })
  }
}
// about.ejs
function copy() {
  var copyEmail = document.querySelector('.email');


  var tempInput = document.createElement("input");

  if (tempInput && copyEmail) {
    tempInput.value = copyEmail.innerHTML;
    document.body.appendChild(tempInput);
    tempInput.select();
    tempInput.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    alert("Copied to clipboard: " + copyEmail.innerHTML);
  }
}

// Image not loading

function imageErrorLoad() {
  var allImages = document.querySelectorAll("img");
  allImages.forEach(image => {
    image.addEventListener("error", e => {
      image.src = "/pictures/defaultShopImage.png";
    });
  });
}



// index.ejs


function slickNewArrivals() {
  $('.new-arrivals').slick({
    arrows: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    // autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: $('.new-arrivals-wrapper .next'),
    prevArrow: $('.new-arrivals-wrapper .prev'),
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
}

// nav.ejs
function menuButtonClickEvent() {
  var menuButton = document.querySelector(".expandable-nav-dropdown i");
  var menu = document.querySelector(".expandable-nav-menu ul");
  if (menu && menuButton) {
    menuButton.addEventListener('click', (e) => {
      menu.classList.toggle('toggle-hide');
    });
  }
}







// Browse Design Loading
function designBrowseLoader() {
  let products = document.querySelector('.results.resultDesigns');
  if (!products || !products.dataset.products) {
    return null;
  }

  var curr = 0;
  var max = 0;
  let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.1
  };
  max = curr + 6;
  productDetails = JSON.parse(products.dataset.products);
  loadXDesigns(products, curr, max);
  curr = max;
  const observer = new IntersectionObserver(handleIntersectDesigns(products, curr, max), options);
  observer.observe(document.querySelector('footer'));
}

function handleIntersectDesigns(products, curr, max) {
  return function (entries) {
    productDetails = JSON.parse(products.dataset.products);
    if (entries[0].isIntersecting) {
      if (curr >= productDetails.length) {
        return false;
      }
      max = curr + 6;
      loadXDesigns(products, curr, max);
      curr = max;


    }
  }
}

function loadXDesigns(products, curr, max) {
  while (curr < max) {
    if (curr == productDetails.length) {
      break;
    }
    product = productDetails[curr];
    if (!product) {
      return 0;
    }
    if (!product.price) {
      product.price = '';
    } else {
      product.price = "<span class= 'currency'> ETB </span> &nbsp; " + product.price;
    }
    products.innerHTML += `
              <div class="entry">
                <a href="/users/${product.userId}/${product.iddesign}">
                    <div class="image-wrapper">
                        <img src='/users/${product.userId}/${product.iddesign}/${product.iddesign}${product.imageExtension}'>

                    </div>
                </a>
                <div class="text">
                  <a href="/users/${product.userId}/${product.iddesign}">
                    <h3>${product.designName}</h3>
                    <p class="toggle-hide">&nbsp;&nbsp;<i class="fa fa-user"></i>${product.shopName}</p>
                    <p>${product.price}</p>
                  </a>

                    <a class="exploreShop" href='/users/${product.userId}/'>
                        Explore Shop
                    </a>
                </div>
                
              </div>
              `;
    curr++;
  }

}
// Browse Design Loading End

// Shop Loading
function shopBrowseLoader() {
  users = document.querySelector('.results.resultShops');
  if (!users || !users.dataset.users) {
    return null;
  }
  userDetails = JSON.parse(users.dataset.users);
  var curr = 0;
  let options = {
    root: null,
    rootMargins: "0px",
    threshold: 0.1
  };
  max = curr + 6;
  loadXShops(users, curr, max)
  curr = max
  const observer = new IntersectionObserver(handleIntersectShops(users, curr), options);
  observer.observe(document.querySelector('footer'));
};

function handleIntersectShops(users, curr) {
  return function (entries) {
    if (entries[0].isIntersecting) {
      if (curr >= userDetails.length) {
        return false;
      }
      max = curr + 6;
      loadXShops(users, curr, max);
      curr = max;


    }
  }
}
function loadXShops(users, curr, max) {
  while (curr < max) {
    if (curr == userDetails.length) {
      break;
    }
    user = userDetails[curr];
    users.innerHTML += `
              <a class="entry" href="/users/${user.userId}" >
                  <div class="image-wrapper image-shop-override-wrapper">
                      <img src='/users/${user.userId}/${user.userId}.jpg'>

                  </div>

                  <div class="text">
                      <p><i class="fas fa-store"></i>&nbsp;${user.shopName}</p>
                  </div>
              </a>
              `
    curr++;
  }

}
// Shop Loading End


function magnify(imgID, zoom) {
  var img, glass, w, h, bw;
  img = document.getElementById(imgID);
  if (!img) {
    return null;
  }
  /*create magnifier glass:*/
  glass = document.createElement("DIV");
  glass.setAttribute("class", "img-magnifier-glass");
  /*insert magnifier glass:*/
  img.parentElement.insertBefore(glass, img);
  /*set background properties for the magnifier glass:*/
  glass.style.backgroundImage = "url('" + img.src + "')";
  glass.style.backgroundRepeat = "no-repeat";

  glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
  // glass.style.backgroundSize = 'cover';
  // glass.style.width = (img.width * zoom) + "px";
  // glass.style.height = (img.height * zoom) + "px";
  bw = 3;
  w = glass.offsetWidth / 2;
  h = glass.offsetHeight / 2;
  /*execute a function when someone moves the magnifier glass over the image:*/
  glass.addEventListener("mousemove", moveMagnifier);
  img.addEventListener("mousemove", moveMagnifier);

  // Stop showing if cursor leaves glass (and image) but start showing if cursor within image
  glass.addEventListener("mouseleave", hideMagnifier);
  img.addEventListener("mouseenter", showMagnifier);
  /*and also for touch screens:*/
  glass.addEventListener("touchmove", moveMagnifier);
  img.addEventListener("touchmove", moveMagnifier);

  function showMagnifier(e) {
    e.preventDefault();
    glass.style.display = 'block';
  }
  function hideMagnifier(e) {
    e.preventDefault();
    glass.style.display = 'none';
  }
  function moveMagnifier(e) {
    glass.style.backgroundSize = (img.width * zoom) + "px " + (img.height * zoom) + "px";
    w = glass.offsetWidth / 2;
    h = glass.offsetHeight / 2;
    // glass.style.height = glass.style.width;
    var pos, x, y;
    /*prevent any other actions that may occur when moving over the image*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = getCursorPos(e);
    x = pos.x;
    y = pos.y;
    glass.style.display = 'block';
    /*prevent the magnifier glass from being positioned outside the image:*/
    if (x > img.width - (w / zoom)) { x = img.width - (w / zoom); }
    // if (x > img.width) { glass.style.display = 'none'; }
    if (x < w / zoom) { x = w / zoom; }
    // if (x < 0) { glass.style.display = 'none'; }
    if (y > img.height - (h / zoom)) { y = img.height - (h / zoom); }
    // if (y > img.height) { glass.style.display = 'none'; }
    if (y < h / zoom) { y = h / zoom; }
    // if (y < 0) { glass.style.display = 'none'; }
    /*set the position of the magnifier glass:*/
    glass.style.left = (x - w) + "px";
    glass.style.top = (y - h) + "px";
    /*display what the magnifier glass "sees":*/
    glass.style.backgroundPosition = "-" + ((x * zoom) - w + bw) + "px -" + ((y * zoom) - h + bw) + "px";
  }
  function getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /*get the x and y positions of the image:*/
    a = img.getBoundingClientRect();
    /*calculate the cursor's x and y coordinates, relative to the image:*/
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /*consider any page scrolling:*/
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }
}

window.addEventListener('load', function () {   // changing img on load
  let fileInput = document.querySelector('input[type="file"]');
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        var img = document.querySelector('.tempImageUpload');
        if (img) {
          img.src = URL.createObjectURL(this.files[0]);
          glass = document.querySelector('.img-magnifier-glass');
          if (glass) {
            glass.style.backgroundImage = "url('" + img.src + "')";
          }
        }
      }
    });
  }
});

// window.addEventListener('load', function () {
//   let fileInput = document.querySelector('input[type="file"]');
//   if (fileInput) {
//     fileInput.addEventListener('change', function () {
//       if (this.files && this.files[0]) {
//         document.querySelector('.tempImageUpload').src = URL.createObjectURL(this.files[0]); // set src to blob url
//       }
//     });
//   }
// });





