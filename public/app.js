/**
 * ARSHANI D - PORTFOLIO INTERACTIVE CLIENT SCRIPT
 * Handles Mobile Menu, Dynamic API Fetching, Tabs, Filters, Modals & Form Submissions
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTabSwitcher();
  fetchProjects();
  fetchCertifications();
  initContactForm();
  initScrollSpy();
});

/* ==========================================================================
   1. MOBILE MENU TOGGLE & OVERLAY
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const backdrop = document.getElementById('nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link');

  function openMenu() {
    toggleBtn.classList.add('active');
    navMenu.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.classList.remove('active');
    navMenu.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  backdrop.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   2. INTERACTIVE TAB SWITCHER (ABOUT ME)
   ========================================================================== */
function initTabSwitcher() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. PROJECTS FETCH & RENDER
   ========================================================================== */
let allProjectsData = [];

async function fetchProjects() {
  const projectsGrid = document.getElementById('projects-grid');
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    allProjectsData = await res.json();
    renderProjects(allProjectsData);
    initFilterButtons();
  } catch (err) {
    console.error(err);
    projectsGrid.innerHTML = `
      <div class="glass-card" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">
        <i class="bi bi-exclamation-triangle" style="font-size: 2rem; color: var(--accent-cyan);"></i>
        <p style="margin-top: 0.5rem;">Could not load projects. Please try refreshing.</p>
      </div>
    `;
  }
}

function renderProjects(projects) {
  const projectsGrid = document.getElementById('projects-grid');
  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `
      <div class="glass-card" style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">
        <p>No projects found in this category.</p>
      </div>
    `;
    return;
  }

  projectsGrid.innerHTML = projects.map(p => `
    <div class="project-card glass-card">
      <div class="project-img-box">
        <img src="${p.image}" alt="${p.title}" class="project-img">
      </div>
      <div class="project-body">
        <span class="project-category">${p.category}</span>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-summary">${p.summary}</p>
        <div class="project-tags">
          ${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="project-actions">
          <button class="btn btn-primary btn-details" onclick="openProjectModal('${p.id}')">
            <i class="bi bi-info-circle"></i> Details
          </button>
          <a href="${p.github}" target="_blank" rel="noopener" class="social-link" title="GitHub Code">
            <i class="bi bi-github"></i>
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');
      if (filterVal === 'All') {
        renderProjects(allProjectsData);
      } else {
        const filtered = allProjectsData.filter(p => p.category.toLowerCase().includes(filterVal.toLowerCase()));
        renderProjects(filtered);
      }
    });
  });
}

/* PROJECT MODAL */
window.openProjectModal = function(id) {
  const project = allProjectsData.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('project-modal');
  const modalBody = document.getElementById('modal-body');

  modalBody.innerHTML = `
    <img src="${project.image}" alt="${project.title}" class="modal-img">
    <span class="project-category">${project.category}</span>
    <h2 class="modal-title">${project.title}</h2>
    <p class="modal-desc">${project.description}</p>
    <div class="project-tags" style="margin-bottom: 1.5rem;">
      ${project.tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>
    <div style="display: flex; gap: 1rem;">
      <a href="${project.github}" target="_blank" rel="noopener" class="btn btn-primary">
        <i class="bi bi-github"></i> View Repository
      </a>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const modalCloseBtn = document.getElementById('modal-close');
const modalOverlay = document.getElementById('project-modal');

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', closeModal);
}

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

function closeModal() {
  if (modalOverlay) modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   4. CERTIFICATIONS FETCH & RENDER
   ========================================================================== */
async function fetchCertifications() {
  const certGrid = document.getElementById('cert-grid');
  try {
    const res = await fetch('/api/certifications');
    if (!res.ok) throw new Error('Failed to fetch certifications');
    const certs = await res.json();

    certGrid.innerHTML = certs.map(c => `
      <div class="cert-card glass-card">
        <div class="cert-icon">
          <i class="bi bi-${c.icon}"></i>
        </div>
        <div class="cert-info">
          <h4>${c.title}</h4>
          <p class="cert-issuer">${c.issuer}</p>
          <span class="cert-badge">${c.badge}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

/* ==========================================================================
   5. CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const responseBox = document.getElementById('form-response');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="bi bi-hourglass-split"></i> Sending...`;
    responseBox.className = 'form-response';
    responseBox.style.display = 'none';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        responseBox.className = 'form-response success';
        responseBox.textContent = data.message;
        form.reset();
      } else {
        throw new Error(data.error || 'Failed to submit form.');
      }
    } catch (err) {
      responseBox.className = 'form-response error';
      responseBox.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="bi bi-send-fill"></i> Send Message`;
    }
  });
}

/* ==========================================================================
   6. SCROLL SPY ACTIVE LINK HIGHLIGHTING
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
