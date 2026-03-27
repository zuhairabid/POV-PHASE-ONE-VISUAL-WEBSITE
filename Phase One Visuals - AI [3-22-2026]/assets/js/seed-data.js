// Revised Seed Data with Comprehensive Pricing Structure
// Note: Firestore does not support nested arrays, so rows are stored as objects { cells: [...] }

const initialContent = {
    hero_title: { value: "Properties<br />Sold Through <em>Exceptional<br />Visuals.</em>", type: "html" },
    hero_subtitle: { value: "Premium photography, video tours and 3D walkthroughs crafted for realtors, developers and construction firms across New Jersey & Pennsylvania.", type: "text" },
    hero_btn1_text: { value: "View Pricing", type: "text" },
    hero_btn1_link: { value: "#pricing", type: "text" },
    hero_btn2_text: { value: "Our Services", type: "text" },
    hero_btn2_link: { value: "#sectors", type: "text" },
    pricing_subtitle: { value: "All packages include professional post-editing and delivery via a secure property marketing website. No hidden fees.", type: "text" },
    price_tab1_name: { value: "Residential", type: "text" },
    price_tab2_name: { value: "Short-Term Rental", type: "text" },
    price_tab3_name: { value: "Construction", type: "text" },
    // Sector Split Section
    sector_re_tag: { value: "Residential & STR", type: "text" },
    sector_re_title: { value: "Real Estate<br /><em>Photography</em>", type: "html" },
    sector_re_desc: { value: "We partner with realtors, agents, and property owners to produce MLS-ready media packages that get eyes on listings and drive faster offers.", type: "text" },
    sector_re_features: { value: "HDR Interior & Exterior Photography\nDrone Aerial Views\nWalkthrough Video + Social Reel\n360° Interactive Tours\nVirtual Twilight & Staging\nMarketing Floor Plans\nCustom Property Website Included", type: "list" },
    sector_cons_tag: { value: "Construction & Development", type: "text" },
    sector_cons_title: { value: "Construction<br /><em>Documentation</em>", type: "html" },
    sector_cons_desc: { value: "Systematic progress documentation for builders, developers and contractors. Capture every phase with precision — from ground-break to ribbon-cutting.", type: "text" },
    sector_cons_features: { value: "Standard Progress Visit Photography\nBefore & After Transformation Package\n3, 5 & Multi-Visit Plans\nProject Walkthrough Video (4K)\nSocial Highlight Reel\n360° Interactive Capture\nSecure Online Project Gallery", type: "list" },
    // Contact Info (Dynamic List)
    contact_info: { value: "Email|hello@phaseonevisuals.com\nPhone / WhatsApp|+1 (908) 555-0123\nAddress|Hopewell, NJ 08525", type: "list" },
};

const residentialPricing = {
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
};

const strPricing = {
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
};

const constructionPricing = {
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
};

async function syncAllContent() {
    const log = document.getElementById('sync-log');
    if (!log) return;
    log.innerText = "Initializing Site Data Sync...\n";
    if (typeof db === 'undefined') { log.innerText += "Error: Firebase DB not initialized.\n"; return; }

    try {
        const batch = db.batch();
        const contentRef = db.collection('site_content');
        for (const [id, data] of Object.entries(initialContent)) {
            batch.set(contentRef.doc(id), data);
            log.innerText += `✓ Text: ${id}\n`;
        }

        const pricingRef = db.collection('pricing');
        batch.set(pricingRef.doc('residential'), residentialPricing);
        batch.set(pricingRef.doc('str'), strPricing);
        batch.set(pricingRef.doc('construction'), constructionPricing);

        log.innerText += `✓ Pricing Structure Ready\n`;

        await batch.commit();
        log.innerText += "\n[SUCCESS] Sync Complete. Refresh your site!";
        if (typeof showToast === 'function') showToast('Sync complete!');
    } catch (error) {
        log.innerText += `\n[ERROR] ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const syncBtn = document.getElementById('sync-content-btn');
    if (syncBtn) syncBtn.addEventListener('click', syncAllContent);
});
