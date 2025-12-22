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

    // --- Core Logic ---

    // 1. Load Data
    let nomineesData = JSON.parse(localStorage.getItem('afroAwardsNominees')) || {};

    // Check if we need to seed defaults (if empty OR missing categories)
    let dataUpdated = false;
    if (Object.keys(nomineesData).length === 0) {
        nomineesData = defaultNominees;
        dataUpdated = true;
    } else {
        // Ensure all default categories exist, but DO NOT re-add deleted individual nominees
        for (const [key, defaults] of Object.entries(defaultNominees)) {
            if (!nomineesData[key]) {
                // Missing category - add whole
                nomineesData[key] = defaults;
                dataUpdated = true;
            }
        }
    }

    if (dataUpdated) {
        localStorage.setItem('afroAwardsNominees', JSON.stringify(nomineesData));
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

            nominees.forEach(nom => {
                const card = document.createElement('div');
                card.className = 'nominee-card';
                card.dataset.category = categoryKey;
                card.dataset.nominee = nom.name; // Keep name as ID for simplicity as per previous logic

                // Avatar Background
                const hasImageClass = nom.image ? 'has-image' : '';

                card.innerHTML = `
                    <div class="nominee-avatar ${hasImageClass}"></div>
                    <div class="nominee-info">
                        <h4>${nom.name}</h4>
                        ${nom.subText ? `<p class="sub-text">${nom.subText}</p>` : ''}
                        
                        <!-- Stats Placeholder (will be filled by update logic) -->
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

                // Set background image safely
                if (nom.image) {
                    card.querySelector('.nominee-avatar').style.backgroundImage = `url('${nom.image}')`;
                    card.querySelector('.nominee-avatar').style.backgroundSize = 'cover';
                    card.querySelector('.nominee-avatar').style.backgroundPosition = 'center';
                }

                // Add click listener
                card.addEventListener('click', () => handleVote(card));
                grid.appendChild(card);
            });
        }
    }

    // Run Render
    renderNominees();

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
                document.querySelector('#vote').scrollIntoView({ behavior: 'smooth' });
            } else {
                searchInput.value = '';
                filterContent('');
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const offset = 180;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetSection.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
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
            // Re-query dynamically as they might have changed
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

    // Clear old data for user reset (from previous step requests)
    if (!localStorage.getItem('voteReset_v2')) {
        localStorage.removeItem('afroAwardsCounts');
        localStorage.removeItem('afroAwardsVotes');
        localStorage.setItem('voteReset_v2', 'true');
    }

    // Initialize/Load Stats
    const cards = document.querySelectorAll('.nominee-card');
    initializeVoteSystem();

    function initializeVoteSystem() {
        let counts = JSON.parse(localStorage.getItem('afroAwardsCounts'));
        const allCards = document.querySelectorAll('.nominee-card');

        // Init counts if empty
        if (!counts) {
            counts = {};
            allCards.forEach(card => {
                const id = getNomineeId(card);
                counts[id] = 0;
            });
            localStorage.setItem('afroAwardsCounts', JSON.stringify(counts));
        }

        // Restore UI State (User Votes & Stats)
        restoreUserVotes();
        const uniqueCategories = Object.keys(categoryMapping); // Iterate all known categories
        uniqueCategories.forEach(cat => updateCategoryStats(cat));
    }

    function getNomineeId(card) {
        return `${card.dataset.category}-${card.dataset.nominee}`;
    }

    function handleVote(selectedCard) {
        // Daily Vote Limit Logic
        const today = new Date().toISOString().split('T')[0];
        let dailyStats = JSON.parse(localStorage.getItem('afroAwardsDailyVotes')) || { date: today, count: 0 };

        if (dailyStats.date !== today) dailyStats = { date: today, count: 0 };

        if (dailyStats.count >= 10) {
            alert("You have reached your daily limit of 10 votes. Please come back tomorrow!");
            return;
        }

        const category = selectedCard.dataset.category;
        const nominee = selectedCard.dataset.nominee;
        const nomineeId = getNomineeId(selectedCard);

        // Check Previous
        let userVotes = JSON.parse(localStorage.getItem('afroAwardsVotes')) || {};
        const previousNominee = userVotes[category];
        let counts = JSON.parse(localStorage.getItem('afroAwardsCounts')) || {};

        if (previousNominee === nominee) return; // Already voted for this

        // Valid Vote Proceeding
        dailyStats.count++;
        localStorage.setItem('afroAwardsDailyVotes', JSON.stringify(dailyStats));

        // Update Count
        counts[nomineeId] = (counts[nomineeId] || 0) + 1;
        localStorage.setItem('afroAwardsCounts', JSON.stringify(counts));

        // Update User Selection
        const currentCategoryCards = document.querySelectorAll(`[data-category="${category}"]`);
        currentCategoryCards.forEach(card => {
            card.classList.remove('selected');
            const btn = card.querySelector('.vote-btn');
            if (btn) btn.textContent = 'Vote';
        });

        selectedCard.classList.add('selected');
        const btn = selectedCard.querySelector('.vote-btn');
        if (btn) btn.textContent = 'Voted';

        userVotes[category] = nominee;
        localStorage.setItem('afroAwardsVotes', JSON.stringify(userVotes));

        showToast();
        updateCategoryStats(category);
    }

    function restoreUserVotes() {
        const votes = JSON.parse(localStorage.getItem('afroAwardsVotes')) || {};
        for (const [category, nominee] of Object.entries(votes)) {
            const cards = document.querySelectorAll(`[data-category="${category}"]`);
            cards.forEach(card => {
                if (card.dataset.nominee === nominee) {
                    card.classList.add('selected');
                    const btn = card.querySelector('.vote-btn');
                    if (btn) btn.textContent = 'Voted';
                }
            });
        }
    }

    function updateCategoryStats(category) {
        const categoryCards = document.querySelectorAll(`[data-category="${category}"]`);
        let counts = JSON.parse(localStorage.getItem('afroAwardsCounts')) || {};

        let totalVotes = 0;
        categoryCards.forEach(card => {
            const id = getNomineeId(card);
            totalVotes += (counts[id] || 0);
        });

        categoryCards.forEach(card => {
            const id = getNomineeId(card);
            const count = counts[id] || 0;
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
    }

    function showToast() {
        if (!toast) return;
        toast.className = "toast show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    function exportVoteData() {
        const data = {
            counts: JSON.parse(localStorage.getItem('afroAwardsCounts') || '{}'),
            userHistory: JSON.parse(localStorage.getItem('afroAwardsVotes') || '{}'),
            daily: JSON.parse(localStorage.getItem('afroAwardsDailyVotes') || '{}'),
            nominees: JSON.parse(localStorage.getItem('afroAwardsNominees') || '{}'),
            exportedAt: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "afro_awards_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
});
