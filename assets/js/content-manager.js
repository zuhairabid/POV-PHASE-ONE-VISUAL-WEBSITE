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
            displayType: "cards+table",
            cards: [
                { name: "Base Stills", tagline: "Photography Only", features: ["Professional HDR Photography", "Custom Property Marketing Website", "24hr Stills Delivery"] },
                { name: "The Essential", tagline: "Stills + Floor Plan", features: ["Everything in Base Stills", "Marketing 2D Floor Plan"] },
                { name: "The Pro Package", tagline: "Full Media Suite", features: ["Everything in Essential", "MLS Walkthrough Video", "Vertical Social Reel"], featured: true },
                { name: "The Signature", tagline: "Complete Package", features: ["Everything in Pro Package", "360° Interactive Tour", "6-Month Hosted Link"] }
            ],
            table: {
                headers: ["Property Size", "Base Stills", "The Essential", "The Pro Package", "The Signature"],
                rows: [
                    { cells: ["0 – 1,000 sq ft", "$200", "$280", "$465", "$625"] },
                    { cells: ["1,001 – 2,000 sq ft", "$250", "$330", "$515", "$675"] },
                    { cells: ["2,001 – 3,000 sq ft", "$300", "$380", "$565", "$725"] },
                    { cells: ["3,001 – 4,000 sq ft", "$350", "$430", "$615", "$775"] }
                ]
            },
            addons: [
                { name: "Vacant Home Refresh (1 Twilight + 3 Staged Images)", price: "$115" },
                { name: "Virtual Staging — per image", price: "$40" },
                { name: "Virtual Staging — 3-image set", price: "$100" },
                { name: "Virtual Twilight — per image", price: "$30" },
                { name: "360° Interactive Tour (6-month hosting)", price: "$185" },
                { name: "Same-Day Delivery (Stills only, by 8PM)", price: "$50" }
            ]
        },
        str: {
            displayType: "cards+table",
            cards: [
                { name: "STR Base", tagline: "Hospitality Media", features: ["Wide-Angle Room Coverage", "Curated Amenity Details", "Property Marketing Website"] },
                { name: "STR Essential", tagline: "Base + Floor Plan", features: ["Everything in STR Base", "Marketing 2D Floor Plan"], featured: true },
                { name: "STR Performance", tagline: "Full STR Media Suite", features: ["Everything in STR Essential", "MLS Walkthrough Video", "Vertical Social Reel"] }
            ],
            table: {
                headers: ["Property Size", "STR Base", "STR Essential", "STR Performance"],
                rows: [
                    { cells: ["0 – 1,000 sq ft", "$295", "$375", "$560"] },
                    { cells: ["1,001 – 2,000 sq ft", "$350", "$430", "$615"] },
                    { cells: ["2,001 – 3,000 sq ft", "$425", "$505", "$690"] },
                    { cells: ["3,001 – 4,000 sq ft", "$495", "$575", "$760"] }
                ]
            },
            addons: [
                { name: "Marketing 2D Floor Plan", price: "$115" },
                { name: "MLS Walkthrough Video (Horizontal)", price: "$175" },
                { name: "Social Media Reel (Vertical)", price: "$155" },
                { name: "Video Bundle (Walkthrough + Reel)", price: "$275" },
                { name: "Virtual Twilight — per image", price: "$35" },
                { name: "Virtual Staging — per image", price: "$45" }
            ]
        },
        construction: {
            displayType: "cards+table",
            cards: [
                { name: "Standard Visit", tagline: "Single Progress Visit", features: ["Exterior overview", "Up to 3 designated rooms", "Professional post-editing", "Secure digital delivery", "48-hour turnaround"] },
                { name: "Best Value", tagline: "Transformation Package", features: ["Two scheduled visits", "Before & After comparison formatting", "Organized milestone delivery"], featured: true },
                { name: "Multi-Visit", tagline: "3-Visit Plan", features: ["Three scheduled visits", "Standard scope per visit", "Flexible milestone scheduling"] },
                { name: "Full Documentation", tagline: "5-Visit Plan", features: ["Five milestone visits", "Comprehensive project coverage", "Standard scope per visit"] }
            ],
            table: {
                headers: ["Plan Type", "Standard Visit", "Transformation", "3-Visit Plan", "5-Visit Plan"],
                rows: [
                    { cells: ["Number of Visits", "1 Visit", "2 Visits", "3 Visits", "5 Visits"] },
                    { cells: ["Base Price", "$300", "$525", "$800", "$1,200"] },
                    { cells: ["Additional Rooms", "$50 / room", "$50 / room", "$50 / room", "$50 / room"] }
                ]
            },
            addons: [
                { name: "Project Walkthrough Video (4K Horizontal)", price: "$200" },
                { name: "Social Highlight Reel (Vertical 30–60s)", price: "$200" },
                { name: "360° Interactive Capture", price: "$200" },
                { name: "Standalone 360° Visit", price: "$300" }
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
