document.addEventListener('DOMContentLoaded', () => {
    const voteButtons = document.querySelectorAll('.vote-btn');
    const cards = document.querySelectorAll('.nominee-card');

    const searchInput = document.getElementById('searchInput');
    const navPills = document.querySelectorAll('.nav-pill');
    const sections = document.querySelectorAll('.category-section');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const categoryNav = document.getElementById('categoryNav');

    // Main Hamburger Menu Logic
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mainNav = document.getElementById('mainNav');
    const exportBtn = document.getElementById('exportDataBtn');
    const toast = document.getElementById('voteToast');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportVoteData);
    }

    function showToast() {
        if (!toast) return;
        toast.className = "toast show";
        setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    function exportVoteData() {
        const counts = localStorage.getItem('afroAwardsCounts');
        const userVotes = localStorage.getItem('afroAwardsVotes');
        const daily = localStorage.getItem('afroAwardsDailyVotes');

        const data = {
            counts: JSON.parse(counts || '{}'),
            userHistory: JSON.parse(userVotes || '{}'),
            daily: JSON.parse(daily || '{}'),
            exportedAt: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "afro_awards_data.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    if (hamburgerBtn && mainNav) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mainNav.classList.toggle('active');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }

    // Mobile Filter Toggle
    if (filterToggleBtn && categoryNav) {
        filterToggleBtn.addEventListener('click', () => {
            categoryNav.classList.toggle('show');
            const icon = filterToggleBtn.querySelector('.icon');
            if (categoryNav.classList.contains('show')) {
                icon.textContent = '-';
            } else {
                icon.textContent = '+';
            }
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterContent(query);

            // Reset active pill to 'All' when searching
            if (query.length > 0) {
                updateActivePill('all');
            }
        });
    }

    // Category Navigation
    navPills.forEach(pill => {
        pill.addEventListener('click', () => {
            const targetId = pill.dataset.target;
            updateActivePill(targetId);

            if (targetId === 'all') {
                // Show all and scroll to top of categories
                filterContent('');
                searchInput.value = '';
                document.querySelector('#vote').scrollIntoView({ behavior: 'smooth' });
            } else {
                // Clear search
                searchInput.value = '';
                filterContent(''); // Reset filtering

                // Scroll to target section
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    // Offset for sticky headers
                    const offset = 180;
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = targetSection.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

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

            // If query matches category title, we might want to show all nominees in that category
            const categoryMatch = categoryTitle.includes(query);

            nominees.forEach(card => {
                const name = card.querySelector('h4').textContent.toLowerCase();
                const subText = card.querySelector('.sub-text') ? card.querySelector('.sub-text').textContent.toLowerCase() : '';

                // Match items if name matches OR if category matches
                if (name.includes(query) || subText.includes(query) || categoryMatch) {
                    card.style.display = 'flex';
                    hasVisibleNominees = true;
                } else {
                    card.style.display = 'none';
                }
            });

            if (hasVisibleNominees) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    // Load saved votes and stats
    initializeVoteSystem();

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent triggering if clicking directly on other elements if any (but here whole card is clickable conceptually)
            handleVote(card);
        });
    });

    function initializeVoteSystem() {
        // Clear old random simulation data to reset to 0 IF flag is not set
        // This ensures the user sees the reset without manually clearing cache
        if (!localStorage.getItem('voteReset_v1')) {
            localStorage.removeItem('afroAwardsCounts');
            localStorage.setItem('voteReset_v1', 'true');
        }

        // 1. Initialize Counts
        let counts = JSON.parse(localStorage.getItem('afroAwardsCounts'));
        if (!counts) {
            counts = {};
            cards.forEach(card => {
                const id = getNomineeId(card);
                // Initialize to 0 as requested
                counts[id] = 0;
            });
            localStorage.setItem('afroAwardsCounts', JSON.stringify(counts));
        }

        // 2. Inject Stat Elements into DOM
        cards.forEach(card => {
            const infoDiv = card.querySelector('.nominee-info');
            // Check if stats already exist to avoid duplication
            if (!infoDiv.querySelector('.vote-stats')) {
                const statsDiv = document.createElement('div');
                statsDiv.className = 'vote-stats';
                statsDiv.innerHTML = `
                    <div class="vote-progress-bg">
                        <div class="vote-progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="vote-count-text">
                        <span class="count">0 votes</span>
                        <span class="percent">0%</span>
                    </div>
                `;
                // Insert before the button (button is last child usually)
                const btn = infoDiv.querySelector('.vote-btn');
                infoDiv.insertBefore(statsDiv, btn);
            }
        });

        // 3. Load User's Voted State
        loadUserVotes();

        // 4. Update Percentages for all categories
        const uniqueCategories = [...new Set(Array.from(cards).map(c => c.dataset.category))];
        uniqueCategories.forEach(cat => updateCategoryStats(cat));
    }

    function getNomineeId(card) {
        // Create a unique key for the nominee based on category and name
        return `${card.dataset.category}-${card.dataset.nominee}`;
    }

    function handleVote(selectedCard) {
        // Daily Vote Limit Check
        const today = new Date().toISOString().split('T')[0];
        let dailyStats = JSON.parse(localStorage.getItem('afroAwardsDailyVotes')) || { date: today, count: 0 };

        // Reset if new day
        if (dailyStats.date !== today) {
            dailyStats = { date: today, count: 0 };
        }

        if (dailyStats.count >= 10) {
            alert("You have reached your daily limit of 10 votes. Please come back tomorrow!");
            return;
        }

        const category = selectedCard.dataset.category;
        const nominee = selectedCard.dataset.nominee;
        const nomineeId = getNomineeId(selectedCard);

        // 1. Check previous vote in this category to handle switching
        let userVotes = JSON.parse(localStorage.getItem('afroAwardsVotes')) || {};
        const previousNominee = userVotes[category];

        let counts = JSON.parse(localStorage.getItem('afroAwardsCounts'));

        // If clicking the same card (already selected), maybe do nothing or unvote? 
        // Standard behavior: selecting another replaces. Selecting same does nothing.
        if (previousNominee === nominee) return;

        // Increment Daily Count since we are proceeding with a valid vote action
        dailyStats.count++;
        localStorage.setItem('afroAwardsDailyVotes', JSON.stringify(dailyStats));

        // 2. Update Counts
        // If switched from another nominee, decrement that one (optional, but realistic)
        // Note: In real apps, you might not decrement, but for simulation let's just increment new one.
        // Actually, let's keep it simple: Just increment the new one.

        counts[nomineeId] = (counts[nomineeId] || 0) + 1;

        // Save Counts
        localStorage.setItem('afroAwardsCounts', JSON.stringify(counts));

        // 3. Update User Choice State
        // Remove 'selected' from siblings
        const currentCategoryCards = document.querySelectorAll(`[data-category="${category}"]`);
        currentCategoryCards.forEach(card => {
            card.classList.remove('selected');
            const btn = card.querySelector('.vote-btn');
            btn.textContent = 'Vote';
        });

        // Set 'selected' on new
        selectedCard.classList.add('selected');
        selectedCard.querySelector('.vote-btn').textContent = 'Voted';

        // Save User Vote
        userVotes[category] = nominee;
        localStorage.setItem('afroAwardsVotes', JSON.stringify(userVotes));

        showToast(); // Show feedback

        // 4. Update Stats UI for this category
        updateCategoryStats(category);
    }

    function loadUserVotes() {
        const votes = JSON.parse(localStorage.getItem('afroAwardsVotes')) || {};

        for (const [category, nominee] of Object.entries(votes)) {
            const cards = document.querySelectorAll(`[data-category="${category}"]`);
            cards.forEach(card => {
                if (card.dataset.nominee === nominee) {
                    card.classList.add('selected');
                    card.querySelector('.vote-btn').textContent = 'Voted';
                }
            });
        }
    }

    function updateCategoryStats(category) {
        const categoryCards = document.querySelectorAll(`[data-category="${category}"]`);
        let counts = JSON.parse(localStorage.getItem('afroAwardsCounts')) || {};

        // Calculate Total
        let totalVotes = 0;
        categoryCards.forEach(card => {
            const id = getNomineeId(card);
            totalVotes += (counts[id] || 0);
        });

        // Update each card
        categoryCards.forEach(card => {
            const id = getNomineeId(card);
            const count = counts[id] || 0;
            let percentage = 0;
            if (totalVotes > 0) {
                percentage = Math.round((count / totalVotes) * 100);
            }

            // Update UI
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
});
