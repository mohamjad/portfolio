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

    // Open project details modal
    function openProjectModal(project) {
        if (!modalBody || !modal) return;
        
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
        if (!previewModal || !previewIframe || !modalInfo) return;
        
        const project = projects[projectId];
        previewIframe.src = url;
        
        if (project) {
            modalInfo.innerHTML = `
                <div style="font-family: 'Share Tech Mono', monospace; font-size: 0.875rem;">
                    <div style="margin-bottom: 0.5rem;">
                        <span style="color: var(--cyber-purple);">PROJECT:</span>
                        <span style="color: var(--cyber-text); margin-left: 0.5rem;">${project.title}</span>
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <span style="color: var(--cyber-green);">URL:</span>
                        <span style="color: var(--cyber-text-dim); margin-left: 0.5rem;">${url}</span>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--cyber-border-dim);">
                        <a href="${url}" target="_blank" class="cyber-link" style="font-size: 0.875rem;">OPEN_IN_NEW_TAB →</a>
                        ${project.github ? `<a href="${project.github}" target="_blank" class="cyber-link" style="font-size: 0.875rem; margin-left: 1rem;">VIEW_GITHUB →</a>` : ''}
                    </div>
                </div>
            `;
        }
        
        previewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Handle preview button clicks
    previewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            const url = button.getAttribute('data-url');
            const card = button.closest('.cyber-card');
            const projectId = card.getAttribute('data-project');
            openPreviewModal(url, projectId);
        });
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
});
