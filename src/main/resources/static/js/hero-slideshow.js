
document.addEventListener("DOMContentLoaded", function () {

    const slideshow = document.querySelector(".hero-background-slideshow");

    if (!slideshow) {
        return;
    }

    const slides = slideshow.querySelectorAll(".hero-background-image");

    // Restaurant images shown behind the hero text
    const images = [
        "images/hero/hero-burger.jpg",
        "images/hero/hero-kota.jpg",
        "images/hero/hero-pizza.jpg",
        "images/hero/hero-hotdog.jpg",
        "images/hero/hero-sandwich.jpg"
    ];

    let currentIndex = -1;
    let activeSlide = 0;

    // Preload images for smoother transitions
    images.forEach(function (imagePath) {
        const image = new Image();
        image.src = imagePath;
    });

    // Random image selection without repeating immediately
    function getRandomImage() {

        let randomIndex;

        do {
            randomIndex = Math.floor(Math.random() * images.length);
        } while (randomIndex === currentIndex);

        return randomIndex;
    }

    // Change the hero background
    function changeBackground() {

        const nextIndex = getRandomImage();

        const nextSlide = activeSlide === 0 ? 1 : 0;

        const image = new Image();

        image.onload = function () {

            slides[nextSlide].style.backgroundImage =
                `url("${images[nextIndex]}")`;

            slides[nextSlide].classList.add("active");

            slides[activeSlide].classList.remove("active");

            activeSlide = nextSlide;

            currentIndex = nextIndex;
        };

        image.onerror = function () {
            console.error(
                "Could not load slideshow image:",
                images[nextIndex]
            );
        };

        image.src = images[nextIndex];
    }

    // Start slideshow
    changeBackground();

    // Change image every 5 seconds
    setInterval(changeBackground, 5000);

});
