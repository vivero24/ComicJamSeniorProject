const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const router = express.Router();

// ----------------------
// D.1 - List all comics
// ----------------------
router.get("/games/:gameId/comics", (req, res) => {
    const { gameId } = req.params;

    const gameDir = path.join(__dirname, "comics", gameId);

    if (!fs.existsSync(gameDir)) {
        return res.status(404).json({ error: "No comics found for this game." });
    }

    const comicFolders = fs.readdirSync(gameDir).filter(name =>
        fs.lstatSync(path.join(gameDir, name)).isDirectory()
    );

    const comics = comicFolders.map(comicId => {
        const comicPath = path.join(gameDir, comicId);
        const pages = fs.readdirSync(comicPath).filter(f =>
            f.endsWith(".png") || f.endsWith(".jpg")
        );

        return {
            id: comicId,
            pageCount: pages.length,
            downloadUrl: `/api/games/${gameId}/comics/${comicId}/download`
        };
    });

    res.json(comics);
});

// ----------------------
// D.2 - Download a comic
// ----------------------
router.get("/games/:gameId/comics/:comicId/download", (req, res) => {
    const { gameId, comicId } = req.params;

    const comicDir = path.join(__dirname, "comics", gameId, comicId);

    if (!fs.existsSync(comicDir)) {
        return res.status(404).send("Comic not found");
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${comicId}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    archive.directory(comicDir, false);
    archive.finalize();
});

module.exports = router;
