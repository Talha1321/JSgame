import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

kaplay({
    background: [141, 183, 255],
});

// 1. HET BEGINSCHERM
scene("beginscherm", () => {
    add([
        text("Fluppy Birb", { size: 48 }),
        pos(width() / 2, height() / 2 - 50),
        anchor("center"),
    ]);

    add([
        text("Druk op SPATIE of klik om te starten", { size: 20 }),
        pos(width() / 2, height() / 2 + 40),
        anchor("center"),
    ]);

    wait(0.2, () => {
        onKeyPress("space", () => {
            go("game");
        });

        onMousePress(() => {
            go("game");
        });
    });
});

// 2. HET SPEELSCHERM
scene("game", () => {
    add([
        text("HET WERKT! Je bent nu in de game-scene!", { size: 28 }),
        pos(width() / 2, height() / 2),
        anchor("center"),
    ]);
});

// Start het spel op het beginscherm
go("beginscherm");