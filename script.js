// Setta landing behavior + systems autopsy interactions
document.addEventListener('DOMContentLoaded', () => {
    const frameworkSection = document.getElementById('frameworkSection');
    const showAutopsyBtn = document.getElementById('showAutopsyBtn');
    const hideAutopsyBtn = document.getElementById('hideAutopsyBtn');
    const openAutopsyFooter = document.getElementById('openAutopsyFooter');

    function setAutopsyVisible(isVisible, scrollTarget) {
        if (!frameworkSection) return;

        frameworkSection.hidden = !isVisible;
        frameworkSection.classList.toggle('active', isVisible);

        if (showAutopsyBtn) {
            showAutopsyBtn.textContent = isVisible ? 'Diagnostics Open' : 'Open Diagnostics';
            showAutopsyBtn.classList.toggle('active', isVisible);
        }

        if (hideAutopsyBtn) {
            hideAutopsyBtn.style.display = isVisible ? 'inline-flex' : 'none';
        }

        if (isVisible && scrollTarget === 'autopsy') {
            frameworkSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (!isVisible && scrollTarget === 'ugc') {
            const ugcSection = document.getElementById('ugcSection');
            if (ugcSection) {
                ugcSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    if (showAutopsyBtn) {
        showAutopsyBtn.addEventListener('click', () => {
            const shouldShow = !frameworkSection.classList.contains('active');
            setAutopsyVisible(shouldShow, shouldShow ? 'autopsy' : null);
        });
    }

    if (hideAutopsyBtn) {
        hideAutopsyBtn.addEventListener('click', () => {
            setAutopsyVisible(false, 'ugc');
        });
    }

    if (openAutopsyFooter) {
        openAutopsyFooter.addEventListener('click', () => {
            setAutopsyVisible(true, 'autopsy');
        });
    }

    setAutopsyVisible(false, null);

    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNavPanel = document.getElementById('mobileNavPanel');
    const navLinks = Array.from(document.querySelectorAll('[data-site-nav-link]'));
    const navTargets = Array.from(
        new Set(navLinks.map(link => link.getAttribute('data-nav-target')).filter(Boolean))
    )
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function setNavActive(targetId) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-nav-target') === targetId);
        });
    }

    function closeMobileNav() {
        if (!mobileNavToggle || !mobileNavPanel) return;
        mobileNavToggle.classList.remove('active');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavPanel.classList.remove('active');
        mobileNavPanel.setAttribute('aria-hidden', 'true');
    }

    function openMobileNav() {
        if (!mobileNavToggle || !mobileNavPanel) return;
        mobileNavToggle.classList.add('active');
        mobileNavToggle.setAttribute('aria-expanded', 'true');
        mobileNavPanel.classList.add('active');
        mobileNavPanel.setAttribute('aria-hidden', 'false');
    }

    function handleNavTo(targetId) {
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (!target) return;

        if (targetId === 'deliverablesPanel' && target.tagName === 'DETAILS') {
            target.open = true;
        }

        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setNavActive(targetId);
        closeMobileNav();
    }

    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            if (mobileNavPanel && mobileNavPanel.classList.contains('active')) {
                closeMobileNav();
                return;
            }
            openMobileNav();
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            const targetId = link.getAttribute('data-nav-target');
            if (!targetId) return;
            event.preventDefault();
            handleNavTo(targetId);
        });
    });

    document.addEventListener('click', event => {
        if (!mobileNavPanel || !mobileNavToggle) return;
        if (!mobileNavPanel.classList.contains('active')) return;
        if (mobileNavPanel.contains(event.target) || mobileNavToggle.contains(event.target)) return;
        closeMobileNav();
    });

    function updateActiveNavOnScroll() {
        if (navTargets.length === 0) return;
        const offset = window.scrollY + 140;
        let activeId = navTargets[0].id;

        navTargets.forEach(section => {
            if (section.offsetTop <= offset) {
                activeId = section.id;
            }
        });

        setNavActive(activeId);
    }

    window.addEventListener('scroll', updateActiveNavOnScroll, { passive: true });
    updateActiveNavOnScroll();

    const briefCards = document.querySelectorAll('.brief-nav-card[data-brief-id]');
    const briefReferenceButtons = document.querySelectorAll('[data-brief-open]');
    const briefPopup = document.getElementById('briefPopup');
    const briefPopupTitle = document.getElementById('briefPopupTitle');
    const briefPopupKicker = document.getElementById('briefPopupKicker');
    const briefPopupBody = document.getElementById('briefPopupBody');
    const briefPopupClose = document.getElementById('briefPopupClose');

    const briefConfig = {
        A: {
            kicker: 'Brief A',
            title: 'LAKA Fruity Glam Tint',
            templateId: 'briefTemplateA',
            accessCode: '1112'
        },
        B: {
            kicker: 'Brief B',
            title: 'LAKA Fruity Glam Tint (Agency Lens)',
            templateId: 'briefTemplateB',
            accessCode: '2221'
        }
    };

    const briefAccessKeyPrefix = 'setta_brief_access_';

    function hasBriefAccess(briefId) {
        try {
            return window.sessionStorage.getItem(`${briefAccessKeyPrefix}${briefId}`) === '1';
        } catch (error) {
            return false;
        }
    }

    function setBriefAccess(briefId) {
        try {
            window.sessionStorage.setItem(`${briefAccessKeyPrefix}${briefId}`, '1');
        } catch (error) {
            // no-op: fallback to re-prompt behavior when storage is unavailable
        }
    }

    function requestBriefAccess(briefId) {
        const config = briefConfig[briefId];
        if (!config || !config.accessCode) return true;
        if (hasBriefAccess(briefId)) return true;

        const enteredCode = window.prompt(`Enter password for ${config.kicker}`);
        if (enteredCode === null) return false;

        if (enteredCode.trim() === config.accessCode) {
            setBriefAccess(briefId);
            return true;
        }

        window.alert('Incorrect password.');
        return false;
    }

    function openBriefPopup(briefId) {
        if (!briefPopup || !briefPopupBody || !briefPopupTitle || !briefPopupKicker) return;
        const config = briefConfig[briefId];
        if (!config) return;
        if (!requestBriefAccess(briefId)) return;

        const template = document.getElementById(config.templateId);
        if (!template || template.tagName !== 'TEMPLATE') return;

        briefPopupBody.innerHTML = '';
        briefPopupBody.appendChild(template.content.cloneNode(true));
        briefPopupKicker.textContent = config.kicker;
        briefPopupTitle.textContent = config.title;
        briefCards.forEach(card => {
            card.classList.toggle('active', card.getAttribute('data-brief-id') === briefId);
        });
        briefPopup.classList.add('active');
        briefPopup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeBriefPopup() {
        if (!briefPopup) return;
        briefPopup.classList.remove('active');
        briefPopup.setAttribute('aria-hidden', 'true');
        briefCards.forEach(card => card.classList.remove('active'));

        const projectPopup = document.getElementById('projectPopup');
        if (!projectPopup || !projectPopup.classList.contains('active')) {
            document.body.style.overflow = 'auto';
        }
    }

    briefCards.forEach(card => {
        card.addEventListener('click', () => {
            const briefId = card.getAttribute('data-brief-id');
            if (briefId) {
                openBriefPopup(briefId);
            }
        });
    });

    briefReferenceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const briefId = button.getAttribute('data-brief-open');
            if (briefId) {
                openBriefPopup(briefId);
            }
        });
    });

    if (briefPopupClose) {
        briefPopupClose.addEventListener('click', closeBriefPopup);
    }

    if (briefPopup) {
        briefPopup.addEventListener('click', event => {
            if (event.target === briefPopup) {
                closeBriefPopup();
            }
        });
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMobileNav();
        }
        if (event.key === 'Escape' && briefPopup && briefPopup.classList.contains('active')) {
            closeBriefPopup();
        }
    });

    const proofTilesEl = document.getElementById('proofTiles');
    const scanHeadlineEl = document.getElementById('scanHeadline');
    const scanMetaEl = document.getElementById('scanMeta');
    const scanDisclaimerEl = document.getElementById('scanDisclaimer');
    const dataSourceIndicatorEl = document.getElementById('dataSourceIndicator');

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function cleanText(value) {
        if (!value) return '';
        const replacements = [
            ['\u00e2\u20ac\u201d', '-'],
            ['\u00e2\u20ac\u201c', '-'],
            ['\u00e2\u20ac\u00a2', ' | '],
            ['\u00e2\u2020\u2019', '->'],
            ['\u00ce\u201d', 'Delta'],
            ['\u00e2\u20ac\u02dc', "'"],
            ['\u00e2\u20ac\u2122', "'"],
            ['\u00e2\u20ac\u0153', '"'],
            ['\u00e2\u20ac', '"'],
            ['\u00c2\u00b7', ' | ']
        ];

        let text = String(value);
        replacements.forEach(([source, target]) => {
            text = text.split(source).join(target);
        });

        return text
            .replace(/[—–]/g, '-')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function formatNumber(value) {
        if (typeof value !== 'number' || Number.isNaN(value)) return '';
        return value.toLocaleString('en-US');
    }

    function formatDate(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function validateTile(tile) {
        if (!tile || typeof tile !== 'object') return false;
        if (typeof tile.tile_id !== 'string' || !tile.tile_id.trim()) return false;
        if (typeof tile.tile_type !== 'string' || !tile.tile_type.trim()) return false;
        if (typeof tile.market !== 'string' || !tile.market.trim()) return false;
        return true;
    }

    function normalizeTiles(rawTiles) {
        if (!Array.isArray(rawTiles)) return [];
        return rawTiles.filter(validateTile);
    }

    function updateDataSourceIndicator(sourceMode) {
        if (!dataSourceIndicatorEl) return;

        if (sourceMode === 'live-json') {
            dataSourceIndicatorEl.textContent = 'Data source: live JSON';
            return;
        }

        if (sourceMode === 'embedded-fallback') {
            dataSourceIndicatorEl.textContent = 'Data source: embedded fallback';
            return;
        }

        dataSourceIndicatorEl.textContent = 'Data source: unavailable';
    }

    function getTileLabel(tile) {
        switch (tile.tile_type) {
            case 'cluster_momentum':
                return "What's Working";
            case 'do_not_shoot':
            case 'llm_brief_decision':
                return 'Do Not Shoot';
            case 'video_proof':
                return 'Top Post Evidence';
            case 'intl_video_proof':
                return 'JP/KR Input Signal';
            case 'intl_intensity':
                return 'US Transfer Signal';
            default:
                return 'Signal';
        }
    }

    function getTileMetric(tile) {
        const metrics = tile.metrics || {};

        if ((tile.tile_type === 'video_proof' || tile.tile_type === 'intl_video_proof') && typeof metrics.views === 'number') {
            return { value: formatNumber(metrics.views), label: 'Views' };
        }

        if (tile.tile_type === 'cluster_momentum' && typeof metrics.latest_delta_total === 'number') {
            return { value: `+${metrics.latest_delta_total.toFixed(2)}`, label: 'Delta score' };
        }

        if (tile.tile_type === 'intl_intensity' && typeof metrics.score_diff === 'number') {
            return { value: metrics.score_diff.toFixed(1), label: 'Score diff' };
        }

        if (tile.tile_type === 'llm_brief_decision' && typeof tile.signal_strength_score === 'number') {
            return { value: tile.signal_strength_score.toFixed(1), label: 'Strength' };
        }

        if (tile.tile_type === 'do_not_shoot' && typeof tile.llm_confidence === 'number') {
            return { value: tile.llm_confidence.toFixed(2), label: 'Confidence' };
        }

        if (typeof metrics.score_confidence === 'number') {
            return { value: metrics.score_confidence.toFixed(1), label: 'Confidence' };
        }

        return { value: 'Ready', label: 'Evidence' };
    }

    function buildTileDescription(tile) {
        const subhead = cleanText(tile.subhead || '');
        const firstTest = Array.isArray(tile.recommended_tests) && tile.recommended_tests.length > 0
            ? cleanText(tile.recommended_tests[0])
            : '';
        const combined = `${subhead}${firstTest ? ` ${firstTest}` : ''}`.trim();
        if (!combined) return 'Evidence-ready signal tile for weekly decision workflows.';
        return combined.length > 210 ? `${combined.slice(0, 207)}...` : combined;
    }

    function parseSourcePackInfo(sourcePack) {
        const raw = sourcePack || '';
        const pattern = /^proof-pack-([A-Z]{2})-([a-z]+)-(\d{4}-\d{2}-\d{2}T\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/;
        const match = raw.match(pattern);
        if (!match) return null;

        const market = match[1];
        const mode = match[2];
        const iso = `${match[3]}:${match[4]}:${match[5]}.${match[6]}Z`;
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) {
            return { market, mode, flaggedAt: '' };
        }

        return {
            market,
            mode,
            flaggedAt: parsed.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            })
        };
    }

    function getFoundFlaggedLine(tile) {
        const pack = parseSourcePackInfo(tile.source_pack);
        if (!pack) {
            return 'Found in a similar campaign proof pack and escalated for review.';
        }

        const whenPart = pack.flaggedAt ? `flagged ${pack.flaggedAt}` : 'flagged in the latest run';
        return `Found in ${pack.market} ${pack.mode} pack, ${whenPart}.`;
    }

    function getQuantLine(tile) {
        const metrics = tile.metrics || {};
        const parts = [];

        if (typeof metrics.views === 'number') {
            parts.push(`${formatNumber(metrics.views)} views`);
        }
        if (typeof metrics.post_signal_score === 'number') {
            parts.push(`post score ${metrics.post_signal_score.toFixed(2)}`);
        }
        if (typeof metrics.score_total === 'number') {
            parts.push(`total score ${metrics.score_total.toFixed(2)}`);
        }
        if (typeof metrics.latest_delta_total === 'number') {
            parts.push(`delta +${metrics.latest_delta_total.toFixed(2)}`);
        }
        if (typeof metrics.posts_24h_gate_passed === 'number' && typeof metrics.posts_24h_all === 'number') {
            parts.push(`gate pass ${metrics.posts_24h_gate_passed}/${metrics.posts_24h_all} (24h)`);
        }
        if (typeof tile.signal_strength_score === 'number') {
            parts.push(`signal strength ${tile.signal_strength_score.toFixed(2)}`);
        }
        if (typeof tile.llm_confidence === 'number') {
            parts.push(`model confidence ${tile.llm_confidence.toFixed(2)}`);
        }
        if (typeof tile.sample_views === 'number') {
            parts.push(`sample post ${formatNumber(tile.sample_views)} views`);
        }
        if (typeof metrics.score_diff === 'number' && typeof metrics.intl_first_score === 'number' && typeof metrics.us_first_score === 'number') {
            parts.push(`JP/KR score ${metrics.intl_first_score.toFixed(2)} vs US ${metrics.us_first_score.toFixed(2)}`);
        }

        if (parts.length === 0) {
            return 'Quantitative evidence validated in the latest scoring run.';
        }
        return parts.join(' | ');
    }

    function getQualLine(tile) {
        const parts = [];
        const labels = tile.labels || {};

        if (labels.hook_pattern) {
            parts.push(`hook pattern: ${labels.hook_pattern}`);
        }
        if (labels.claim_type) {
            parts.push(`claim style: ${labels.claim_type}`);
        }
        if (Array.isArray(tile.do_not_shoot_reasons) && tile.do_not_shoot_reasons.length > 0) {
            parts.push(`risk flags: ${tile.do_not_shoot_reasons.slice(0, 2).join(', ')}`);
        }
        if (Array.isArray(tile.do_not_shoot_checks) && tile.do_not_shoot_checks.length > 0) {
            parts.push(`decision checks: ${tile.do_not_shoot_checks.slice(0, 2).join(', ')}`);
        }
        if (Array.isArray(tile.missing_signal_reasons) && tile.missing_signal_reasons.length > 0) {
            parts.push(`missing signals: ${tile.missing_signal_reasons.slice(0, 2).join(', ')}`);
        }
        if (tile.why_post_matters) {
            parts.push(`qual read: ${tile.why_post_matters}`);
        }

        // For buyers asking about comment sentiment, frame as a qualitative proxy when DNS/decision flags fire.
        if (
            tile.tile_type === 'do_not_shoot' ||
            tile.tile_type === 'llm_brief_decision'
        ) {
            parts.push('comment-sentiment risk proxy reviewed');
        }

        if (parts.length === 0) {
            return 'Qualitative pattern checks and similar-campaign reception reviewed.';
        }
        return parts.join(' | ');
    }

    function renderScanSummary(tile) {
        if (!scanHeadlineEl || !scanMetaEl) return;

        if (!tile) {
            scanHeadlineEl.textContent = 'No system scale tile found in the latest proof pack.';
            scanMetaEl.textContent = '';
            if (scanDisclaimerEl) {
                scanDisclaimerEl.textContent = 'Snapshot disclaimer: based on the last 72 hours only.';
            }
            return;
        }

        const metrics = tile.metrics || {};
        const candidates = typeof metrics.candidates_count === 'number' ? formatNumber(metrics.candidates_count) : 'n/a';
        const selected = typeof metrics.selected_signals === 'number' ? formatNumber(metrics.selected_signals) : 'n/a';
        const windowHours = typeof metrics.window_hours === 'number' ? `${metrics.window_hours}h` : '';
        const asOf = formatDate(metrics.as_of_ts);
        const marketMode = `${tile.market || 'US'} ${tile.mode || 'discovery'}`.trim();
        const hoursForDisclaimer = typeof metrics.window_hours === 'number' ? metrics.window_hours : 72;

        scanHeadlineEl.textContent = `${candidates} candidates -> ${selected} selected signals`;
        scanMetaEl.textContent = [marketMode, windowHours ? `window ${windowHours}` : '', asOf ? `as of ${asOf}` : '']
            .filter(Boolean)
            .join(' | ');
        if (scanDisclaimerEl) {
            scanDisclaimerEl.textContent = `Snapshot disclaimer: based on the last ${hoursForDisclaimer} hours only.`;
        }
    }

    function pickTop(tiles, count, scoreFn) {
        return [...tiles]
            .sort((a, b) => scoreFn(b) - scoreFn(a))
            .slice(0, count);
    }

    function selectFeaturedTiles(tiles) {
        const seen = new Set();
        const selected = [];

        const push = (tile) => {
            if (!tile || seen.has(tile.tile_id)) return;
            selected.push(tile);
            seen.add(tile.tile_id);
        };

        push(pickTop(tiles.filter(t => t.tile_type === 'cluster_momentum'), 1, t => t.metrics?.latest_delta_total || 0)[0]);
        push(tiles.find(t => t.tile_type === 'llm_brief_decision'));

        pickTop(tiles.filter(t => t.tile_type === 'video_proof'), 3, t => t.metrics?.views || 0).forEach(push);

        const jpTop = pickTop(tiles.filter(t => t.tile_type === 'intl_video_proof' && t.market === 'JP'), 1, t => t.metrics?.views || 0)[0];
        const krTop = pickTop(tiles.filter(t => t.tile_type === 'intl_video_proof' && t.market === 'KR'), 1, t => t.metrics?.views || 0)[0];
        push(jpTop);
        push(krTop);

        push(pickTop(tiles.filter(t => t.tile_type === 'intl_intensity'), 1, t => Math.abs(t.metrics?.score_diff || 0))[0]);

        pickTop(tiles.filter(t => t.tile_type === 'do_not_shoot'), 2, t => t.llm_confidence || 0).forEach(push);

        if (selected.length < 10) {
            tiles.forEach(push);
        }

        return selected.slice(0, 10);
    }

    function renderProofTiles(tiles) {
        if (!proofTilesEl) return;

        const featured = selectFeaturedTiles(tiles);
        if (featured.length === 0) {
            proofTilesEl.innerHTML = `
                <div class="proof-tile">
                    <div class="proof-tile-header">
                        <span class="proof-label">No Data</span>
                        <span class="proof-timestamp">Setta</span>
                    </div>
                    <h3 class="proof-title">No proof tiles available</h3>
                    <p class="proof-description">The dataset loaded, but no valid proof tiles were found.</p>
                </div>
            `;
            return;
        }

        proofTilesEl.innerHTML = featured.map(tile => {
            const metric = getTileMetric(tile);
            const marketTag = tile.tile_type === 'intl_intensity' && tile.metrics?.intl_market
                ? `${tile.metrics.intl_market} -> US`
                : (tile.market || 'US');
            const foundFlaggedLine = cleanText(getFoundFlaggedLine(tile));
            const quantLine = cleanText(getQuantLine(tile));
            const qualLine = cleanText(getQualLine(tile));
            const linkHtml = tile.video_url
                ? `<a class="proof-link" href="${escapeHtml(tile.video_url)}" target="_blank" rel="noopener noreferrer">Open evidence video</a>`
                : `<span class="proof-source">${escapeHtml(cleanText(tile.source_pack || ''))}</span>`;

            return `
                <article class="proof-tile">
                    <div class="proof-tile-header">
                        <span class="proof-label">${escapeHtml(getTileLabel(tile))}</span>
                        <span class="proof-timestamp">${escapeHtml(marketTag)}</span>
                    </div>
                    <h3 class="proof-title">${escapeHtml(cleanText(tile.headline || tile.cluster_label || 'Signal tile'))}</h3>
                    <p class="proof-description">${escapeHtml(buildTileDescription(tile))}</p>
                    <div class="proof-insights">
                        <p class="proof-insight"><strong>Found + flagged:</strong> ${escapeHtml(foundFlaggedLine)}</p>
                        <p class="proof-insight"><strong>Quant:</strong> ${escapeHtml(quantLine)}</p>
                        <p class="proof-insight"><strong>Qual:</strong> ${escapeHtml(qualLine)}</p>
                    </div>
                    <div class="proof-metrics">
                        <span class="metric">${escapeHtml(metric.value)}</span>
                        <span class="metric-label">${escapeHtml(metric.label)}</span>
                    </div>
                    <div class="proof-footer">
                        ${linkHtml}
                    </div>
                </article>
            `;
        }).join('');
    }

    async function loadProofTiles() {
        if (!proofTilesEl) return;

        let sourceMode = 'none';
        let tileList = [];

        try {
            const response = await fetch('data/setta_proof_tiles_v2.json', { cache: 'no-store' });
            if (response.ok) {
                const fetched = await response.json();
                const normalized = normalizeTiles(fetched);
                if (normalized.length > 0) {
                    tileList = normalized;
                    sourceMode = 'live-json';
                }
            }
        } catch (error) {
            // Fallback handled below.
        }

        if (tileList.length === 0) {
            const fallbackRaw = window.SETTA_PROOF_TILES_V2;
            const fallback = normalizeTiles(fallbackRaw);
            if (fallback.length > 0) {
                tileList = fallback;
                sourceMode = 'embedded-fallback';
            }
        }

        updateDataSourceIndicator(sourceMode);

        if (tileList.length === 0) {
            if (scanHeadlineEl) {
                scanHeadlineEl.textContent = 'Unable to load latest scan summary.';
            }
            if (scanMetaEl) {
                scanMetaEl.textContent = 'No valid tile data available from JSON or embedded fallback.';
            }
            proofTilesEl.innerHTML = `
                <div class="proof-tile">
                    <div class="proof-tile-header">
                        <span class="proof-label">Load Error</span>
                        <span class="proof-timestamp">Setta</span>
                    </div>
                    <h3 class="proof-title">Could not load proof tiles</h3>
                    <p class="proof-description">Check data/setta_proof_tiles_v2.json or data/setta_proof_tiles_v2.embedded.js.</p>
                </div>
            `;
            return;
        }

        renderScanSummary(tileList.find(tile => tile.tile_type === 'system_scale'));
        renderProofTiles(tileList.filter(tile => tile.tile_type !== 'system_scale'));
    }

    loadProofTiles();

    const toggleBtn = document.getElementById('toggleBtn');
    const toggleOptions = document.querySelectorAll('.toggle-option');

    let currentState = 'common';

    function updateState() {
        toggleOptions.forEach(option => {
            if (option.getAttribute('data-state') === currentState) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        const allCommonContent = document.querySelectorAll('.common-content');
        const allEarlyContent = document.querySelectorAll('.early-content');
        const systemReliabilityNote = document.getElementById('systemReliabilityNote');
        const systemReliabilityProject = document.getElementById('systemReliability');

        if (currentState === 'common') {
            allCommonContent.forEach(content => {
                content.classList.add('active');
            });
            allEarlyContent.forEach(content => {
                content.classList.remove('active');
            });
            if (systemReliabilityNote) {
                systemReliabilityNote.style.display = 'none';
            }
            if (systemReliabilityProject) {
                systemReliabilityProject.classList.remove('flagship-highlight');
            }
        } else {
            allCommonContent.forEach(content => {
                content.classList.remove('active');
            });
            allEarlyContent.forEach(content => {
                content.classList.add('active');
            });
            if (systemReliabilityNote) {
                systemReliabilityNote.style.display = 'block';
            }
            if (systemReliabilityProject) {
                systemReliabilityProject.classList.add('flagship-highlight');
            }
        }
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            currentState = currentState === 'common' ? 'early' : 'common';
            updateState();
        });
    }

    toggleOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentState = option.getAttribute('data-state') || 'common';
            updateState();
        });
    });

    updateState();

    const dropdownToggle = document.getElementById('dropdownToggle');
    const bottomProjects = document.getElementById('bottomProjects');

    if (dropdownToggle && bottomProjects) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            bottomProjects.classList.toggle('expanded');
            dropdownToggle.classList.toggle('expanded');
        });
    }

    const popupHTML = `
        <div class="project-popup" id="projectPopup">
            <div class="popup-content">
                <div class="popup-header">
                    <h2 class="popup-title" id="popupTitle"></h2>
                    <span class="popup-close" id="popupClose">&times;</span>
                </div>
                <div class="popup-body" id="popupBody"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);

    const popup = document.getElementById('projectPopup');
    const popupTitle = document.getElementById('popupTitle');
    const popupBody = document.getElementById('popupBody');
    const popupClose = document.getElementById('popupClose');

    const projectUrls = {
        1: 'https://system1-phi.vercel.app/',
        2: 'https://n8n-crm-lime.vercel.app/',
        3: 'https://n8n-workflow-portfolio.vercel.app/',
        4: 'https://n8n-ecommerce-reporting.vercel.app/'
    };

    const projectTitles = {
        1: 'System Health Evaluation',
        2: 'Client Health Monitor',
        3: 'Sentiment Analysis',
        4: 'Revenue Integrity'
    };

    const projectSections = document.querySelectorAll('.project-section');

    projectSections.forEach((section, index) => {
        const projectNum = index + 1;
        const title = section.querySelector('.project-title');

        if (title && !title.querySelector('.expand-icon')) {
            const expandIcon = document.createElement('span');
            expandIcon.className = 'expand-icon';
            expandIcon.textContent = ' +';
            expandIcon.style.cssText = 'font-size: 0.875rem; color: var(--sys-accent); cursor: pointer; margin-left: 0.5rem; transition: transform 0.3s ease;';
            title.appendChild(expandIcon);
        }

        section.addEventListener('click', (e) => {
            if (e.target.closest('.toggle-btn') || e.target.closest('.dropdown-toggle') || e.target.closest('.secondary-toggle')) {
                return;
            }

            const isEarlySignal = currentState === 'early';
            const url = projectUrls[projectNum];
            const titleText = projectTitles[projectNum];

            popupTitle.textContent = titleText;

            if (isEarlySignal && url) {
                popupBody.innerHTML = `
                    <div class="popup-iframe-container">
                        <iframe
                            src="${url}"
                            class="popup-iframe"
                            allow="fullscreen"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms">
                        </iframe>
                    </div>
                `;
            } else {
                const cardContent = section.querySelector('.common-content .project-card') || section.querySelector('.early-content .project-card');
                if (cardContent) {
                    popupBody.innerHTML = cardContent.outerHTML;
                }
            }

            popup.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closePopup() {
        popup.classList.remove('active');
        document.body.style.overflow = 'auto';
        const iframe = popupBody.querySelector('.popup-iframe');
        if (iframe) {
            iframe.src = '';
        }
    }

    if (popupClose) {
        popupClose.addEventListener('click', closePopup);
    }

    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closePopup();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (popup && e.key === 'Escape' && popup.classList.contains('active')) {
            closePopup();
        }
    });
});
