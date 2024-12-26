const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dinamik olarak ekran boyutuna göre ayarla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Oyuncu ve diğer oyun elemanları
let player = { x: canvas.width / 4, y: canvas.height / 2, size: 30, velocity: 0, gravity: 0.5, lift: -10, emoji: "😊", speed: 5 };
let movingSmiles = [];
let obstacles = [];
let frame = 0;
let score = 0;
let gameRunning = true;
let gapSize = 600; // Çizgiler arasındaki başlangıç genişliği (600 piksel)

// Hareketli suratlar oluştur
function createMovingSmiles() {
    if (frame % 60 === 0) {
        movingSmiles.push({
            x: canvas.width,
            y: Math.random() * canvas.height,
            size: 30,
            emoji: Math.random() > 0.2 ? "😊" : "☹️", // %20 ihtimalle üzgün surat
            dx: -2, // Sola doğru hareket
            dy: (Math.random() - 0.5) * 2 // Hafif yukarı/aşağı hareket
        });
    }
}

// Çizgileri (engelleri) oluştur
function createObstacles() {
    if (frame % 120 === 0) {
        let topHeight = Math.random() * (canvas.height - gapSize);
        obstacles.push({
            x: canvas.width,
            y: 0,
            width: 20,
            height: topHeight,
        });
        obstacles.push({
            x: canvas.width,
            y: topHeight + gapSize,
            width: 20,
            height: canvas.height - topHeight - gapSize,
        });

        // Zamanla aralıkları daralt
        if (gapSize > 150) gapSize -= 5; // Minimum 150 piksel aralık
    }
}

// Hareket eden engelleri güncelle
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= 3;
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// Engelleri çiz
function drawObstacles() {
    ctx.fillStyle = "#8b5cf6";
    for (let obs of obstacles) {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }
}

// Hareket eden suratları güncelle
function updateMovingSmiles() {
    for (let i = movingSmiles.length - 1; i >= 0; i--) {
        let smile = movingSmiles[i];
        smile.x += smile.dx;
        smile.y += smile.dy;

        // Ekran dışına çıkan suratları kaldır
        if (smile.x + smile.size < 0) {
            movingSmiles.splice(i, 1);
        }
    }
}

// Hareket eden suratları çiz
function drawMovingSmiles() {
    ctx.font = "30px Arial";
    for (let smile of movingSmiles) {
        ctx.fillText(smile.emoji, smile.x, smile.y);
    }
}

// Gülen suratları yemeyi kontrol et
function checkEating() {
    for (let i = movingSmiles.length - 1; i >= 0; i--) {
        let smile = movingSmiles[i];
        if (
            player.x < smile.x + smile.size &&
            player.x + player.size > smile.x &&
            player.y < smile.y + smile.size &&
            player.y + player.size > smile.y
        ) {
            if (smile.emoji === "☹️") {
                gameOver(); // Üzgün surata çarparsa Game Over
            } else {
                movingSmiles.splice(i, 1); // Gülen surat yutulur
                player.size += 5; // Oyuncu büyüsün
                score += 10;
            }
        }
    }
}

// Oyuncunun fiziksel hareketi
function updatePlayer() {
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Ekranın altına düşerse yukarı çıkar
    if (player.y + player.size > canvas.height) {
        player.y = canvas.height - player.size;
        player.velocity = 0;
    }

    // Ekranın üstüne çıkmasın
    if (player.y < 0) {
        player.y = 0;
        player.velocity = 0;
    }
}

// Fare tıklaması ile zıplama
canvas.addEventListener("click", () => {
    if (gameRunning) {
        player.velocity = player.lift;
    }
});

// Klavye ile sağa/sola hareket
document.addEventListener("keydown", (event) => {
    if (!gameRunning) return;
    if (event.key === "ArrowRight") player.x += player.speed;
    if (event.key === "ArrowLeft") player.x -= player.speed;
});

// Çizgilere (engellere) çarpmayı kontrol et
function checkCollision() {
    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.width &&
            player.x + player.size > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.size > obs.y
        ) {
            return true;
        }
    }
    return false;
}

// Game Over olduğunda üzgün surat
function gameOver() {
    gameRunning = false;
    player.emoji = "☹️"; // Üzgün surat
    drawPlayer();
    document.getElementById("gameOver").style.display = "block";
    document.getElementById("finalScore").textContent = score;
}

function restartGame() {
    player = { x: canvas.width / 4, y: canvas.height / 2, size: 30, velocity: 0, gravity: 0.5, lift: -10, emoji: "😊", speed: 5 };
    movingSmiles = [];
    obstacles = [];
    frame = 0;
    score = 0;
    gapSize = 600; // Genişliği sıfırla
    gameRunning = true;
    document.getElementById("gameOver").style.display = "none";
    loop();
}

document.getElementById("restartButton").addEventListener("click", restartGame);

function drawPlayer() {
    ctx.font = `${player.size}px Arial`;
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.fillText(player.emoji, player.x, player.y + player.size / 2);
}

function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    createMovingSmiles();
    createObstacles();
    updateMovingSmiles();
    updateObstacles();

    drawMovingSmiles();
    drawObstacles();

    updatePlayer();
    drawPlayer();
    checkEating();

    if (checkCollision()) {
        gameOver();
    }

    frame++;
    document.getElementById("score").textContent = `Score: ${score}`;
    requestAnimationFrame(loop);
}

// Oyunu başlat
loop();
