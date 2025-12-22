const PASS = "admin123"; // Simple hardcoded password

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

// Categories mapping (matches script.js)
const categories = {
    'best-artist-performance': 'Best Artist Performance',
    'best-song': 'Best Song',
    'best-dj': 'Best DJ',
    'best-album': 'Best Album',
    'best-tiktoker': 'Best Tik Toker',
    'best-mc': 'Best MC',
    'best-male-model': 'Best Male Model',
    'best-female-model': 'Best Female Model',
    'best-dancer': 'Best Dancer',
    'best-promoter': 'Best Show Promoter',
    'best-rap-artist': 'Best Rap Artist',
    'best-rap-song': 'Best Rap Song',
    'best-athlete': 'Best Athlete'
};

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
    // Populate Selects
    const catSelect = document.getElementById('categorySelect');
    const filterSelect = document.getElementById('filterCategory');

    for (const [key, label] of Object.entries(categories)) {
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

    // Function to finalize save
    const finalizeSave = (imageData) => {
        if (editIndex > -1) {
            // EDIT MODE
            // If checking cross-category availability could be complex, for now assume we edit in place or move if category changed
            // But simplifying: If category changed, remove from old, add to new. 
            // If category same, update in place.

            // However, the complexity of moving categories with index tracking suggests we might restrict category change OR handle it carefully.
            // Let's assume we allow changing everything.

            // 1. Remove from old location
            const oldNominee = nomineesData[editCategory][editIndex];

            // Use new image if provided, else keep old
            const finalImage = imageData !== null ? imageData : oldNominee.image;

            const newNomineeObj = { name: name, subText: sub, image: finalImage };

            if (selectedCat === editCategory) {
                // Update in place
                nomineesData[selectedCat][editIndex] = newNomineeObj;
            } else {
                // Remove from old, add to new
                nomineesData[editCategory].splice(editIndex, 1);
                if (!nomineesData[selectedCat]) nomineesData[selectedCat] = [];
                nomineesData[selectedCat].push(newNomineeObj);
            }

        } else {
            // ADD MODE
            const newNomineeObj = { name: name, subText: sub, image: imageData };
            if (!nomineesData[selectedCat]) nomineesData[selectedCat] = [];
            nomineesData[selectedCat].push(newNomineeObj);
        }

        localStorage.setItem('afroAwardsNominees', JSON.stringify(nomineesData));
        resetForm();
        renderManagerList();
        alert(editIndex > -1 ? "Nominee Updated!" : "Nominee Added!");
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onloadend = function () {
            finalizeSave(reader.result);
        }
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeSave(null); // No new image
    }
}

function editNominee(cat, index) {
    const nominee = nomineesData[cat][index];

    document.getElementById('formTitle').textContent = "Edit Nominee";
    document.getElementById('saveBtn').textContent = "Update Nominee";
    document.getElementById('cancelBtn').style.display = "inline-block";
    document.getElementById('currentImageMsg').style.display = "block";

    document.getElementById('categorySelect').value = cat;
    document.getElementById('nomineeName').value = nominee.name;
    document.getElementById('nomineeSub').value = nominee.subText || '';
    document.getElementById('nomineePhoto').value = ''; // Clear file input

    document.getElementById('editIndex').value = index;
    document.getElementById('editCategory').value = cat;

    // Scroll to top
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
    // Removed confirm for smoother UX and testing
    if (nomineesData[cat]) {
        nomineesData[cat].splice(index, 1);
        localStorage.setItem('afroAwardsNominees', JSON.stringify(nomineesData));
        renderManagerList();
    }
}

function renderManagerList() {
    const list = document.getElementById('nomineesList');
    const filterCat = document.getElementById('filterCategory').value;
    list.innerHTML = '';

    const nominees = nomineesData[filterCat] || [];

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
