// Content Manager for Landing Page
// Fetches text and structured pricing from Firestore

document.addEventListener('DOMContentLoaded', () => {
    if (typeof db !== 'undefined') {
        fetchSiteContent();
        fetchPricing();
    }
});

function fetchSiteContent() {
    db.collection('site_content').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const targetElements = document.querySelectorAll(`[data-content-id="${doc.id}"]`);
            targetElements.forEach(el => {
                if (data.type === 'text') el.innerText = data.value;
                else if (data.type === 'html') el.innerHTML = data.value;
            });
        });
    });
}

function fetchPricing() {
    const categories = ['residential', 'str', 'construction'];
    categories.forEach(cat => {
        db.collection('pricing').doc(cat).get().then(doc => {
            if (doc.exists) {
                renderPricingCategory(cat, doc.data());
            }
        });
    });
}

function renderPricingCategory(catId, data) {
    const container = document.getElementById(`dynamic-pricing-${catId}`);
    if (!container) return;

    let html = '';

    // 1. Render Cards (if any)
    if (data.cards && data.cards.length > 0) {
        html += `<div class="package-cards">`;
        data.cards.forEach((pkg, index) => {
            const featuredClass = pkg.featured ? 'featured' : '';
            const wideClass = (data.cards.length === 3 && index === 2) ? 'style="grid-column: span 2;"' : '';
            html += `
                <div class="pkg-card ${featuredClass}" ${wideClass}>
                    <div class="pkg-name">${pkg.name}</div>
                    <h4>${pkg.tagline}</h4>
                    <ul class="pkg-includes">
                        ${pkg.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>`;
        });
        html += `</div>`;
    }

    // 2. Render Table (if any)
    if (data.table && data.table.headers) {
        html += `
            <div class="pricing-table-wrapper">
                <table class="pricing-table">
                    <thead>
                        <tr>
                            ${data.table.headers.map((h, i) => `<th class="${i === 2 ? 'gold-col' : ''}">${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.table.rows.map(row => `
                            <tr>
                                ${(row.cells || []).map((cell, i) => `
                                    <td class="${i === 0 ? '' : 'price-cell'} ${i === 2 ? 'gold-col' : ''}">${cell}</td>
                                `).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    }

    // 3. Render Add-ons (if any)
    if (data.addons && data.addons.length > 0) {
        const label = catId === 'construction' ? 'Visual Add-Ons' : 'Add-On Services';
        html += `
            <div class="section-label" style="margin-top:48px; margin-bottom:20px;">${label}</div>
            <div class="addons-grid">
                ${data.addons.map(a => `
                    <div class="addon-item">
                        <span>${a.name}</span>
                        <div class="addon-price">${a.price}</div>
                    </div>
                `).join('')}
            </div>`;
    }

    container.innerHTML = html;
}
