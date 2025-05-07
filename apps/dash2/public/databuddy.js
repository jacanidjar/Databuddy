(() => {
    const c = class {
        constructor(config) {
            this.baseUrl = config.baseUrl;
            this.headers = {
                "Content-Type": "application/json",
                ...config.defaultHeaders
            };
            this.maxRetries = config.maxRetries ?? 3;
            this.initialRetryDelay = config.initialRetryDelay ?? 500;
        }
        async resolveHeaders() {
            const headerEntries = Object.entries(this.headers);
            const resolvedEntries = await Promise.all(
                headerEntries.map(async ([key, value]) => {
                    const resolvedValue = await value;
                    return resolvedValue !== null ? [key, resolvedValue] : null;
                })
            );
            return Object.fromEntries(resolvedEntries.filter(Boolean));
        }
        addHeader(key, value) {
            this.headers[key] = value;
        }
        async post(url, data, options = {}, retryCount = 0) {
            try {
                const fetchOptions = {
                    method: "POST",
                    headers: await this.resolveHeaders(),
                    body: JSON.stringify(data ?? {}),
                    keepalive: true,
                    ...options
                };
                const response = await fetch(url, fetchOptions);
                if (response.status === 401) {
                    return null;
                }
                if (response.status !== 200 && response.status !== 202) {
                    throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
                }
                try {
                    return await response.json();
                } catch (e) {
                    const text = await response.text();
                    return text ? JSON.parse(text) : null;
                }
            } catch (error) {
                const isRetryableError = error.message.includes('HTTP error') || 
                    error.name === 'TypeError' || 
                    error.name === 'NetworkError';
                if (retryCount < this.maxRetries && isRetryableError) {
                    const jitter = Math.random() * 0.3 + 0.85;
                    const delay = this.initialRetryDelay * (2 ** retryCount) * jitter;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.post(url, data, options, retryCount + 1);
                }
                return null;
            }
        }
        async fetch(endpoint, data, options = {}) {
            const url = `${this.baseUrl}${endpoint}`;
            return this.post(url, data, options, 0);
        }
    };
    const l = class {
        constructor(options) {
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
                samplingRate: 1.0,
                enableRetries: true,
                maxRetries: 3,
                initialRetryDelay: 500,
                enableBatching: false,
                batchSize: 10,
                batchTimeout: 2000,
                ...options
            };
            this.queue = [];
            this.batchQueue = [];
            this.batchTimer = null;
            const headers = {
                "databuddy-client-id": this.options.clientId
            };
            if (this.options.clientSecret) {
                headers["databuddy-client-secret"] = this.options.clientSecret;
            }
            headers["databuddy-sdk-name"] = this.options.sdk || "web";
            headers["databuddy-sdk-version"] = this.options.sdkVersion || "1.0.0";
            this.api = new c({
                baseUrl: this.options.apiUrl || "https://api.databuddy.cc",
                defaultHeaders: headers,
                maxRetries: this.options.enableRetries ? (this.options.maxRetries || 3) : 0,
                initialRetryDelay: this.options.initialRetryDelay || 500
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
            this.pageEngagementStart = Date.now();
            this.utmParams = this.getUtmParams();
            this.isTemporarilyHidden = false;
            this.visibilityChangeTimer = null;
            if (typeof window !== 'undefined') {
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
            return `anon_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
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
            return `sess_${this.anonymousId.substring(5, 10)}_${Date.now().toString(36)}`;
        }
        getSessionStartTime() {
            if (this.isServer()) {
                return Date.now();
            }
            const storedTime = sessionStorage.getItem('did_session_start');
            if (storedTime) {
                return Number.parseInt(storedTime, 10);
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
                for (const eventType of ['mousedown', 'keydown', 'scroll', 'touchstart']) {
                    window.addEventListener(eventType, () => {
                        this.lastActivityTime = Date.now();
                        if (this.options.trackInteractions) {
                            this.interactionCount++;
                        }
                    }, { passive: true });
                }
            } else {
                this.anonymousId = this.getOrCreateAnonymousId();
            }
            if (this.options.trackEngagement) {
                this.maxScrollDepth = 0;
                this.interactionCount = 0;
                this.hasExitIntent = false;
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
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            const scrollPercent = Math.round((currentScroll / scrollHeight) * 100);
            this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
        }
        ready() {
            this.options.waitForProfile = false;
            this.flush();
        }
        prepareEventData(event) {
            if (event.payload) {
                if (event.payload.profileId || this.profileId) {
                    event.payload.anonymousId = this.anonymousId;
                    event.payload.profileId = undefined;
                }
                if (event.payload.properties) {
                    event.payload.properties.sessionId = this.sessionId;
                }
            }
            return event;
        }
        async send(event) {
            const pEvent = this.prepareEventData(event);
            if (this.options.disabled || (this.options.filter && !this.options.filter(pEvent))) {
                return Promise.resolve();
            }
            if (this.options.waitForProfile && !this.anonymousId) {
                this.queue.push(pEvent);
                return Promise.resolve();
            }
            if (this.options.enableBatching && !event.isForceSend) {
                return this.addToBatch(pEvent);
            }
            const fetchOptions = {
                keepalive: true,
                credentials: 'omit'
            };
            return this.api.fetch("/basket", pEvent, fetchOptions);
        }
        addToBatch(event) {
            this.batchQueue.push(event);
            const eventName = event.payload.name || event.type;
            if (this.batchTimer === null) {
                this.batchTimer = setTimeout(() => this.flushBatch(), this.options.batchTimeout);
            }
            if (this.batchQueue.length >= this.options.batchSize) {
                this.flushBatch();
            }
            return Promise.resolve();
        }
        async flushBatch() {
            if (this.batchTimer) {
                clearTimeout(this.batchTimer);
                this.batchTimer = null;
            }
            if (this.batchQueue.length === 0) {
                return;
            }
            const batchEvents = [...this.batchQueue];
            this.batchQueue = [];
            try {
                const fetchOptions = {
                    keepalive: true,
                    credentials: 'omit'
                };
                const beaconResult = await this.sendBatchBeacon(batchEvents);
                if (beaconResult) {
                    return beaconResult;
                }
                const result = await this.api.fetch("/basket/batch", batchEvents, fetchOptions);
                return result;
            } catch (error) {
                const isNetworkError = !error.status && error.name === 'TypeError';
                if (isNetworkError) {
                    for (const event of batchEvents) {
                        event.isForceSend = true;
                        this.send(event);
                    }
                }
                return null;
            }
        }
        async sendBatchBeacon(events) {
            if (this.isServer() || !navigator.sendBeacon) return null;
            try {
                const baseUrl = this.api.baseUrl;
                const clientId = this.options.clientId;
                const sdkName = this.options.sdk || "web";
                const sdkVersion = this.options.sdkVersion || "1.0.0";
                const url = `${baseUrl}/basket/batch?client_id=${encodeURIComponent(clientId)}&sdk_name=${encodeURIComponent(sdkName)}&sdk_version=${encodeURIComponent(sdkVersion)}`;
                const data = JSON.stringify(events);
                const blob = new Blob([data], { type: 'application/json' });
                const success = navigator.sendBeacon(url, blob);
                if (success) {
                    return { success: true };
                }
            } catch (e) {}
            return null;
        }
        setGlobalProperties(props) {
            this.global = {
                ...this.global,
                ...props
            };
        }
        async track(eventName, properties) {
            if (this.options.disabled) return;
            if (this.options.samplingRate < 1.0) {
                const samplingValue = Math.random();
                if (samplingValue > this.options.samplingRate) {
                    return { sampled: false };
                }
            }
            const sessionData = {
                sessionId: this.sessionId,
                sessionStartTime: this.sessionStartTime,
            };
            if (eventName === 'screen_view' || eventName === 'page_view') {
                if (!this.isServer() && this.options.trackPerformance) {
                    const performanceData = this.collectNavigationTiming();
                    Object.assign(properties ?? {}, performanceData);
                    if (this.options.trackWebVitals) {
                        setTimeout(() => {
                            this.collectWebVitals(eventName);
                        }, 1000);
                    }
                }
            }
            const payload = {
                type: "track",
                payload: {
                    name: eventName,
                    anonymousId: this.anonymousId,
                    properties: {
                        ...this.global ?? {},
                        ...sessionData,
                        ...properties ?? {}
                    }
                }
            };
            if (this.options.enableBatching) {
                return this.send(payload);
            }
            try {
                const beaconResult = await this.sendBeacon(payload);
                if (beaconResult) {
                    return beaconResult;
                }
            } catch (e) {}
            return this.send(payload);
        }
        async sendBeacon(event) {
            if (this.isServer()) return null;
            try {
                const pEvent = this.prepareEventData(event);
                if (this.options.disabled || (this.options.filter && !this.options.filter(pEvent))) {
                    return null;
                }
                const baseUrl = this.api.baseUrl;
                const clientId = this.options.clientId;
                const sdkName = this.options.sdk || "web";
                const sdkVersion = this.options.sdkVersion || "1.0.0";
                const url = `${baseUrl}/basket?client_id=${encodeURIComponent(clientId)}&sdk_name=${encodeURIComponent(sdkName)}&sdk_version=${encodeURIComponent(sdkVersion)}`;
                const data = JSON.stringify(pEvent);
                if (navigator.sendBeacon) {
                    try {
                        const blob = new Blob([data], { type: 'application/json' });
                        const success = navigator.sendBeacon(url, blob);
                        if (success) {
                            return { success: true };
                        }
                    } catch (e) {}
                }
                return null;
            } catch (error) {
                return null;
            }
        }
        async increment(data) {
            return this.send({
                type: "increment",
                payload: data
            });
        }
        async decrement(data) {
            return this.send({
                type: "decrement",
                payload: data
            });
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
            for (const event of this.queue) {
                this.send({
                    ...event,
                    payload: {
                        ...event.payload,
                        anonymousId: this.anonymousId
                    }
                });
            }
            this.queue = [];
            if (this.options.enableBatching) {
                this.flushBatch();
            }
        }
        isServer() {
            return typeof document === "undefined" || typeof window === "undefined" || typeof localStorage === "undefined";
        }
        collectNavigationTiming() {
            if (this.isServer() || !this.options.trackPerformance) return {};
            try {
                if (window.performance?.getEntriesByType) {
                    const navEntries = window.performance.getEntriesByType('navigation');
                    if (navEntries && navEntries.length > 0) {
                        const navEntry = navEntries[0];
                        return {
                            load_time: Math.round(navEntry.loadEventEnd),
                            dom_ready_time: Math.round(navEntry.domContentLoadedEventEnd),
                            ttfb: Math.round(navEntry.responseStart),
                            request_time: Math.round(navEntry.responseEnd - navEntry.responseStart),
                            render_time: Math.round(navEntry.domComplete - navEntry.domInteractive)
                        };
                    }
                }
                if (window.performance?.timing) {
                    const timing = window.performance.timing;
                    const navigationStart = timing.navigationStart;
                    return {
                        load_time: timing.loadEventEnd - navigationStart,
                        dom_ready_time: timing.domContentLoadedEventEnd - navigationStart,
                        dom_interactive: timing.domInteractive - navigationStart,
                        ttfb: timing.responseStart - timing.requestStart,
                        request_time: timing.responseEnd - timing.requestStart,
                        render_time: timing.domComplete - timing.domInteractive
                    };
                }
                return {};
            } catch (e) {
                return {};
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
            }, { passive: true });
            const interactionEvents = ['click', 'keypress', 'mousemove', 'touchstart'];
            for (const event of interactionEvents) {
                window.addEventListener(event, () => this.interactionCount++, { once: true });
            }
            window.addEventListener('mouseout', (e) => {
                if (e.clientY <= 0) this.hasExitIntent = true;
            });
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (link?.href) {
                    try {   
                        const linkUrl = new URL(link.href);
                        if (linkUrl.origin === window.location.origin) this.isInternalNavigation = true;
                    } catch (err) {}
                }
            });
            for (const event of ['popstate', 'pushstate', 'replacestate']) {
                window.addEventListener(event, () => {
                    this.isInternalNavigation = true;
                });
            }
            const exitHandler = (event) => {
                if (this.options.enableBatching) this.flushBatch();
                if (!this.isInternalNavigation && !this.isTemporarilyHidden) {
                    this.trackExitData();
                }
                this.isInternalNavigation = false;
            };
            window.addEventListener('pagehide', () => {
                this.isTemporarilyHidden = false;
                exitHandler();
            });
            window.addEventListener('beforeunload', () => {
                this.isTemporarilyHidden = false;
                exitHandler();
            });
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.isTemporarilyHidden = true;
                    if (this.visibilityChangeTimer) {
                        clearTimeout(this.visibilityChangeTimer);
                    }
                    if (this.options.enableBatching) {
                        this.flushBatch();
                    }
                } else if (document.visibilityState === 'visible') {
                    this.isTemporarilyHidden = false;
                    if (this.visibilityChangeTimer) {
                        clearTimeout(this.visibilityChangeTimer);
                        this.visibilityChangeTimer = null;
                    }
                }
            });
        }
        trackExitData() {
            if (this.isServer()) return;
            const exitData = {
                time_on_page: Math.round((Date.now() - this.pageEngagementStart) / 1000),
                scroll_depth: Math.round(this.maxScrollDepth),
                interaction_count: this.interactionCount,
                has_exit_intent: this.hasExitIntent,
                page_count: this.pageCount,
                is_bounce: this.pageCount <= 1 ? 1 : 0,
                __path: window.location.href,
                __title: document.title,
                __timestamp_ms: Date.now(),
                ...this.getUtmParams()
            };
            const exitEvent = {
                type: "track",
                payload: {
                    name: "page_exit",
                    anonymousId: this.anonymousId,
                    properties: {
                        ...this.global ?? {},
                        sessionId: this.sessionId,
                        sessionStartTime: this.sessionStartTime,
                        ...exitData
                    }
                },
                priority: "high"
            };
            if (this.options.enableBatching) {
                if (this.batchQueue.length === 0) {
                    this.sendExitEventImmediately(exitEvent);
                } else {
                    this.batchQueue.unshift(exitEvent);
                    this.flushBatch();
                }
            } else {
                this.sendExitEventImmediately(exitEvent);
            }
        }
        async sendExitEventImmediately(exitEvent) {
            try {
                const beaconResult = await this.sendBeacon(exitEvent);
                if (beaconResult) return beaconResult;
                return this.api.fetch("/basket", exitEvent, {
                    keepalive: true,
                    credentials: 'omit'
                });
            } catch (e) {
                return null;
            }
        }
        collectWebVitals(eventName) {
            if (this.isServer() || !this.options.trackWebVitals || 
                typeof window.performance === 'undefined') {
                return;
            }
            try {
                const paintEntries = performance.getEntriesByType('paint');
                let fcpTime = null;
                for (const entry of paintEntries) {
                    if (entry.name === 'first-contentful-paint') {
                        fcpTime = Math.round(entry.startTime);
                        break;
                    }
                }
                let lcpTime = null;
                if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
                    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
                    if (lcpEntries && lcpEntries.length > 0) {
                        lcpTime = Math.round(lcpEntries[lcpEntries.length - 1].startTime);
                    }
                }
                let cls = null;
                if (PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
                    const layoutShifts = performance.getEntriesByType('layout-shift');
                    if (layoutShifts && layoutShifts.length > 0) {
                        cls = layoutShifts.reduce((sum, entry) => sum + entry.value, 0).toFixed(3);
                    }
                }
                const viewportInfo = {
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`
                };
                const timezoneInfo = {
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language
                };
                const connectionInfo = this.getConnectionInfo();
                const pageContext = {
                    __path: this.lastPath,
                    __title: document.title,
                    __referrer: this.global?.__referrer || document.referrer || 'direct'
                };
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
            } catch (e) {}
        }
        getConnectionInfo() {
            if (!navigator.connection) return {};
            return {
                connection_type: navigator.connection.effectiveType || navigator.connection.type || 'unknown'
            };
        }
        trackCustomEvent(eventName, properties = {}) {
            if (this.isServer()) return;
            const pageContext = {
                __path: window.location.href,
                __title: document.title,
                __referrer: this.global?.__referrer || document.referrer || 'direct'
            };
            const viewportInfo = {
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`
            };
            const timezoneInfo = {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            };
            const connectionInfo = this.getConnectionInfo();
            this.track(eventName, {
                __timestamp_ms: Date.now(),
                ...properties,
                ...pageContext,
                ...viewportInfo,
                ...timezoneInfo,
                ...connectionInfo,
            });
        }
    };
    function h(a) {
        return a.replace(/([-_][a-z])/gi, e => e.toUpperCase().replace("-", "").replace("_", ""))
    }
    const d = class extends l {
        constructor(t) {
            super({
                sdk: "web",
                sdkVersion: "1.0.2",
                ...t
            });
            if (this.isServer()) return;
            this.setGlobalProperties({
                __anonymized: t.anonymized !== false
            });
            if (this.options.trackScreenViews) {
                this.trackScreenViews();
                setTimeout(() => this.screenView(), 0);
            }
            if (this.options.trackOutgoingLinks) {
                this.trackOutgoingLinks();
            }
            if (this.options.trackAttributes) {
                this.trackAttributes();
            }
            this.init();
        }
        debounce(t, r) {
            clearTimeout(this.debounceTimer)
            this.debounceTimer = setTimeout(t, r)
        }
        trackOutgoingLinks() {
            this.isServer() || document.addEventListener("click", t => {
                const r = t.target;
                const i = r.closest("a"); 
                if (i && r) {
                    const n = i.getAttribute("href");
                    if (n) {
                        try {
                            const url = new URL(n, window.location.origin);
                            const isOutgoing = url.origin !== window.location.origin;
                            if (isOutgoing) {
                                this.track("link_out", {
                                    href: n,
                                    text: i.innerText || i.getAttribute("title") || r.getAttribute("alt") || r.getAttribute("title")
                                });
                            }
                        } catch (e) {}
                    }
                }
            })
        }
        trackScreenViews() {
            if (this.isServer()) return;
            const t = history.pushState;
            history.pushState = function(...s) {
                const o = t.apply(this, s);
                window.dispatchEvent(new Event("pushstate"));
                window.dispatchEvent(new Event("locationchange"));
                return o;
            };
            const r = history.replaceState;
            history.replaceState = function(...s) {
                const o = r.apply(this, s);
                window.dispatchEvent(new Event("replacestate"));
                window.dispatchEvent(new Event("locationchange"));
                return o;
            };
            window.addEventListener("popstate", () => {
                window.dispatchEvent(new Event("locationchange"));
            });
            this.pageEngagementStart = Date.now();
            const i = () => this.debounce(() => {
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
                const r = t.target;
                const i = r.closest("button");
                const n = r.closest("a");
                const s = i?.getAttribute("data-track") ? i : n?.getAttribute("data-track") ? n : null;
                if (s) {
                    const o = {};
                    for (const p of s.attributes) {
                        if (p.name.startsWith("data-") && p.name !== "data-track") {
                            o[h(p.name.replace(/^data-/, ""))] = p.value;
                        }
                    }
                    const u = s.getAttribute("data-track");
                    if (u) {
                        this.track(u, o);
                    }
                }
            });
        }
        screenView(t, r) {
            if (this.isServer()) return;
            let i;
            let n;
            if (this.lastPath && this.pageEngagementStart && this.options.trackEngagement) {
                const time_on_page = Math.round((Date.now() - this.pageEngagementStart) / 1000);
                const previousPageData = {
                    previous_path: this.lastPath,
                    previous_time_on_page: time_on_page,
                    previous_scroll_depth: Math.round(this.maxScrollDepth),
                    previous_interaction_count: this.interactionCount
                };
                this.maxScrollDepth = 0;
                this.interactionCount = 0;
                this.hasExitIntent = false;
            }
            this.pageEngagementStart = Date.now();
            if (typeof t === "string") {
                i = t;
                n = r;
            } else {
                i = window.location.href;
                n = t;
            }
            if (this.lastPath !== i) {
                this.lastPath = i;
                this.pageCount++;
                const pageData = {
                    ...n ?? {},
                    __path: i,
                    __title: document.title,
                    __timestamp_ms: Date.now(),
                    page_count: this.pageCount,
                    ...this.getUtmParams(),
                    ...this.getConnectionInfo(),
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language,
                    __referrer: this.global?.__referrer || document.referrer || 'direct'
                };
                this.track("screen_view", pageData);
            }
        }
    };
    function initializeDatabuddy() {
        if (typeof window === 'undefined') return;
        const currentScript = document.currentScript || (() => {
            const scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
        function getConfig() {
            const globalConfig = window.databuddyConfig || {};
            if (!currentScript) {
                return globalConfig;
            }
            const dataAttributes = {};
            for (const attr of currentScript.attributes) {
                if (attr.name.startsWith('data-')) {
                    const key = attr.name.substring(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
                    let value = attr.value;
                    if (value === 'true') value = true;
                    if (value === 'false') value = false;
                    if (!Number.isNaN(value) && value !== '') value = Number(value);
                    dataAttributes[key] = value;
                }
            }
            const urlParams = {};
            try {
                const srcUrl = new URL(currentScript.src);
                const params = new URLSearchParams(srcUrl.search);
                params.forEach((value, key) => {
                    let processedValue = value;
                    if (processedValue === 'true') processedValue = true;
                    if (processedValue === 'false') processedValue = false;
                    if (!Number.isNaN(processedValue) && processedValue !== '') {
                        processedValue = Number(processedValue);
                    }
                    urlParams[key] = processedValue;
                });
            } catch (e) {}
            const config = {
                ...globalConfig,
                ...urlParams,
                ...dataAttributes
            };
            if (config.samplingRate !== undefined) {
                if (config.samplingRate < 0) config.samplingRate = 0;
                if (config.samplingRate > 1) config.samplingRate = 1;
            }
            if (config.maxRetries !== undefined && config.maxRetries < 0) {
                config.maxRetries = 0;
            }
            if (config.initialRetryDelay !== undefined) {
                if (config.initialRetryDelay < 50) config.initialRetryDelay = 50;
                if (config.initialRetryDelay > 10000) config.initialRetryDelay = 10000;
            }
            if (config.batchSize !== undefined) {
                if (config.batchSize < 1) config.batchSize = 1;
                if (config.batchSize > 50) config.batchSize = 50;
            }
            if (config.batchTimeout !== undefined) {
                if (config.batchTimeout < 100) config.batchTimeout = 100;
                if (config.batchTimeout > 30000) config.batchTimeout = 30000;
            }
            return config;
        }
        function getClientId(config) {
            if (config.clientId) {
                return config.clientId;
            }
            if (currentScript?.getAttribute('data-client-id')) {
                return currentScript.getAttribute('data-client-id');
            }
            console.error('Databuddy: Missing client ID');
            return null;
        }
        function init() {
            const config = getConfig();
            const clientId = getClientId(config);
            if (!clientId) return;
            window.databuddy = new d({
                ...config,
                clientId
            });
            window.db = (method, ...args) => {
                if (window.databuddy && typeof window.databuddy[method] === 'function') {
                    return window.databuddy[method](...args);
                }
            };
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    initializeDatabuddy();
    if (typeof window !== 'undefined') {
        window.Databuddy = d;
    } else if (typeof exports === 'object') {
        module.exports = d;
    }
    let visibilityChangeTimeout;
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && window.databuddy) {
            if (visibilityChangeTimeout) {
                clearTimeout(visibilityChangeTimeout);
            }
            visibilityChangeTimeout = setTimeout(() => {
                if (document.visibilityState === 'hidden') {
                    if (window.databuddy.options.enableBatching) {
                        window.databuddy.flushBatch();
                    }
                }
            }, 1000);
            if (window.databuddy) {
                window.databuddy.isTemporarilyHidden = true;
            }
        } else if (document.visibilityState === 'visible' && window.databuddy) {
            if (visibilityChangeTimeout) {
                clearTimeout(visibilityChangeTimeout);
                visibilityChangeTimeout = null;
            }
            if (window.databuddy) {
                window.databuddy.isTemporarilyHidden = false;
            }
        }
    });
    window.addEventListener('pagehide', () => {
        if (window.databuddy) {
            if (visibilityChangeTimeout) {
                clearTimeout(visibilityChangeTimeout);
            }
            if (window.databuddy.options.enableBatching) {
                window.databuddy.flushBatch();
            }
            if (window.databuddy) {
                window.databuddy.isTemporarilyHidden = false;
            }
        }
    });
    window.addEventListener('beforeunload', () => {
        if (window.databuddy) {
            if (visibilityChangeTimeout) {
                clearTimeout(visibilityChangeTimeout);
            }
            if (window.databuddy.options.enableBatching) {
                window.databuddy.flushBatch();
            }
            if (window.databuddy) {
                window.databuddy.isTemporarilyHidden = false;
            }
        }
    });
})();
