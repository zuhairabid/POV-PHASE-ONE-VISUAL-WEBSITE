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
            const id = doc.id;
            const targetElements = document.querySelectorAll(`[data-content-id="${id}"]`);

            targetElements.forEach(el => {
                // If it's a link field and the element is an anchor, set href
                if (id.endsWith('_link') && el.tagName === 'A') {
                    el.setAttribute('href', data.value);
                }
                // If it's an image field and the element is an img, set src
                else if (id.endsWith('_img') && el.tagName === 'IMG') {
                    el.src = data.value;
                }
                // Handle list fields (split by newline)
                else if (data.type === 'list') {
                    const items = data.value.split('\n').filter(i => i.trim());
                    el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
                }
                // Otherwise update text/html content
                else {
                    if (data.type === 'text') el.innerText = data.value;
                    else if (data.type === 'html') el.innerHTML = data.value;
                }
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
                <div class="pkg-card ${featuredClass}" ${wideClass} onclick="scrollToPackageColumn(this, ${index})">
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

    // Re-attach scroll hint removal listener for mobile
    const wrapper = container.querySelector('.pricing-table-wrapper');
    if (wrapper) {
        wrapper.addEventListener('scroll', function () {
            if (this.scrollLeft > 10) {
                this.classList.add('scrolled');
            }
        });
    }
}

/**
 * Helper to scroll to the correct pricing table column on mobile
 * @param {HTMLElement} cardEl - The clicked package card
 * @param {number} index - The index of the package (0-based)
 */
function scrollToPackageColumn(cardEl, index) {
    const panel = cardEl.closest('.tab-panel');
    const wrapper = panel.querySelector('.pricing-table-wrapper');
    if (!wrapper) return;

    // 1. Scroll page vertically to the table
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 2. On mobile, scroll the table horizontally to the relevant column
    if (window.innerWidth <= 768) {
        const targetTh = wrapper.querySelectorAll('th')[index + 1]; // +1 because col 0 is "Property Size"
        if (targetTh) {
            // Delay slightly to coordinate with vertical scroll
            setTimeout(() => {
                // Adjust scroll so column starts after the sticky first column (~160px)
                const stickyColWidth = 140;
                const scrollTarget = targetTh.offsetLeft - stickyColWidth;
                wrapper.scrollTo({ left: scrollTarget, behavior: 'smooth' });
            }, 500);
        }
    }
}
