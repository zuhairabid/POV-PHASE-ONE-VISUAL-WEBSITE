// Main Admin Logic
// Handles leads table, content editing, and dynamic form generation

function initAdmin() {
    console.log("Admin Dashboard Initialized");

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
                if (section.id === `${targetTab}-tab`) {
                    section.classList.add('active');
                }
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
        "Contact & Footer": ["contact_title", "contact_subtitle", "pricing_subtitle", "price_tab1_name", "price_tab2_name", "price_tab3_name"]
    };

    async function fetchAllContent() {
        if (!db) return;
        contentGrid.innerHTML = 'Loading content...';
        try {
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
                    const inputHtml = data.value.length > 50 || data.type === 'html'
                        ? `<textarea name="${id}" data-type="${data.type}">${data.value}</textarea>`
                        : `<input type="text" name="${id}" data-type="${data.type}" value="${data.value}">`;
                    fieldDiv.innerHTML = `<label>${id.toUpperCase()}</label>${inputHtml}`;
                    sectionDiv.appendChild(fieldDiv);
                });
                contentGrid.appendChild(sectionDiv);
            }
        } catch (error) { contentGrid.innerHTML = 'Error loading content.'; }
    }

    contentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputs = contentForm.querySelectorAll('input, textarea');
        const batch = db.batch();
        inputs.forEach(input => {
            batch.set(db.collection('site_content').doc(input.name), { value: input.value, type: input.dataset.type });
        });
        try { await batch.commit(); showToast('Site content updated!'); } catch (error) { showToast('Error saving.', true); }
    });

    // --- PRICING STRUCTURE BUILDER ---
    const pricingCatSelector = document.getElementById('pricing-cat-selector');
    const pricingBuilderContainer = document.getElementById('pricing-builder-container');
    const savePricingBtn = document.getElementById('save-pricing-btn');

    pricingCatSelector.addEventListener('change', fetchPricingForEditor);

    async function fetchPricingForEditor() {
        const cat = pricingCatSelector.value;
        pricingBuilderContainer.innerHTML = 'Loading structure...';
        const doc = await db.collection('pricing').doc(cat).get();
        if (doc.exists) {
            renderPricingBuilder(doc.data());
        }
    }

    function renderPricingBuilder(data) {
        let html = `
            <div class="pricing-editor-section">
                <h3>Display Type: <span style="color:var(--admin-accent)">${data.displayType}</span></h3>
                
                <div class="content-card">
                    <h4>Headers (Comma Separated)</h4>
                    <input type="text" id="price-headers" value="${data.table.headers.join(', ')}" style="width:100%; padding:10px;">
                </div>

                <div class="content-card">
                    <h4>Packages / Cards</h4>
                    <div id="price-cards-list">
                        ${(data.cards || []).map((card, i) => `
                            <div class="card-editor-item" data-index="${i}" style="border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:8px;">
                                <input type="text" placeholder="Card Title" class="card-title" value="${card.name}">
                                <input type="text" placeholder="Tagline" class="card-tagline" value="${card.tagline}">
                                <textarea placeholder="Features (one per line)" class="card-features">${card.features.join('\n')}</textarea>
                                <label><input type="checkbox" class="card-featured" ${card.featured ? 'checked' : ''}> Featured (Gold)</label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="content-card">
                    <h4>Table Rows (CSV Style)</h4>
                    <p style="font-size:12px; color:#888;">Format: Size, Price1, Price2, Price3...</p>
                    <textarea id="price-table-csv" style="height:200px;">${data.table.rows.map(row => (row.cells || []).join(', ')).join('\n')}</textarea>
                </div>

                <div class="content-card">
                    <h4>Add-ons</h4>
                    <p style="font-size:12px; color:#888;">Format: Name | Price</p>
                    <textarea id="price-addons-csv" style="height:150px;">${(data.addons || []).map(a => `${a.name} | ${a.price}`).join('\n')}</textarea>
                </div>
            </div>`;
        pricingBuilderContainer.innerHTML = html;
    }

    savePricingBtn.addEventListener('click', async () => {
        const cat = pricingCatSelector.value;
        const headers = document.getElementById('price-headers').value.split(',').map(h => h.trim());
        const rowText = document.getElementById('price-table-csv').value;
        const rows = rowText.split('\n').filter(r => r.trim()).map(r => ({ cells: r.split(',').map(cell => cell.trim()) }));

        const addonText = document.getElementById('price-addons-csv').value;
        const addons = addonText.split('\n').filter(a => a.trim()).map(a => {
            const parts = a.split('|');
            return { name: parts[0]?.trim(), price: parts[1]?.trim() };
        });

        const cardItems = document.querySelectorAll('.card-editor-item');
        const cards = Array.from(cardItems).map(item => ({
            name: item.querySelector('.card-title').value,
            tagline: item.querySelector('.card-tagline').value,
            features: item.querySelector('.card-features').value.split('\n').filter(f => f.trim()),
            featured: item.querySelector('.card-featured').checked
        }));

        try {
            await db.collection('pricing').doc(cat).update({
                table: { headers, rows },
                cards: cards,
                addons: addons
            });
            showToast('Pricing structure saved!');
        } catch (error) {
            showToast('Error saving pricing.', true);
        }
    });

    fetchLeads();
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
