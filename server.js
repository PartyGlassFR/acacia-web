import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { createBareServer } from '@tomphttp/bare-server-node';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import fs from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const bareServer = createBareServer('/bare/');
const app = express();

// --- NEW: Games Folder Scanner ---
app.get('/api/games', (req, res) => {
    const gamesDir = join(__dirname, 'public', 'games');
    const gamesList = [];

    // Create the folder if it doesn't exist so the server doesn't crash
    if (!fs.existsSync(gamesDir)) {
        fs.mkdirSync(gamesDir, { recursive: true });
        return res.json([]); 
    }

    try {
        const folders = fs.readdirSync(gamesDir, { withFileTypes: true });

        for (const folder of folders) {
            if (folder.isDirectory()) {
                const gamePath = `/games/${folder.name}/`;
                let thumb = 'https://via.placeholder.com/200x120?text=No+Thumbnail'; // Fallback
                
                // Scanner rule: Check for thumbnail.png or main.png
                if (fs.existsSync(join(gamesDir, folder.name, 'thumbnail.png'))) {
                    thumb = `${gamePath}thumbnail.png`;
                } else if (fs.existsSync(join(gamesDir, folder.name, 'main.png'))) {
                    thumb = `${gamePath}main.png`;
                }

                // Format the folder name (e.g., "retro-bowl" -> "Retro Bowl")
                const formattedName = folder.name
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                gamesList.push({ 
                    name: formattedName, 
                    path: gamePath, 
                    thumb: thumb 
                });
            }
        }
        res.json(gamesList);
    } catch (err) {
        console.error("Scanner Error:", err);
        res.status(500).json({ error: "Failed to scan games directory." });
    }
});

// Serve the frontend UI
app.use(express.static(join(__dirname, 'public')));

// Serve the proxy engines
app.use('/uv/', express.static(uvPath));
app.use('/baremux/', express.static(baremuxPath));
app.use('/bareasmodule3/', express.static(join(__dirname, 'node_modules', '@mercuryworkshop', 'bare-as-module3')));

const server = createServer();

server.on('request', (req, res) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeRequest(req, res);
    } else {
        app(req, res);
    }
});

server.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Acacia is live! Open http://localhost:${PORT} in your browser.`);
});