window.onload = function() {
    // --- Niveaux et musiques ---
    const levels = [
        { name: "Départ", color: "#00fff0", music: "assets/music/level1.mp3", file: "assets/levels/level1.json" },
        { name: "Ruée Néon", color: "#fa8072", music: "assets/music/level2.mp3", file: "assets/levels/level2.json" },
        { name: "Dash Laser", color: "#6a5af9", music: "assets/music/level3.mp3", file: "assets/levels/level3.json" },
        { name: "Matrix", color: "#0f0", music: "assets/music/level4.mp3", file: "assets/levels/level4.json" },
        { name: "Ice Road", color: "#aeefff", music: "assets/music/level5.mp3", file: "assets/levels/level5.json" },
        { name: "Fire Run", color: "#ff512f", music: "assets/music/level6.mp3", file: "assets/levels/level6.json" },
        { name: "Rainbow Dash", color: "#f9d423", music: "assets/music/level7.mp3", file: "assets/levels/level7.json" },
        { name: "Cyber", color: "#ff00cc", music: "assets/music/level8.mp3", file: "assets/levels/level8.json" },
        { name: "Gold Rush", color: "#ffd700", music: "assets/music/level9.mp3", file: "assets/levels/level9.json" },
        { name: "Ocean Line", color: "#00cfff", music: "assets/music/level10.mp3", file: "assets/levels/level10.json" },
        { name: "Candy Jump", color: "#ff69b4", music: "assets/music/level11.mp3", file: "assets/levels/level11.json" },
        { name: "Space Wars", color: "#fff", music: "assets/music/level12.mp3", file: "assets/levels/level12.json" },
        { name: "Mint Ride", color: "#43e97b", music: "assets/music/level13.mp3", file: "assets/levels/level13.json" },
        { name: "Lava Dash", color: "#fd1d1d", music: "assets/music/level14.mp3", file: "assets/levels/level14.json" },
        { name: "Forest", color: "#38ef7d", music: "assets/music/level15.mp3", file: "assets/levels/level15.json" },
        { name: "Galaxy", color: "#9d50bb", music: "assets/music/level16.mp3", file: "assets/levels/level16.json" },
        { name: "Energy", color: "#f953c6", music: "assets/music/level17.mp3", file: "assets/levels/level17.json" },
        { name: "Arctic", color: "#1cefff", music: "assets/music/level18.mp3", file: "assets/levels/level18.json" },
        { name: "Retro", color: "#fd1d1d", music: "assets/music/level19.mp3", file: "assets/levels/level19.json" },
        { name: "Toxic Dash", color: "#b621fe", music: "assets/music/level20.mp3", file: "assets/levels/level20.json" }
    ];
    let currentLevel = 0;

    // Elements
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const menu = document.getElementById('menu');
    const btnPlay = document.getElementById('btn-play');
    const btnLevels = document.getElementById('btn-levels');
    const btnMusic = document.getElementById('btn-music');
    const levelSelect = document.getElementById('level-select');
    const levelList = document.getElementById('level-list');
    const closeLevel = document.getElementById('close-level');
    const audioPlayer = document.getElementById('audio-player');

    // Menu Levels
    btnLevels.onclick = () => {
        levelSelect.style.display = 'block';
        levelList.innerHTML = '';
        levels.forEach((level, i) => {
            const div = document.createElement('div');
            div.className = 'level-preview' + (i === currentLevel ? ' selected' : '');
            div.style.background = level.color;
            div.innerHTML = `<span>Niveau ${i+1}</span>`;
            div.onclick = () => {
                currentLevel = i;
                Array.from(document.querySelectorAll('.level-preview')).forEach(d => d.classList.remove('selected'));
                div.classList.add('selected');
            };
            levelList.appendChild(div);
        });
    };
    closeLevel.onclick = () => {
        levelSelect.style.display = 'none';
    };

    // Lancer le jeu
    btnPlay.onclick = () => {
        menu.style.display = 'none';
        canvas.style.display = 'block';
        startLevel(currentLevel);
    };

    function startLevel(idx) {
        loadLevel(levels[idx].file, (levelData) => {
            playMusic(levels[idx].music);
            gameLoop(levelData);
        });
    }

    function playMusic(src) {
        audioPlayer.src = src;
        audioPlayer.volume = 0.6;
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    }

    btnMusic.onclick = () => {
        if (audioPlayer.paused) {
            audioPlayer.play();
            btnMusic.innerText = "Musique: Stop";
        } else {
            audioPlayer.pause();
            btnMusic.innerText = "Musique: Play";
        }
    };

    // Chargement d'un niveau (JSON)
    function loadLevel(file, cb) {
        fetch(file).then(r=>r.json()).then(cb);
    }

    // --- GAMEPLAY ---

    function gameLoop(levelData) {
        // Paramètres du joueur
        let player = {
            x: 80, y: canvas.height-90,
            w: 30, h: 30,
            vy: 0, jumping: false, dead: false
        };
        let cameraX = 0;
        let gravity = 1.1;
        let jumpPower = -16;
        let speed = levelData.speed || 7;
        let platforms = levelData.platforms;
        let obstacles = levelData.obstacles;
        let bgColor = levelData.bgColor || "#222";
        let levelEnd = levelData.end || (platforms[platforms.length-1].x+platforms[platforms.length-1].w);
        let win = false;
        let frame = 0;

        function draw() {
            // Fond
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Décor à la Geometry Dash
            if(levelData.decor) {
                for(let deco of levelData.decor) {
                    ctx.fillStyle = deco.color;
                    ctx.globalAlpha = deco.alpha||0.19;
                    ctx.fillRect(deco.x-cameraX, deco.y, deco.w, deco.h);
                    ctx.globalAlpha = 1;
                }
            }
            // Plateformes
            for(let plat of platforms) {
                ctx.fillStyle = plat.color || levels[currentLevel].color;
                ctx.fillRect(plat.x-cameraX, plat.y, plat.w, plat.h);
            }
            // Obstacles
            for(let obs of obstacles) {
                ctx.fillStyle = obs.color || "#ff0033";
                ctx.fillRect(obs.x-cameraX, obs.y, obs.w, obs.h);
            }
            // Joueur
            ctx.save();
            ctx.shadowColor = levels[currentLevel].color;
            ctx.shadowBlur = 18;
            ctx.fillStyle = "#fff";
            ctx.fillRect(player.x, player.y, player.w, player.h);
            ctx.restore();

            // Arrivée
            ctx.fillStyle = "#fffc00";
            ctx.globalAlpha = 0.8;
            ctx.fillRect(levelEnd-cameraX, canvas.height-80, 15, 80);
            ctx.globalAlpha = 1;

            // HUD
            ctx.font = "bold 30px Orbitron, Arial";
            ctx.fillStyle = "#fff";
            ctx.fillText(`Niveau ${currentLevel+1}`, canvas.width/2, 44);
        }

        function update() {
            if (player.dead || win) return;
            player.vy += gravity;
            player.y += player.vy;
            // Mouvement horizontal automatique
            player.x += speed;
            cameraX = player.x - 80;

            // Collisions plateformes
            for(let plat of platforms) {
                if (rectCollide(player, plat, cameraX)) {
                    if (player.vy > 0 && player.y+player.h-plat.y < 22) {
                        player.y = plat.y - player.h;
                        player.vy = 0;
                        player.jumping = false;
                    }
                }
            }
            // Collisions obstacles
            for(let obs of obstacles) {
                if(rectCollide(player, obs, cameraX)){
                    player.dead = true;
                    setTimeout(showMenu, 1200);
                }
            }
            // Arrivée
            if(player.x > levelEnd) {
                win = true;
                setTimeout(showMenu, 1500);
            }
            // Tomber dans le vide
            if(player.y > canvas.height) {
                player.dead = true;
                setTimeout(showMenu, 1200);
            }
        }

        function showMenu() {
            canvas.style.display = 'none';
            menu.style.display = 'block';
        }

        // Contrôle saut
        window.onkeydown = (e) => {
            if((e.code === 'Space' || e.code==='ArrowUp' || e.code==='KeyW') && !player.jumping && !player.dead && !win) {
                player.vy = jumpPower;
                player.jumping = true;
            }
        };
        // Boucle
        function loop() {
            update();
            draw();
            frame++;
            if(!win && !player.dead) requestAnimationFrame(loop);
        }
        loop();
    }

    // Collision rectangle
    function rectCollide(a, b, cameraX) {
        return (a.x < (b.x-cameraX)+b.w && a.x+a.w > (b.x-cameraX) && a.y < b.y+b.h && a.y+a.h > b.y);
    }
};
