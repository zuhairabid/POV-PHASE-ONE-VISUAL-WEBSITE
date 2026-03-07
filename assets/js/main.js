// --- CONTACT FORM SUBMISSION ---
window.addEventListener('load', () => {
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    preloader.classList.add('preloader-hidden');
    setTimeout(() => {
      preloader.style.display = 'none'; // Clear from layout after fade
    }, 1000);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.querySelector('#contactForm');

  if (contactForm && typeof db !== 'undefined') {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button');
      const originalBtnText = submitBtn.innerHTML;

      // Set Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="label">SENDING...</span>';

      const formData = {
        name: contactForm.name.value,
        email: contactForm.email.value,
        company: contactForm.company.value || 'N/A',
        topic: contactForm.topic.value || 'N/A',
        message: contactForm.message.value,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        await db.collection('leads').add(formData);

        // Success state
        submitBtn.innerHTML = '<span class="label">SENT!</span>';
        submitBtn.style.background = 'var(--gold)';
        submitBtn.style.borderColor = 'var(--gold)';
        submitBtn.style.color = 'white';

        contactForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          submitBtn.style = ''; // Reset styles
        }, 5000);

      } catch (error) {
        console.error("Error adding document: ", error);
        alert("Something went wrong. Please try again later.");
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});

// --- EXISTING LOGIC ---
// Theme Toggle Logic
const themeToggle = document.querySelector('#theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

themeToggle.addEventListener('click', () => {
  let theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

//navbar
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.nav-links');

menu.addEventListener('click', function () {
  // Toggles the sliding menu
  menuLinks.classList.toggle('active');

  // Toggles the hamburger to cross animation
  this.classList.toggle('is-active');
});

// Close menu and reset icon when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    menuLinks.classList.remove('active');
    menu.classList.remove('is-active');
  });
});



//process section
const targets = document.querySelectorAll('.step, .step-connector');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

targets.forEach(el => observer.observe(el));

// Pricing tab switcher
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  if (btn) btn.classList.add('active');
  document.getElementById('pricing').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Remove scroll hint once user scrolls table
document.querySelectorAll('.pricing-table-wrapper').forEach(wrapper => {
  wrapper.addEventListener('scroll', function () {
    if (this.scrollLeft > 10) {
      this.classList.add('scrolled');
    }
  });
});

// document.getElementById('scrollBtn').addEventListener('click', () => {
//     document.getElementById('process').scrollIntoView({ behavior: 'smooth' });
//   });