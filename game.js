
kaplay({
    focus: false,
    font: "happy",
    background: "#4a3052",
});

// Sprites, fonts en geluiden laden
loadSprite("mark", "assets/sprites/mark.png");
loadSprite("bean", "/sprites/bean.png");

loadBitmapFont("happy", "/fonts/happy_28x36.png", 28, 36);
loadBitmapFont("happy-o", "/fonts/happy-o_36x45.png", 36, 45);

loadSound("score", "/sounds/score.mp3");
loadSound("wooosh", "/sounds/wooosh.mp3");
loadSound("hit", "/sounds/hit.mp3");
loadSound("off", "/sounds/off.mp3");

// Instellingen
setGravity(1850);

// Game
scene("game", () => {
    const PIPE_OPEN = 225;
    const PIPE_MIN = 25;
    const JUMP_FORCE = 550;
    let SPEED = 300;
    const CEILING = -60;

    let score = 0;

    // Speler
    const bean = add([
        sprite("bean"),
        pos(width() / 10, 0),
        area({ isSensor: true }),
        body(),
    ]);

    // Controleer of de speler buiten beeld valt
    bean.onUpdate(() => {
        if (bean.pos.y >= height() || bean.pos.y <= CEILING) {
            play("off");
            go("lose", score);
        }
    });

    // Springen met spatie
    onKeyPress("space", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });

    // Springen met gamepad
    onGamepadButtonPress("south", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });

    // Springen met muis
    onMousePress("left", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });

    // Beginhoogte van de buizen
    let prevPipeH1 = center().y - PIPE_OPEN / 2;

    // Buizen maken
    function spawnPipe() {
        const PIPE_MAX = height() - PIPE_MIN - PIPE_OPEN;

        const low = Math.max(
            PIPE_MIN,
            prevPipeH1 - PIPE_OPEN * 1.2
        );

        const high = Math.min(
            PIPE_MAX,
            prevPipeH1 + PIPE_OPEN * 1.2
        );

        const h1 = prevPipeH1 = rand(low, high);
        const h2 = height() - h1 - PIPE_OPEN;

        // Gemeenschappelijke onderdelen van een buis
        const makePipe = (posY, h) => [
            pos(width(), posY),
            rect(64, h),
            color(0, 127, 255),
            outline(4),
            area({ isSensor: true }),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            "pipe",
        ];

        // Bovenste buis
        add(makePipe(0, h1));

        // Onderste buis
        add([
            ...makePipe(h1 + PIPE_OPEN, h2),
            { passed: false },
        ]);
    }

    // Snelheid verhogen
    function addSpeed() {
        SPEED += 1;
    }

    // Botsing met buizen
    bean.onCollide("pipe", () => {
        play("hit");
        addKaboom(bean.pos);
        go("lose", score);
    });

    // Score bijhouden
    onUpdate("pipe", (p) => {
        if (p.pos.x + p.width <= bean.pos.x && p.passed === false) {
            addScore();
            p.passed = true;
        }
    });

    // Buizen laten verschijnen
    loop(0.8, spawnPipe);

    // Spel steeds sneller maken
    loop(0.05, addSpeed);

    // Score weergeven
    const scoreLabel = add([
        text(score.toString(), {
            font: "happy-o",
            size: 45,
        }),
        anchor("center"),
        pos(width() / 2, 80),
        fixed(),
        z(1000),
    ]);

    function addScore() {
        score++;
        scoreLabel.text = score.toString();
        play("score");
    }
});

// Game over
scene("lose", (score) => {
    add([
        sprite("bean"),
        pos(width() / 2, height() / 2 - 108),
        scale(3),
        anchor("center"),
    ]);

    // Score weergeven
    add([
        text(score, {
            font: "happy-o",
        }),
        pos(width() / 2, height() / 2 + 108),
        scale(3),
        anchor("center"),
    ]);

    // Opnieuw beginnen
    wait(0.2, () => {
        onKeyPress("space", () => go("game"));
        onMousePress(() => go("game"));
    });
});

// Game starten
go("game");
