// Content Manager for Landing Page
// Fetches text and structured pricing from Firestore

document.addEventListener('DOMContentLoaded', () => {
    if (typeof db !== 'undefined') {
        fetchSiteContent();
        fetchPricing();
    } else {
        // Firestore not available (fallback) — render sample pricing so UI isn't empty
        renderPricingFallback();
    }
});

// Render simple fallback pricing so users see pricing even if Firestore fails
function renderPricingFallback() {
    const sample = {
        cards: [
            { name: 'Basic', tagline: '$199', features: ['Interior photos', 'MLS-ready'], featured: false },
            { name: 'Standard', tagline: '$349', features: ['Interior + Exterior', 'Drone photo'], featured: true },
            { name: 'Premium', tagline: '$599', features: ['Video tour', 'Twilight edits'], featured: false }
        ],
        table: {
            headers: ['Property Size', 'Basic', 'Standard'],
            rows: [
                { cells: ['Studio / 1BR', '$199', '$249'] },
                { cells: ['2-3 BR', '$249', '$349'] },
                { cells: ['4+ BR', '$349', '$499'] }
            ]
        },
        addons: [ { name: 'Aerial Photos', price: '$75' }, { name: 'Twilight Edit', price: '$50' } ]
    };

    renderPricingCategory('residential', sample);
    renderPricingCategory('str', sample);
    renderPricingCategory('construction', sample);
}

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
                // Handle specialized contact list (Label|Value)
                else if (id === 'contact_info') {
                    const items = data.value.split('\n').filter(i => i.trim());
                    el.innerHTML = items.map(item => {
                        const [label, val] = item.split('|');
                        let formattedVal = val;
                        if (val.includes('@')) formattedVal = `<a href="mailto:${val}" class="info-value">${val}</a>`;
                        else if (val.startsWith('http')) formattedVal = `<a href="${val}" target="_blank" class="info-value">${val.replace('https://', '').replace('http://', '')}</a>`;
                        else if (label.toLowerCase().includes('phone') || label.toLowerCase().includes('whatsapp')) {
                            const cleanPhone = val.replace(/\D/g, '');
                            formattedVal = `<a href="tel:${cleanPhone}" class="info-value">${val}</a>`;
                        } else {
                            formattedVal = `<span class="info-value">${val}</span>`;
                        }
                        return `
                            <div class="info-item">
                                <span class="info-label">${label}</span>
                                ${formattedVal}
                            </div>`;
                    }).join('');
                }
                // Handle standard list fields
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

    const staticData = {
        residential: {
            cards: [
                { name: 'Essential', tagline: 'Starting at $199', features: ['25 HDR Interior Photos', 'Exterior Photos', 'MLS-Ready Delivery', '48hr Turnaround'], featured: false },
                { name: 'Standard', tagline: 'Starting at $349', features: ['35 HDR Photos', 'Drone Aerial Photos', 'Property Video Tour', 'Branded Gallery Site'], featured: true },
                { name: 'Premium', tagline: 'Starting at $599', features: ['50 HDR Photos', 'Cinematic Video', 'Twilight Edits', 'Express 24hr Delivery'], featured: false }
            ],
            table: {
                headers: ['Property Size', 'Essential', 'Standard', 'Premium'],
                rows: [
                    { cells: ['Studio / 1BR', '$199', '$299', '$449'] },
                    { cells: ['2–3 Bedrooms', '$249', '$349', '$549'] },
                    { cells: ['4–5 Bedrooms', '$299', '$449', '$649'] },
                    { cells: ['6+ / Luxury', 'Custom', '$599', '$799'] }
                ]
            },
            addons: [
                { name: 'Aerial Drone Photos', price: '$75' },
                { name: 'Twilight / Dusk Edit', price: '$50' },
                { name: 'Virtual Staging (per room)', price: '$35' },
                { name: 'Floor Plan', price: '$99' }
            ]
        },
        str: {
            cards: [
                { name: 'Starter', tagline: 'Starting at $249', features: ['20 Styled Photos', 'Airbnb-Ready Edit', 'Quick Turnaround'], featured: false },
                { name: 'Pro', tagline: 'Starting at $399', features: ['35 Styled Photos', 'Video Walkthrough', 'Branded Gallery'], featured: true },
                { name: 'Elite', tagline: 'Starting at $599', features: ['50+ Photos', 'Cinematic Reel', 'Social Media Clips'], featured: false }
            ],
            table: {
                headers: ['Unit Size', 'Starter', 'Pro', 'Elite'],
                rows: [
                    { cells: ['Studio', '$249', '$349', '$499'] },
                    { cells: ['1–2 Bed', '$299', '$399', '$549'] },
                    { cells: ['3+ Bed', '$349', '$499', '$649'] }
                ]
            },
            addons: [
                { name: 'Social Media Reel', price: '$100' },
                { name: 'Aerial Drone', price: '$75' },
                { name: 'Virtual Staging', price: '$35/room' }
            ]
        },
        construction: {
            cards: [
                { name: 'Progress', tagline: 'Starting at $299', features: ['Site Progress Photos', 'Before & After Series', 'Contractor-Ready Files'], featured: false },
                { name: 'Documentation', tagline: 'Starting at $499', features: ['Full Site Coverage', 'Aerial Drone Photos', 'Timestamped Archive'], featured: true },
                { name: 'Marketing', tagline: 'Starting at $799', features: ['Hero Photos & Video', 'Drone Cinematic', 'Brand-Ready Gallery'], featured: false }
            ],
            table: {
                headers: ['Project Type', 'Progress', 'Documentation', 'Marketing'],
                rows: [
                    { cells: ['Residential Build', '$299', '$499', '$749'] },
                    { cells: ['Commercial / Mixed', '$399', '$599', '$899'] },
                    { cells: ['Infrastructure', '$499', '$749', 'Custom'] }
                ]
            },
            addons: [
                { name: 'Monthly Retainer (4 visits)', price: '$999/mo' },
                { name: 'Aerial Progress Video', price: '$150' },
                { name: 'Time-Lapse Setup', price: 'Custom' }
            ]
        }
    };

    categories.forEach(cat => {
        db.collection('pricing').doc(cat).get().then(doc => {
            if (doc.exists) {
                renderPricingCategory(cat, doc.data());
            } else {
                renderPricingCategory(cat, staticData[cat]);
            }
        }).catch(() => {
            renderPricingCategory(cat, staticData[cat]);
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
