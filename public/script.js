// --- Initialize Proxy Engine (Server Cluster Fix) ---
async function initProxy() {
    try {
        const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
        
        // A cluster of community servers to prevent your home Wi-Fi from being blocked
        const bareServers = [
            "https://bare.benrogo.net/",
            "https://bare.z1g.top/",
            location.origin + "/bare/" // Your local server as a final backup
        ];

        await connection.setTransport("/bareasmodule3/dist/index.mjs", bareServers);
        
        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/sw.js', { scope: __uv$config.prefix });
            console.log("Proxy Ready.");
        }
    } catch (err) { console.error("Proxy Error:", err); }
}
initProxy();

// --- Proxy Routing Logic ---
function loadProxy(query, customName = null) {
    if (!query) return;

    let fullUrl = query.trim();
    let useProxy = true;

    // 1. Skip proxy for local games
    if (fullUrl.startsWith(window.location.origin) || fullUrl.startsWith('/games/')) {
        fullUrl = query;
        useProxy = false; 
    } 
    // 2. Direct links
    else if (fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) {
        fullUrl = query;
    } 
    // 3. Search via Bing (Google's anti-bot system is too aggressive for local testing)
    else if (!fullUrl.includes('.') || fullUrl.includes(' ')) {
        fullUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(fullUrl);
    } 
    // 4. Missing https://
    else {
        fullUrl = 'https://' + fullUrl;
    }

    // UI Bar handling
    const urlBar = document.getElementById('proxy-url-bar');
    if (urlBar) {
        if (customName) {
            urlBar.value = `Playing: ${customName}`;
            urlBar.readOnly = true;
        } else {
            urlBar.value = query;
            urlBar.readOnly = false;
        }
        urlBar.blur(); 
    }

    // Load the URL directly into the iframe (Preserves History for the Back Button!)
    const frame = document.getElementById('proxy-frame');
    if (frame) {
        frame.src = useProxy ? (__uv$config.prefix + __uv$config.encodeUrl(fullUrl)) : fullUrl;
    }

    switchView('proxy');
}

// --- KEYBOARD EVENT LISTENERS ---
document.getElementById('search-bar').addEventListener('keypress', e => {
    if (e.key === 'Enter') { 
        e.preventDefault(); 
        loadProxy(e.target.value); 
    }
});

document.getElementById('proxy-url-bar').addEventListener('keypress', e => {
    if (e.key === 'Enter' && !e.target.readOnly) { 
        e.preventDefault(); 
        loadProxy(e.target.value); 
    }
});


// --- Dynamic Games Scanner ---
async function initGames() {
    const grid = document.getElementById('games-grid');
    if (!grid || grid.children.length > 0) return; 

    try {
        const response = await fetch('/api/games');
        const games = await response.json();

        if (games.length === 0) {
            grid.innerHTML = '<p style="color:#888; text-align:center; width:100%;">No games found. Put folders in public/games/</p>';
            return;
        }

        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img src="${game.thumb}" class="game-thumb" alt="${game.name}">
                <div class="game-info">${game.name}</div>
            `;
            const fullLocalUrl = window.location.origin + game.path;
            card.onclick = () => loadProxy(fullLocalUrl, game.name);
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Failed to load games:", err);
    }
}

// --- UI View Logic ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(`${viewName}-view`).classList.add('active-view');
    
    if (viewName === 'games') initGames();
}

function toggleSettings() {
    document.getElementById('settings-view').classList.toggle('show');
}

function switchSettingsTab(tabName, element) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active-tab'));
    document.querySelectorAll('#settings-menu li').forEach(li => li.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active-tab');
    element.classList.add('active');
}

// --- Dynamic Settings & Browser Storage ---
const savedDock = localStorage.getItem('acacia-dock') || 'dock-bottom';
document.getElementById('proxy-view').classList.add(savedDock);
document.getElementById('control-position').value = savedDock;

document.getElementById('control-position').addEventListener('change', e => {
    const pView = document.getElementById('proxy-view');
    pView.classList.remove('dock-bottom', 'dock-top', 'dock-left', 'dock-right');
    pView.classList.add(e.target.value);
    localStorage.setItem('acacia-dock', e.target.value);
});

// --- Light/Dark Mode Logic ---
function setMode(mode) {
    if (mode === 'light') {
        document.documentElement.setAttribute('data-mode', 'light');
    } else {
        document.documentElement.removeAttribute('data-mode');
    }
    
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active-mode'));
    const activeBtn = Array.from(document.querySelectorAll('.mode-btn')).find(b => b.innerText.toLowerCase() === mode);
    if (activeBtn) activeBtn.classList.add('active-mode');

    localStorage.setItem('acacia-mode', mode);
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => setMode(btn.innerText.toLowerCase());
});

const savedMode = localStorage.getItem('acacia-mode') || 'dark';
setMode(savedMode);

// --- Privacy Tools (Anti-Close, Cloak, Panic) ---
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') window.location.replace(document.getElementById('panic-url').value);
});

let isCloaked = false;
document.getElementById('cloak-toggle').addEventListener('change', e => isCloaked = e.target.checked);
document.addEventListener("visibilitychange", () => {
    if (isCloaked) document.title = document.hidden ? "Google" : "Acacia";
});

let noClose = false;
document.getElementById('anticlose-toggle').addEventListener('change', e => noClose = e.target.checked);
window.addEventListener('beforeunload', e => { if (noClose) { e.preventDefault(); e.returnValue = ''; }});

function launchStealth() {
    const win = window.open();
    const url = window.location.href;
    const iframe = win.document.createElement('iframe');
    iframe.style.cssText = "width:100%;height:100%;border:none;position:fixed;top:0;left:0;";
    iframe.src = url;
    win.document.body.appendChild(iframe);
}

// --- Leaf Animation Generation ---
for (let i = 0; i < 20; i++) {
    let leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = `${Math.random()*7+8}s, ${Math.random()*3+3}s`;
    leaf.style.animationDelay = `${Math.random()*10}s, ${Math.random()*5}s`;
    leaf.style.width = leaf.style.height = `${Math.random()*10+10}px`;
    document.getElementById('leaf-container').appendChild(leaf);
}
