// Project data
const projects = {
    1: {
        title: 'E-commerce Reporting',
        category: 'Repairing Broken Systems',
        problem: 'Revenue and refund issues were only discovered weeks later through manual reports. Daily performance was invisible until month-end reviews.',
        solution: 'A real-time reporting and alerting system that surfaced anomalies automatically instead of relying on end-of-month reviews.',
        result: 'Teams regained day-to-day visibility and could intervene before losses compounded.',
        github: 'https://github.com/mohamjad/n8n-ecommerce-reporting',
        demo: 'https://n8n-ecommerce-reporting.vercel.app/'
    },
    2: {
        title: 'Sentiment Analysis',
        category: 'Early Failure Detection',
        problem: 'Brand crises exploded before anyone noticed. Negative sentiment spread unchecked while teams were blind.',
        solution: 'A monitoring system that tracks sentiment signals and alerts teams when threats emerge before they escalate.',
        result: 'Teams regained visibility into brand health and could intervene before problems went viral.',
        github: 'https://github.com/mohamjad/n8n-workflow-portfolio',
        demo: 'https://n8n-workflow-portfolio.vercel.app/'
    },
    3: {
        title: 'Client Health Monitoring',
        category: 'Early Failure Detection',
        problem: 'Customers churned without warning. Revenue disappeared before intervention. Account managers learned about problems from cancellation emails.',
        solution: 'A health monitoring system that tracks signals across touchpoints and surfaces churn risk before cancellation.',
        result: 'Account managers regained visibility into client health and could intervene before revenue was lost.',
        github: 'https://github.com/mohamjad/n8n-crm-lime',
        demo: 'https://n8n-crm-lime.vercel.app/'
    },
    4: {
        title: 'System Health Evaluation',
        category: 'Early Failure Detection',
        opening: 'A lot of systems don\'t fail all at once. They look fine, numbers are green, and then something breaks in a way nobody saw coming.\n\nI kept running into this while fixing broken automation and pipelines, so I built a way to reason about whether systems are actually healthy, not just passing checks on the surface.',
        whatItHelps: 'This helps answer questions like:\n\n• Are things actually stable right now, or just not obviously broken?\n• What would fail next if usage or conditions change?\n• What signals would have caught the last incident earlier?\n\nInstead of waiting for alerts after something breaks, it focuses on signals that change before the failure shows up.',
        howIApproach: 'I break systems down into:\n\n• signals that change early\n• failure modes that actually matter\n• incidents that already happened\n\nWhen something breaks, I don\'t just fix it. I look at what should have caught it earlier and update the signals so the same thing doesn\'t happen again.',
        mainFeature: 'The most useful part is being able to take a past incident and ask, "what would have caught this sooner?"\n\nThe demo lets you see which signals fired too late, which ones were missing entirely, and what to change so the system would\'ve noticed earlier next time.',
        whyThisExists: 'This grew out of fixing real systems. Revenue pipelines, monitoring setups, automation that quietly stopped working.\n\nThe other projects on this site are specific fixes. This is the way I think about preventing the same kinds of failures from happening again.',
        closing: 'This isn\'t meant to be a finished product. It\'s how I reason about systems when I\'m trying to figure out what\'s going to break next.',
        demo: 'https://system1-phi.vercel.app/'
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Modal elements
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modalBody');
    const previewModal = document.getElementById('previewModal');
    const previewIframe = document.getElementById('previewIframe');
    const modalInfo = document.getElementById('modalInfo');
    const previewButtons = document.querySelectorAll('.preview-btn');
    const allCloseButtons = document.querySelectorAll('.modal-close');
    const projectCards = document.querySelectorAll('.cyber-card');
    
    console.log('Found preview buttons:', previewButtons.length);

    // Open project details modal
    function openProjectModal(project) {
        if (!modalBody || !modal) return;
        
        // Special handling for System Health Evaluation (project 4)
        if (project.opening) {
            modalBody.innerHTML = `
                <h2 class="card-title">${project.title}</h2>
                <p style="margin-top: 0.5rem; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 0.75rem; color: var(--sys-text-muted);">${project.category}</p>
                
                <div style="margin-top: 2rem;">
                    <p class="card-description" style="margin-bottom: 2rem; white-space: pre-line;">${project.opening}</p>
                    
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--sys-border);">
                        <h3 style="color: var(--sys-accent); margin-bottom: 1rem; font-size: 1rem; font-weight: 500;">What this helps with</h3>
                        <p class="card-description" style="white-space: pre-line;">${project.whatItHelps}</p>
                    </div>
                    
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--sys-border);">
                        <h3 style="color: var(--sys-accent); margin-bottom: 1rem; font-size: 1rem; font-weight: 500;">How I approach it</h3>
                        <p class="card-description" style="white-space: pre-line;">${project.howIApproach}</p>
                    </div>
                    
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--sys-border);">
                        <h3 style="color: var(--sys-accent); margin-bottom: 1rem; font-size: 1rem; font-weight: 500;">The part I care about most</h3>
                        <p class="card-description" style="white-space: pre-line;">${project.mainFeature}</p>
                    </div>
                    
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--sys-border);">
                        <h3 style="color: var(--sys-accent); margin-bottom: 1rem; font-size: 1rem; font-weight: 500;">Why this exists</h3>
                        <p class="card-description" style="white-space: pre-line;">${project.whyThisExists}</p>
                    </div>
                    
                    ${project.closing ? `<p class="card-description" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--sys-border); white-space: pre-line;">${project.closing}</p>` : ''}
                </div>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${project.demo ? `<button class="preview-btn" data-url="${project.demo}" style="font-size: 1rem;">VIEW_DEMO →</button>` : ''}
                    ${project.github ? `<a href="${project.github}" target="_blank" class="cyber-link" style="font-size: 1rem;">VIEW_GITHUB →</a>` : ''}
                </div>
            `;
        } else {
            // Standard project modal (for projects 1-3)
            modalBody.innerHTML = `
                <h2 class="card-title">${project.title}</h2>
                <p style="margin-top: 0.5rem; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 0.75rem; color: var(--sys-text-muted);">${project.category}</p>
                
                <div style="margin-top: 2rem;">
                    <p class="card-description" style="margin-bottom: 1rem;">
                        <strong style="color: var(--sys-accent);">What was broken:</strong><br>
                        ${project.problem}
                    </p>
                    <p class="card-description" style="margin-bottom: 1rem;">
                        <strong style="color: var(--sys-accent);">What I built:</strong><br>
                        ${project.solution}
                    </p>
                    <p class="card-description">
                        <strong style="color: var(--sys-accent);">Result:</strong><br>
                        ${project.result}
                    </p>
                </div>
                
                <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${project.demo ? `<button class="preview-btn" data-url="${project.demo}" style="font-size: 1rem;">PREVIEW_DEMO →</button>` : ''}
                    ${project.github ? `<a href="${project.github}" target="_blank" class="cyber-link" style="font-size: 1rem;">VIEW_GITHUB →</a>` : ''}
                </div>
            `;
        }
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Re-attach preview button listener if it was added in modal
        const modalPreviewBtn = modalBody.querySelector('.preview-btn');
        if (modalPreviewBtn) {
            modalPreviewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = modalPreviewBtn.getAttribute('data-url');
                const projectId = Object.keys(projects).find(id => projects[id].demo === url);
                if (projectId) {
                    openPreviewModal(url, projectId);
                    modal.style.display = 'none';
                }
            });
        }
    }

    // Open preview modal
    function openPreviewModal(url, projectId) {
        console.log('openPreviewModal called with:', url, projectId);
        
        if (!previewModal || !previewIframe || !modalInfo) {
            console.error('Modal elements not found', {
                previewModal: !!previewModal,
                previewIframe: !!previewIframe,
                modalInfo: !!modalInfo
            });
            return;
        }
        
        const project = projects[projectId];
        if (!project) {
            console.error('Project not found:', projectId, 'Available projects:', Object.keys(projects));
            return;
        }
        
        console.log('Setting iframe src to:', url);
        previewIframe.src = url;
        
        modalInfo.innerHTML = `
            <div style="font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace; font-size: 0.875rem;">
                <div style="margin-bottom: 0.5rem;">
                    <span style="color: var(--sys-accent);">PROJECT:</span>
                    <span style="color: var(--sys-text-primary); margin-left: 0.5rem;">${project.title}</span>
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <span style="color: var(--sys-success);">URL:</span>
                    <span style="color: var(--sys-text-secondary); margin-left: 0.5rem;">${url}</span>
                </div>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--sys-border);">
                    <a href="${url}" target="_blank" class="cyber-link" style="font-size: 0.875rem;">OPEN_IN_NEW_TAB →</a>
                    ${project.github ? `<a href="${project.github}" target="_blank" class="cyber-link" style="font-size: 0.875rem; margin-left: 1rem;">VIEW_GITHUB →</a>` : ''}
                </div>
            </div>
        `;
        
        console.log('Displaying modal');
        previewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Check if iframe loaded
        previewIframe.onload = function() {
            console.log('Iframe loaded successfully');
        };
        
        previewIframe.onerror = function() {
            console.error('Iframe failed to load');
        };
    }

    // Handle preview button clicks using event delegation
    document.addEventListener('click', function(e) {
        // Check if clicked element or its parent is a preview button
        let previewBtn = null;
        
        // First check if the target itself is the button
        if (e.target && e.target.classList && e.target.classList.contains('preview-btn')) {
            previewBtn = e.target;
        } else if (e.target && e.target.closest) {
            // Otherwise try to find the closest preview button
            previewBtn = e.target.closest('.preview-btn');
        }
        
        if (previewBtn && typeof previewBtn.getAttribute === 'function') {
            console.log('Preview button clicked!', previewBtn);
            e.preventDefault();
            e.stopPropagation();
            
            const url = previewBtn.getAttribute('data-url');
            // Try to get project ID from button's data attribute first, then from card
            let projectId = previewBtn.getAttribute('data-project');
            if (!projectId && previewBtn.closest) {
                const card = previewBtn.closest('.cyber-card');
                if (card && typeof card.getAttribute === 'function') {
                    projectId = card.getAttribute('data-project');
                }
            }
            console.log('Button data:', { url, projectId });
            if (projectId && url) {
                // Convert to number if needed
                projectId = parseInt(projectId) || projectId;
                console.log('Opening preview:', url, projectId);
                openPreviewModal(url, projectId);
            } else {
                console.error('Preview button missing data:', { url, projectId, button: previewBtn });
            }
        }
    });

    // Open project details modal when card is clicked (but not preview button)
    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open if clicking on preview button
            if (e.target.closest('.preview-btn')) {
                return;
            }
            const projectId = card.getAttribute('data-project');
            const project = projects[projectId];
            if (project) {
                openProjectModal(project);
            }
        });
    });

    // Close modals
    allCloseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.cyber-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                // Clear iframe src when closing preview
                if (modal.id === 'previewModal' && previewIframe) {
                    previewIframe.src = '';
                }
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('cyber-modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Clear iframe src when closing preview
            if (e.target.id === 'previewModal' && previewIframe) {
                previewIframe.src = '';
            }
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.cyber-modal[style*="block"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                if (modal.id === 'previewModal' && previewIframe) {
                    previewIframe.src = '';
                }
            });
        }
    });

    // Main content expand/collapse
    const expandMainBtn = document.getElementById('expandMainBtn');
    const collapsibleContent = document.getElementById('collapsibleContent');
    
    if (expandMainBtn && collapsibleContent) {
        expandMainBtn.addEventListener('click', () => {
            const isExpanded = collapsibleContent.style.display === 'block';
            
            if (isExpanded) {
                collapsibleContent.style.display = 'none';
                expandMainBtn.classList.remove('expanded');
                expandMainBtn.querySelector('.expand-btn-text').textContent = 'EXPLORE MY WORK →';
            } else {
                collapsibleContent.style.display = 'block';
                expandMainBtn.classList.add('expanded');
                expandMainBtn.querySelector('.expand-btn-text').textContent = 'COLLAPSE →';
                // Smooth scroll to content
                setTimeout(() => {
                    collapsibleContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    }

    // System Health Evaluation expand/collapse
    const expandBtn = document.getElementById('expandExplanationBtn');
    const detailsSection = document.getElementById('systemHealthDetails');
    
    if (expandBtn && detailsSection) {
        expandBtn.addEventListener('click', () => {
            const isExpanded = detailsSection.style.display === 'block';
            
            if (isExpanded) {
                detailsSection.style.display = 'none';
                expandBtn.textContent = 'READ FULL EXPLANATION →';
            } else {
                detailsSection.style.display = 'block';
                expandBtn.textContent = 'COLLAPSE EXPLANATION →';
                // Smooth scroll to details
                setTimeout(() => {
                    detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                // Expand content if collapsed
                if (collapsibleContent && collapsibleContent.style.display === 'none') {
                    collapsibleContent.style.display = 'block';
                    expandMainBtn.classList.add('expanded');
                    expandMainBtn.querySelector('.expand-btn-text').textContent = 'COLLAPSE →';
                }
                const target = document.querySelector(href);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            }
        });
    });
});
