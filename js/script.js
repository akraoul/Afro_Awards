document.addEventListener('DOMContentLoaded', () => {
    // --- Data & Initialization ---
    // Mapping keys (data-category) to DOM Container IDs
    const categoryMapping = {
        'best-artist-performance': 'cat-artist-performance',
        'best-song': 'cat-best-song',
        'best-dj': 'cat-best-dj',
        'best-album': 'cat-best-album',
        'best-tiktoker': 'cat-best-tiktoker',
        'best-mc': 'cat-best-mc',
        'best-male-model': 'cat-best-male-model',
        'best-female-model': 'cat-best-female-model',
        'best-dancer': 'cat-best-dancer',
        'best-promoter': 'cat-best-promoter',
        'best-rap-artist': 'cat-best-rap-artist',
        'best-rap-song': 'cat-best-rap-song',
        'best-athlete': 'cat-best-athlete'
    };

    const defaultNominees = {
        'best-artist-performance': [
            { name: "Afrococoa" }, { name: "Mansa" }, { name: "Union Sacree" },
            { name: "Motion Group" }, { name: "Manur" }, { name: "J bliz" }, { name: "cj wanted" }
        ],
        'best-song': [
            { name: "Certifiee", subText: "Union Sacree" }, { name: "1960 Groove", subText: "Afrococoa" },
            { name: "zero on zero", subText: "Mansa" }, { name: "ebelebe", subText: "cj wanted" },
            { name: "my head", subText: "Motion" }
        ],
        'best-dj': [
            { name: "Dj Anthony" }, { name: "Dj Dejavu" }, { name: "Dj djafar" },
            { name: "Dj Escobar" }, { name: "Dj foxie" }
        ],
        'best-album': [
            { name: "3 Am", subText: "Afrococoa" }, { name: "motion" }, { name: "top tier", subText: "Mansa" }
        ],
        'best-tiktoker': [
            { name: "Nav" }, { name: "nathan" }, { name: "Alias" }, { name: "La fleure" },
            { name: "certified malee" }, { name: "Rexigner" }, { name: "zamani" }, { name: "dilan" }
        ],
        'best-mc': [
            { name: "Izzy" }, { name: "kartel" }, { name: "Miller" }, { name: "iceflare" }
        ],
        'best-male-model': [
            { name: "Rexigner" }, { name: "walther vill" }, { name: "Michael chimaobi" }, { name: "Lory carel" }
        ],
        'best-female-model': [
            { name: "monique" }, { name: "Priscilla" }, { name: "koriane" }, { name: "Dixie b" }
        ],
        'best-dancer': [
            { name: "prince afro" }, { name: "Dc vibe" }, { name: "l'ovni" }, { name: "thoko" }
        ],
        'best-promoter': [
            { name: "josh flex" }, { name: "dasylva" }, { name: "xclusiv tonye" },
            { name: "olivier" }, { name: "Escausé" }, { name: "fifty" }, { name: "Yves" }
        ],
        'best-rap-artist': [
            { name: "Rexigner" }, { name: "jbliz" }, { name: "no game le ghost" },
            { name: "lafigth Rondo" }, { name: "fritz Diddy" }, { name: "Destroyer drex" },
            { name: "KUMBA BOY" }
        ],
        'best-rap-song': [
            { name: "Amiri", subText: "la figth" }, { name: "shake", subText: "rexigner" },
            { name: "again", subText: "fritz diddy" }, { name: "hightunes", subText: "jbliz" },
            { name: "dejavu", subText: "destroyer drex" }, { name: "Incompris", subText: "no game le ghost" }
        ],
        'best-athlete': [
            { name: "Bara" }, { name: "camara" }, { name: "mpomez" }
        ]
    };

    // --- Core Logic (Firebase with Fallback) ---

    // 1. Check Configuration validity
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

    // Initial Render with Defaults (Instant Load)
    // We start with defaults to ensure UI is never empty while waiting for DB
    let nomineesData = defaultNominees;
    let voteCounts = {}; // Moved to global scope for offline access
    renderNominees();

    if (isFirebaseConfigured) {
        // 2. Listen for Nominees Data if configured
        const nomineesRef = db.ref('nominees');
        const votesRef = db.ref('votes');
        // let voteCounts = {}; // Redundant here

        nomineesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                // If DB is empty, seed defaults
                console.log("Database empty, seeding defaults...");
                seedDefaults();
            } else {
                nomineesData = data;
                renderNominees();
                refreshStats();
            }
        });

        votesRef.on('value', (snapshot) => {
            voteCounts = snapshot.val() || {};
            refreshStats();
        });

        function seedDefaults() {
            nomineesData = defaultNominees;
            nomineesRef.set(defaultNominees);
        }
    } else {
        console.warn("Firebase not configured. Using local defaults.");
        // We could optionally show a banner here
    }

    // 2. Render Functions
    function renderNominees() {
        for (const [categoryKey, nominees] of Object.entries(nomineesData)) {
            const containerId = categoryMapping[categoryKey];
            const section = document.getElementById(containerId);
            if (!section) continue;

            const grid = section.querySelector('.nominees-grid');
            if (!grid) continue;

            // Clear existing content safely
            grid.innerHTML = '';

            const list = Array.isArray(nominees) ? nominees : [];

            list.forEach((nom, index) => { // Added index for tracking if needed
                const card = document.createElement('div');
                card.className = 'nominee-card';
                card.dataset.category = categoryKey;
                card.dataset.nominee = nom.name;

                // Avatar Background
                const hasImageClass = nom.image ? 'has-image' : '';

                card.innerHTML = `
                    <div class="nominee-avatar ${hasImageClass}"></div>
                    <div class="nominee-info">
                        <h4>${nom.name}</h4>
                        ${nom.subText ? `<p class="sub-text">${nom.subText}</p>` : ''}
                        
                        <div class="vote-stats">
                            <div class="vote-progress-bg">
                                <div class="vote-progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="vote-count-text">
                                <span class="count">0 votes</span>
                                <span class="percent">0%</span>
                            </div>
                        </div>

                        <button class="vote-btn">Vote</button>
                    </div>
                `;

                if (nom.image) {
                    card.querySelector('.nominee-avatar').style.backgroundImage = `url('${nom.image}')`;
                    card.querySelector('.nominee-avatar').style.backgroundSize = 'cover';
                    card.querySelector('.nominee-avatar').style.backgroundPosition = 'center';
                }

                card.addEventListener('click', () => handleVote(card));
                grid.appendChild(card);
            });
        }

        // Restore local user selection state (visual only)
        restoreUserVotes();
    }

    // --- Global Elements ---
    const searchInput = document.getElementById('searchInput');
    const navPills = document.querySelectorAll('.nav-pill');
    const sections = document.querySelectorAll('.category-section');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const categoryNav = document.getElementById('categoryNav');
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const exportBtn = document.getElementById('exportDataBtn');
    const toast = document.getElementById('voteToast');

    // --- Event Listeners ---
    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }

    if (filterToggleBtn && categoryNav) {
        filterToggleBtn.addEventListener('click', () => {
            categoryNav.classList.toggle('show');
            const icon = filterToggleBtn.querySelector('.icon');
            icon.textContent = categoryNav.classList.contains('show') ? '-' : '+';
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterContent(query);
            if (query.length > 0) updateActivePill('all');
        });
    }

    navPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const targetId = pill.dataset.target;
            updateActivePill(targetId);

            if (targetId === 'all') {
                filterContent('');
                searchInput.value = '';
                // Show all sections
                sections.forEach(sec => sec.style.display = 'block');
                document.querySelector('#vote').scrollIntoView({ behavior: 'smooth' });
            } else {
                searchInput.value = '';
                filterContent('');

                // Hide all sections except target
                sections.forEach(sec => {
                    if (sec.id === targetId) {
                        sec.style.display = 'block';
                    } else {
                        sec.style.display = 'none';
                    }
                });

                // Scroll to top of vote section to ensure visibility
                document.querySelector('#vote').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (exportBtn) {
        exportBtn.addEventListener('click', exportVoteData);
    }

    // --- Logic Functions ---

    function updateActivePill(targetId) {
        navPills.forEach(p => {
            if (p.dataset.target === targetId || (targetId === 'all' && p.dataset.target === 'all')) {
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });
    }

    function filterContent(query) {
        sections.forEach(section => {
            const nominees = section.querySelectorAll('.nominee-card');
            const categoryTitle = section.querySelector('.category-title').textContent.toLowerCase();
            let hasVisibleNominees = false;
            const categoryMatch = categoryTitle.includes(query);

            nominees.forEach(card => {
                const name = card.querySelector('h4').textContent.toLowerCase();
                const subText = card.querySelector('.sub-text') ? card.querySelector('.sub-text').textContent.toLowerCase() : '';
                if (name.includes(query) || subText.includes(query) || categoryMatch) {
                    card.style.display = 'flex';
                    hasVisibleNominees = true;
                } else {
                    card.style.display = 'none';
                }
            });
            section.style.display = hasVisibleNominees ? 'block' : 'none';
        });
    }

    // --- Voting System ---

    function getNomineeId(category, name) {
        // Create a safe database key
        return `${category}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    function handleVote(selectedCard) {
        // 1. Unlimited Voting - No daily limit check
        // const today = new Date().toISOString().split('T')[0];
        // let dailyStats = JSON.parse(localStorage.getItem('afroAwardsDailyVotes')) || { date: today, count: 0 };
        // ... (Limit logic removed)

        const category = selectedCard.dataset.category;
        const nominee = selectedCard.dataset.nominee;
        const voteKey = getNomineeId(category, nominee);

        // Offline Mode Fallback
        if (!isFirebaseConfigured) {
            console.log("Offline vote (simulated):", voteKey);
            voteCounts[voteKey] = (voteCounts[voteKey] || 0) + 1;
            refreshStats();
            showToast();
            return;
        }

        // 3. Increment Firebase Vote
        // Uses transaction to ensure atomic updates
        const specificVoteRef = db.ref(`votes/${voteKey}`);

        specificVoteRef.transaction((current_value) => {
            return (current_value || 0) + 1;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error('Vote failed abnormally!', error);
            } else if (committed) {
                // Success - update local usage
                showToast();
                // restoreUserVotes(); // No longer needed for unlimited
            }
        });
    }

    function restoreUserVotes() {
        // Disabled for unlimited voting mode
    }

    function refreshStats() {
        // Calculate totals per category
        const allCategories = Object.keys(nomineesData);
        let globalTotalVotes = 0;

        allCategories.forEach(cat => {
            const catNominees = nomineesData[cat] || [];
            let totalVotes = 0;

            // First pass: sum
            catNominees.forEach(nom => {
                const key = getNomineeId(cat, nom.name);
                const val = voteCounts[key] || 0;
                totalVotes += val;
                globalTotalVotes += val;
            });

            // Second pass: update UI
            const catCards = document.querySelectorAll(`[data-category="${cat}"]`);
            catCards.forEach(card => {
                const nomName = card.dataset.nominee;
                const key = getNomineeId(cat, nomName);
                const count = voteCounts[key] || 0;

                let percentage = 0;
                if (totalVotes > 0) {
                    percentage = Math.round((count / totalVotes) * 100);
                }

                const fill = card.querySelector('.vote-progress-fill');
                const countText = card.querySelector('.vote-count-text .count');
                const percentText = card.querySelector('.vote-count-text .percent');

                if (fill && countText && percentText) {
                    fill.style.width = `${percentage}%`;
                    countText.textContent = `${count} votes`;
                    percentText.textContent = `${percentage}%`;
                }
            });
        });

        // Update Global Counter
        const globalCountEl = document.getElementById('globalVoteCount');
        if (globalCountEl) {
            globalCountEl.textContent = globalTotalVotes.toLocaleString();
        }
    }

    function showToast() {
        if (!toast) return;
        toast.className = "toast show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    function exportVoteData() {
        alert("Export now downloads Firebase data snapshot.");
        const data = {
            nominees: nomineesData,
            votes: voteCounts,
            exportedAt: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "afro_awards_firebase_export.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    // --- Leaderboard Logic ---
    const leaderboardBtn = document.getElementById('viewLeaderboardBtn');
    const leaderboardModal = document.getElementById('leaderboardModal');
    const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');

    if (leaderboardBtn && leaderboardModal && closeLeaderboardBtn) {
        leaderboardBtn.addEventListener('click', () => {
            renderLeaderboard();
            leaderboardModal.style.display = 'flex';
        });

        closeLeaderboardBtn.addEventListener('click', () => {
            leaderboardModal.style.display = 'none';
        });

        leaderboardModal.addEventListener('click', (e) => {
            if (e.target === leaderboardModal) {
                leaderboardModal.style.display = 'none';
            }
        });
    }

    function renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let allNominees = [];

        // Flatten data structure
        for (const [catKey, list] of Object.entries(nomineesData)) {
            if (Array.isArray(list)) {
                list.forEach(nom => {
                    const key = getNomineeId(catKey, nom.name);
                    const count = voteCounts[key] || 0;
                    allNominees.push({
                        name: nom.name,
                        category: catKey, // Use key for lookup if needed, or readable name
                        count: count
                    });
                });
            }
        }

        // Sort Descending
        allNominees.sort((a, b) => b.count - a.count);

        // Render Top 20 (or all)
        allNominees.forEach((item, index) => {
            const row = document.createElement('tr');

            // Readable Category Name Logic (Simple map or format)
            const catName = item.category.replace('cat-', '').replace(/-/g, ' ').toUpperCase();

            let rankClass = '';
            if (index === 0) rankClass = 'rank-1';
            if (index === 1) rankClass = 'rank-2';
            if (index === 2) rankClass = 'rank-3';

            row.innerHTML = `
                <td class="${rankClass}">#${index + 1}</td>
                <td style="font-weight:bold;">${item.name}</td>
                <td style="font-size:0.9em; opacity:0.8;">${catName}</td>
                <td class="${rankClass}">${item.count.toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    }

});
