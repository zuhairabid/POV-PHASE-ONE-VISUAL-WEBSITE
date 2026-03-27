// Main Admin Logic
// Handles leads table, site content editing, and Advanced Pricing Manager

function initAdmin() {
    console.log("Admin Dashboard v2.0 Initialized");

    // --- TAB NAVIGATION ---
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetTab = item.dataset.tab;
            navItems.forEach(btn => btn.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetTab}-tab`) section.classList.add('active');
            });

            if (targetTab === 'leads') fetchLeads();
            if (targetTab === 'content') fetchAllContent();
            if (targetTab === 'pricing') fetchPricingForEditor();
        });
    });

    // --- LEADS FETCHING ---
    const leadsBody = document.getElementById('leads-body');
    function fetchLeads() {
        if (!db) return;
        db.collection('leads').orderBy('timestamp', 'desc').onSnapshot((querySnapshot) => {
            leadsBody.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const lead = doc.data();
                const row = document.createElement('tr');
                const dateStr = lead.timestamp ? new Date(lead.timestamp.toDate()).toLocaleDateString() : 'N/A';
                row.innerHTML = `
                    <td>${dateStr}</td>
                    <td style="font-weight:700;">${lead.name}</td>
                    <td><a href="mailto:${lead.email}">${lead.email}</a></td>
                    <td>${lead.company}</td>
                    <td>${lead.topic}</td>
                    <td>${lead.message}</td>
                    <td><button onclick="deleteLead('${doc.id}')" class="delete-btn">Delete</button></td>
                `;
                leadsBody.appendChild(row);
            });
        });
    }

    // --- SITE CONTENT EDITOR ---
    const contentForm = document.getElementById('dynamic-content-form');
    const contentGrid = document.getElementById('content-editor-grid');
    const contentSchema = {
        "Hero Section": ["hero_title", "hero_subtitle", "hero_btn1_text", "hero_btn1_link", "hero_btn2_text", "hero_btn2_link"],
        "Process Steps": ["step1_title", "step1_desc", "step2_title", "step2_desc", "step3_title", "step3_desc", "step4_title", "step4_desc"],
        "Sectors Section": ["sector_re_tag", "sector_re_title", "sector_re_desc", "sector_re_features", "sector_cons_tag", "sector_cons_title", "sector_cons_desc", "sector_cons_features"],
        "Contact & Footer": ["contact_title", "contact_subtitle", "contact_info", "pricing_subtitle", "price_tab1_name", "price_tab2_name", "price_tab3_name"]
    };

    async function fetchAllContent() {
        if (!db) return;
        contentGrid.innerHTML = 'Loading content...';
        const snapshot = await db.collection('site_content').get();
        const contentData = {};
        snapshot.forEach(doc => contentData[doc.id] = doc.data());
        contentGrid.innerHTML = '';
        for (const [sectionName, fieldIds] of Object.entries(contentSchema)) {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'content-section-block';
            sectionDiv.innerHTML = `<h4>${sectionName}</h4>`;
            fieldIds.forEach(id => {
                const data = contentData[id] || { value: '', type: 'text' };
                const fieldDiv = document.createElement('div');
                fieldDiv.className = 'editor-field';
                const inputHtml = (data.value.length > 50 || data.type === 'html' || data.type === 'list')
                    ? `<textarea name="${id}" data-type="${data.type}">${data.value}</textarea>`
                    : `<input type="text" name="${id}" data-type="${data.type}" value="${data.value}">`;
                fieldDiv.innerHTML = `<label>${id.toUpperCase()}</label>${inputHtml}`;
                sectionDiv.appendChild(fieldDiv);
            });
            contentGrid.appendChild(sectionDiv);
        }
    }

    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = contentForm.querySelectorAll('input, textarea');
        const batch = db.batch();
        inputs.forEach(input => batch.set(db.collection('site_content').doc(input.name), { value: input.value, type: input.dataset.type }));
        try { await batch.commit(); showToast('Site content updated!'); } catch (error) { showToast('Error saving.', true); }
    });

    // --- ADVANCED PRICING MANAGER ---
    const pricingCatSelector = document.getElementById('pricing-cat-selector');
    const pricingBuilderContainer = document.getElementById('pricing-builder-container');
    const savePricingBtn = document.getElementById('save-pricing-btn');

    pricingCatSelector.addEventListener('change', fetchPricingForEditor);

    async function fetchPricingForEditor() {
        const cat = pricingCatSelector.value;
        pricingBuilderContainer.innerHTML = 'Loading structure...';
        const doc = await db.collection('pricing').doc(cat).get();
        if (doc.exists) renderPricingBuilder(doc.data());
    }

    function renderPricingBuilder(data) {
        pricingBuilderContainer.innerHTML = '';

        // --- 1. SETTINGS CARD ---
        const settingsCard = createCard('General Settings');
        settingsCard.innerHTML += `
            <div class="editor-field">
                <label>Display Type</label>
                <select id="pricing-display-type" class="admin-input">
                    <option value="table" ${data.displayType === 'table' ? 'selected' : ''}>Table Only</option>
                    <option value="cards+table" ${data.displayType === 'cards+table' ? 'selected' : ''}>Cards + Table</option>
                </select>
            </div>
        `;
        pricingBuilderContainer.appendChild(settingsCard);

        // --- 2. PACKAGES (CARDS) EDITOR ---
        const cardsBlock = createCard('Packages (Cards)');
        const cardList = document.createElement('div');
        cardList.id = 'package-cards-editor';
        (data.cards || []).forEach(card => addCardUI(cardList, card));

        const addPackageBtn = createAddBtn('Add New Package');
        addPackageBtn.onclick = () => addCardUI(cardList);

        cardsBlock.appendChild(cardList);
        cardsBlock.appendChild(addPackageBtn);
        pricingBuilderContainer.appendChild(cardsBlock);

        // --- 3. TABLE EDITOR ---
        const tableBlock = createCard('Pricing Table');
        const tableGridWrapper = document.createElement('div');
        tableGridWrapper.className = 'table-editor-wrapper';

        // Headers Row
        const headerRow = document.createElement('div');
        headerRow.className = 'table-editor-headers';
        headerRow.id = 'table-headers-cont';
        data.table.headers.forEach((h, i) => addHeaderUI(headerRow, h, i));

        const addColBtn = createAddBtn('Add Column', 'small');
        addColBtn.onclick = () => addHeaderUI(headerRow, 'New Col', headerRow.children.length);

        // Rows Body
        const tableRowsCont = document.createElement('div');
        tableRowsCont.className = 'table-editor-rows';
        tableRowsCont.id = 'table-rows-cont';
        (data.table.rows || []).forEach(row => addRowUI(tableRowsCont, row, data.table.headers.length));

        const addRowBtn = createAddBtn('Add New Row');
        addRowBtn.onclick = () => addRowUI(tableRowsCont, { cells: Array(headerRow.children.length).fill('') }, headerRow.children.length);

        tableBlock.appendChild(headerRow);
        tableBlock.appendChild(addColBtn);
        tableBlock.appendChild(tableRowsCont);
        tableBlock.appendChild(addRowBtn);
        pricingBuilderContainer.appendChild(tableBlock);

        // --- 4. ADD-ONS EDITOR ---
        const addonsBlock = createCard('Add-On Services');
        const addonsList = document.createElement('div');
        addonsList.id = 'addons-editor-list';
        (data.addons || []).forEach(addon => addAddonUI(addonsList, addon));

        const addAddonBtn = createAddBtn('Add New Add-On');
        addAddonBtn.onclick = () => addAddonUI(addonsList);

        addonsBlock.appendChild(addonsList);
        addonsBlock.appendChild(addAddonBtn);
        pricingBuilderContainer.appendChild(addonsBlock);
    }

    // --- UI HELPERS ---
    function createCard(title) {
        const div = document.createElement('div');
        div.className = 'content-card-advanced';
        div.innerHTML = `<h3>${title}</h3>`;
        return div;
    }

    function createAddBtn(text, size = 'normal') {
        const btn = document.createElement('button');
        btn.className = `add-btn ${size}`;
        btn.innerHTML = `<span>+</span> ${text}`;
        return btn;
    }

    function addCardUI(container, data = { name: '', tagline: '', features: [], featured: false }) {
        const item = document.createElement('div');
        item.className = 'pricing-item-grid pkg-item';
        item.innerHTML = `
            <div class="drag-handle">::</div>
            <div class="input-stack">
                <input type="text" placeholder="Package name" class="in-pkg-name" value="${data.name}">
                <input type="text" placeholder="Tagline" class="in-pkg-tag" value="${data.tagline}">
                <textarea placeholder="Bullet points (one per line)" class="in-pkg-feats">${data.features.join('\n')}</textarea>
                <label class="toggle-label"><input type="checkbox" class="in-pkg-featured" ${data.featured ? 'checked' : ''}> Featured (Gold Glow)</label>
            </div>
            <button class="remove-item-btn" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(item);
    }

    function addHeaderUI(container, text, index) {
        const div = document.createElement('div');
        div.className = 'header-input-wrap';
        div.innerHTML = `
            <input type="text" class="table-header-in" value="${text}">
            <button class="remove-col-btn" onclick="removeColumn(${index})">×</button>
        `;
        container.appendChild(div);
    }

    function addRowUI(container, rowData, colCount) {
        const div = document.createElement('div');
        div.className = 'table-row-editor';
        let rowHtml = `<div class="row-inputs">`;
        for (let i = 0; i < colCount; i++) {
            rowHtml += `<input type="text" class="cell-in" value="${rowData.cells[i] || ''}">`;
        }
        rowHtml += `</div><button class="remove-item-btn" onclick="this.parentElement.remove()">×</button>`;
        div.innerHTML = rowHtml;
        container.appendChild(div);
    }

    function addAddonUI(container, data = { name: '', price: '' }) {
        const div = document.createElement('div');
        div.className = 'addon-item-editor';
        div.innerHTML = `
            <input type="text" placeholder="Add-on name" class="in-addon-name" value="${data.name}">
            <input type="text" placeholder="Price" class="in-addon-price" value="${data.price}">
            <button class="remove-item-btn" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(div);
    }

    // --- SAVE LOGIC ---
    savePricingBtn.addEventListener('click', async () => {
        const cat = pricingCatSelector.value;

        // Headers
        const headers = Array.from(document.querySelectorAll('.table-header-in')).map(i => i.value);

        // Rows
        const rows = Array.from(document.querySelectorAll('.table-row-editor')).map(row => {
            const cells = Array.from(row.querySelectorAll('.cell-in')).map(c => c.value);
            return { cells };
        });

        // Cards
        const cards = Array.from(document.querySelectorAll('.pkg-item')).map(pkg => ({
            name: pkg.querySelector('.in-pkg-name').value,
            tagline: pkg.querySelector('.in-pkg-tag').value,
            features: pkg.querySelector('.in-pkg-feats').value.split('\n').filter(f => f.trim()),
            featured: pkg.querySelector('.in-pkg-featured').checked
        }));

        // Addons
        const addons = Array.from(document.querySelectorAll('.addon-item-editor')).map(a => ({
            name: a.querySelector('.in-addon-name').value,
            price: a.querySelector('.in-addon-price').value
        }));

        try {
            await db.collection('pricing').doc(cat).set({
                displayType: document.getElementById('pricing-display-type').value,
                table: { headers, rows },
                cards,
                addons
            });
            showToast('Advanced Pricing Saved Successfully!');
        } catch (error) {
            showToast('Error saving pricing: ' + error.message, true);
        }
    });

    fetchLeads();
}

function removeColumn(index) {
    const headers = document.getElementById('table-headers-cont');
    const rows = document.querySelectorAll('.table-row-editor');

    // Remove header
    headers.children[index].remove();

    // Remove cell from each row
    rows.forEach(row => {
        const inputs = row.querySelector('.row-inputs');
        if (inputs.children[index]) inputs.children[index].remove();
    });

    // Re-index buttons if many
    reindexColumnHeaders();
}

function reindexColumnHeaders() {
    const headers = document.querySelectorAll('.header-input-wrap');
    headers.forEach((h, i) => {
        h.querySelector('.remove-col-btn').setAttribute('onclick', `removeColumn(${i})`);
    });
}

function deleteLead(id) {
    if (confirm('Delete?')) db.collection('leads').doc(id).delete().then(() => showToast('Deleted.'));
}

function showToast(msg, isError = false) {
    const toast = document.getElementById('save-toast');
    toast.innerText = msg;
    toast.className = `save-status ${isError ? 'error' : 'success'}`;
    setTimeout(() => toast.className = 'save-status', 3000);
}

window.initAdmin = initAdmin;
window.deleteLead = deleteLead;
window.removeColumn = removeColumn;
