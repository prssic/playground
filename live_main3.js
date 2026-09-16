// Base URL for GitHub Pages compatibility
var baseUrl = document.documentElement.dataset.baseurl || '';

/* ==========================================================================
           JS: MODAL CONTACT PERSOANĂ (Decan / Prodecani)
           Date preluate manual de pe chimie.upb.ro/administratie/conducerea-facultatii
           (nume, titlu, e-mail, telefon, birou, departament, pagină personală, poză).
           ========================================================================== */
        const contactData = window.siteData.contacts;

        (function () {
            const overlay = document.getElementById('contactOverlay');
            const card = overlay ? overlay.querySelector('.contact-card') : null;
            const closeBtn = document.getElementById('contactCloseBtn');
            const photoEl = document.getElementById('contactPhoto');
            const roleEl = document.getElementById('contactRole');
            const nameEl = document.getElementById('contactName');
            const titleEl = document.getElementById('contactTitle');
            const linesEl = document.getElementById('contactLines');
            const personalLink = document.getElementById('contactPersonalLink');
            const scrollHint = document.getElementById('contactScrollHint');
            if (!overlay) return;

            function refreshScrollHint() {
                if (!scrollHint || !card) return;
                const canScroll = card.scrollHeight > card.clientHeight + 8;
                const nearBottom = card.scrollTop + card.clientHeight >= card.scrollHeight - 12;
                scrollHint.classList.toggle('visible', canScroll && card.scrollTop < 24 && !nearBottom);
            }
            if (card) {
                card.addEventListener('scroll', refreshScrollHint);
                window.addEventListener('resize', refreshScrollHint);
            }

            let lastFocused = null;

            window.openContact = function (id) {
                const p = contactData[id];
                if (!p) return;
                if (typeof haptic === 'function') haptic(10);

                photoEl.innerHTML = `<img src="${p.photo}" alt="${p.name}" loading="lazy" decoding="async">`;
                roleEl.textContent = p.role;
                nameEl.textContent = p.name;
                titleEl.textContent = p.title;
                linesEl.innerHTML = `
                    <a href="mailto:${p.email}" class="hover-target"><i data-lucide="mail"></i> ${p.email}</a>
                    <a href="tel:${p.phone.replace(/\s+/g, '')}" class="hover-target"><i data-lucide="phone"></i> ${p.phone}</a>
                    <span><i data-lucide="map-pin"></i> ${p.office}</span>
                    <span><i data-lucide="landmark"></i> ${p.dept}</span>
                `;
                if (window.lucide) lucide.createIcons({ root: linesEl });
                personalLink.href = p.personalUrl;

                lastFocused = document.activeElement;
                overlay.classList.add('open');
                overlay.setAttribute('aria-hidden', 'false');
                if (card) card.scrollTop = 0;
                setTimeout(() => closeBtn.focus(), 50);
                requestAnimationFrame(refreshScrollHint);
                setTimeout(refreshScrollHint, 350);
            };

            function closeContact() {
                overlay.classList.remove('open');
                overlay.setAttribute('aria-hidden', 'true');
                if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
            }
            window.closeContact = closeContact;

            closeBtn.addEventListener('click', closeContact);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeContact(); });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && overlay.classList.contains('open')) closeContact();
            });
        })();

(function () {
            const notice = document.getElementById('cookieNotice');
            const btn = document.getElementById('cookieNoticeBtn');
            if (!notice || !btn) return;

            let alreadyShown = false;
            try { alreadyShown = sessionStorage.getItem('ssicCookieNoticeShown') === '1'; } catch (e) { /* ignorăm */ }
            if (alreadyShown) return;

            setTimeout(() => {
                notice.classList.add('is-visible');
                try { sessionStorage.setItem('ssicCookieNoticeShown', '1'); } catch (e) { /* ignorăm */ }
            }, 900);
            btn.addEventListener('click', () => {
                notice.classList.remove('is-visible');
                setTimeout(() => { notice.style.display = 'none'; }, 500);
            });
        })();

/* ==========================================================================
           JS: Widget Accesibilitate — stare persistentă (localStorage), aplicată pe
           <html> prin clase/atribute (vezi CSS-ul de mai sus), plus lupă + narator.
           ========================================================================== */
        (function () {
            const STORAGE_KEY = 'ssicA11yPrefs';
            const defaults = {
                contrast: false, underline: false, cursorVisible: false,
                reduceMotion: false, dyslexia: false, textStep: 0
            };
            let prefs = Object.assign({}, defaults);
            try {
                const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                prefs = Object.assign({}, defaults, saved);
            } catch (e) { /* localStorage indisponibil sau date corupte — pornim din default */ }

            function save() {
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { /* ignorăm */ }
            }

            const html = document.documentElement;
            const root = document.getElementById('a11yOverlay');
            if (!root) return; // panoul lipsește din pagina asta — nimic de făcut

            const triggerBtns = () => document.querySelectorAll('#a11yTriggerBtn');
            const closeBtn = document.getElementById('a11yCloseBtn');
            const resetBtn = document.getElementById('a11yResetBtn');

            const sw = {
                contrast: document.getElementById('a11ySwitchContrast'),
                cursorVisible: document.getElementById('a11ySwitchCursor'),
                reduceMotion: document.getElementById('a11ySwitchMotion'),
                underline: document.getElementById('a11ySwitchUnderline'),
                dyslexia: document.getElementById('a11ySwitchDyslexia'),
                narrator: document.getElementById('a11ySwitchNarrator')
            };
            const textDown = document.getElementById('a11yTextDown');
            const textUp = document.getElementById('a11yTextUp');
            const textDots = document.getElementById('a11yTextDots') ? document.getElementById('a11yTextDots').children : [];

            function setSwitch(btn, on) {
                if (!btn) return;
                btn.classList.toggle('is-on', !!on);
                btn.setAttribute('aria-checked', on ? 'true' : 'false');
            }

            function applyAll() {
                html.classList.toggle('a11y-contrast', prefs.contrast);
                html.classList.toggle('a11y-underline', prefs.underline);
                html.classList.toggle('a11y-cursor-visible', prefs.cursorVisible);
                html.classList.toggle('a11y-reduce-motion', prefs.reduceMotion);
                html.classList.toggle('a11y-dyslexia', prefs.dyslexia);
                html.setAttribute('data-a11y-text', String(prefs.textStep));

                setSwitch(sw.contrast, prefs.contrast);
                setSwitch(sw.cursorVisible, prefs.cursorVisible);
                setSwitch(sw.reduceMotion, prefs.reduceMotion);
                setSwitch(sw.underline, prefs.underline);
                setSwitch(sw.dyslexia, prefs.dyslexia);

                for (let i = 0; i < textDots.length; i++) {
                    textDots[i].classList.toggle('is-filled', i <= prefs.textStep);
                }
                if (textDown) textDown.disabled = prefs.textStep <= 0;
                if (textUp) textUp.disabled = prefs.textStep >= 2;

                triggerBtns().forEach(b => b.classList.toggle('is-active',
                    prefs.contrast || prefs.underline || prefs.cursorVisible || prefs.reduceMotion || prefs.dyslexia || prefs.textStep > 0));
            }

            function toggle(key, btn) {
                prefs[key] = !prefs[key];
                save();
                applyAll();
                if (key === 'narrator') { /* gestionat separat mai jos */ }
            }

            if (sw.contrast) sw.contrast.addEventListener('click', () => toggle('contrast'));
            if (sw.cursorVisible) sw.cursorVisible.addEventListener('click', () => toggle('cursorVisible'));
            if (sw.reduceMotion) sw.reduceMotion.addEventListener('click', () => toggle('reduceMotion'));
            if (sw.underline) sw.underline.addEventListener('click', () => toggle('underline'));
            if (sw.dyslexia) sw.dyslexia.addEventListener('click', () => toggle('dyslexia'));

            if (textDown) textDown.addEventListener('click', () => {
                if (prefs.textStep > 0) { prefs.textStep--; save(); applyAll(); }
            });
            if (textUp) textUp.addEventListener('click', () => {
                if (prefs.textStep < 2) { prefs.textStep++; save(); applyAll(); }
            });

            /* ---------- Deschidere / închidere panou ---------- */
            function openPanel() {
                root.classList.add('open');
                triggerBtns().forEach(b => b.setAttribute('aria-expanded', 'true'));
                document.addEventListener('keydown', onKeydown);
                setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 50);
            }
            function closePanel() {
                root.classList.remove('open');
                triggerBtns().forEach(b => b.setAttribute('aria-expanded', 'false'));
                document.removeEventListener('keydown', onKeydown);
            }
            function onKeydown(e) { if (e.key === 'Escape') closePanel(); }

            document.addEventListener('click', (e) => {
                if (e.target.closest && e.target.closest('#a11yTriggerBtn')) openPanel();
            });
            if (closeBtn) closeBtn.addEventListener('click', closePanel);
            root.addEventListener('click', (e) => { if (e.target === root) closePanel(); });

            if (resetBtn) resetBtn.addEventListener('click', () => {
                prefs = Object.assign({}, defaults);
                save();
                applyAll();
                stopNarration();
            });

            /* ---------- Narator (Web Speech API) ---------- */
            const narratorBar = document.getElementById('a11yNarratorBar');
            const narratorLabel = document.getElementById('a11yNarratorLabel');
            const narratorPlayPause = document.getElementById('a11yNarratorPlayPause');
            const narratorStop = document.getElementById('a11yNarratorStop');
            const canSpeak = 'speechSynthesis' in window;
            let roVoice = null;
            let lastSpokenText = '';
            let isPaused = false;

            function pickVoice() {
                if (!canSpeak) return;
                const voices = window.speechSynthesis.getVoices();
                roVoice = voices.find(v => /^ro/i.test(v.lang)) || null;
            }
            if (canSpeak) {
                pickVoice();
                window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
            }

            function speak(text) {
                if (!canSpeak || !text || !text.trim()) return;
                lastSpokenText = text.trim();
                isPaused = false;
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(lastSpokenText);
                utter.lang = 'ro-RO';
                if (roVoice) utter.voice = roVoice;
                utter.rate = 1;
                utter.onstart = () => showNarratorBar(true);
                utter.onend = () => { if (!isPaused) showNarratorBar(false); };
                utter.onerror = () => { if (!isPaused) showNarratorBar(false); };
                window.speechSynthesis.speak(utter);
            }

            function showNarratorBar(playing) {
                if (!narratorBar) return;
                narratorBar.classList.add('is-visible');
                if (narratorPlayPause) narratorPlayPause.innerHTML = playing ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
                if (window.lucide) window.lucide.createIcons();
                if (!playing) setTimeout(() => {
                    if (!window.speechSynthesis.speaking && !isPaused) narratorBar.classList.remove('is-visible');
                }, 200);
            }

            function stopNarration() {
                isPaused = false;
                if (canSpeak) window.speechSynthesis.cancel();
                if (narratorBar) narratorBar.classList.remove('is-visible');
            }

            if (sw.narrator) sw.narrator.addEventListener('click', () => {
                if (!canSpeak) { alert('Browserul acesta nu suportă citirea cu voce (Web Speech API).'); return; }
                const on = !sw.narrator.classList.contains('is-on');
                setSwitch(sw.narrator, on);
                html.classList.toggle('a11y-narrator-mode', on);
                if (!on) stopNarration();
            });

            const NARRATOR_SELECTOR = 'p, h1, h2, h3, h4, li, a, button, .team-name, .search-result-title';
            document.addEventListener('click', (e) => {
                if (!html.classList.contains('a11y-narrator-mode')) return;
                if (e.target.closest('#a11yOverlay, .a11y-narrator-bar, #a11yTriggerBtn')) return;
                const el = e.target.closest(NARRATOR_SELECTOR);
                if (!el) return;
                e.preventDefault(); e.stopPropagation();
                speak(el.textContent);
            }, true);

            if (narratorPlayPause) narratorPlayPause.addEventListener('click', () => {
                if (!canSpeak) return;
                if (!isPaused) {
                    isPaused = true;
                    window.speechSynthesis.pause();
                    showNarratorBar(false);
                } else {
                    isPaused = false;
                    window.speechSynthesis.resume();
                    showNarratorBar(true);
                    /* Unele motoare (Chrome pe anumite sisteme) "pierd" utterance-ul la
                       resume() și rămân tăcute la nesfârșit — dacă nu se aude nimic la
                       scurt timp după resume(), repornim citirea de la început, ca
                       apăsarea pe Play să producă mereu un rezultat audibil. */
                    setTimeout(() => {
                        if (!isPaused && !window.speechSynthesis.speaking) speak(lastSpokenText);
                    }, 300);
                }
            });
            if (narratorStop) narratorStop.addEventListener('click', stopNarration);

            /* ---------- Inițializare ---------- */
            applyAll();
        })();

document.addEventListener('DOMContentLoaded', () => {
            if (window.lucide) lucide.createIcons();
        });

/* ==========================================================================
           JS: Generare Footer Global (Curat, Profesional, Cu Social Links Specifice)
           ========================================================================== */
        

        /* ==========================================================================
           JS: Cursor Custom
           ========================================================================== */
        const cursor = document.getElementById('cursor');

        // Pe telefon/tabletă (fără mouse real) cursorul e oricum ascuns din CSS (.cursor
        // { display:none } la (hover:none)/(pointer:coarse) mai sus), dar bucla
        // requestAnimationFrame de mai jos + listener-ul de mousemove tot rulau la nesfârșit
        // în fundal pe acele device-uri, consumând baterie/CPU degeaba pentru ceva nevăzut
        // niciodată. Le pornim doar pe device-uri cu mouse real; restul codului din fișier
        // (clase .hovering/.is-hidden pe elementul #cursor, declanșate din alte evenimente)
        // rămâne neschimbat — oricum nu se declanșează pe touch, unde nu există mouseenter/
        // mousemove reale. Pe desktop nu se schimbă nimic vizual sau de comportament.
        const supportsRealCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (supportsRealCursor) {
            let mX = window.innerWidth/2, mY = window.innerHeight/2;
            let cX = mX, cY = mY;

            function loopCursor() {
                cX += (mX - cX) * 0.2;
                cY += (mY - cY) * 0.2;
                cursor.style.transform = `translate(calc(${cX}px - 50%), calc(${cY}px - 50%))`;
                requestAnimationFrame(loopCursor);
            }
            loopCursor();

            window.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; });
        }

        /* Peste widget-ul Instagram (iframe încărcat de pe instagram.com), browserul nu mai
           trimite evenimente mousemove către pagina noastră — cross-origin, nimic de făcut din
           CSS/JS de aici. Fără fix-ul de mai jos, inelul rămânea "înghețat" pe ultima poziție
           dinaintea intrării în widget, ceea ce arăta ca un bug. Detectăm intrarea/ieșirea din
           wrapper-ul din jurul iframe-ului (acela e al nostru, nu cross-origin) și estompăm
           inelul cât timp mouse-ul e deasupra — nativul Instagram-ului rămâne vizibil acolo,
           inevitabil, dar cel puțin al nostru nu mai arată stricat restul timpului. */
        (function initInstagramCursorFade() {
            const igWrapper = document.getElementById('ig-embed-wrapper');
            if (!igWrapper) return;
            igWrapper.addEventListener('mouseenter', () => cursor.classList.add('is-hidden'));
            igWrapper.addEventListener('mouseleave', () => cursor.classList.remove('is-hidden'));
        })();

        /* ==========================================================================
           JS: Comutare automată de la loader-ul temat la postarea Instagram reală
           ==========================================================================
           Scriptul oficial embed.js (încărcat la finalul paginii) înlocuiește
           <blockquote class="instagram-media"> cu un <iframe> odată ce postarea s-a
           încărcat de pe instagram.com — necesită conexiune la rețea. Până atunci,
           rămâne vizibil loaderul temat (.ig-embed-skeleton), nu placeholder-ul alb
           nativ al Instagram (care nu se încadra corect în ramă). Ne uităm după apariția
           unui <iframe> în cadru și, când apare, comutăm clasa 'ig-ready' — CSS-ul face
           restul (fade). Dacă nu apare deloc într-un timp rezonabil (offline, script
           blocat), arătăm un link simplu spre postare, în loc să lăsăm loaderul la nesfârșit. */
        (function initInstagramReadySwap() {
            const frame = document.getElementById('igEmbedFrame');
            if (!frame) return;

            let settled = false;
            const markReady = () => {
                if (settled) return;
                settled = true;
                frame.classList.add('ig-ready');
                observer.disconnect();
            };

            const observer = new MutationObserver(() => {
                if (frame.querySelector('iframe')) markReady();
            });
            observer.observe(frame, { childList: true, subtree: true });

            // Poate fi deja prezent dacă embed.js a rulat foarte rapid (cache etc.)
            if (frame.querySelector('iframe')) markReady();

            setTimeout(() => {
                if (settled) return;
                if (frame.querySelector('iframe')) { markReady(); return; }
                frame.classList.add('ig-timeout');
            }, 6000);
        })();

        /* ==========================================================================
           JS: fallback grațios pt. video-ul din hero, dacă fișierul local nu există încă
           ========================================================================== */
        (function initHeroVideoFallback() {
            const video = document.getElementById('heroVideo');
            if (!video) return;
            // Raport: pe unele iPhone-uri videoul din hero nu pornea deloc. 'error' singur nu
            // prindea cazul real — pe iOS, autoplay-ul poate fi blocat silențios (fără eveniment
            // 'error') de Low Power Mode, Low Data Mode sau de un browser in-app (Instagram/
            // TikTok webview), caz în care videoul rămâne "înghețat" pe primul cadru, nu apare
            // nicio eroare. Fix: setăm explicit .muted (proprietatea JS, nu doar atributul HTML —
            // pe unele versiuni vechi de iOS doar atributul nu e suficient) și încercăm play()
            // manual, cu retry, în loc să ne bazăm doar pe autoplay declarativ.
            //
            // BUG GĂSIT (raport nou: "acum videoul nu mai apare deloc"): watchdog-ul de mai jos
            // ascundea videoul PERMANENT (display:none) dacă nu ajungea la readyState 3 în 5s —
            // dar pe o rețea aglomerată (multe telefoane pe același WiFi, exact scenariul unui
            // eveniment SSIC), bufer-area poate dura mai mult de 5s FĂRĂ ca videoul să fie stricat,
            // doar mai lent. Videoul pornea totuși la scurt timp după — dar giveUp() îl ascunsese
            // deja ireversibil, deci rezultatul vizibil era "videoul nu mai apare niciodată" pe
            // orice conexiune sub o anumită viteză, nu doar pe cele efectiv blocate. Fix: (1)
            // watchdog-ul renunță acum doar dacă readyState e 0 (HAVE_NOTHING = n-a plecat nicio
            // cerere reală, semn de blocare adevărată), nu doar "mai lent"; (2) un listener pe
            // 'playing' reafișează videoul oricând ar începe să ruleze, chiar dacă asta se
            // întâmplă după ce watchdog-ul a renunțat deja — nu mai există stare ireversibilă.
            let settled = false;
            let watchdogId = null;
            const reveal = () => {
                settled = true;
                if (watchdogId) { clearTimeout(watchdogId); watchdogId = null; }
                video.style.display = '';
            };
            const giveUp = () => {
                if (settled) return;
                settled = true;
                video.style.display = 'none'; // rămâne gridul/gradientul din fundal, arată bine oricum
            };
            video.addEventListener('error', giveUp, true);
            // Dacă videoul chiar pornește la un moment dat — chiar și după ce watchdog-ul de mai
            // jos ar fi renunțat — îl arătăm. Nu mai ținem videoul ascuns definitiv doar pentru
            // că a buferat mai lent pe o rețea aglomerată.
            video.addEventListener('playing', reveal);
            video.muted = true;
            video.playsInline = true; // proprietate JS, pe lângă atributul HTML din markup — necesară pe iOS mai vechi
            const tryPlay = () => {
                if (settled) return;
                const p = video.play();
                if (p && typeof p.catch === 'function') {
                    p.then(() => { settled = true; }).catch(() => {
                        // Prima încercare eșuează des dacă play() se cheamă înainte ca browserul
                        // să considere videoul "gata" — mai încercăm o dată la evenimentul canplay.
                        video.addEventListener('canplay', () => { if (!settled) video.play().catch(() => {}); }, { once: true });
                    });
                }
            };
            tryPlay();
            // Plasă de siguranță: renunțăm DOAR dacă videoul n-a apucat nici măcar să înceapă să
            // descarce date (readyState 0 = HAVE_NOTHING) după 8s — semn de blocare reală (Low
            // Data Mode, webview care interzice video, fișier lipsă), nu doar o rețea mai lentă
            // care încă buferează (readyState 1-3), caz în care merită să mai așteptăm —
            // listener-ul 'playing' de mai sus îl va arăta oricum imediat ce pornește, chiar dacă
            // asta se-ntâmplă după acest timeout.
            watchdogId = setTimeout(() => {
                if (!settled && video.readyState === 0) giveUp();
            }, 8000);
        })();

        /* ==========================================================================
           JS: REVEAL ON SCROLL (declarat aici, ÎNAINTE de orice cod care îl folosește —
           typewriter-ul de mai jos nu are nevoie de el, dar statisticile din home, câteva
           blocuri mai jos, îl apelează imediat ce rulează, deci trebuie definit primul)
           ========================================================================== */
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    const counter = entry.target.querySelector('[data-count-to]');
                    if (counter) animateCount(counter);
                    if (entry.target.hasAttribute('data-count-to')) animateCount(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        function observeReveals() {
            document.querySelectorAll('.reveal:not(.is-observed)').forEach(el => {
                el.classList.add('is-observed');
                revealObserver.observe(el);
            });
        }
        observeReveals();

        /* ==========================================================================
           JS: TYPEWRITER — textul din hero se scrie, așteaptă, apoi se șterge
           ========================================================================== */
        (function initHeroTypewriter() {
            const textEl = document.getElementById('heroTyped');
            const cursorEl = document.getElementById('heroCursor');
            const lineEl = textEl ? textEl.closest('.typed-line') : null;
            if (!textEl || !cursorEl) return;

            // 8 variante — toate gândite să curgă natural în propoziția fixă de dedesubt
            // ("... Inginerie Chimică"), ca sensul să rămână corect indiferent care apare.
            const phrases = [
                'Inovație în',
                'Spirit de echipă în',
                'Pasiune pentru',
                'Viitorul tău în',
                'Excelență în',
                'Curiozitate pentru',
                'Ambiție în',
                'Determinare în'
            ];
            let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!reduceMotion) {
                try { reduceMotion = !!JSON.parse(localStorage.getItem('ssicA11yPrefs') || '{}').reduceMotion; } catch (e) { /* ignorăm */ }
            }
            if (reduceMotion) {
                // Respectăm preferința utilizatorului: text fix, doar cursorul clipește discret (setat deja în CSS).
                textEl.textContent = phrases[0];
                return;
            }

            const TYPE_MIN = 55, TYPE_MAX = 95;   // ms/caracter, la scriere (ritm ușor neregulat, "uman")
            const DELETE_MIN = 28, DELETE_MAX = 42; // ms/caracter, la ștergere (mai rapid decât scrierea)
            const HOLD_AFTER_TYPE = 2000;          // pauză cu textul complet + cursor clipind, cerută explicit
            const HOLD_AFTER_DELETE = 450;         // mică pauză înainte să înceapă următorul cuvânt

            let phraseIndex = 0;
            let charIndex = 0;
            let currentPhrase = phrases[0];

            function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

            function pickNextPhrase() {
                phraseIndex = (phraseIndex + 1) % phrases.length;
                return phrases[phraseIndex];
            }

            /* Auto-scalare pe rând: măsurăm varianta curentă cu un canvas invizibil, la mărimea
               de bază definită în CSS pentru breakpoint-ul curent. Dacă nu încape pe un rând,
               micșorăm punctual doar acel rând (fără să afectăm "Inginerie Chimică" de dedesubt),
               ca niciodată să nu iasă din ecran și nici să nu se despartă în silabe. Pe desktop,
               unde lățimea disponibilă e generoasă, scala rămâne mereu 1 (fără efect vizibil). */
            const measureCanvas = document.createElement('canvas');
            const measureCtx = measureCanvas.getContext('2d');
            function fitLineToViewport(text) {
                if (!lineEl || !measureCtx) return;
                lineEl.style.fontSize = ''; // revenim la mărimea de bază din CSS, apoi verificăm dacă e nevoie de ajustare
                const container = lineEl.closest('.hero-content');
                if (!container) return;
                const style = getComputedStyle(lineEl);
                const baseSize = parseFloat(style.fontSize);
                if (!baseSize) return;
                measureCtx.font = `${style.fontWeight} ${baseSize}px ${style.fontFamily}`;
                const textWidth = measureCtx.measureText(text).width;
                const cursorAllowance = 16; // spațiu rezervat pt. cursorul care clipește lângă text
                const available = container.clientWidth - cursorAllowance;
                if (available > 0 && textWidth > available) {
                    const scale = Math.max(0.6, available / textWidth);
                    lineEl.style.fontSize = (baseSize * scale) + 'px';
                }
            }

            function typeStep() {
                cursorEl.classList.add('is-typing'); // cursor solid, opac, cât timp scrie activ

                if (charIndex <= currentPhrase.length) {
                    textEl.textContent = currentPhrase.slice(0, charIndex);
                    charIndex++;
                    setTimeout(typeStep, rand(TYPE_MIN, TYPE_MAX));
                } else {
                    cursorEl.classList.remove('is-typing'); // reactivăm blink-ul normal în pauză
                    setTimeout(deleteStep, HOLD_AFTER_TYPE);
                }
            }

            function deleteStep() {
                cursorEl.classList.add('is-typing');

                if (charIndex >= 0) {
                    textEl.textContent = currentPhrase.slice(0, charIndex);
                    charIndex--;
                    setTimeout(deleteStep, rand(DELETE_MIN, DELETE_MAX));
                } else {
                    cursorEl.classList.remove('is-typing');
                    currentPhrase = pickNextPhrase();
                    fitLineToViewport(currentPhrase);
                    charIndex = 0;
                    setTimeout(typeStep, HOLD_AFTER_DELETE);
                }
            }

            fitLineToViewport(currentPhrase);
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => fitLineToViewport(currentPhrase), 150);
            });

            // Pornim din poziția 0, cu un mic delay inițial (lasă hero-ul să se așeze vizual)
            setTimeout(typeStep, 500);
        })();

        /* ==========================================================================
           JS: STATISTICI HOME — un singur array de editat (valoare + sufix + etichetă)
           ========================================================================== */
        (function initHomeStats() {
            const container = document.getElementById('homeHugeStats');
            if (!container) return;

            // Adaugă/șterge/modifică o intrare aici — se generează automat blocul corespunzător
            // (cifră animată de la 0 + sufix + etichetă), fără să umbli prin HTML/layout.
            const STATS = [
                { value: 200, suffix: '+', label: 'Voluntari Activi' },
                { value: 3, suffix: '+', label: 'Ani de Activitate Continuă' }
            ];

            container.innerHTML = STATS.map((stat, i) => `
                <div class="home-stat reveal"${i > 0 ? ` style="--r-delay:${(i * 0.12).toFixed(2)}s;"` : ''}>
                    <span data-count-to="${stat.value}" data-suffix="${stat.suffix}">0${stat.suffix}</span>
                    <p>${stat.label}</p>
                </div>
            `).join('');

            // Elementele .reveal generate acum nu erau în DOM la primul observeReveals() (apelat
            // mai jos în script) — le înregistrăm din nou; funcția ignoră ce e deja observat.
            if (typeof observeReveals === 'function') observeReveals();
        })();

        /* ==========================================================================
           JS: HARTĂ REALĂ STUDENȚI (Leaflet + OpenStreetMap, coordonate GPS reale) —
           un singur array de editat (POIS). Inițializată LAZY din switchStudent(),
           doar când tab-ul "Hartă" devine activ prima dată — vezi acolo motivul.
           ========================================================================== */
        let studentMapInitialized = false;
        let studentMapMarkers = null; // populat doar dacă Leaflet chiar reușește să se încarce

        // Injectează CSS+JS Leaflet din CDN doar când e nevoie (primul click pe tab-ul "Hartă"),
        // nu la fiecare vizită a site-ului. Promisiunea e memorată (leafletLoadPromise), ca un
        // al doilea click să nu mai injecteze scriptul a doua oară. Aceleași sha256 folosite
        // înainte static, ca integritatea fișierelor să rămână verificată.
        let leafletLoadPromise = null;
        function loadLeaflet() {
            if (leafletLoadPromise) return leafletLoadPromise;
            leafletLoadPromise = new Promise((resolve) => {
                if (typeof L !== 'undefined') { resolve(); return; }

                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
                link.crossOrigin = '';
                document.head.appendChild(link);

                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
                script.crossOrigin = '';
                // La eroare (rețea/adblock) rezolvăm oricum promisiunea — initRealMap() are deja
                // un fallback grațios pentru "typeof L === 'undefined'" (vezi mai jos), exact ca
                // atunci când Leaflet era static și pica de pe rețea.
                script.onload = () => resolve();
                script.onerror = () => resolve();
                document.head.appendChild(script);
            });
            return leafletLoadPromise;
        }

        function initRealMap() {
            if (studentMapInitialized) return;
            const mapEl = document.getElementById('realMap');
            if (!mapEl) return;

            // Dacă scriptul Leaflet n-a apucat să se încarce (rețea/adblock), nu lăsăm
            // eroarea să oprească restul paginii — arătăm un mesaj simplu, în loc de hartă.
            if (typeof L === 'undefined') {
                mapEl.innerHTML = '<div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--c-gray); font-size:0.9rem; text-align:center; padding:20px;">Harta nu a putut fi încărcată (verifică conexiunea la internet).</div>';
                return;
            }
            studentMapInitialized = true;

            // Culori din paleta SSIC + câteva accente noi (roșu/teal/portocaliu) doar pentru
            // pinii de pe hartă, ca fiecare categorie din filtru să fie ușor de distins.
            // Repere reale, verificate (nume + adresă + coordonate din OpenStreetMap/Google Places).
            const CATEGORIES = {
                cazare:    { label: 'Cazare',    color: '#8348c4', iconColor: '#ffffff' },
                cantina:   { label: 'Cantine',   color: '#f5b027', iconColor: '#1a1206' },
                mancare:   { label: 'Magazine',  color: '#ff9f43', iconColor: '#1a1206' },
                sanatate:  { label: 'Farmacii',  color: '#e0645f', iconColor: '#ffffff' },
                transport: { label: 'Transport', color: '#4fd1c5', iconColor: '#0c1f1e' },
                studiu:    { label: 'Studiu',    color: '#c9a6f2', iconColor: '#1a1206' },
                facultate: { label: 'Facultate', color: '#e9e2ef', iconColor: '#1a1206' },
                parcuri:   { label: 'Parcuri',   color: '#5fb85a', iconColor: '#0d1f0a' },
                cafenele:  { label: 'Cafenele',  color: '#d98e4a', iconColor: '#241505' },
                baruri:    { label: 'Baruri',    color: '#c4485a', iconColor: '#ffffff' }
            };

            const POIS = [
                // Cazare — căminele FICBi din Regie (coordonate corectate, verificate din lista oficială)
                { cat: 'cazare',    name: 'Cămin P7 (fete)', addr: 'Complexul Studențesc Regie',
                  lat: 44.44519624683363, lng: 26.05274543132701, icon: 'home' },
                { cat: 'cazare',    name: 'Cămin P8 (băieți)', addr: 'Complexul Studențesc Regie',
                  lat: 44.44526404275452, lng: 26.052563042012075, icon: 'home' },
                { cat: 'cazare',    name: 'Cămin P26', addr: 'Complexul Studențesc Regie',
                  lat: 44.4455, lng: 26.0578, icon: 'home' },
                // Cantine
                { cat: 'cantina',   name: 'Cantina Rectorat', addr: 'Splaiul Independenței 313, etaj 5',
                  lat: 44.4386195, lng: 26.051572, icon: 'utensils' },
                { cat: 'cantina',   name: 'Cantina Regie (R3)', addr: 'Splaiul Independenței 299',
                  lat: 44.44588912250304, lng: 26.052088174889764, icon: 'utensils' },
                // Magazine (Orhideea + Polizu) + centre comerciale/magazine utile din lista studenților
                { cat: 'mancare',   name: 'Carrefour Orhideea', addr: 'Splaiul Independenței 210-210B',
                  lat: 44.4447231, lng: 26.0632957, icon: 'shopping-cart' },
                { cat: 'mancare',   name: 'Profi (Polizu)', addr: 'Calea Griviței 134-138',
                  lat: 44.4473738, lng: 26.0769589, icon: 'shopping-cart' },
                { cat: 'mancare',   name: 'Froo (Polizu)', addr: 'Calea Griviței 134',
                  lat: 44.4474305, lng: 26.0768052, icon: 'shopping-basket' },
                { cat: 'mancare',   name: 'LivrăriRegie.ro', addr: 'Complexul Studențesc Regie',
                  lat: 44.44561438049759, lng: 26.052337960736235, icon: 'shopping-basket' },
                { cat: 'mancare',   name: 'Centrul Comercial Orhideea', addr: 'Splaiul Independenței 210',
                  lat: 44.446216420016455, lng: 26.062524102927426, icon: 'shopping-cart' },
                { cat: 'mancare',   name: 'Lidl', addr: 'Str. Sergent Ștefan Crișan 31',
                  lat: 44.45183937710921, lng: 26.04796908790601, icon: 'shopping-cart' },
                { cat: 'mancare',   name: 'AFI Cotroceni', addr: 'Bulevardul Vasile Milea 4',
                  lat: 44.431861085702685, lng: 26.053697810379354, icon: 'shopping-bag' },
                { cat: 'mancare',   name: 'Jumbo Center', addr: 'Șoseaua Berceni',
                  lat: 44.41584285362142, lng: 26.079416133915537, icon: 'shopping-bag' },
                { cat: 'mancare',   name: 'Socului Kebap Obor', addr: 'Strada Ziduri Moși 4',
                  lat: 44.44955369942694, lng: 26.123559772905622, icon: 'utensils' },
                // Farmacii din zonă
                { cat: 'sanatate',  name: 'Farmacia Dr. Max (Orhideea)', addr: 'Splaiul Independenței 210-210B',
                  lat: 44.4442865, lng: 26.0625989, icon: 'cross' },
                { cat: 'sanatate',  name: 'Help Net (Orhideea)', addr: 'Splaiul Independenței 210-210B',
                  lat: 44.4440423, lng: 26.0621402, icon: 'cross' },
                { cat: 'sanatate',  name: 'Minifarm Regie', addr: 'Bulevardul Regiei 6-8',
                  lat: 44.4466748, lng: 26.0583114, icon: 'cross' },
                { cat: 'sanatate',  name: 'Farmacia Catena', addr: 'Calea Plevnei 132B',
                  lat: 44.4416661, lng: 26.0721785, icon: 'cross' },
                // Catena Non-Stop scoasă de pe hartă: era etichetată greșit "(Polizu)" — adresa
                // (Bd. Ion Mihalache 70-82) e de fapt în zona Aviatorilor, nu lângă Polizu.
                // Transport — circuitul de metrou Crângași -> Grozăvești -> Petrache Poenaru -> Basarab -> Gara de Nord
                { cat: 'transport', name: 'Metrou Crângași (M1)', addr: 'Șoseaua Crângași, lângă Lacul Morii',
                  lat: 44.451839, lng: 26.047722, icon: 'train-front' },
                { cat: 'transport', name: 'Metrou Grozăvești (M1)', addr: 'Șoseaua Grozăvești',
                  lat: 44.4427413, lng: 26.0604824, icon: 'train-front' },
                { cat: 'transport', name: 'Metrou Petrache Poenaru (M1)', addr: 'Splaiul Independenței, lângă Podul Grozăvești',
                  lat: 44.4453043, lng: 26.0467146, icon: 'train-front' },
                { cat: 'transport', name: 'Metrou Basarab (M1/M4)', addr: 'Calea Griviței, lângă Gara de Nord',
                  lat: 44.44998, lng: 26.068089, icon: 'train-front' },
                { cat: 'transport', name: 'Gara de Nord', addr: 'Bulevardul Gării de Nord 1',
                  lat: 44.446634, lng: 26.073892, icon: 'train-front' },
                // Studiu — biblioteci + librării/anticariate din lista studenților
                { cat: 'studiu',    name: 'Biblioteca Centrală UNSTPB', addr: 'Splaiul Independenței 313',
                  lat: 44.441191391143455, lng: 26.051440564343125, icon: 'book-open' },
                { cat: 'studiu',    name: 'Biblioteca Națională a României', addr: 'Bulevardul Unirii 22',
                  lat: 44.42614835130018, lng: 26.11023615767798, icon: 'book-open' },
                { cat: 'studiu',    name: 'Anticariat UNU', addr: 'Pasajul Universității',
                  lat: 44.434361124075856, lng: 26.099743768545743, icon: 'book-marked' },
                { cat: 'studiu',    name: 'Târgul Cărții', addr: 'Pasajul Universității',
                  lat: 44.43388374873857, lng: 26.102744490471178, icon: 'book-marked' },
                { cat: 'studiu',    name: 'Antic ExLibris', addr: 'Pasajul Universității',
                  lat: 44.43353325604077, lng: 26.102226824139255, icon: 'book-marked' },
                // Facultate
                { cat: 'facultate', name: 'FICBi — Clădirea Polizu', addr: 'Strada Gheorghe Polizu 1-7',
                  lat: 44.447844250433064, lng: 26.079711737380148, icon: 'graduation-cap' },
                { cat: 'facultate', name: 'Facultatea de Științe Aplicate', addr: 'Splaiul Independenței 313',
                  lat: 44.439817879671835, lng: 26.050660021659674, icon: 'graduation-cap' },
                // Parcuri
                { cat: 'parcuri',   name: 'Parcul Politehnica', addr: 'Splaiul Independenței',
                  lat: 44.440772552182615, lng: 26.052555677857647, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Regele Mihai I (Herăstrău)', addr: 'Șoseaua Kiseleff',
                  lat: 44.47035845304378, lng: 26.082682962470503, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Liniei', addr: 'Calea Griviței',
                  lat: 44.431644541658464, lng: 26.035633820772407, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Tineretului', addr: 'Bulevardul Tineretului',
                  lat: 44.40800839176741, lng: 26.105009791334325, icon: 'trees' },
                { cat: 'parcuri',   name: 'Grădina Cișmigiu', addr: 'Bulevardul Regina Elisabeta',
                  lat: 44.437480734880126, lng: 26.091078049163023, icon: 'trees' },
                { cat: 'parcuri',   name: 'Grădina Botanică „Dimitrie Brândză”', addr: 'Șoseaua Cotroceni 32',
                  lat: 44.43743926558714, lng: 26.06280048150343, icon: 'leaf' },
                { cat: 'parcuri',   name: 'Parcul Alexandru Ioan Cuza', addr: 'Bulevardul Basarabia',
                  lat: 44.42625931231126, lng: 26.155142083698404, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Izvor', addr: 'Splaiul Independenței',
                  lat: 44.432071410671874, lng: 26.08773258712462, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Crângași', addr: 'Bulevardul Constructorilor',
                  lat: 44.452639588998714, lng: 26.045747502810457, icon: 'trees' },
                { cat: 'parcuri',   name: 'Morii Lake Promenad', addr: 'Lacul Morii',
                  lat: 44.45271100158281, lng: 26.03964800008108, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Insula Lacul Morii', addr: 'Lacul Morii',
                  lat: 44.45973742949955, lng: 26.02960230713795, icon: 'trees' },
                { cat: 'parcuri',   name: 'Parcul Drumul Taberei', addr: 'Bulevardul Timișoara',
                  lat: 44.42280821664365, lng: 26.030859983291197, icon: 'trees' },
                // Cafenele
                { cat: 'cafenele',  name: 'Leonard Caffe Polizu', addr: 'Strada Gheorghe Polizu',
                  lat: 44.447805514471334, lng: 26.07778854666857, icon: 'coffee' },
                { cat: 'cafenele',  name: 'B17 COFFEELAB Polizu', addr: 'Strada Gheorghe Polizu',
                  lat: 44.44749627368328, lng: 26.07734329997222, icon: 'coffee' },
                { cat: 'cafenele',  name: 'Beans & Dots', addr: 'Strada Ion Brezoianu 23-25',
                  lat: 44.43569315780523, lng: 26.09396696090108, icon: 'coffee' },
                { cat: 'cafenele',  name: 'Meron', addr: 'Bulevardul Regina Elisabeta 40',
                  lat: 44.43484521301282, lng: 26.09459777537656, icon: 'coffee' },
                // Baruri — separate de cafenele; Quantic era etichetat greșit "zona Cișmigiu",
                // dar e de fapt pe Șoseaua Grozăvești (lângă Podul Grozăvești), nu în zona Cișmigiu.
                { cat: 'baruri',    name: 'Quantic', addr: 'Șoseaua Grozăvești 82',
                  lat: 44.43827284286915, lng: 26.059362463505245, icon: 'beer' },
                { cat: 'baruri',    name: 'Mechano Pub', addr: 'Complexul Studențesc Regie',
                  lat: 44.44687491494298, lng: 26.051812904006496, icon: 'beer' },
                { cat: 'baruri',    name: 'Wicked Bar', addr: 'Calea Moșilor',
                  lat: 44.4378826641658, lng: 26.11236936694795, icon: 'beer' }
            ];

            const map = L.map('realMap', { scrollWheelZoom: false });
            window.studentMapInstance = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Zoom cu rotița se activează doar după un click pe hartă, ca vizitatorul să nu
            // "piardă" accidental scroll-ul paginii când doar trece cu mouse-ul peste ea.
            map.on('click', () => map.scrollWheelZoom.enable());

            // TOATE reperele sunt pe hartă din start, indiferent de filtre — filtrele nu mai
            // ascund pinii (asta îi făcea să pară "goi" până apăsai un buton), ci doar le schimbă
            // înfățișarea: fără nicio categorie bifată, toate rămân pinuri colorate ("arată tot" e
            // starea implicită); din momentul în care bifezi o categorie, doar aceea rămâne pin
            // colorat, iar restul se micșorează la un punct gri, discret, dar tot vizibil/click-abil
            // pe hartă (nu dispar complet).
            function buildFullIcon(p, c) {
                // Formă de "pin" standard: colț ascuțit jos-stânga (border-radius 0 pe acel colț),
                // rotit -45° ca acel colț să ajungă exact în vârf, jos, îndreptat spre punctul de
                // pe hartă — nu în lateral (rotația +45° de dinainte trimitea vârful spre stânga,
                // de-asta arătau pinurile "culcate"/orizontale).
                return L.divIcon({
                    className: '',
                    html: `<div style="width:32px; height:32px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); background:${c.color}; box-shadow:0 4px 12px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,255,255,0.25);"><i data-lucide="${p.icon}" style="transform:rotate(45deg); width:15px; height:15px; color:${c.iconColor};"></i></div>`,
                    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -30]
                });
            }
            function buildMutedIcon() {
                // Punct mic gri pentru reperele care nu se potrivesc cu filtrele bifate — rămân
                // pe hartă (context/scară), dar vizual date la o parte.
                return L.divIcon({
                    className: '',
                    html: `<div style="width:11px; height:11px; border-radius:50%; background:#8d879a; opacity:0.75; border:2px solid rgba(255,255,255,0.2); box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
                    iconSize: [11, 11], iconAnchor: [5, 5], popupAnchor: [0, -8]
                });
            }

            const markers = [];
            const markerLatLngs = [];
            POIS.forEach(p => {
                const c = CATEGORIES[p.cat];
                const fullIcon = buildFullIcon(p, c);
                const mutedIcon = buildMutedIcon();
                const marker = L.marker([p.lat, p.lng], { icon: fullIcon, title: p.name });
                marker.bindPopup(`<strong>${p.name}</strong><span class="poi-cat">${c.label}</span><span class="poi-addr">${p.addr}</span>`);
                marker.on('popupopen', () => { if (window.lucide) lucide.createIcons(); });
                marker.addTo(map);
                markers.push({ marker, poi: p, fullIcon, mutedIcon });
                markerLatLngs.push([p.lat, p.lng]);
            });
            studentMapMarkers = markers;

            // Cadrăm harta ca să încapă tot circuitul (Crângași -> Gara de Nord), nu doar
            // vecinătatea imediată a căminelor.
            map.fitBounds(L.latLngBounds(markerLatLngs), { padding: [28, 28] });

            // Aplică starea curentă a filtrelor (implicit niciun buton activ -> toate pinurile
            // pline, cf. cerinței de mai sus).
            updateMapMarkerStyles();
        }

        // Recalculează, pentru fiecare marker, dacă rămâne pin colorat sau devine punct gri, în
        // funcție de categoriile bifate în #mapFilters chiar acum. Fără nicio categorie bifată,
        // toate rămân pinuri pline. Apelată la inițializarea hărții și la fiecare click de filtru.
        function updateMapMarkerStyles() {
            if (!studentMapMarkers) return;
            const activeCats = new Set(
                Array.from(document.querySelectorAll('#mapFilters .map-filter-btn.active')).map(b => b.dataset.cat)
            );
            studentMapMarkers.forEach(({ marker, poi, fullIcon, mutedIcon }) => {
                const showFull = activeCats.size === 0 || activeCats.has(poi.cat);
                marker.setIcon(showFull ? fullIcon : mutedIcon);
            });
            // setIcon() înlocuiește nodul DOM al markerului cu unul nou, deci orice <i data-lucide>
            // din pinurile redevenite "pline" trebuie convertit din nou în SVG — altfel iconițele
            // rămâneau invizibile până la următorul eveniment care apela createIcons() (de ex.
            // deschiderea unui popup), ceea ce era bug-ul "iconițele apar doar dacă apeși pe pin".
            if (window.lucide) lucide.createIcons();
        }

        // Butoane de filtru hartă: legate O SINGURĂ DATĂ, la încărcarea paginii, nu în interiorul
        // initRealMap(). Butoanele sunt HTML static (există din start), deci nu au nevoie să
        // aștepte harta — starea vizuală (.active, galben) trebuie să răspundă la click chiar
        // și dacă Leaflet n-a apucat încă să se încarce. Dacă harta există deja, resincronizăm
        // stilul markerilor; dacă nu, doar starea vizuală a butonului se schimbă (fără eroare).
        document.querySelectorAll('#mapFilters .map-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                if (window.studentMapInstance) updateMapMarkerStyles();
                haptic(6);
            });
        });

        /* ==========================================================================
           JS: Hartă — meniu de filtre collapsabil + mod fullscreen
           ========================================================================== */
        const mapFilterToggle = document.getElementById('mapFilterToggle');
        const mapFiltersEl = document.getElementById('mapFilters');
        const mapFullscreenToggle = document.getElementById('mapFullscreenToggle');
        const mapFullscreenExit = document.getElementById('mapFullscreenExit');
        const mapFsWrapper = document.getElementById('mapFsWrapper');
        let mapIsFullscreen = false;

        if (mapFilterToggle && mapFiltersEl) {
            // Panoul de filtre era aliniat printr-un offset fix în CSS (left: 46px), calculat
            // ca să pornească exact sub controalele native de zoom Leaflet — dar acel offset
            // presupune că butonul de Filtre e mereu primul/singurul element vizibil din
            // toolbar, la o poziție fixă. Dacă toolbar-ul are și alte controale sau lățimea
            // lor variază (font, limbă, zoom de browser), poziția reală a butonului nu mai
            // coincide cu offset-ul "ghicit" din CSS, și ribbonul se deschide vizibil
            // deplasat față de buton — exact bug-ul raportat. Fix real: aliniem panoul la
            // poziția EFECTIVĂ a butonului, calculată la runtime, nu la o valoare ghicită.
            const alignMapFiltersPanel = () => {
                if (!mapFsWrapper) return;
                const wrapperRect = mapFsWrapper.getBoundingClientRect();
                const btnRect = mapFilterToggle.getBoundingClientRect();
                mapFiltersEl.style.left = Math.round(btnRect.left - wrapperRect.left) + 'px';
            };
            mapFilterToggle.addEventListener('click', () => {
                const collapsed = mapFiltersEl.classList.toggle('is-collapsed');
                mapFilterToggle.setAttribute('aria-expanded', String(!collapsed));
                mapFilterToggle.classList.toggle('is-active', !collapsed);
                if (!collapsed) alignMapFiltersPanel();
                haptic(6);
            });
            window.addEventListener('resize', () => {
                if (!mapFiltersEl.classList.contains('is-collapsed')) alignMapFiltersPanel();
            });
        }

        // Bug-ul de dinainte: codul de mai jos NU chema niciodată Fullscreen API-ul real —
        // doar comuta clase CSS (#realMap.is-fullscreen, body.map-fullscreen-active etc.)
        // pentru care nu mai exista nicio regulă în foaia de stil, deci vizual nu se
        // întâmpla absolut nimic la click. Acum chemăm efectiv requestFullscreen()/
        // exitFullscreen() pe .map-fs-wrapper (elementul care înconjoară toolbar + filtre +
        // hartă + butonul de ieșire — vezi HTML-ul din Studenți). Pt. browsere care NU
        // suportă requestFullscreen() pe elemente oarecare (în primul rând Safari pe iPhone,
        // care-l permite doar pe <video>), cădem pe un fullscreen "fals" simulat din CSS
        // (position:fixed) — vezi .is-fake-fullscreen mai sus în stylesheet.
        // BUG GĂSIT (raport: butonul de fullscreen pe hartă face restul secțiunii unclickable pe
        // iOS): pe iPhone/iPad, `element.webkitRequestFullscreen` EXISTĂ ca metodă (deci
        // feature-detection-ul de mai jos "credea" că fullscreen-ul nativ e suportat), dar pe
        // iOS Safari fullscreen-ul nativ funcționează DOAR pe <video> — apelat pe orice alt
        // element, metoda nu face nimic vizibil, nu aruncă eroare, nu întoarce mereu un Promise
        // care respinge, și evenimentul 'fullscreenchange' nu se mai declanșează niciodată. Fără
        // niciun eveniment, applyFullscreenUI(true) nu se chema NICIODATĂ, deci clasa
        // 'is-fake-fullscreen' rămânea neadăugată, dar butonul rămânea "apăsat" din UI, iar la
        // click-ul următor exitFullscreenMode() considera eronat că suntem în fullscreen fals
        // (mapIsFullscreen sincronizat greșit) — DOM-ul rămânea într-o stare intermediară care
        // lăsa hartă + toolbar cu z-index-ul de fullscreen (1001+) peste restul paginii, blocând
        // click-urile pe Cămine/Tips&Tricks/Ghidul Studentului dedesubt, fără ca fullscreen-ul
        // "real" să fi pornit vreodată. Fix: nu ne mai bazăm pe feature-detection pe iOS — orice
        // iPhone/iPad merge direct pe calea "fake fullscreen" (position:fixed simulat), care e
        // testată și funcționează corect acolo.
        function isIOS() {
            return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+ se dă drept Mac
        }
        function nativeFullscreenSupported() {
            if (isIOS()) return false;
            return !!(mapFsWrapper && (mapFsWrapper.requestFullscreen || mapFsWrapper.webkitRequestFullscreen));
        }
        function nativeFullscreenElement() {
            return document.fullscreenElement || document.webkitFullscreenElement || null;
        }

        // Bug raportat: pe desktop, în fullscreen NATIV, nu se mai vedea NICIUN cursor —
        // imposibil de navigat sau de ieșit din fullscreen fără tastatură. Cauza: Fullscreen
        // API-ul nativ randează DOAR elementul cerut (.map-fs-wrapper) și descendenții lui,
        // pe un "top layer" separat, gestionat de browser — #cursor (inelul custom) trăiește
        // în afara acelui arbore, deci nu mai apărea deloc, oricât de mare i-ar fi z-index-ul.
        // Am încercat inițial să mutăm nodul #cursor în interiorul lui .map-fs-wrapper cât
        // timp fullscreen-ul era activ — funcțional, dar tot un cursor custom, nu cel nativ,
        // și tot depindea de JS ca să se miște. Fix cerut explicit: readucem pur și simplu
        // cursorul NATIV al sistemului cât timp fullscreen-ul (real sau fals) e activ — vezi
        // regulile `.map-fs-wrapper:fullscreen, ...` de mai sus în foaia de stil — și ascundem
        // #cursor complet cât timp body.map-fullscreen-active e activă (vezi CSS), ca să nu se
        // suprapună cele două. Toggle-ul clasei pe <body> e centralizat aici, în
        // applyFullscreenUI, ca să acopere identic ambele căi (nativă + fake).
        function applyFullscreenUI(on) {
            mapIsFullscreen = on;
            document.body.classList.toggle('map-fullscreen-active', on);
            if (mapFiltersEl) {
                // La intrarea în fullscreen, panoul de filtre pornește collapsat (doar
                // butonul de Filtre rămâne vizibil peste hartă) — utilizatorul îl deschide
                // la nevoie.
                if (on) {
                    mapFiltersEl.classList.add('is-collapsed');
                    if (mapFilterToggle) {
                        mapFilterToggle.setAttribute('aria-expanded', 'false');
                        mapFilterToggle.classList.remove('is-active');
                    }
                }
            }
            if (mapFullscreenToggle) {
                mapFullscreenToggle.setAttribute('aria-pressed', String(on));
                mapFullscreenToggle.classList.toggle('is-active', on);
                const label = mapFullscreenToggle.querySelector('span');
                if (label) label.textContent = on ? 'Închide fullscreen' : 'Fullscreen';
                const icon = mapFullscreenToggle.querySelector('[data-lucide]');
                if (icon) { icon.setAttribute('data-lucide', on ? 'minimize' : 'maximize'); }
            }
            if (window.lucide) lucide.createIcons();
            // Leaflet trebuie anunțat că dimensiunea containerului s-a schimbat, altfel
            // rămâne randată la mărimea veche (tile-uri lipsă pe margini). Delay-ul lasă
            // browserul să termine tranziția de fullscreen înainte de măsurătoare.
            if (window.studentMapInstance) {
                setTimeout(() => window.studentMapInstance.invalidateSize(), 80);
            }
        }

        function enterFullscreen() {
            if (!mapFsWrapper || mapIsFullscreen) return;
            if (nativeFullscreenSupported()) {
                const req = mapFsWrapper.requestFullscreen
                    ? mapFsWrapper.requestFullscreen.bind(mapFsWrapper)
                    : mapFsWrapper.webkitRequestFullscreen.bind(mapFsWrapper);
                const result = req();
                // requestFullscreen() poate fi respins (gest lipsă, restricție de browser) —
                // dacă se întâmplă, cădem tot pe varianta simulată, ca butonul să tot
                // funcționeze pentru vizitator.
                if (result && typeof result.catch === 'function') {
                    result.catch(() => enterFakeFullscreen());
                }
                // applyFullscreenUI(true) e chemat din handler-ul de fullscreenchange, ca
                // starea din UI să rămână corectă indiferent cum s-a intrat/ieșit (buton,
                // Escape, gest de swipe pe mobil etc.), nu doar din acest click.
                //
                // Plasă suplimentară: dacă metoda nativă nu întoarce deloc un Promise (unele
                // implementări vechi/prefixate) ȘI 'fullscreenchange' nu se declanșează în
                // scurt timp, browserul a "ignorat" tăcut cererea — cădem pe varianta simulată,
                // ca butonul să funcționeze oricum, în loc să rămână fără efect vizibil.
                setTimeout(() => {
                    if (!mapIsFullscreen && nativeFullscreenElement() !== mapFsWrapper) {
                        enterFakeFullscreen();
                    }
                }, 400);
            } else {
                enterFakeFullscreen();
            }
        }

        function exitFullscreenMode() {
            if (!mapIsFullscreen) return;
            if (nativeFullscreenElement()) {
                const exit = document.exitFullscreen
                    ? document.exitFullscreen.bind(document)
                    : document.webkitExitFullscreen.bind(document);
                exit();
            } else {
                exitFakeFullscreen();
            }
        }

        // Plasă suplimentară de siguranță pt. bug-ul #3: un `position:fixed` se raportează la
        // cel mai apropiat ancestor cu transform/filter/perspective/will-change — dacă
        // .map-fs-wrapper rămâne în arborele de tab-uri Studenți (care animă opacity/transform/
        // filter la comutare — vezi swapTabPanel mai sus), "fullscreen"-ul simulat poate ajunge
        // poziționat/dimensionat greșit față de acel ancestor, nu față de tot ecranul, oricât de
        // bine ar arăta regulile CSS care anulează transform-ul pe .active — un singur cadru
        // prins la mijlocul unei tranziții e suficient să strice calculul. Mutăm efectiv nodul
        // direct sub <body> cât timp fullscreen-ul fals e activ (deci n-are niciun ancestor care
        // ar putea deveni containing block), și-l punem la loc exact unde a fost, la ieșire.
        let mapFsOriginalParent = null, mapFsOriginalNextSibling = null;

        function enterFakeFullscreen() {
            if (!mapFsWrapper || mapFsWrapper.classList.contains('is-fake-fullscreen')) return;
            mapFsOriginalParent = mapFsWrapper.parentNode;
            mapFsOriginalNextSibling = mapFsWrapper.nextSibling;
            document.body.appendChild(mapFsWrapper);
            mapFsWrapper.classList.add('is-fake-fullscreen');
            applyFullscreenUI(true);
        }

        function exitFakeFullscreen() {
            if (!mapFsWrapper) return;
            mapFsWrapper.classList.remove('is-fake-fullscreen');
            if (mapFsOriginalParent) {
                mapFsOriginalParent.insertBefore(mapFsWrapper, mapFsOriginalNextSibling);
                mapFsOriginalParent = null;
                mapFsOriginalNextSibling = null;
            }
            applyFullscreenUI(false);
        }

        if (mapFullscreenToggle) {
            mapFullscreenToggle.addEventListener('click', () => {
                mapIsFullscreen ? exitFullscreenMode() : enterFullscreen();
                haptic(8);
            });
        }
        if (mapFullscreenExit) {
            mapFullscreenExit.addEventListener('click', () => { exitFullscreenMode(); haptic(8); });
        }
        // Escape e gestionat automat de browser pt. fullscreen-ul nativ (declanșează
        // fullscreenchange mai jos) — listener-ul de-aici acoperă doar varianta simulată,
        // unde noi suntem singurii care știm că "fullscreen-ul" e activ.
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && mapIsFullscreen && mapFsWrapper && mapFsWrapper.classList.contains('is-fake-fullscreen')) {
                exitFakeFullscreen();
            }
        });
        // Singura sursă de adevăr pt. starea fullscreen-ului nativ: acest eveniment prinde
        // și ieșirile care nu trec prin butonul nostru (Escape, gestul de swipe-down pe
        // mobil, alt tab care a intrat în fullscreen etc.), ca UI-ul (iconiță, panou de
        // filtre, invalidateSize pe hartă) să rămână mereu sincronizat cu ce vede vizitatorul.
        ['fullscreenchange', 'webkitfullscreenchange'].forEach(evt => {
            document.addEventListener(evt, () => {
                if (mapFsWrapper && mapFsWrapper.classList.contains('is-fake-fullscreen')) return;
                const on = nativeFullscreenElement() === mapFsWrapper;
                applyFullscreenUI(on);
            });
        });

        /* Delegare de evenimente pe document, în loc de a lega listener-e individual pe fiecare
           .hover-target la încărcare: acele elemente adăugate DUPĂ acest punct în execuție
           (rezultatele din search, poze din galerie, notificarea de cookie-uri etc.) nu mai
           există încă în DOM când s-ar fi rulat un bindHover() clasic, deci rămâneau fără
           cursor-ul cu "mânuță". Delegarea prinde automat orice element, oricând apare. */
        const HOVER_SELECTOR = '.hover-target, .nav-link, .soc-icon';
        document.addEventListener('mouseover', e => {
            if (e.target.closest(HOVER_SELECTOR)) cursor.classList.add('hovering');
        });
        document.addEventListener('mouseout', e => {
            const leavingTarget = e.target.closest(HOVER_SELECTOR);
            if (!leavingTarget) return;
            const enteringTarget = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOVER_SELECTOR);
            if (!enteringTarget) cursor.classList.remove('hovering');
        });

        /* ==========================================================================
           JS: Haptic feedback (mobil) — no-op silențios pe orice device/browser
           care nu suportă Vibration API (desktop, iOS Safari etc.)
           ========================================================================== */
        function haptic(duration = 10) {
            if (navigator.vibrate) {
                try { navigator.vibrate(duration); } catch (e) { /* ignorăm */ }
            }
        }

        /* ==========================================================================
           JS: Meniu Mobil (Hamburger)
           ========================================================================== */
        const navBurger = document.getElementById('navBurger');
        const navLinksEl = document.getElementById('navLinks');

        function closeMobileNav() {
            navLinksEl.classList.remove('nav-open');
            navBurger.classList.remove('is-active');
            navBurger.setAttribute('aria-expanded', 'false');
        }

        navBurger.addEventListener('click', () => {
            const isOpen = navLinksEl.classList.toggle('nav-open');
            navBurger.classList.toggle('is-active', isOpen);
            navBurger.setAttribute('aria-expanded', String(isOpen));
            haptic(isOpen ? 12 : 8);
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });

        /* ==========================================================================
           JS: Navigare reală între pagini (MPA) — fiecare secțiune e propria ei
           pagină Jekyll (ssic.ro/evenimente/, /board/ etc.), încărcată independent de
           server/GitHub Pages. Nu mai există un singur "view" ascuns/arătat prin JS:
           id-ul paginii curente vine direct din front matter-ul paginii Jekyll.
           ========================================================================== */
        const viewUrls = { home: baseUrl + '/', evenimente: baseUrl + '/evenimente/', board: baseUrl + '/board/', facultate: baseUrl + '/facultate/', studenti: baseUrl + '/studenti/', gallery: baseUrl + '/gallery/' };
        const navOrder = ['home', 'evenimente', 'board', 'facultate', 'studenti', 'gallery'];
        let currentViewId = document.documentElement.dataset.view || resolveViewFromPath(location.pathname) || 'home';
        // Verificată LA FIECARE navigare (nu memorată o singură dată la încărcarea paginii):
        // comutatorul de accesibilitate poate fi activat chiar în timpul sesiunii curente,
        // fără reload, deci o constantă calculată o singură dată la parse ar rămâne cu
        // valoarea veche. Ține cont atât de preferința sistemului, cât și de cea proprie a
        // site-ului — dacă verificam doar media query-ul de sistem, activarea opțiunii DOAR
        // din panoul de accesibilitate tot lăsa să ruleze animația de swipe/acoperire (CSS-ul
        // de reduce-motion îi reducea durata la ~0, dar location.href tot era amânat cu
        // setTimeout-ul normal de 360ms, deci ecranul rămânea acoperit, static, cu bara mov,
        // cât timp dura acel timeout — reziduul raportat).
        function isReducedMotion() {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
            try {
                return !!JSON.parse(localStorage.getItem('ssicA11yPrefs') || '{}').reduceMotion;
            } catch (e) { return false; }
        }

        function resolveViewFromPath(pathname) {
            const stripped = baseUrl ? pathname.replace(new RegExp('^' + baseUrl.replace(/\//g, '\\/')), '') : pathname;
            const clean = (stripped === '' || stripped === '/') ? '/' : (stripped.endsWith('/') ? stripped : stripped + '/');
            const viewUrlsRaw = { home: '/', evenimente: '/evenimente/', board: '/board/', facultate: '/facultate/', studenti: '/studenti/', gallery: '/gallery/' };
            for (const key in viewUrlsRaw) { if (viewUrlsRaw[key] === clean) return key; }
            return null;
        }

        // Navbar-ul stă ascuns doar pe Acasă, cât timp ești sus de tot (hero fullscreen).
        // Pe orice altă pagină navbar-ul e mereu vizibil (nu au hero, ci page-content cu padding pt. el).
        // Pe desktop (dispozitive cu mouse), navbar-ul mai apare și dacă mișcăm cursorul
        // aproape de marginea de sus a ecranului, chiar dacă n-am scrollat deloc.
        const supportsHoverNav = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        let mouseNearTop = false;
        let lastHomeScrollTop = 0;

        function updateNavForView(viewId, scrollTop = 0) {
            const navEl = document.querySelector('nav');
            if (!navEl) return;
            const revealedByCursor = supportsHoverNav && viewId === 'home' && mouseNearTop;
            const shouldHide = (viewId === 'home' && scrollTop < 24 && !revealedByCursor);
            navEl.classList.toggle('nav-hidden', shouldHide);
        }

        if (supportsHoverNav) {
            document.addEventListener('mousemove', (e) => {
                if (currentViewId !== 'home') return;
                const near = e.clientY < 120;
                if (near !== mouseNearTop) {
                    mouseNearTop = near;
                    updateNavForView('home', lastHomeScrollTop);
                }
            });
        }

        function resetScrollProgress() {
            const fill = document.getElementById('scrollProgressFill');
            if (fill) fill.style.width = '0%';
        }

        // Navigare reală (MPA), dar cu aceeași "senzație" de swipe LTR/RTL ca-n monolit:
        // acoperim ecranul cu bara (direcția depinde de poziția în navOrder), apoi abia
        // după aia navigăm efectiv la noul URL. sessionStorage duce direcția mai departe,
        // ca pagina nouă să știe cum să se "descopere" la încărcare (vezi scriptul sincron
        // de lângă #swiper, sus în <body>, și applySwipeEntrance() mai jos).
        function goToUrl(url, targetView) {
            const view = targetView || resolveViewFromPath(new URL(url, location.href).pathname);
            const swiper = document.getElementById('swiper');
            if (!view || view === currentViewId || !swiper || isReducedMotion()) {
                location.href = url;
                return;
            }
            haptic(10);
            const dir = navOrder.indexOf(view) > navOrder.indexOf(currentViewId) ? 'ltr' : 'rtl';
            try { sessionStorage.setItem('ssicSwipeDir', dir); } catch (e) { /* ignorăm */ }

            swiper.className = 'swipe-container';
            void swiper.offsetWidth;
            swiper.classList.add('swipe-' + dir, 'covering');

            setTimeout(() => { location.href = url; }, 360);
        }

        // navigate() rămâne ca funcție (nu doar location.href direct), ca restul codului
        // (goToDept, rezultatele din căutare) să rămână neschimbat ca formă.
        function navigate(targetId) {
            if (targetId === currentViewId) return;
            goToUrl(viewUrls[targetId] || '/', targetId);
        }

        // Interceptăm orice click pe un <a> intern care duce spre o altă pagină a site-ului
        // (nav, logo, meniul mobil ...) ca să rulăm swipe-ul de mai sus în loc de un salt sec.
        // Linkurile care au deja propriul onclick+preventDefault (ex. cele din footer, care
        // cheamă goToDept) sunt sărite automat, prin verificarea e.defaultPrevented.
        document.addEventListener('click', (e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            const a = e.target.closest('a[href]');
            if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
            let url;
            try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
            if (url.origin !== location.origin) return;
            const targetView = resolveViewFromPath(url.pathname);
            if (!targetView || targetView === currentViewId) return; // ancoră pe aceeași pagină — comportament normal
            e.preventDefault();
            goToUrl(url.pathname + url.hash, targetView);
        });

        // La încărcare: dacă am ajuns aici cu o direcție de swipe "în așteptare" (setată de
        // goToUrl() pe pagina anterioară), bara e deja randată acoperind ecranul (vezi
        // scriptul sincron de sus); acum o "descoperim" cu o mică animație, dezvăluind pagina.
        (function applySwipeEntrance() {
            const dir = window.__ssicUncoverDir;
            const swiper = document.getElementById('swiper');
            if (!dir || !swiper) return;
            requestAnimationFrame(() => {
                setTimeout(() => {
                    swiper.classList.remove('covered');
                    swiper.classList.add('uncovering');
                    setTimeout(() => { swiper.className = 'swipe-container'; }, 420);
                }, 40);
            });
        })();

        // Plasă de siguranță pt. bfcache: dacă utilizatorul dă "înapoi"/"înainte" din browser,
        // pagina poate reveni din back/forward-cache exact în starea DOM de la momentul în care
        // a fost părăsită — inclusiv la mijlocul animației de "covering" (ecran acoperit de bară),
        // dacă tocmai plecase de pe ea printr-un click intern chiar când s-a apăsat "înapoi".
        // Fără reset, bara rămâne "înghețată" peste tot ecranul și pagina pare complet blocată
        // (exact genul de blocaj vechi de la navbar, dar acum pe swiper). La orice revenire din
        // bfcache (event.persisted), curățăm swiper-ul necondiționat, ca pagina să fie mereu
        // vizibilă, indiferent în ce stare a rămas la ieșire.
        window.addEventListener('pageshow', (e) => {
            if (!e.persisted) return;
            const swiper = document.getElementById('swiper');
            if (swiper) swiper.className = 'swipe-container';
        });

        /* ==========================================================================
           JS: Deep-link la încărcarea paginii — dacă URL-ul are un #hash (ex.
           /board/#dept-pr, venit dintr-un link din footer sau din căutare), deschidem
           tab-ul corect și derulăm la elementul țintă. sessionStorage e folosit pt. a
           duce peste navigare numele exact al persoanei căutate (vezi selectResult mai jos).
           ========================================================================== */
        (function applyDeepLinkFromHash() {
            const hash = (location.hash || '').slice(1);
            const deptOrder = ['dept-cd', 'dept-hr', 'dept-pr', 'dept-fr', 'dept-ev'];
            const facOrder = ['fac-conducere', 'fac-senatori', 'fac-consilieri'];

            if (hash && deptOrder.includes(hash) && document.getElementById('nav-board')) {
                const tabs = document.querySelectorAll('#nav-board .horizontal-tab');
                const tabEl = tabs[deptOrder.indexOf(hash)];
                if (tabEl && typeof switchDept === 'function') switchDept(hash, tabEl);
            } else if (hash && facOrder.includes(hash) && document.getElementById('nav-facultate')) {
                const tabs = document.querySelectorAll('#nav-facultate .horizontal-tab');
                const tabEl = tabs[facOrder.indexOf(hash)];
                if (tabEl && typeof switchFac === 'function') switchFac(hash, tabEl);
            } else if (hash && /^ev-\d+$/.test(hash) && document.getElementById('nav-evenimente')) {
                const index = parseInt(hash.split('-')[1], 10);
                const tab = document.querySelectorAll('#nav-evenimente .horizontal-tab')[index];
                if (tab && typeof switchEventItem === 'function') switchEventItem('event', index, tab);
            } else if (hash === 'evsub-calendar' && document.getElementById('nav-evenimente')) {
                const calTab = document.querySelector('#nav-evenimente .horizontal-tab:last-child');
                if (calTab && typeof switchEventItem === 'function') switchEventItem('calendar', null, calTab);
            }

            // Nume de persoană dus peste navigare (setat din selectResult, la un rezultat
            // de căutare aflat pe altă pagină decât cea curentă).
            let targetName = null;
            try { targetName = sessionStorage.getItem('ssicScrollTarget'); sessionStorage.removeItem('ssicScrollTarget'); } catch (e) { /* ignorăm */ }

            setTimeout(() => {
                let scrollTarget = null;
                if (targetName) {
                    scrollTarget = Array.from(document.querySelectorAll('.team-name'))
                        .find(el => el.textContent.trim() === targetName)?.closest('.team-member') || null;
                }
                if (!scrollTarget && hash) {
                    scrollTarget = document.getElementById(hash);
                }
                if (scrollTarget) {
                    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    if (targetName) {
                        scrollTarget.classList.add('search-target-highlight');
                        setTimeout(() => scrollTarget.classList.remove('search-target-highlight'), 2300);
                    }
                }
            }, 150);

            updateNavForView(currentViewId, 0);
        })();

        /* ==========================================================================
           JS: Interactivitate & Carusele Punctate
           ========================================================================== */
        
        // Poze evenimente lipsă (assets/events/ încă necompletat sau un fișier individual
        // absent): slide-ul dispare, ca până acum — dar dacă TOATE pozele unui carusel lipsesc,
        // rămânea o cutie goală, rotunjită, fără nimic vizibil în ea (arăta "stricat", nu
        // pur și simplu absent). Acum, dacă un carusel ajunge la 0 slide-uri, ascundem tot
        // containerul (poză + puncte), nu doar poza individuală.
        function handleEventImgError(img) {
            const slide = img.closest('.carousel-slide');
            const container = img.closest('.carousel-container');
            if (slide) slide.remove();
            if (container) {
                const track = container.querySelector('.carousel-track');
                if (track && track.children.length === 0) container.style.display = 'none';
            }
        }

        // Setup Carusele (drag to scroll & dots sync)
        function initDraggableCarousel(trackId, dotsId) {
            const track = document.getElementById(trackId);
            const dotsContainer = document.getElementById(dotsId);
            if(!track || !dotsContainer) return;

            const dots = dotsContainer.querySelectorAll('.carousel-dot');

            track.addEventListener('scroll', () => {
                let index = Math.round(track.scrollLeft / track.offsetWidth);
                if (index >= dots.length) index = dots.length - 1;
                if (index < 0) index = 0;
                
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === index);
                });
            });

            let isD = false, sX, sL;
            track.onmousedown = e => { isD = true; sX = e.pageX - track.offsetLeft; sL = track.scrollLeft; cursor.classList.add('hovering'); };
            track.onmouseleave = () => { isD = false; cursor.classList.remove('hovering'); };
            track.onmouseup = () => { isD = false; cursor.classList.remove('hovering'); };
            track.onmousemove = e => { if(!isD) return; e.preventDefault(); track.scrollLeft = sL - (e.pageX - track.offsetLeft - sX)*2; };
        }
        
        initDraggableCarousel('carousel-ev0', 'dots-ev0');
        initDraggableCarousel('carousel-ev1', 'dots-ev1');
        initDraggableCarousel('carousel-ev2', 'dots-ev2');

        /* ==========================================================================
           JS: Tranziție crossfade+slide pentru conținutul de tab (fără salt instant)
           ========================================================================== */
        function swapTabPanel(allPanels, nextPanel) {
            // Curățăm FORȚAT orice alt panou din grup (nu doar cel presupus "curent"), ca stările
            // rămase blocate (ex. tab schimbat rapid, sau animationend care nu se declanșează pe
            // Safari/iOS când panoul devine invizibil în timpul animației) să nu mai rămână vizibile
            // la nesfârșit — asta cauza glitch-ul unde textele de la mai multe evenimente apăreau
            // suprapuse pe iPhone.
            allPanels.forEach(panel => {
                if (panel === nextPanel) return;
                if (!panel.classList.contains('active') && !panel.classList.contains('tab-leaving')) return;
                panel.classList.remove('active');
                panel.classList.add('tab-leaving');
                // Dacă panoul ăsta avea deja un cleanup de la un ciclu de ieșire anterior,
                // întrerupt de un click rapid (ex. A -> B -> A -> B în mai puțin de 300ms),
                // îl anulăm explicit înainte să pornim unul nou — altfel rămâneau două
                // cleanup-uri "în cursă" pe același element, cu risc real ca cel vechi să
                // șteargă starea nou-setată mai jos, la nextPanel.
                if (panel._tabCleanup) {
                    panel.removeEventListener('animationend', panel._tabCleanup);
                    clearTimeout(panel._tabTimeout);
                }
                // BUG GĂSIT (raport: "dispare textul cand dai back and forth pe evenimente si
                // calendar"): mai jos scoatem 'active' și adăugăm 'tab-leaving' pe același
                // element, în aceeași secvență sincronă de JS. Safari/iOS nu retrigger-uiește
                // fiabil o animație CSS dacă între cele două schimbări de clasă browserul n-a
                // apucat să randeze niciun cadru — vede doar starea finală, nu și tranziția prin
                // "fără clasă", deci animația nouă (tabLeave) pornește din starea calculată a
                // vechii animații întreruptă la mijloc, nu de la 0%, și la comutare rapidă
                // înapoi (mai jos, unde readăugăm 'active') pățește la fel: animația tabEnter nu
                // repornește de la opacity:0, rămâne "înghețată" acolo unde a fost întreruptă —
                // uneori chiar la opacity redusă/invizibilă. void panel.offsetWidth forțează un
                // reflow imediat între cele două clase, obligând browserul să "vadă" efectiv
                // starea intermediară și să repornească animația corect de fiecare dată.
                void panel.offsetWidth;
                let done = false;
                const cleanup = () => {
                    if (done) return;
                    done = true;
                    panel.classList.remove('tab-leaving');
                    panel.removeEventListener('animationend', cleanup);
                    if (panel._tabCleanup === cleanup) panel._tabCleanup = null;
                };
                panel._tabCleanup = cleanup;
                panel.addEventListener('animationend', cleanup);
                // Plasă de siguranță: dacă animationend nu se declanșează deloc (posibil pe iOS
                // când panoul iese din ecran/din DOM randat înainte ca animația să se termine),
                // forțăm curățarea oricum, puțin după durata animației (300ms).
                panel._tabTimeout = setTimeout(cleanup, 300);
            });
            if (nextPanel) {
                // Panoul care redevine activ poate fi el însuși încă "pe jumătate" în propria
                // animație de ieșire, dacă utilizatorul a comutat dus-întors suficient de rapid
                // (ex. Evenimente -> Calendar -> Evenimente, toate în mai puțin de 300ms) — avea
                // deci un cleanup vechi încă în așteptare (listener + setTimeout), care mai
                // târziu i-ar fi scos clasa 'active'/'tab-leaving' pe la spate și ar fi lăsat
                // conținutul invizibil. Îl anulăm explicit înainte să-l marcăm activ din nou.
                if (nextPanel._tabCleanup) {
                    nextPanel.removeEventListener('animationend', nextPanel._tabCleanup);
                    clearTimeout(nextPanel._tabTimeout);
                    nextPanel._tabCleanup = null;
                }
                nextPanel.classList.remove('tab-leaving');
                // Același fix de reflow forțat ca mai sus (vezi comentariul de acolo) — altfel
                // Safari/iOS poate să nu repornească animația tabEnter la reactivare rapidă,
                // lăsând panoul "înghețat" la opacitatea la care rămăsese din tranziția
                // întreruptă anterior, deci textul pare că a dispărut.
                void nextPanel.offsetWidth;
                if (!nextPanel.classList.contains('active')) nextPanel.classList.add('active');
                // Plasă de siguranță: dacă panoul nou-activat are iconițe <i data-lucide> care
                // n-au apucat să fie convertite în SVG la încărcarea paginii (ex. conținut
                // adăugat/schimbat rapid, imediat după DOMContentLoaded), le randăm acum —
                // altfel rămâneau spații goale în loc de iconițe (calendarul din Evenimente,
                // de exemplu) până la următoarea acțiune care apela createIcons() din altă parte.
                if (window.lucide) lucide.createIcons();
                if (typeof observeReveals === 'function') observeReveals();
                // Fix real pt. bug-ul de comutare rapidă (Evenimente <-> Calendar, dar afectează
                // orice tab): elementele .reveal așteaptă IntersectionObserver-ul de scroll ca să
                // devină vizibile (opacity 0 -> 1). La un tab abia deschis prin click, conținutul
                // e deja pe ecran — n-are niciun motiv să mai aștepte după intersecție. Dacă
                // utilizatorul comută mai repede decât apucă browser-ul să calculeze intersecția
                // (ex. click-click-click rapid între Evenimente și Calendar), acel calcul poate
                // fi "sărit" complet cât timp panoul era ascuns, iar elementul rămânea blocat la
                // opacity:0 pentru totdeauna — exact bug-ul raportat ("nu mai e text la
                // calendar"). Soluția: la fiecare activare de tab, marcăm direct .is-visible pe
                // tot ce e .reveal în panoul nou-activat, fără să mai așteptăm observer-ul.
                //
                // Dublu requestAnimationFrame, NU adăugare sincronă: dacă puneam .is-visible în
                // aceeași secvență sincronă cu .active (fără niciun cadru de randare între ele),
                // browserul nu mai avea ce stare "de dinainte" să anime — sărea direct la
                // rezultatul final, adică textul apărea brusc, dintr-o dată ("sare aiurea"), în
                // loc de fade-ul lin, "fancy", pe care îl are la încărcarea inițială a paginii
                // (acolo IntersectionObserver-ul are, natural, cadre de randare între stările
                // opacity:0 și opacity:1). Cele două rAF-uri imbricate garantează un cadru complet
                // randat cu opacity:0 înainte să cerem tranziția spre opacity:1, deci tab-urile
                // primesc exact aceeași animație lină ca restul site-ului, nu doar o apariție
                // instantă.
                const revealTargets = nextPanel.querySelectorAll('.reveal:not(.is-visible)');
                revealTargets.forEach(el => el.classList.add('is-observed'));
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        revealTargets.forEach(el => el.classList.add('is-visible'));
                    });
                });
            }
        }

        // Sub-tab-uri Evenimente (nivel superior: "Evenimente" flagship vs. "Calendar"),
        // folosind același sistem orizontal + crossfade ca restul paginii.
        function switchEventSub(id, el) {
            if (el.classList.contains('active')) return;
            haptic(8);
            document.querySelectorAll('#nav-evenimente-sub .horizontal-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');

            const panels = document.querySelectorAll('#view-evenimente .evsub');
            const next = document.getElementById(id);
            swapTabPanel(panels, next);
        }

        // Tab-uri Evenimente (folosind sistemul orizontal)
        function switchEvent(index, el) {
            if (el.classList.contains('active')) return;
            haptic(8);
            document.querySelectorAll('#nav-evenimente .horizontal-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');

            const panels = document.querySelectorAll('#view-evenimente .event-content-wrapper');
            const next = document.getElementById(`ev-${index}`);
            swapTabPanel(panels, next);
        }

        // Tab-uri Board (folosind sistemul orizontal)
        function switchDept(id, el) {
            if (el.classList.contains('active')) return;
            haptic(8);
            document.querySelectorAll('#nav-board .horizontal-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');

            const panels = document.querySelectorAll('#view-board .board-dept');
            const next = document.getElementById(id);
            swapTabPanel(panels, next);
        }

        // Tab-uri Facultate (Conducere / Senatori / Consilieri), folosind același sistem orizontal
        function switchFac(id, el) {
            if (el.classList.contains('active')) return;
            haptic(8);
            document.querySelectorAll('#nav-facultate .horizontal-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');

            const panels = document.querySelectorAll('#view-facultate .board-dept');
            const next = document.getElementById(id);
            swapTabPanel(panels, next);
        }

        // Tab-uri Studenți (Cămine / Tips & Tricks / Ghidul Bobocului / Hartă), folosind același sistem orizontal.
        // Harta Leaflet e inițializată lazy, doar când tab-ul "Hartă" devine activ prima dată —
        // Leaflet nu poate calcula dimensiuni corecte pe un container ascuns (display:none).
        function switchStudent(id, el) {
            if (el.classList.contains('active')) return;
            haptic(8);
            document.querySelectorAll('#nav-studenti .horizontal-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');

            const panels = document.querySelectorAll('#view-studenti .board-dept');
            const next = document.getElementById(id);
            swapTabPanel(panels, next);

            if (id === 'stu-harta') {
                // Așteptăm ca Leaflet să se încarce (dacă nu era deja) înainte să inițializăm
                // harta — vezi loadLeaflet() mai sus.
                loadLeaflet().then(() => {
                    if (typeof initRealMap === 'function') initRealMap();
                    // Containerul tocmai a devenit vizibil — Leaflet trebuie anunțat să-și
                    // recalculeze dimensiunile, altfel afișează doar un colț din tile-uri.
                    setTimeout(() => { if (window.studentMapInstance) window.studentMapInstance.invalidateSize(); }, 260);
                });
            }
        }

        /* ==========================================================================
           JS: Link-uri directe către un departament (folosit din footer, "Structură")
           ==========================================================================
           Duce direct pe pagina Board ȘI comută pe tab-ul departamentului cerut, fără
           ca vizitatorul să mai trebuiască să navigheze manual și să caute tab-ul. */
        function goToDept(deptId) {
            haptic(10);
            if (currentViewId !== 'board') {
                goToUrl(baseUrl + '/board/#' + deptId, 'board');
                return;
            }
            const deptOrder = ['dept-cd', 'dept-hr', 'dept-pr', 'dept-fr', 'dept-ev'];
            const tabs = document.querySelectorAll('#nav-board .horizontal-tab');
            const tabEl = tabs[deptOrder.indexOf(deptId)];
            if (tabEl) switchDept(deptId, tabEl);
            const view = document.getElementById('view-board');
            if (view) view.scrollTop = 0;
            closeMobileNav();
        }

        /* ==========================================================================
           JS: Scroll delegat — bară de progres + navbar ascuns pe Acasă până la scroll
           (evenimentul 'scroll' nu urcă prin bubbling, deci ascultăm în faza de capture
           pe document, ca să prindem scroll-ul din interiorul oricărui .view activ)
           ========================================================================== */
        const scrollProgressFill = document.getElementById('scrollProgressFill');
        document.addEventListener('scroll', (e) => {
            const el = e.target;
            if (!el.classList || !el.classList.contains('view')) return;

            const max = el.scrollHeight - el.clientHeight;
            const pct = max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0;
            if (scrollProgressFill) scrollProgressFill.style.width = pct + '%';

            if (el.id === 'view-home') {
                lastHomeScrollTop = el.scrollTop;
                updateNavForView('home', el.scrollTop);
            }
        }, true);

        // Stare inițială a navbar-ului: currentViewId vine direct din front matter-ul
        // paginii Jekyll curente (setat mai sus), deci navbar-ul e corect de la primul
        // frame, indiferent pe ce pagină ai intrat direct (ex. ssic.ro/board/).
        updateNavForView(currentViewId, 0);

        function animateCount(el) {
            if (el.dataset.counted) return;
            el.dataset.counted = '1';
            const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 1400;
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        }

        // Generare fix 24 Poze în Galerie
        const galContainer = document.getElementById('gallery-container');
        if(galContainer) {
            let html = '';
            const aspects = [1.2, 0.8, 1.5, 0.7, 1.1, 1.4, 0.9, 1.3, 0.6, 1.0, 1.25, 0.85, 1.45, 0.75, 1.15, 1.35, 0.95, 1.6, 0.65, 1.05, 1.2, 0.8, 1.5, 0.7];
            for(let i=0; i<24; i++) {
                const delay = (i % 6) * 0.08;
                // Caută automat assets/gallery/1.jpg, 2.jpg, ... 24.jpg. Dacă fișierul nu există,
                // imaginea se șterge singură și rămâne iconița decorativă (fără poză spartă vizibil).
                html += `<div class="gal-item hover-target reveal" style="--aspect: ${aspects[i]}; --r-delay: ${delay}s;"><img src="${baseUrl}/assets/gallery/${i + 1}.jpg" alt="Fotografie din galeria SSIC" loading="lazy" decoding="async" onerror="this.remove()"></div>`;
            }
            galContainer.innerHTML = html;
            observeReveals();
        }

        /* ==========================================================================
           JS: POZE ECHIPĂ — completate automat după numele fiecărui membru
           ==========================================================================
           Pentru fiecare membru din Board/Facultate/Studenți, scriptul deduce singur numele
           fișierului din textul afișat (ex. "Constantin Alexandru" → "constantin-alexandru",
           diacriticele fiind scoase automat) și caută poza în assets/team/, încercând pe rând
           .jpg, .jpeg și .png — ca să nu conteze formatul în care primești poza de la cineva.
           Dacă niciuna dintre cele 3 nu există, rămâne vizibil gradientul + iconița de siluetă
           (fără eroare vizibilă). Un singur folder, un singur tipar, valabil pe orice pagină —
           nu trebuie editat niciun .html ca să adaugi/schimbi o poză, doar pui fișierul în
           assets/team/, denumit după acest tipar. */
        function slugifyName(name) {
            return name.trim().toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // scoate diacriticele (ă, â, î, ș, ț)
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }
        const TEAM_PHOTO_EXTS = ['jpg', 'jpeg', 'png'];
        document.querySelectorAll('.team-member').forEach(member => {
            const nameEl = member.querySelector('.team-name');
            const photoEl = member.querySelector('.team-photo');
            if (!nameEl || !photoEl) return;
            const slug = slugifyName(nameEl.textContent);
            const img = document.createElement('img');
            img.alt = nameEl.textContent.trim();
            img.loading = 'lazy';
            img.decoding = 'async';
            let extIndex = 0;
            img.onerror = function () {
                extIndex++;
                if (extIndex < TEAM_PHOTO_EXTS.length) {
                    img.src = `${baseUrl}/assets/team/${slug}.${TEAM_PHOTO_EXTS[extIndex]}`;
                } else {
                    img.remove();
                }
            };
            img.src = `${baseUrl}/assets/team/${slug}.${TEAM_PHOTO_EXTS[0]}`;
            photoEl.appendChild(img);
        });

        /* ==========================================================================
           JS: INSTAGRAM — embed manual (fără API)
           ==========================================================================
           Nu mai e nevoie de niciun cod aici: dacă lipești un <blockquote class="instagram-media">
           în HTML (vezi instrucțiunile de lângă IG-EMBED-START/END, mai sus în pagină), scriptul
           oficial embed.js (încărcat mai jos) îl detectează și îl transformă automat în postarea
           reală, cu poză și caption. Cât timp nu există niciun blockquote, rămâne vizibil cardul
           de rezervă cu link către profil.
        */

        /* ==========================================================================
           JS: EASTER EGGS (Click Explozii menționate: murakami & patru)
           ========================================================================== */
        let clkM = 0;
        let clkP = 0;
        let eggTimeout = null;

        function triggerEgg(type, event) {
            clearTimeout(eggTimeout);
            eggTimeout = setTimeout(() => { clkM = 0; clkP = 0; }, 3000);

            if (type === 'murakami') {
                clkM++;
                if (clkM >= 6) { createExplosion(event.clientX, event.clientY, ['6', '7']); clkM = 0; }
            } else if (type === 'patru') {
                clkP++;
                if (clkP >= 4) { createExplosion(event.clientX, event.clientY, ['3', '4']); clkP = 0; }
            }
        }

        function createExplosion(x, y, chars) {
            for(let i=0; i<30; i++) {
                let el = document.createElement('div');
                el.className = 'easter-particle';
                el.innerText = chars[Math.floor(Math.random() * chars.length)];
                document.body.appendChild(el);
                
                let angle = Math.random() * Math.PI * 2;
                let velocity = 80 + Math.random() * 150;
                let tx = Math.cos(angle) * velocity;
                let ty = Math.sin(angle) * velocity - 80;
                let rot = (Math.random() - 0.5) * 360 + 'deg';
                
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.setProperty('--tx', `${tx}px`);
                el.style.setProperty('--ty', `${ty}px`);
                el.style.setProperty('--rot', rot);
                
                setTimeout(() => el.remove(), 1200);
            }
        }

        /* ==========================================================================
           JS: SEARCH (Command Palette) — caută secțiuni, evenimente și membri board
           ========================================================================== */
        (function () {
            // Indexul e construit static din conținutul paginii (nume, roluri, evenimente).
            // Fiecare intrare știe cum să "ajungă" la ținta ei: view + (opțional) tab + element de scroll.
            const searchIndex = window.siteData.searchIndex;

            const overlay = document.getElementById('searchOverlay');
            const panel = overlay ? overlay.querySelector('.search-panel') : null;
            const input = document.getElementById('searchInput');
            const resultsEl = document.getElementById('searchResults');
            const openBtn = document.getElementById('navSearchBtn');
            const closeBtn = document.getElementById('searchCloseBtn');
            if (!overlay || !input || !resultsEl || !openBtn) return;

            let activeIndex = -1;
            let currentResults = [];

            const normalize = (str) => str
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // scoate diacriticele (ă, â, î, ș, ț)

            function escapeHtml(str) {
                return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            }

            function highlight(text, query) {
                if (!query) return escapeHtml(text);
                const nText = normalize(text);
                const nQuery = normalize(query);
                const idx = nText.indexOf(nQuery);
                if (idx === -1) return escapeHtml(text);
                return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + query.length)) + '</mark>' + escapeHtml(text.slice(idx + query.length));
            }

            function renderResults(query) {
                const q = normalize(query.trim());
                const filtered = q
                    ? searchIndex.filter(item => normalize(item.title).includes(q) || normalize(item.sub).includes(q) || normalize(item.group).includes(q))
                    : searchIndex.filter(item => item.group === 'Secțiuni'); // fără query: arătăm doar secțiunile principale

                currentResults = filtered;
                activeIndex = filtered.length ? 0 : -1;

                if (!filtered.length) {
                    resultsEl.innerHTML = `<div class="search-empty">Niciun rezultat pentru „${escapeHtml(query)}”</div>`;
                    return;
                }

                let html = '';
                let lastGroup = null;
                filtered.forEach((item, i) => {
                    if (item.group !== lastGroup) {
                        html += `<div class="search-result-group-label">${escapeHtml(item.group)}</div>`;
                        lastGroup = item.group;
                    }
                    // Board / Senatori / Consilieri nu au un URL de poză explicit în index (spre
                    // deosebire de Conducerea Facultății, care are poza de pe chimie.upb.ro), dar
                    // folosesc același tipar de fișier ca și cardurile din pagină: assets/team/<nume-slug>.jpg
                    // (vezi slugifyName mai sus). Dacă poza chiar există acolo, apare și în search;
                    // dacă nu, onerror mai jos cade discret pe iconița generică.
                    const photoSrc = item.photo || ((item.group === 'Board' || item.group === 'Facultate') ? `${baseUrl}/assets/team/${slugifyName(item.title)}.jpg` : null);
                    const iconHtml = photoSrc
                        ? `<div class="search-result-icon search-result-photo"><img src="${photoSrc}" alt="" loading="lazy" decoding="async"></div>`
                        : `<div class="search-result-icon"><i data-lucide="${item.icon}"></i></div>`;
                    html += `
                        <div class="search-result-item${i === 0 ? ' is-active' : ''}" data-index="${i}" role="option">
                            ${iconHtml}
                            <div class="search-result-text">
                                <div class="search-result-title">${highlight(item.title, query)}</div>
                                <div class="search-result-sub">${escapeHtml(item.sub)}</div>
                            </div>
                        </div>`;
                });
                resultsEl.innerHTML = html;
                if (window.lucide) lucide.createIcons({ root: resultsEl });

                resultsEl.querySelectorAll('.search-result-item').forEach(el => {
                    el.addEventListener('click', () => selectResult(parseInt(el.dataset.index, 10)));
                });
                resultsEl.querySelectorAll('.search-result-photo img').forEach(img => {
                    img.addEventListener('error', function () {
                        const box = this.closest('.search-result-icon');
                        const item = filtered[parseInt(box.closest('.search-result-item').dataset.index, 10)];
                        box.classList.remove('search-result-photo');
                        box.innerHTML = `<i data-lucide="${item.icon}"></i>`;
                        if (window.lucide) lucide.createIcons({ root: box });
                    });
                });
            }

            function setActive(i) {
                const items = resultsEl.querySelectorAll('.search-result-item');
                items.forEach(el => el.classList.remove('is-active'));
                if (items[i]) {
                    items[i].classList.add('is-active');
                    items[i].scrollIntoView({ block: 'nearest' });
                }
                activeIndex = i;
            }

            function selectResult(i) {
                const item = currentResults[i];
                if (!item) return;
                haptic(10);
                closeSearch();

                if (currentViewId !== item.view) {
                    // Rezultatul e pe altă pagină: navigăm real către URL-ul ei, cu un #hash
                    // pentru tab-ul corect, iar dacă e o persoană anume, îi trecem numele prin
                    // sessionStorage ca pagina nouă să știe exact la cine să deruleze/evidențieze.
                    const hash = item.targetId || item.deptId || item.facDeptId || '';
                    if (item.deptId || item.facDeptId) {
                        try { sessionStorage.setItem('ssicScrollTarget', item.title); } catch (e) { /* ignorăm */ }
                    }
                    goToUrl((viewUrls[item.view] || '/') + (hash ? '#' + hash : ''), item.view);
                    return;
                }

                // Rezultatul e chiar pe pagina curentă: comutăm tab-ul și derulăm pe loc,
                // fără nicio navigare de pagină.
                if (item.eventIndex !== undefined) {
                    const tab = document.querySelector(`#nav-evenimente .horizontal-tab:nth-child(${item.eventIndex + 1})`);
                    if (tab && typeof switchEventItem === 'function') switchEventItem('event', item.eventIndex, tab);
                }
                if (item.deptId && typeof switchDept === 'function') {
                    const tabs = document.querySelectorAll('#nav-board .horizontal-tab');
                    const deptOrder = ['dept-cd', 'dept-hr', 'dept-pr', 'dept-fr', 'dept-ev'];
                    const tabEl = tabs[deptOrder.indexOf(item.deptId)];
                    if (tabEl) switchDept(item.deptId, tabEl);
                }
                if (item.facDeptId && typeof switchFac === 'function') {
                    const tabs = document.querySelectorAll('#nav-facultate .horizontal-tab');
                    const facOrder = ['fac-conducere', 'fac-senatori', 'fac-consilieri'];
                    const tabEl = tabs[facOrder.indexOf(item.facDeptId)];
                    if (tabEl) switchFac(item.facDeptId, tabEl);
                }

                let scrollTarget = null;
                const groupId = item.deptId || item.facDeptId;
                if (item.targetId) {
                    scrollTarget = document.getElementById(item.targetId);
                } else if (groupId) {
                    const group = document.getElementById(groupId);
                    if (group) {
                        scrollTarget = Array.from(group.querySelectorAll('.team-name'))
                            .find(el => el.textContent.trim() === item.title)?.closest('.team-member') || null;
                    }
                }
                if (scrollTarget) {
                    setTimeout(() => {
                        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 120);
                }
            }

            function openSearch() {
                haptic(10);
                overlay.classList.add('open');
                openBtn.setAttribute('aria-expanded', 'true');
                renderResults('');
                input.value = '';
                setTimeout(() => input.focus(), 50);
            }

            function closeSearch() {
                overlay.classList.remove('open');
                openBtn.setAttribute('aria-expanded', 'false');
            }

            openBtn.addEventListener('click', openSearch);
            closeBtn.addEventListener('click', closeSearch);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });

            input.addEventListener('input', () => renderResults(input.value));

            document.addEventListener('keydown', (e) => {
                if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    overlay.classList.contains('open') ? closeSearch() : openSearch();
                    return;
                }
                if (!overlay.classList.contains('open')) return;
                if (e.key === 'Escape') { closeSearch(); }
                else if (e.key === 'ArrowDown') { e.preventDefault(); if (currentResults.length) setActive((activeIndex + 1) % currentResults.length); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); if (currentResults.length) setActive((activeIndex - 1 + currentResults.length) % currentResults.length); }
                else if (e.key === 'Enter') { e.preventDefault(); if (activeIndex > -1) selectResult(activeIndex); }
            });
        })();

// Initialize all Lucide icons on page load (including static footer, navbar, etc.)
document.addEventListener('DOMContentLoaded', function() {
    if (window.lucide) lucide.createIcons();
});