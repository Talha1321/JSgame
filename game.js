import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

const k = kaplay({
    focus: false,
    background: [141, 183, 255],
});
// Assets laden
loadSprite("bean", "img/bean.png");
loadSprite("mark", "img/mark.png");

// Lettertypen laden
loadBitmapFont("happy", "img/happy.png", 28, 36);
loadBitmapFont("happy-o", "img/happy-o.png", 36, 45);

// Geluiden laden
loadSound("score", "mp3/score.mp3");
loadSound("wooosh", "mp3/woosh.mp3");
loadSound("hit", "mp3/hit.mp3");
loadSound("off", "mp3/off.mp3");

// Zwaartekracht
setGravity(1850);

// 1. BEGINSCHERM
scene("beginscherm", () => {
    add([
        text("Fluppy Birb", { size: 48, font: "happy-o" }),
        pos(width() / 2, height() / 2 - 50),
        anchor("center"),
    ]);
    add([
        text("Druk op SPATIE of klik om te starten", { size: 20, font: "happy" }),
        pos(width() / 2, height() / 2 + 40),
        anchor("center"),
    ]);
    wait(0.2, () => {
        onKeyPress("space", () => go("tussenin"));
        onMousePress(() => go("tussenin"));
    });
});

// 2. TUSSENSCHERM - NAAM INVULLEN
scene("tussenin", () => {
    add([
        text("Vul je naam in", { size: 32, font: "happy-o" }),
        pos(width() / 2, height() / 2 - 100),
        anchor("center"),
    ]);
    // Naam invoerveld
    const nameField = add([
        text("", { size: 24, font: "happy" }),
        textInput(true),
        pos(width() / 2, height() / 2 - 30),
        anchor("center"),
    ]);
    add([
        text("Druk op SPATIE of klik om te beginnen", { size: 18, font: "happy" }),
        pos(width() / 2, height() / 2 + 60),
        anchor("center"),
    ]);
    // Naar de game gaan
    function NextScene() {
        if (nameField.text.trim() === "") {
            return;
        }
        globalThis.name = nameField.text.trim();
        go("game");
    }
    wait(0.2, () => {
        onKeyPress("space", () => NextScene());
        onMousePress(() => NextScene());
    });
});

// 3. GAME
scene("game", () => {
    const PIPE_OPEN = 225;
    const PIPE_MIN = 25;
    const JUMP_FORCE = 550;
    let SPEED = 300;
    const CEILING = -60;
    let score = 0;

    // Speler maken
    const bean = add([
        sprite("bean"),
        pos(width() / 10, 0),
        area({ isSensor: true }),
        body()
    ]);

    // Naam bovenaan weergeven
    add([
        text("Speler: " + globalThis.name, { size: 20, font: "happy" }),
        pos(width() / 2, 30),
        anchor("center"),
        fixed(),
    ]);

    // Score weergeven
    const scoreLabel = add([
        text(score.toString(), { font: "happy-o", size: 45 }),
        anchor("center"),
        pos(width() / 2, 80),
        fixed(),
        z(1000)
    ]);

    // Controleren of de speler buiten het scherm valt
    bean.onUpdate(() => {
        if (bean.pos.y >= height() || bean.pos.y <= CEILING) {
            play("off");
            go("lose", score);
        }
    });

    // Besturing
    onKeyPress("space", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });
    onGamepadButtonPress("south", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });
    onMousePress("left", () => {
        bean.jump(JUMP_FORCE);
        play("wooosh");
    });

    // Hoogte van de vorige buis
    let prevPipeH1 = center().y - PIPE_OPEN / 2;

    // Nieuwe buizen maken
    function spawnPipe() {
        const h1 = prevPipeH1 = (() => {
            const PIPE_MAX = height() - PIPE_MIN - PIPE_OPEN;
            const low = Math.max(PIPE_MIN, prevPipeH1 - PIPE_OPEN * 1.2);
            const high = Math.min(PIPE_MAX, prevPipeH1 + PIPE_OPEN * 1.2);
            return rand(low, high);
        })();
        const h2 = height() - h1 - PIPE_OPEN;

        // Buis maken
        const makePipe = (posY, h) => [
            pos(width(), posY),
            rect(64, h),
            color(0, 127, 255),
            outline(4),
            area({ isSensor: true }),
            move(LEFT, SPEED),
            offscreen({ destroy: true }),
            "pipe"
        ];

        add(makePipe(0, h1));
        add([
            ...makePipe(h1 + PIPE_OPEN, h2),
            { passed: false }
        ]);
    }

    // Snelheid verhogen
    function addSpeed() {
        SPEED += 1;
    }

    // Botsing met een buis
    bean.onCollide("pipe", () => {
        play("hit");
        addKaboom(bean.pos);
        go("lose", score);
    });

    // Score verhogen als een buis gepasseerd wordt
    onUpdate("pipe", (p) => {
        if (p.pos.x + p.width <= bean.pos.x && p.passed === false) {
            addScore();
            p.passed = true;
        }
    });

    // Buizen laten verschijnen
    loop(0.8, spawnPipe);
    loop(0.05, addSpeed);

    // Score verhogen
    function addScore() {
        score++;
        scoreLabel.text = score.toString();
        play("score");
    }
});

// 4. GAME OVER
scene("lose", (score) => {
    // API aanroepen om de score op te slaan
    if (typeof window.submitForm === "function") {
        window.submitForm(globalThis.name, score);
    } else {
        console.error("De API-functie submitForm is niet gevonden.");
    }

    // Speler weergeven
    add([
        sprite("bean"),
        pos(width() / 2, height() / 2 - 108),
        scale(3),
        anchor("center")
    ]);

    // Game over tekst
    add([
        text("GAME OVER", { size: 32, font: "happy-o" }),
        pos(width() / 2, height() / 2),
        anchor("center")
    ]);

    // Score weergeven
    add([
        text("Score: " + score, { font: "happy-o" }),
        pos(width() / 2, height() / 2 + 108),
        scale(2),
        anchor("center")
    ]);

    // Opnieuw beginnen
    add([
        text("Druk op SPATIE of klik om opnieuw te spelen", { size: 18, font: "happy" }),
        pos(width() / 2, height() - 80),
        anchor("center")
    ]);

    wait(0.2, () => {
        onKeyPress("space", () => go("beginscherm"));
        onMousePress(() => go("beginscherm"));
    });
});

// 5. GAME STARTEN
go("beginscherm");