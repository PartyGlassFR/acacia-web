// --- Initialize Proxy Engine (UV v2 Stable Edition) ---
async function initProxy() {
    try {
        if ('serviceWorker' in navigator) {
            // No bare-mux required! Just register the worker directly.
            await navigator.serviceWorker.register('/acacia-web/sw.js', { scope: __uv$config.prefix });
            console.log("Proxy Ready (v2).");
        }
    } catch (err) { console.error("Proxy Error:", err); }
}
initProxy();

// --- Proxy Routing Logic ---
function loadProxy(query, customName = null) {
    if (!query) return;

    let fullUrl = query.trim();
    if (!fullUrl.includes('.') || fullUrl.includes(' ')) {
        fullUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(fullUrl);
    } else if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
    }

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

    const frame = document.getElementById('proxy-frame');
    if(frame) frame.src = __uv$config.prefix + __uv$config.encodeUrl(fullUrl);
    
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

// --- Remote GitHub Games Fetcher (Offline Placeholder Fix) ---
async function initGames() {
    const grid = document.getElementById('games-grid');
    if (!grid || grid.children.length > 0) return; 

    const githubUser = "genizy"; 
    const githubRepo = "web-port"; 

    grid.innerHTML = '<p style="color:#a7f3d0; text-align:center; width:100%;">Syncing games from GitHub...</p>';

    try {
        const response = await fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/contents/`);
        if (!response.ok) throw new Error("GitHub API Error.");
        
        const data = await response.json();
        grid.innerHTML = ''; 

        // This is an OFFLINE image. It literally cannot be blocked by your firewall!
        const offlinePlaceholder = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="120"%3E%3Crect width="100%25" height="100%25" fill="%23222"/%3E%3Ctext x="50%25" y="50%25" fill="%23a7f3d0" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle" alignment-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E`;

        data.forEach(item => {
            if (item.type === "dir") { 
                const gameName = item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const playUrl = `https://${githubUser}.github.io/${githubRepo}/${item.name}/`;
                const thumb = `https://raw.githubusercontent.com/${githubUser}/${githubRepo}/main/${item.name}/thumbnail.png`;

                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <img src="${thumb}" class="game-thumb" alt="${gameName}" onerror="this.src='${offlinePlaceholder}'">
                    <div class="game-info">${gameName}</div>
                `;
                card.onclick = () => loadProxy(playUrl, gameName);
                grid.appendChild(card);
            }
        });
    } catch (err) {
        console.error("Failed to sync:", err);
        grid.innerHTML = '<p style="color:#ff6b6b; text-align:center; width:100%;">Failed to load games database.</p>';
    }
}

// --- UI View Logic ---
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(`${viewName}-view`).classList.add('active-view');
    if (viewName === 'games') initGames();
}

function toggleSettings() { document.getElementById('settings-view').classList.toggle('show'); }

function switchSettingsTab(tabName, element) {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active-tab'));
    document.querySelectorAll('#settings-menu li').forEach(li => li.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active-tab');
    element.classList.add('active');
}

// --- Dynamic Settings ---
const savedDock = localStorage.getItem('acacia-dock') || 'dock-bottom';
document.getElementById('proxy-view').classList.add(savedDock);
document.getElementById('control-position').value = savedDock;

document.getElementById('control-position').addEventListener('change', e => {
    const pView = document.getElementById('proxy-view');
    pView.classList.remove('dock-bottom', 'dock-top', 'dock-left', 'dock-right');
    pView.classList.add(e.target.value);
    localStorage.setItem('acacia-dock', e.target.value);
});

// --- Theme Logic ---
function setMode(mode) {
    if (mode === 'light') { document.documentElement.setAttribute('data-mode', 'light'); } 
    else { document.documentElement.removeAttribute('data-mode'); }
    
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

// --- Privacy Tools ---
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
    window.location.replace("https://classroom.google.com");
}

// --- Aesthetics ---
for (let i = 0; i < 20; i++) {
    let leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.style.left = Math.random() * 100 + 'vw';
    leaf.style.animationDuration = `${Math.random()*7+8}s, ${Math.random()*3+3}s`;
    leaf.style.animationDelay = `${Math.random()*10}s, ${Math.random()*5}s`;
    leaf.style.width = leaf.style.height = `${Math.random()*10+10}px`;
    document.getElementById('leaf-container').appendChild(leaf);
}
