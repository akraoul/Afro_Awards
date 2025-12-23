const PASS = "admin123"; // Simple hardcoded password

const categories = {
    'best-artist-performance': "Best Artist Performance",
    'best-song': "Best Song",
    'best-dj': "Best DJ",
    'best-album': "Best Album",
    'best-tiktoker': "Best Tik Toker",
    'best-mc': "Best MC (Hypeman)",
    'best-male-model': "Best Male Model",
    'best-female-model': "Best Female Model",
    'best-dancer': "Best Dancer",
    'best-promoter': "Best Show Promoter",
    'best-rap-artist': "Best Rap Artist",
    'best-rap-song': "Best Rap Song",
    'best-athlete': "Best Athlete"
};

// Initial local cache of data
let nomineesData = {};
let rawNominees = []; // Keep track of DB rows for IDs

function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    if (input === PASS) {
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('managerContent').style.display = 'block';
        initManager();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

async function initManager() {
    console.log("Initializing Manager with Supabase...");

    // Initialize Selects
    const catSelect = document.getElementById('categorySelect');
    const filterSelect = document.getElementById('filterCategory');

    catSelect.innerHTML = '';
    filterSelect.innerHTML = '';

    const entries = Object.entries(categories);

    for (const [key, label] of entries) {
        const opt1 = document.createElement('option');
        opt1.value = key;
        opt1.textContent = label;
        catSelect.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = key;
        opt2.textContent = label;
        filterSelect.appendChild(opt2);
    }

    // Event Listeners for Buttons
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', saveNomineeBtn);

    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

    // Fetch Data
    await fetchAndRenderNominees();
}

async function fetchAndRenderNominees() {
    if (!supabase) {
        console.error("Supabase client not initialized!");
        return;
    }

    const { data, error } = await supabase
        .from('nominees')
        .select('*');

    if (error) {
        console.error("Error fetching nominees:", error);
        alert("Error loading data from database.");
        return;
    }

    rawNominees = data || [];
    processDataForManager(rawNominees);
    renderManagerList();
}

function processDataForManager(dbRows) {
    nomineesData = {};

    // Initialize all categories with empty arrays
    for (const key of Object.keys(categories)) {
        nomineesData[key] = [];
    }

    // Populate from DB
    dbRows.forEach(row => {
        if (!nomineesData[row.category]) {
            nomineesData[row.category] = []; // Safety check
        }
        nomineesData[row.category].push({
            id: row.id,
            name: row.name,
            subText: row.sub_text,
            image: row.image_url,
            vote_count: row.vote_count
        });
    });
}

function renderManagerList() {
    const list = document.getElementById('nomineesList');
    const filterCat = document.getElementById('filterCategory').value;
    list.innerHTML = '';

    const nominees = nomineesData[filterCat] || [];

    if (nominees.length === 0) {
        list.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">No nominees in this category.</div>';
        return;
    }

    nominees.forEach((nom, index) => {
        const div = document.createElement('div');
        div.className = 'nominee-list-item';

        const imgHtml = nom.image ? `<img src="${nom.image}" class="preview-img">` : `<div class="preview-img" style="display:inline-block; vertical-align:middle;"></div>`;

        div.innerHTML = `
            <div style="display:flex; align-items:center;">
                ${imgHtml}
                <div>
                    <strong>${nom.name}</strong><br>
                    <small>${nom.subText || ''}</small>
                </div>
            </div>
            <div>
                <button onclick="editNominee('${filterCat}', ${index})" class="btn-primary" style="font-size:0.8rem; padding: 5px 10px; margin-right: 5px;">Edit</button>
                <button onclick="deleteNominee('${filterCat}', ${index})" class="btn-danger">Delete</button>
            </div>
        `;
        list.appendChild(div);
    });
}

async function saveNomineeBtn() {
    const catSelect = document.getElementById('categorySelect');
    const nameInput = document.getElementById('nomineeName');
    const subInput = document.getElementById('nomineeSub');
    const fileInput = document.getElementById('nomineePhoto');
    const editIndex = parseInt(document.getElementById('editIndex').value);
    const editCategory = document.getElementById('editCategory').value;

    const selectedCat = catSelect.value;
    const name = nameInput.value;
    const sub = subInput.value;

    if (!name) return alert("Name is required");

    // Helper to finish save after image processing
    const finalizeSave = async (imageData) => {
        const payload = {
            category: selectedCat,
            name: name,
            sub_text: sub,
            image_url: imageData // Note: Storing base64 directly as per legacy behavior
        };

        console.log("Attempting to save nominee:", payload);

        let error = null;

        if (editIndex > -1) {
            // EDIT MODE
            const oldNominee = nomineesData[editCategory][editIndex];

            const updatePayload = { ...payload };
            if (imageData === null) {
                delete updatePayload.image_url;
            }

            console.log("Updating nominee ID:", oldNominee.id, "with:", updatePayload);
            const { error: dbError } = await supabase
                .from('nominees')
                .update(updatePayload)
                .eq('id', oldNominee.id);

            error = dbError;

        } else {
            // ADD MODE
            payload.vote_count = 0;
            if (imageData === null) {
                payload.image_url = "";
            }

            console.log("Inserting new nominee:", payload);
            const { error: dbError } = await supabase
                .from('nominees')
                .insert([payload]);

            error = dbError;
        }

        if (error) {
            console.error("Error saving nominee:", error);
            alert("Failed to save nominee: " + error.message);
        } else {
            console.log("Save successful. Refreshing list...");
            resetForm();
            alert(editIndex > -1 ? "Nominee Updated!" : "Nominee Added!");
            await fetchAndRenderNominees(); // Refresh list. Added await for clarity.
        }
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onloadend = function () {
            finalizeSave(reader.result);
        }
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeSave(null);
    }
}

function editNominee(cat, index) {
    const nominee = nomineesData[cat][index];
    if (!nominee) return;

    document.getElementById('formTitle').textContent = "Edit Nominee";
    document.getElementById('saveBtn').textContent = "Update Nominee";
    document.getElementById('cancelBtn').style.display = "inline-block";
    document.getElementById('currentImageMsg').style.display = "block";

    document.getElementById('categorySelect').value = cat;
    document.getElementById('nomineeName').value = nominee.name;
    document.getElementById('nomineeSub').value = nominee.subText || '';
    document.getElementById('nomineePhoto').value = '';

    document.getElementById('editIndex').value = index;
    document.getElementById('editCategory').value = cat;

    document.querySelector('.manager-container').scrollIntoView({ behavior: 'smooth' });
}

async function deleteNominee(cat, index) {
    if (!confirm("Are you sure you want to delete this nominee? This cannot be undone.")) return;

    const nominee = nomineesData[cat][index];
    if (!nominee || !nominee.id) return;

    const { error } = await supabase
        .from('nominees')
        .delete()
        .eq('id', nominee.id);

    if (error) {
        console.error("Error deleting nominee:", error);
        alert("Failed to delete nominee.");
    } else {
        fetchAndRenderNominees();
    }
}

function cancelEdit() {
    resetForm();
}

function resetForm() {
    document.getElementById('formTitle').textContent = "Add New Nominee";
    document.getElementById('saveBtn').textContent = "Add Nominee";
    document.getElementById('cancelBtn').style.display = "none";
    document.getElementById('currentImageMsg').style.display = "none";

    // document.getElementById('categorySelect').value = ... keep current selection
    document.getElementById('nomineeName').value = '';
    document.getElementById('nomineeSub').value = '';
    document.getElementById('nomineePhoto').value = '';

    document.getElementById('editIndex').value = -1;
    document.getElementById('editCategory').value = "";
}
