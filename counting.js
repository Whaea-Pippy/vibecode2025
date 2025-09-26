const imageContainer = document.getElementById('image-container');
const numberContainer = document.getElementById('number-container');
const messageContainer = document.getElementById('message-container');

const images = [
    'images/gabby/cakey.jpg',
    'images/gabby/catrat.jpg',
    'images/gabby/djcatnip.jpg',
    'images/gabby/gabby.jpg',
    'images/gabby/kittyfairy.jpg',
    'images/gabby/mercat.jpg',
    'images/gabby/pandy.jpg',
    'images/chase.jpg',
    'images/everest.jpg',
    'images/marshall.jpg',
    'images/rubble.jpg',
    'images/ryder.jpg',
    'images/skye.jpg',
    'images/zuma.jpg'
];

let correctNumber;

function startGame() {
    imageContainer.innerHTML = '';
    numberContainer.innerHTML = '';
    messageContainer.innerHTML = '';

    correctNumber = Math.floor(Math.random() * 6) + 1;
    const selectedImages = [];
    for (let i = 0; i < correctNumber; i++) {
        const randomIndex = Math.floor(Math.random() * images.length);
        selectedImages.push(images[randomIndex]);
    }

    selectedImages.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        imageContainer.appendChild(img);
    });

    for (let i = 1; i <= 6; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => handleAnswer(i));
        numberContainer.appendChild(button);
    }
}

function handleAnswer(selectedNumber) {
    if (selectedNumber === correctNumber) {
        messageContainer.textContent = `YES - THERE ARE ${correctNumber} READY TO PLAY!`;
    } else {
        messageContainer.textContent = 'Try again!';
    }
}

startGame();
