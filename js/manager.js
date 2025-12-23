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

// Firebase logic reuses 'db' from firebase-config.js (initialized globally)
let nomineesData = defaultNominees; // Start with defaults
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isFirebaseConfigured) {
    const nomineesRef = db.ref('nominees');
    // Listen for updates to nominees
    nomineesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            nomineesData = data;
        }
        // Only render if manager content is visible to avoid redundant updates before login
        if (document.getElementById('managerContent') && document.getElementById('managerContent').style.display === 'block') {
            renderManagerList();
        }
    });
} else {
    console.warn("Firebase not configured. Manager operating in local read-only mode (optimistic).");
}

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

function initManager() {
    const catSelect = document.getElementById('categorySelect');
    const filterSelect = document.getElementById('filterCategory');

    // Clean first to avoid duplicates if re-init
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
    renderManagerList();
}

function saveNomineeBtn() {
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

    const finalizeSave = (imageData) => {
        let currentList = nomineesData[selectedCat] || [];
        // Ensure array
        if (!Array.isArray(currentList)) currentList = [];

        if (editIndex > -1) {
            // EDIT MODE
            // 1. Remove from old location if category changed
            if (editCategory !== selectedCat) {
                let oldList = nomineesData[editCategory];
                if (oldList) {
                    oldList.splice(editIndex, 1);
                    nomineesRef.child(editCategory).set(oldList); // Atomic update to old cat
                }
            }

            // 2. Prepare new object
            // If editing in place (same cat), get old image if null.
            // If different cat, we need to handle image. 
            // Simplified: We assume we have the new image or we are creating new
            // Note: If different cat, we can't easily retrieve old image unless we fetched it before.
            // But nomineesData[editCategory][editIndex] should still exist in memory until step 1 runs? 
            // Actually step 1 runs async if we just called it. But we just modify local object for now?
            // BETTER: modify nomineesData locally then set() entire object for simplicity, OR use specific paths.

            // To be robust:
            // Fetch old nominee data from memory before modification
            const oldNominee = (nomineesData[editCategory] && nomineesData[editCategory][editIndex]) || {};
            const finalImage = imageData !== null ? imageData : oldNominee.image;

            const newNomineeObj = { name: name, subText: sub, image: finalImage };

            if (selectedCat === editCategory) {
                // Update in place
                currentList[editIndex] = newNomineeObj;
                nomineesRef.child(selectedCat).set(currentList);
            } else {
                // Add to new
                currentList.push(newNomineeObj);
                nomineesRef.child(selectedCat).set(currentList);
            }

        } else {
            // ADD MODE
            const newNomineeObj = { name: name, subText: sub, image: imageData };
            currentList.push(newNomineeObj);
            nomineesRef.child(selectedCat).set(currentList);
        }

        resetForm();
        alert(editIndex > -1 ? "Nominee Updated!" : "Nominee Added!");
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

function cancelEdit() {
    resetForm();
}

function resetForm() {
    document.getElementById('formTitle').textContent = "Add New Nominee";
    document.getElementById('saveBtn').textContent = "Add Nominee";
    document.getElementById('cancelBtn').style.display = "none";
    document.getElementById('currentImageMsg').style.display = "none";

    document.getElementById('categorySelect').value = Object.keys(categories)[0];
    document.getElementById('nomineeName').value = '';
    document.getElementById('nomineeSub').value = '';
    document.getElementById('nomineePhoto').value = '';

    document.getElementById('editIndex').value = -1;
    document.getElementById('editCategory').value = "";
}

function deleteNominee(cat, index) {
    const list = nomineesData[cat];
    if (list) {
        list.splice(index, 1);
        nomineesRef.child(cat).set(list);
    }
}

function renderManagerList() {
    const list = document.getElementById('nomineesList');
    const filterCat = document.getElementById('filterCategory').value;
    list.innerHTML = '';

    const nominees = nomineesData[filterCat] || [];
    // Ensure array
    const cleanNominees = Array.isArray(nominees) ? nominees : [];

    cleanNominees.forEach((nom, index) => {
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
