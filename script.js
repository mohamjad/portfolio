// Project data
const projects = {
    1: {
        title: 'E-commerce Reporting Dashboard',
        description: 'A comprehensive e-commerce analytics automation built with n8n that aggregates sales data, tracks revenue trends, monitors order metrics, and provides real-time insights into business performance.',
        features: [
            'Real-time sales dashboard with 30-day performance metrics',
            'Automated data aggregation and reporting',
            'Revenue trend analysis and visualization',
            'Daily sales data tracking with comprehensive metrics',
            'Refund rate monitoring and analysis'
        ],
        technologies: ['n8n', 'API Integration', 'Data Analytics', 'Dashboard'],
        github: 'https://github.com/mohamjad/n8n-ecommerce-reporting',
        demo: 'https://n8n-ecommerce-reporting.vercel.app/'
    },
    2: {
        title: 'Social Media Sentiment Analysis',
        description: 'An AI-powered sentiment analysis automation that monitors social media platforms in real-time. The system fetches posts from Twitter and Reddit, performs AI-powered sentiment analysis, enriches data with engagement metrics, and triggers alerts based on sentiment thresholds.',
        features: [
            'Real-time social media monitoring (Twitter & Reddit)',
            'AI-powered sentiment analysis and scoring',
            'Automated alert system for negative sentiment',
            'PostgreSQL data storage and historical tracking',
            'Engagement metrics and trend analysis',
            'Multi-platform data normalization'
        ],
        technologies: ['n8n', 'AI/ML', 'PostgreSQL', 'Twitter API', 'Reddit API'],
        github: 'https://github.com/mohamjad/n8n-workflow-portfolio',
        demo: 'https://n8n-workflow-portfolio.vercel.app/'
    },
    3: {
        title: 'Client Health Monitoring Dashboard',
        description: 'A production-ready n8n automation that monitors client health signals across revenue, usage, and support metrics. The system computes risk scores, identifies churn risks, tracks expansion opportunities, and routes alerts to Slack and Notion.',
        features: [
            'Multi-source client health monitoring (Revenue, Usage, Support)',
            'Automated churn risk detection and scoring',
            'Health score computation and risk distribution',
            'Integration with Stripe, HubSpot, Zendesk/Intercom',
            'Automated alerts to Slack and Notion',
            'Expansion opportunity identification',
            'MRR tracking and risk assessment'
        ],
        technologies: ['n8n', 'Stripe', 'HubSpot CRM', 'Zendesk', 'Intercom', 'Slack', 'Notion', 'API'],
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
            <p class="card-description" style="margin-top: 1rem;">${project.description}</p>
            
            <div style="margin-top: 2rem; padding: 1rem; border: 1px solid var(--cyber-green); background: rgba(5, 150, 105, 0.1);">
                <h3 style="color: var(--cyber-green); margin-bottom: 1rem; font-family: 'Share Tech Mono', monospace;">FEATURES:</h3>
                <ul style="list-style: none; padding: 0;">
                    ${project.features.map(feature => `<li style="padding: 0.5rem 0; color: var(--cyber-text); border-bottom: 1px solid var(--cyber-border-dim);">• ${feature}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 2rem;">
                <div class="tech-label">TECHNOLOGIES:</div>
                <div class="tech-items" style="margin-top: 1rem;">
                    ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                </div>
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
