"use strict";
( () => {
    var c = class {
        constructor(e) {
            this.baseUrl = e.baseUrl,
            this.headers = {
                "Content-Type": "application/json",
                ...e.defaultHeaders
            },
            this.maxRetries = e.maxRetries ?? 3,
            this.initialRetryDelay = e.initialRetryDelay ?? 500
        }
        async resolveHeaders() {
            let e = {};
            for (let[t,r] of Object.entries(this.headers)) {
                let i = await r;
                i !== null && (e[t] = i)
            }
            return e
        }
        addHeader(e, t) {
            this.headers[e] = t
        }
        async post(e, t, r, i) {
            try {
                let n = await fetch(e, {
                    method: "POST",
                    headers: await this.resolveHeaders(),
                    body: JSON.stringify(t ?? {}),
                    keepalive: !0,
                    ...r
                });
                if (n.status === 401)
                    return null;
                if (n.status !== 200 && n.status !== 202)
                    throw new Error(`HTTP error! status: ${n.status}`);
                let s = await n.text();
                return s ? JSON.parse(s) : null
            } catch (n) {
                if (i < this.maxRetries) {
                    let s = this.initialRetryDelay * 2 ** i;
                    return await new Promise(o => setTimeout(o, s)),
                    this.post(e, t, r, i + 1)
                }
                return console.error("Max retries reached:", n),
                null
            }
        }
        async fetch(e, t, r={}) {
            let i = `${this.baseUrl}${e}`;
            return this.post(i, t, r, 0)
        }
    }
    ;
    var l = class {
        constructor(e) {
            this.options = {
                disabled: false,
                waitForProfile: false,
                
                trackScreenViews: true,
                trackHashChanges: false,
                trackAttributes: false,
                trackOutgoingLinks: false,
                
                trackSessions: false,
                trackPerformance: false,
                trackWebVitals: false,
                trackEngagement: false,
                trackScrollDepth: false,
                trackExitIntent: false,
                trackInteractions: false,
                trackErrors: false,
                trackBounceRate: false,

                ...e
            };
            
            this.queue = [];
            let t = {
                "databuddy-client-id": this.options.clientId
            };
            this.options.clientSecret && (t["databuddy-client-secret"] = this.options.clientSecret),
            t["databuddy-sdk-name"] = this.options.sdk || "node",
            t["databuddy-sdk-version"] = this.options.sdkVersion || process.env.SDK_VERSION,
            this.api = new c({
                baseUrl: this.options.apiUrl || "https://api.databuddy.cc",
                defaultHeaders: t
            });
            
            this.lastPath = "";
            this.pageCount = 0;
            this.isInternalNavigation = false;
            
            this.anonymousId = this.getOrCreateAnonymousId();
            this.sessionId = this.getOrCreateSessionId();
            this.sessionStartTime = this.getSessionStartTime();
            this.lastActivityTime = Date.now();
            
            this.maxScrollDepth = 0;
            this.interactionCount = 0;
            this.hasExitIntent = false;
            this.pageStartTime = Date.now();
            this.utmParams = this.getUtmParams();

            if (typeof window !== 'undefined' && this.options.trackExitIntent) {
                this.setupExitTracking();
            }
        }
        getOrCreateAnonymousId() {
            if (typeof window !== 'undefined' && window.localStorage) {
                const storedId = localStorage.getItem('did');
                if (storedId) {
                    return storedId;
                }
                const newId = this.generateAnonymousId();
                localStorage.setItem('did', newId);
                return newId;
            }
            return this.generateAnonymousId();
        }
        generateAnonymousId() {
            return 'anon_' + Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
        }
        getOrCreateSessionId() {
            if (this.isServer()) {
                return this.generateSessionId();
            }

            const storedId = sessionStorage.getItem('did_session');
            if (storedId) {
                return storedId;
            }
            
            const newId = this.generateSessionId();
            sessionStorage.setItem('did_session', newId);
            return newId;
        }
        generateSessionId() {
            return 'sess_' + this.anonymousId.substring(5, 10) + '_' + 
                Date.now().toString(36);
        }
        getSessionStartTime() {
            if (this.isServer()) {
                return Date.now();
            }

            const storedTime = sessionStorage.getItem('did_session_start');
            if (storedTime) {
                return parseInt(storedTime, 10);
            }
            
            const now = Date.now();
            sessionStorage.setItem('did_session_start', now.toString());
            return now;
        }
        init() {
            if (this.isServer()) return;
            
            if (this.options.trackSessions) {
                this.anonymousId = this.getOrCreateAnonymousId();
                this.sessionId = this.getOrCreateSessionId();
                this.sessionStartTime = this.getSessionStartTime();
                this.lastActivityTime = Date.now();
                
                ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
                    window.addEventListener(eventType, () => {
                        this.lastActivityTime = Date.now();
                        
                        if (this.options.trackInteractions) {
                            this.interactionCount++;
                        }
                    }, { passive: true });
                });
            } else {
                this.anonymousId = this.getOrCreateAnonymousId();
            }
            
            if (this.options.trackEngagement) {
                this.maxScrollDepth = 0;
                this.interactionCount = 0;
                this.hasExitIntent = false;
                
                if (this.options.trackScrollDepth) {
                    window.addEventListener('scroll', () => {
                        this.trackScrollDepth();
                    }, { passive: true });
                }
                
                if (this.options.trackExitIntent) {
                    document.addEventListener('mouseleave', (e) => {
                        if (e.clientY <= 0) {
                            this.hasExitIntent = true;
                        }
                    });
                }
            }
            
            if (this.options.trackErrors) {
                window.addEventListener('error', (event) => {
                    this.track('error', {
                        message: event.message,
                        filename: event.filename,
                        lineno: event.lineno,
                        colno: event.colno,
                        stack: event.error?.stack,
                        __path: window.location.href,
                        __title: document.title,
                        __referrer: document.referrer || 'direct'
                    });
                });
            }
        }
        trackScrollDepth() {
            if (this.isServer()) return;
            
            const scroll_depth = Math.round(this.maxScrollDepth);
            super.track('scroll_depth', { scroll_depth });
        }
        ready() {
            this.options.waitForProfile = !1,
            this.flush()
        }
        async send(e) {
            if (e.payload && (e.payload.profileId || this.profileId)) {
                e.payload.anonymousId = this.anonymousId;
                delete e.payload.profileId;
            }
            
            if (e.payload && e.payload.properties) {
                e.payload.properties.sessionId = this.sessionId;
            }
            
            return this.options.disabled || this.options.filter && !this.options.filter(e) ? Promise.resolve() : this.options.waitForProfile && !this.anonymousId ? (this.queue.push(e),
            Promise.resolve()) : this.api.fetch("/basket", e)
        }
        setGlobalProperties(e) {
            this.global = {
                ...this.global,
                ...e
            }
        }
        async track(e, t) {
            // Skip tracking if disabled globally
            if (this.options.disabled) return;
            
            const sessionData = {
                sessionId: this.sessionId,
                sessionStartTime: this.sessionStartTime,
            };
            
            if (e === 'screen_view' || e === 'page_view') {
                // Add performance metrics for page loads if enabled
                if (!this.isServer() && this.options.trackPerformance) {
                    // Collect performance timing metrics
                    const performanceData = this.collectNavigationTiming();
                    
                    // Add them to properties
                    Object.assign(t ?? {}, performanceData);
                    
                    // Add vitals if enabled
                    if (this.options.trackWebVitals) {
                        setTimeout(() => {
                            this.collectWebVitals(e);
                        }, 1000);
                    }
                }
            }
            
            return this.send({
                type: "track",
                payload: {
                    name: e,
                    anonymousId: this.anonymousId,
                    properties: {
                        ...this.global ?? {},
                        ...sessionData,
                        ...t ?? {}
                    }
                }
            })
        }
        async increment(e) {
            return this.send({
                type: "increment",
                payload: e
            })
        }
        async decrement(e) {
            return this.send({
                type: "decrement",
                payload: e
            })
        }
        clear() {
            this.anonymousId = this.generateAnonymousId();
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('did', this.anonymousId);
            }
            
            this.sessionId = this.generateSessionId();
            this.sessionStartTime = Date.now();
            this.lastActivityTime = this.sessionStartTime;
            
            if (!this.isServer()) {
                sessionStorage.setItem('did_session', this.sessionId);
                sessionStorage.setItem('did_session_start', this.sessionStartTime.toString());
            }
        }
        flush() {
            this.queue.forEach(e => {
                this.send({
                    ...e,
                    payload: {
                        ...e.payload,
                        anonymousId: this.anonymousId
                    }
                })
            }),
            this.queue = []
        }
        isServer() {
            return typeof document === "undefined" || typeof window === "undefined" || typeof localStorage === "undefined";
        }
        collectPerformanceData() {
            if (this.isServer() || !window.performance) return {};
            
            try {
                const perf = window.performance;
                const timing = perf.timing;
                
                if (!timing) return {};
                
                const navigationStart = timing.navigationStart;
                
                return {
                    loadTime: timing.loadEventEnd - navigationStart,
                    domReadyTime: timing.domContentLoadedEventEnd - navigationStart,
                    domInteractive: timing.domInteractive - navigationStart,
                    ttfb: timing.responseStart - timing.requestStart,
                    redirectTime: timing.redirectEnd - timing.redirectStart,
                    domainLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
                    connectTime: timing.connectEnd - timing.connectStart,
                    requestTime: timing.responseEnd - timing.requestStart,
                    renderTime: timing.domComplete - timing.domInteractive
                };
            } catch (e) {
                return {};
            }
        }
        collectNavigationTiming() {
            if (this.isServer() || !this.options.trackPerformance) return {};
            
            try {
                // Try to use the newer Navigation Timing API if available
                let perfData = {};
                
                if (window.performance && window.performance.getEntriesByType) {
                    const navEntry = window.performance.getEntriesByType('navigation')[0];
                    if (navEntry) {
                        perfData = {
                            load_time: Math.round(navEntry.loadEventEnd),
                            dom_ready_time: Math.round(navEntry.domContentLoadedEventEnd),
                            ttfb: Math.round(navEntry.responseStart),
                            request_time: Math.round(navEntry.responseEnd - navEntry.responseStart),
                            render_time: Math.round(navEntry.domComplete - navEntry.domInteractive)
                        };
                    }
                }
                
                // Fall back to the older timing API if needed
                if (Object.keys(perfData).length === 0 && window.performance && window.performance.timing) {
                    return this.collectPerformanceData();
                }
                
                return perfData;
            } catch (e) {
                return {};
            }
        }
        
        calculatePageSize() {
            try {
                if (window.performance && window.performance.getEntriesByType) {
                    const resources = window.performance.getEntriesByType('resource');
                    let totalSize = 0;
                    
                    // Transfer size for all resources
                    resources.forEach(resource => {
                        if (resource.transferSize) {
                            totalSize += resource.transferSize;
                        }
                    });
                    
                    // For the main document
                    const navEntry = window.performance.getEntriesByType('navigation')[0];
                    if (navEntry && navEntry.transferSize) {
                        totalSize += navEntry.transferSize;
                    }
                    
                    return Math.round(totalSize / 1024); // Convert to KB
                }
            } catch (e) {
                // Ignore errors
            }
            
            return 0;
        }
        
        collectWebVitals(eventName) {
            if (this.isServer() || !this.options.trackWebVitals || 
                typeof window.performance === 'undefined') {
                return;
            }
            
            try {
                // Get FCP (First Contentful Paint)
                const paintEntries = performance.getEntriesByType('paint');
                let fcpTime = null;
                
                for (const entry of paintEntries) {
                    if (entry.name === 'first-contentful-paint') {
                        fcpTime = Math.round(entry.startTime);
                        break;
                    }
                }
                
                // Get LCP (Largest Contentful Paint) if possible
                let lcpTime = null;
                if (PerformanceObserver.supportedEntryTypes && 
                    PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
                    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
                    if (lcpEntries && lcpEntries.length > 0) {
                        lcpTime = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
                    }
                }
                
                // Get CLS (Cumulative Layout Shift) if possible
                let cls = null;
                if (PerformanceObserver.supportedEntryTypes && 
                    PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
                    const layoutShifts = performance.getEntriesByType('layout-shift');
                    if (layoutShifts && layoutShifts.length > 0) {
                        cls = layoutShifts.reduce((sum, entry) => sum + entry.value, 0).toFixed(3);
                    }
                }
                
                // Get viewport and screen information
                const viewportInfo = {
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`
                };

                // Get timezone information
                const timezoneInfo = {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                };

                // Get connection information
                const connectionInfo = this.getConnectionInfo();

                // Get current page context
                const pageContext = {
                    __path: this.lastPath,
                    __title: document.title,
                    __referrer: this.global?.__referrer || document.referrer || 'direct'
                };
                
                // Send vitals if we have at least one metric
                if (fcpTime || lcpTime || cls !== null) {
                    this.track('web_vitals', {
                        __timestamp_ms: Date.now(),
                        fcp: fcpTime,
                        lcp: lcpTime,
                        cls: cls,
                        ...pageContext,
                        ...viewportInfo,
                        ...timezoneInfo,
                        ...connectionInfo,
                    });
                }
            } catch (e) {
                // Ignore errors
            }
        }

        getUtmParams() {
            if (typeof window === 'undefined') return {};
            
            const urlParams = new URLSearchParams(window.location.search);
            return {
                utm_source: urlParams.get('utm_source'),
                utm_medium: urlParams.get('utm_medium'),
                utm_campaign: urlParams.get('utm_campaign'),
                utm_term: urlParams.get('utm_term'),
                utm_content: urlParams.get('utm_content')
            };
        }

        setupExitTracking() {
            if (typeof window === 'undefined') return;

            window.addEventListener('scroll', () => {
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const currentScroll = window.scrollY;
                const scrollPercent = Math.round((currentScroll / scrollHeight) * 100);
                this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
            });

            const interactionEvents = ['click', 'keypress', 'mousemove', 'touchstart'];
            interactionEvents.forEach(event => {
                window.addEventListener(event, () => {
                    this.interactionCount++;
                }, { once: true });
            });

            window.addEventListener('mouseout', (e) => {
                if (e.clientY <= 0 && !this.hasExitIntent) {
                    this.hasExitIntent = true;
                }
            });

            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (link && link.href) {
                    try {
                        const linkUrl = new URL(link.href);
                        const isSameOrigin = linkUrl.origin === window.location.origin;
                        if (isSameOrigin) {
                            this.isInternalNavigation = true;
                        }
                    } catch (err) {
                        // Invalid URL, ignore
                    }
                }
            });

            window.addEventListener('popstate', () => {
                this.isInternalNavigation = true;
            });

            window.addEventListener('pushstate', () => {
                this.isInternalNavigation = true;
            });

            window.addEventListener('replacestate', () => {
                this.isInternalNavigation = true;
            });

            window.addEventListener('beforeunload', () => {
                if (!this.isInternalNavigation) {
                    this.trackExitData();
                }
                this.isInternalNavigation = false;
            });

            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden' && !this.isInternalNavigation) {
                    this.trackExitData();
                }
            });
        }

        trackExitData() {
            if (this.isServer()) return;
            
            const time_on_page = Math.round((Date.now() - this.pageEngagementStart) / 1000);
            const utm_params = this.getUtmParams();
            const exit_data = {
                time_on_page: time_on_page,
                scroll_depth: Math.round(this.maxScrollDepth),
                interaction_count: this.interactionCount,
                has_exit_intent: this.hasExitIntent,
                page_count: this.pageCount,
                is_bounce: this.pageCount <= 1 ? 1 : 0,
                utm_source: utm_params.utm_source || "",
                utm_medium: utm_params.utm_medium || "",
                utm_campaign: utm_params.utm_campaign || "",
                utm_term: utm_params.utm_term || "",
                utm_content: utm_params.utm_content || ""
            };
            
            super.track('page_exit', exit_data);
        }

        getConnectionInfo() {
            if (!navigator.connection) return {};

            return {
                connection_type: navigator.connection.effectiveType || navigator.connection.type || 'unknown'
            };
        }

        trackCustomEvent(eventName, properties = {}) {
            if (this.isServer()) return;
            
            // Get current page context
            const pageContext = {
                __path: window.location.href,
                __title: document.title,
                __referrer: this.global?.__referrer || document.referrer || 'direct'
            };

            // Get viewport and screen information
            const viewportInfo = {
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`
            };

            // Get timezone information
            const timezoneInfo = {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            };

            // Get connection information
            const connectionInfo = this.getConnectionInfo();

            // Track the custom event with all context
            super.track(eventName, {
                __timestamp_ms: Date.now(),
                ...properties,
                ...pageContext,
                ...viewportInfo,
                ...timezoneInfo,
                ...connectionInfo,
            });
        }
    }
    ;
    function h(a) {
        return a.replace(/([-_][a-z])/gi, e => e.toUpperCase().replace("-", "").replace("_", ""))
    }
    var d = class extends l {
        constructor(t) {
            super({
                sdk: "web",
                sdkVersion: "1.0.2",
                ...t
            });
            
            if (this.isServer()) return;
            
            // Set global properties without default referrer
            this.setGlobalProperties({
                __anonymized: true
            });
            
            // Set up screen view tracking if enabled
            if (this.options.trackScreenViews) {
                this.trackScreenViews();
                setTimeout(() => this.screenView(), 0);
            }
            
            // Set up other tracking capabilities if enabled
            if (this.options.trackOutgoingLinks) {
                this.trackOutgoingLinks();
            }
            
            if (this.options.trackAttributes) {
                this.trackAttributes();
            }
            
            // Initialize the tracker
            this.init();
        }
        debounce(t, r) {
            clearTimeout(this.debounceTimer),
            this.debounceTimer = setTimeout(t, r)
        }
        trackOutgoingLinks() {
            this.isServer() || document.addEventListener("click", t => {
                let r = t.target
                  , i = r.closest("a");
                if (i && r) {
                    let n = i.getAttribute("href");
                    n?.startsWith("http") && super.track("link_out", {
                        href: n,
                        text: i.innerText || i.getAttribute("title") || r.getAttribute("alt") || r.getAttribute("title")
                    })
                }
            })
        }
        trackScreenViews() {
            if (this.isServer()) return;
            
            let t = history.pushState;
            history.pushState = function(...s) {
                let o = t.apply(this, s);
                window.dispatchEvent(new Event("pushstate"));
                window.dispatchEvent(new Event("locationchange"));
                return o;
            };
            
            let r = history.replaceState;
            history.replaceState = function(...s) {
                let o = r.apply(this, s);
                window.dispatchEvent(new Event("replacestate"));
                window.dispatchEvent(new Event("locationchange"));
                return o;
            };
            
            window.addEventListener("popstate", () => {
                window.dispatchEvent(new Event("locationchange"));
            });
            
            this.pageEngagementStart = Date.now();
            
            let i = () => this.debounce(() => {
                const previous_path = this.lastPath || window.location.href;
                this.setGlobalProperties({
                    __referrer: previous_path
                });
                this.isInternalNavigation = true;
                this.screenView();
            }, 50);
            
            this.options.trackHashChanges ? window.addEventListener("hashchange", i) : window.addEventListener("locationchange", i);
        }
        trackAttributes() {
            this.isServer() || document.addEventListener("click", t => {
                let r = t.target
                  , i = r.closest("button")
                  , n = r.closest("a")
                  , s = i?.getAttribute("data-track") ? i : n?.getAttribute("data-track") ? n : null;
                if (s) {
                    let o = {};
                    for (let p of s.attributes)
                        p.name.startsWith("data-") && p.name !== "data-track" && (o[h(p.name.replace(/^data-/, ""))] = p.value);
                    let u = s.getAttribute("data-track");
                    u && super.track(u, o)
                }
            })
        }
        screenView(t, r) {
            if (this.isServer()) return;
            
            let i, n;
            
            if (this.lastPath && this.pageEngagementStart && this.options.trackEngagement) {
                const time_on_page = Math.round((Date.now() - this.pageEngagementStart) / 1000);
                const exit_data = {
                    __path: this.lastPath,
                    time_on_page: time_on_page,
                    scroll_depth: Math.round(this.maxScrollDepth),
                    interaction_count: this.interactionCount,
                    exit_intent: this.hasExitIntent,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language,
                    ...this.getConnectionInfo(),
                    ...this.getUtmParams()
                };
                
                this.maxScrollDepth = 0;
                this.interactionCount = 0;
                this.hasExitIntent = false;
            }
            
            this.pageEngagementStart = Date.now();
            
            typeof t == "string" ? (i = t, n = r) : (i = window.location.href, n = t);
            
            if (this.lastPath !== i) {
                this.lastPath = i;
                this.pageCount++;
                
                const utm_params = this.getUtmParams();
                const connection_info = this.getConnectionInfo();
                const viewport_info = {
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`
                };
                const timezone_info = {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                };
                const referrer_info = {
                    __referrer: this.global?.__referrer || document.referrer || 'direct'
                };

                super.track("screen_view", {
                    ...n ?? {},
                    __path: i,
                    __title: document.title,
                    __timestamp_ms: Date.now(),
                    page_count: this.pageCount,
                    ...utm_params,
                    ...connection_info,
                    ...viewport_info,
                    ...timezone_info,
                    ...referrer_info,
                });
            }
        }
    }
    ;
    (a => {
        if (a.db && "q"in a.db) {
            let e = a.db.q || []
              , t = new d(e.shift()[1]);
            e.forEach(r => {
                r[0]in t && t[r[0]](...r.slice(1))
            }
            ),
            a.db = (r, ...i) => {
                let n = t[r] ? t[r].bind(t) : void 0;
                typeof n == "function" ? n(...i) : console.warn(`Databuddy: ${r} is not a function`)
            }
            ,
            a.databuddy = t
        }
    }
    )(window);

    // Wrap everything in an IIFE to avoid globals
    (function() {
        // Auto-initialize the tracker
        function initializeDatabuddy() {
            // Don't run in Node environment
            if (typeof window === 'undefined') return;
            
            // Initialize databuddy with configuration from various sources
            function init() {
                // Check if a global configuration object exists
                const config = window.databuddyConfig || {};
                
                // Find the script tag
                const scripts = document.querySelectorAll('script');
                let scriptTag = null;
                
                for (let i = 0; i < scripts.length; i++) {
                    if (scripts[i].src && (
                        scripts[i].src.includes('/databuddy.js') || 
                        scripts[i].src.includes('/api/tracking')
                    )) {
                        scriptTag = scripts[i];
                        break;
                    }
                }
                
                if (!scriptTag) {
                    console.error('Databuddy: Could not find tracking script');
                    return;
                }
                
                // Get client ID from various sources (in order of precedence):
                // 1. data-client-id attribute
                // 2. URL parameter
                // 3. Global config
                let clientId = null;
                
                // Check for data attribute
                if (scriptTag.hasAttribute('data-client-id')) {
                    clientId = scriptTag.getAttribute('data-client-id');
                }
                
                // If not found, check URL params
                if (!clientId) {
                    const srcParts = scriptTag.src.split('?');
                    const urlParams = new URLSearchParams(srcParts.length > 1 ? srcParts[1] : '');
                    clientId = urlParams.get('id');
                }
                
                // If still not found, check global config
                if (!clientId) {
                    clientId = config.clientId;
                }
                
                if (!clientId) {
                    console.error('Databuddy: Missing client ID');
                    return;
                }
                
                // Get all data attributes from script tag
                const dataAttributes = {};
                if (scriptTag.dataset) {
                    Object.keys(scriptTag.dataset).forEach(key => {
                        // Convert camelCase to proper config case
                        const configKey = key.replace(/[A-Z]/g, letter => letter.toLowerCase());
                        
                        // Convert string values to proper types
                        let value = scriptTag.dataset[key];
                        if (value === 'true') value = true;
                        if (value === 'false') value = false;
                        if (!isNaN(value) && value !== '') value = Number(value);
                        
                        dataAttributes[configKey] = value;
                    });
                }
                
                // Merge configuration from all sources (in order of precedence)
                const mergedConfig = {
                    ...config,                // Global config (lowest precedence)
                    ...dataAttributes,        // Data attributes (higher precedence)
                    clientId                  // Client ID (highest precedence)
                };
                
                // Initialize the tracker with the merged configuration
                window.databuddy = new d(mergedConfig);
            }
            
            // Initialize on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        }
        
        // Auto-initialize the library if we're in a browser
        if (typeof window !== 'undefined') {
            initializeDatabuddy();
        }
        
        // Export library for module use cases
        if (typeof window !== 'undefined') {
            window.Databuddy = d;
        } else if (typeof exports === 'object') {
            module.exports = d;
        }
    })();
}
)();
