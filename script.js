// Projects Data
let projects = [];

// Load projects from JSON file
async function loadProjects() {
    try {
        const response = await fetch('./data/projects.json');
        if (!response.ok) {
            throw new Error('Failed to load projects data');
        }
        projects = await response.json();
        return projects;
    } catch (error) {
        console.error('Error loading projects:', error);
        // Fallback to empty array if loading fails
        projects = [];
        return projects;
    }
}


// Render Projects
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Clear existing content
    projectsGrid.innerHTML = '';
    
    console.log('Rendering projects:', projects.length);
    
    // Role labels mapping
    const roleLabels = {
        'author': { text: 'Разработал', icon: '✨', color: '#0066FF' },
        'contributor': { text: 'Работа в команде', icon: '👥', color: '#00D4FF' },
        'maintainer': { text: 'Работа в команде', icon: '👥', color: '#00D4FF' }
    };
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        
        const roleInfo = roleLabels[project.role] || roleLabels['author'];
        
        // Build store links HTML
        let storeLinksHTML = '';
        if (project.links.appStore || project.links.playStore || project.links.ruStore) {
            storeLinksHTML = '<div class="project-stores">';
            
            if (project.links.appStore) {
                storeLinksHTML += `
                    <a href="${project.links.appStore}" class="store-badge" target="_blank" onclick="event.stopPropagation()">
                        <i class="fab fa-apple"></i>
                    </a>
                `;
            }
            if (project.links.playStore) {
                storeLinksHTML += `
                    <a href="${project.links.playStore}" class="store-badge" target="_blank" onclick="event.stopPropagation()">
                        <i class="fab fa-google-play"></i>
                    </a>
                `;
            }
            if (project.links.ruStore) {
                storeLinksHTML += `
                    <a href="${project.links.ruStore}" class="store-badge rustore" target="_blank" onclick="event.stopPropagation()">
                        <i class="fas fa-store"></i>
                    </a>
                `;
            }
            
            storeLinksHTML += '</div>';
        }
        
        projectCard.innerHTML = `
            <div class="project-icon-wrapper">
                <div class="icon-loader"></div>
                <img src="${project.appIcon}" 
                     alt="${project.title}" 
                     class="project-icon"
                     loading="lazy"
                     onload="this.previousElementSibling.style.display='none'; this.style.opacity='1';"
                     onerror="this.onerror=null; this.previousElementSibling.style.display='none'; this.src='./assets/images/flutter_bird.png'; this.classList.add('placeholder-icon'); this.style.opacity='1';">
            </div>
            <div class="project-content">
                <div class="project-header">
                    <h3 class="project-title">${project.title}</h3>
                    <div class="project-role-badge" style="background: ${roleInfo.color}20; color: ${roleInfo.color}; border: 1px solid ${roleInfo.color}40;">
                        <span class="role-icon">${roleInfo.icon}</span>
                        <span class="role-text">${roleInfo.text}</span>
                    </div>
                </div>
                <p class="project-description">${project.shortDescription}</p>
                ${storeLinksHTML}
            </div>
        `;
        
        // Add click handler to card (but not to store links)
        projectCard.addEventListener('click', () => openModal(project.id, true));
        
        projectsGrid.appendChild(projectCard);
    });
    
    console.log('Projects rendered successfully');
}

// Modal functionality
function openModal(projectId, updateHistory = true) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalRole = document.getElementById('modalRole');
    const modalDescription = document.getElementById('modalDescription');
    const modalTechStack = document.getElementById('modalTechStack');
    const modalLinks = document.getElementById('modalLinks');
    const modalSmallIcon = document.getElementById('modalSmallIcon');
    const modalIconLoader = document.getElementById('modalIconLoader');
    const modalScreenshots = document.getElementById('modalScreenshots');
    
    // Role labels mapping
    const roleLabels = {
        'author': { text: 'Разработал проект', icon: '✨', color: '#0066FF' },
        'contributor': { text: 'Работа в команде', icon: '👥', color: '#00D4FF' },
        'maintainer': { text: 'Работа в команде', icon: '👥', color: '#00D4FF' }
    };
    
    // Status labels mapping
    const statusLabels = {
        'completed': { text: 'Завершён', icon: '✅', color: '#10B981' }, // Green
        'in-progress': { text: 'В процессе', icon: '🚧', color: '#F59E0B' }, // Amber
        'frozen': { text: 'Заморожен', icon: '❄️', color: '#3B82F6' } // Blue
    };
    
    const roleInfo = roleLabels[project.role] || roleLabels['author'];
    const statusInfo = statusLabels[project.status] || statusLabels['completed'];
    
    // Set Header Info
    modalTitle.textContent = project.title;
    if (modalSmallIcon && modalIconLoader) {
        // Reset state
        modalSmallIcon.classList.remove('loaded');
        modalIconLoader.style.display = 'block';
        
        modalSmallIcon.src = project.appIcon || './assets/images/flutter_bird.png';
        
        modalSmallIcon.onload = function() {
             modalIconLoader.style.display = 'none';
             this.classList.add('loaded');
        };
        
        modalSmallIcon.onerror = function() {
             modalIconLoader.style.display = 'none';
             this.src='./assets/images/flutter_bird.png'; 
             this.classList.add('loaded');
        };
    }
    
    // Set Role and Status
    modalRole.innerHTML = `
        <div class="modal-meta-row">
            <div class="modal-meta-item">
                <span class="role-icon">${roleInfo.icon}</span>
                <span class="role-text" style="color: ${roleInfo.color}">${roleInfo.text}</span>
            </div>
            ${project.status !== 'completed' ? `
            <div class="modal-meta-item">
                 <span class="role-icon">${statusInfo.icon}</span>
                 <span class="role-text" style="color: ${statusInfo.color}">${statusInfo.text}</span>
            </div>` : ''}
        </div>
    `;
    
    // Set Description
    modalDescription.textContent = project.fullDescription;
    
    // Set Screenshots
    if (modalScreenshots) {
        modalScreenshots.innerHTML = '';
        
        let imageUrls = [];

        // Check for custom images in project data
        if (project.imageUrls && project.imageUrls.length > 0) {
            imageUrls = project.imageUrls;
        } else {
            // Fallback: Generate 4 mock screenshots
            const colors = ['0066FF', '00D4FF', '5D3FD3', 'FFB800'];
            for (let i = 0; i < 4; i++) {
                 const color = colors[i % colors.length];
                 imageUrls.push(`https://via.placeholder.com/300x600/1A1F3A/${color}?text=Screen+${i+1}`);
            }
        }
        
        imageUrls.forEach((url, i) => {
            // Wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'modal-screenshot-wrapper';
            
            // Loader
            const loader = document.createElement('div');
            loader.className = 'modal-screenshot-loader skeleton';
            
            // Image
            const img = document.createElement('img');
            img.className = 'modal-screenshot';
            img.alt = `${project.title} Screenshot ${i+1}`;
            img.loading = 'lazy';
            
            img.onload = function() {
                loader.style.display = 'none';
                this.classList.add('loaded');
                // Only enable click if loaded successfully
                this.addEventListener('click', () => {
                    openImageViewer(this.src, imageUrls);
                });
            };

            img.onerror = function() {
                loader.style.display = 'none';
                this.src = './assets/images/flutter_bird.png'; 
                this.classList.add('error');
                // No click listener added
            };
            
            // Start loading
            img.src = url;
            
            wrapper.appendChild(loader);
            wrapper.appendChild(img);
            modalScreenshots.appendChild(wrapper);
        });
    }
    
    // Tech stack
    modalTechStack.innerHTML = project.stack.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    // Store links
    modalLinks.innerHTML = '';
    
    const hasLinks = project.links && Object.keys(project.links).length > 0;
    
    if (hasLinks) {
        if (project.links.appStore) {
            modalLinks.innerHTML += `
                <a href="${project.links.appStore}" class="store-link" target="_blank">
                    <i class="fab fa-apple"></i>
                    <span>App Store</span>
                </a>
            `;
        }
        if (project.links.playStore) {
            modalLinks.innerHTML += `
                <a href="${project.links.playStore}" class="store-link" target="_blank">
                    <i class="fab fa-google-play"></i>
                    <span>Google Play</span>
                </a>
            `;
        }
        if (project.links.ruStore) {
            modalLinks.innerHTML += `
                <a href="${project.links.ruStore}" class="store-link rustore" target="_blank">
                    <i class="fas fa-cube"></i>
                    <span>RuStore</span>
                </a>
            `;
        }
        // Add other link types if needed (e.g. web, github)
         if (project.links.web) {
            modalLinks.innerHTML += `
                <a href="${project.links.web}" class="store-link" target="_blank">
                    <i class="fas fa-globe"></i>
                    <span>Website</span>
                </a>
            `;
        }
    } else {
        modalLinks.innerHTML = `
            <div class="store-link disabled" style="opacity: 0.7; cursor: default; background: var(--surface-light);">
                <i class="fas fa-eye-slash"></i>
                <span>Не опубликовано</span>
            </div>
        `;
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update History
    if (updateHistory) {
         history.pushState(null, null, `#project-${projectId}`);
    }
}

// ... (previous code)

function closeModal(updateHistory = true) {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Update History: Revert to #projects or clear
    if (updateHistory) {
        // Use replaceState to avoid cluttering history with modal open/close if desired, 
        // but pushState is better for "Back" button behavior support.
        // However, user asked to "remove #project-ID".
        // Setting it to #projects makes sense as context.
        history.pushState(null, null, '#projects');
    }
}

// Scroll Spy to update URL based on active section
function initScrollSpy() {
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "-10% 0px -50% 0px" // Offset to trigger closer to top/middle
    };

    const observer = new IntersectionObserver((entries) => {
        // Check if modal is active - don't update URL if looking at project details
        const modal = document.getElementById('projectModal');
        if (modal && modal.classList.contains('active')) return;

        // Find the visible section closest to top
        let visibleSection = null;
        
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Determine if this section is the "main" one in view
                if (!visibleSection || entry.intersectionRatio > visibleSection.intersectionRatio) {
                    visibleSection = entry;
                }
            }
        });

        if (visibleSection && visibleSection.target.id) {
             const id = visibleSection.target.id;
             // Only update if changed and not currently on a project
             if (window.location.hash !== `#${id}` && !window.location.hash.startsWith('#project-')) {
                 // Use replaceState to not flood history
                 history.replaceState(null, null, `#${id}`);
                 
                 // Also update nav active state (optional but good UX)
                 document.querySelectorAll('.nav-link').forEach(link => {
                     link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                 });
             }
        }
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });
}




// Mobile Menu Toggle
const navHamburger = document.getElementById('navHamburger');
const navMenu = document.getElementById('navMenu');
const navOverlay = document.getElementById('navOverlay');
const navLinks = document.querySelectorAll('.nav-link');

function toggleMobileMenu() {
    navHamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    navHamburger.classList.remove('active');
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

navHamburger.addEventListener('click', toggleMobileMenu);
navOverlay.addEventListener('click', closeMobileMenu);

navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Routing Handler
function handleHashChange() {
    const hash = window.location.hash;
    
    // Project Deep Link
    if (hash.startsWith('#project-')) {
        const projectId = parseInt(hash.replace('#project-', ''));
        // Wait for projects to be loaded if not already
        if (projects.length > 0) {
            openModal(projectId, false);
        }
        return;
    }
    
    // Close modal if open and hash changed to something else (e.g. Back button)
    const modal = document.getElementById('projectModal');
    if (modal && modal.classList.contains('active')) {
        closeModal(false);
    }

    // Scroll to section
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
}

// Event listeners
document.getElementById('modalClose').addEventListener('click', () => closeModal(true));

// Close modal on outside click
document.getElementById('projectModal').addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
        closeModal(true);
    }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal(true);
    }
});

// Touch swipe support for carousel


// Filtering functionality
const filters = {
    role: ['all'],
    status: ['all'],
    projectType: ['all']
};

function initializeFilters() {
    // Toggle dropdowns
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = btn.nextElementSibling;
            const isActive = btn.classList.contains('active');
            
            // Close all dropdowns
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('active'));
            
            // Toggle current dropdown
            if (!isActive) {
                btn.classList.add('active');
                dropdown.classList.add('active');
            }
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('active'));
    });
    
    // Handle checkbox changes
    const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const filterType = e.target.dataset.filter;
            const value = e.target.value;
            const dropdown = e.target.closest('.filter-dropdown');
            const allCheckbox = dropdown.querySelector('input[value="all"]');
            const otherCheckboxes = dropdown.querySelectorAll('input:not([value="all"])');
            
            if (value === 'all') {
                if (e.target.checked) {
                    otherCheckboxes.forEach(cb => cb.checked = false);
                    filters[filterType] = ['all'];
                }
            } else {
                if (e.target.checked) {
                    allCheckbox.checked = false;
                    filters[filterType] = Array.from(otherCheckboxes)
                        .filter(cb => cb.checked)
                        .map(cb => cb.value);
                    
                    if (filters[filterType].length === 0) {
                        allCheckbox.checked = true;
                        filters[filterType] = ['all'];
                    }
                } else {
                    filters[filterType] = Array.from(otherCheckboxes)
                        .filter(cb => cb.checked)
                        .map(cb => cb.value);
                    
                    if (filters[filterType].length === 0) {
                        allCheckbox.checked = true;
                        filters[filterType] = ['all'];
                    }
                }
            }
            
            updateFilterLabels();
            applyFilters();
        });
    });
    
    // Reset filters
    document.getElementById('filterReset').addEventListener('click', () => {
        filters.role = ['all'];
        filters.status = ['all'];
        filters.projectType = ['all'];
        
        document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.value === 'all';
        });
        
        updateFilterLabels();
        applyFilters();
    });
}

function updateFilterLabels() {
    // Update role filter label
    const roleValue = document.getElementById('roleFilterValue');
    if (filters.role.includes('all')) {
        roleValue.textContent = 'Все';
    } else {
        roleValue.textContent = filters.role.length === 1 ? 
            filters.role[0] === 'author' ? 'Разработал' : 
            filters.role[0] === 'contributor' ? 'Работа в команде' : 'Работа в команде' :
            `${filters.role.length} выбрано`;
    }
    
    // Update status filter label
    const statusValue = document.getElementById('statusFilterValue');
    if (filters.status.includes('all')) {
        statusValue.textContent = 'Все';
    } else {
        statusValue.textContent = filters.status.length === 1 ? 
            filters.status[0] === 'completed' ? 'Завершён' : 
            filters.status[0] === 'in-progress' ? 'В разработке' : 'Заморожен' :
            `${filters.status.length} выбрано`;
    }
    
    // Update type filter label
    const typeValue = document.getElementById('typeFilterValue');
    
    const typeLabels = {
        'ai': 'AI / ML',
        'e-commerce': 'E-commerce',
        'education': 'Образование',
        'finance': 'Финансы',
        'Health & Services': 'Здоровье',
        'lifestyle': 'Lifestyle',
        'medical': 'Медицина',
        'productivity': 'Продуктивность',
        'social': 'Социальные',
        'startup': 'Стартапы',
        'tools': 'Инструменты',
        'travel': 'Путешествия',
        'utility': 'Утилиты'
    };

    if (filters.projectType.includes('all')) {
        typeValue.textContent = 'Все';
    } else {
        typeValue.textContent = filters.projectType.length === 1 ? 
            (typeLabels[filters.projectType[0]] || filters.projectType[0]) :
            `${filters.projectType.length} выбрано`;
    }
}

function applyFilters() {
    const projectCards = document.querySelectorAll('.project-card');
    let visibleCount = 0;
    
    projectCards.forEach((card, index) => {
        const project = projects[index];
        
        const roleMatch = filters.role.includes('all') || filters.role.includes(project.role);
        const statusMatch = filters.status.includes('all') || filters.status.includes(project.status);
        const typeMatch = filters.projectType.includes('all') || filters.projectType.includes(project.projectType);
        
        if (roleMatch && statusMatch && typeMatch) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('filteredCount').textContent = visibleCount;
    document.getElementById('totalCount').textContent = projects.length;
}

// Initialize on page load
async function init() {
    // Load projects data first
    await loadProjects();
    
    // Then render and initialize
    renderProjects();
    initializeFilters();
    document.getElementById('totalCount').textContent = projects.length;
    
    // Initialize Scroll Spy
    initScrollSpy();
    
    // Handle initial hash
    if (window.location.hash) {
        handleHashChange();
    }
}

// Call init when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Handle hash changes
window.addEventListener('hashchange', handleHashChange);

// Image Viewer functionality
const imageViewer = document.getElementById('imageViewer');
const imageViewerImg = document.getElementById('imageViewerImg');
const imageViewerClose = document.getElementById('imageViewerClose');
const imageViewerPrev = document.getElementById('imageViewerPrev');
const imageViewerNext = document.getElementById('imageViewerNext');

let currentImageIndex = 0;
let currentImagesList = [];

function openImageViewer(imageSrc, imagesList = []) {
    currentImagesList = imagesList.length > 0 ? imagesList : [imageSrc];
    currentImageIndex = currentImagesList.indexOf(imageSrc);
    if (currentImageIndex === -1) currentImageIndex = 0;
    
    updateImageViewerImage();
    
    imageViewer.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Update navigation visibility
    updateNavigationVisibility();
}

function updateImageViewerImage() {
    // Show loader if needed (can be added to CSS)
    imageViewerImg.style.opacity = '0.5';
    imageViewerImg.src = currentImagesList[currentImageIndex];
    
    imageViewerImg.onload = function() {
        this.style.opacity = '1';
    };
    
    imageViewerImg.onerror = function() {
        this.src = './assets/images/flutter_bird.png'; // Fallback
        this.style.opacity = '1';
    };
}

function updateNavigationVisibility() {
    if (currentImagesList.length <= 1) {
        if (imageViewerPrev) imageViewerPrev.style.display = 'none';
        if (imageViewerNext) imageViewerNext.style.display = 'none';
    } else {
        if (imageViewerPrev) imageViewerPrev.style.display = 'flex';
        if (imageViewerNext) imageViewerNext.style.display = 'flex';
    }
}

function closeImageViewer() {
    imageViewer.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        imageViewerImg.src = '';
    }, 300);
}

function nextImage(e) {
    if (e) e.stopPropagation();
    if (currentImagesList.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % currentImagesList.length;
    updateImageViewerImage();
}

function prevImage(e) {
    if (e) e.stopPropagation();
    if (currentImagesList.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + currentImagesList.length) % currentImagesList.length;
    updateImageViewerImage();
}

// Event listeners
if (imageViewerClose) imageViewerClose.addEventListener('click', closeImageViewer);
if (imageViewerPrev) imageViewerPrev.addEventListener('click', prevImage);
if (imageViewerNext) imageViewerNext.addEventListener('click', nextImage);

// Close on background click
imageViewer.addEventListener('click', (e) => {
    if (e.target === imageViewer) {
        closeImageViewer();
    }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!imageViewer.classList.contains('active')) return;
    
    if (e.key === 'Escape') {
        closeImageViewer();
    } else if (e.key === 'ArrowRight') {
        nextImage();
    } else if (e.key === 'ArrowLeft') {
        prevImage();
    }
});

// Add click listeners to carousel images when modal opens


// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
