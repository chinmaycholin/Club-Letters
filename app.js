/**
 * Automated Letter Generator Frontend Controller
 * Manages UI interactions, local storage configurations, AI endpoints, and printing.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Theme Toggle Logic
    const btnThemeToggle = document.getElementById('btnThemeToggle');
    const moonSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" /></svg>`;

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            if (btnThemeToggle) btnThemeToggle.innerHTML = sunSvg;
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            if (btnThemeToggle) btnThemeToggle.innerHTML = moonSvg;
            localStorage.setItem('theme', 'light');
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('light');
    }

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', () => {
            if (document.body.classList.contains('dark-theme')) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }

    // UI Elements
    const dateInput = document.getElementById('date');
    const recipientSelect = document.getElementById('recipientSelect');
    const customRecipientGroup = document.getElementById('customRecipientGroup');
    const customRecipient = document.getElementById('customRecipient');
    const subjectInput = document.getElementById('subject');
    const promptInput = document.getElementById('prompt');
    const toneSelect = document.getElementById('tone');

    const btnGenerate = document.getElementById('btnGenerate');
    const btnEdit = document.getElementById('btnEdit');
    const btnPrint = document.getElementById('btnPrint');
    const btnShare = document.getElementById('btnShare');
    const btnSettings = document.getElementById('btnSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');

    const settingsModal = document.getElementById('settingsModal');
    const geminiKeyInput = document.getElementById('geminiKey');
    const letterContainer = document.getElementById('letterContainer');
    const editingStatus = document.getElementById('editingStatus');
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loaderText');

    // State
    let isEditing = false;
    let generatedBodyRaw = "";

    // Initialize default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;

    // Load saved settings
    const savedGeminiKey = localStorage.getItem('gemini_api_key');
    if (savedGeminiKey) {
        geminiKeyInput.value = savedGeminiKey;
    }

    // Header Selector Elements
    const headerSelectModal = document.getElementById('headerSelectModal');
    const cardHeaderClub = document.getElementById('cardHeaderClub');
    const cardHeaderEvent = document.getElementById('cardHeaderEvent');
    const btnSwitchHeader = document.getElementById('btnSwitchHeader');
    const activeHeaderLabel = document.getElementById('activeHeaderLabel');
    const a4Paper = document.getElementById('a4Paper');

    // Onboarding welcome popup elements
    const welcomeModal = document.getElementById('welcomeModal');
    const btnGoToSettings = document.getElementById('btnGoToSettings');
    const btnExploreFirst = document.getElementById('btnExploreFirst');

    function applyHeader(type, isInitial = false) {
        const headerUrl = type === 'event' ? 'header/event.png' : 'header/header.png';
        const label = type === 'event' ? 'Event Header' : 'Club Header';

        // Update CSS variable and element styles for both viewport and @media print
        document.documentElement.style.setProperty('--active-header-url', `url("${headerUrl}")`);
        if (a4Paper) {
            a4Paper.style.setProperty('background-image', `url("${headerUrl}")`, 'important');
        }

        if (activeHeaderLabel) {
            activeHeaderLabel.textContent = (window.innerWidth <= 680)
                ? (type === 'event' ? 'Event' : 'Club')
                : label;
        }

        if (cardHeaderClub) cardHeaderClub.classList.toggle('selected', type !== 'event');
        if (cardHeaderEvent) cardHeaderEvent.classList.toggle('selected', type === 'event');

        localStorage.setItem('has_selected_header', 'true');
        localStorage.setItem('selected_header_type', type);

        if (headerSelectModal) {
            headerSelectModal.classList.remove('active');

            // If user hasn't configured API key yet, show the onboarding modal after selection
            if (!savedGeminiKey && welcomeModal) {
                welcomeModal.classList.add('active');
            }
        }
    }

    // Initialize with stored or default header
    const hasSelectedHeader = localStorage.getItem('has_selected_header');
    const storedHeader = localStorage.getItem('selected_header_type') || 'club';
    applyHeader(storedHeader, true);

    // Only show header selection modal if user has NEVER chosen a header yet
    if (!hasSelectedHeader && headerSelectModal) {
        headerSelectModal.classList.add('active');
    } else if (headerSelectModal) {
        headerSelectModal.classList.remove('active');
    }

    if (cardHeaderClub) {
        cardHeaderClub.addEventListener('click', () => applyHeader('club'));
        cardHeaderClub.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                applyHeader('club');
            }
        });
    }

    if (cardHeaderEvent) {
        cardHeaderEvent.addEventListener('click', () => applyHeader('event'));
        cardHeaderEvent.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                applyHeader('event');
            }
        });
    }

    if (btnSwitchHeader) {
        btnSwitchHeader.addEventListener('click', () => {
            if (headerSelectModal) {
                headerSelectModal.classList.add('active');
            }
        });
    }

    if (btnGoToSettings) {
        btnGoToSettings.addEventListener('click', () => {
            if (welcomeModal) welcomeModal.classList.remove('active');
            if (settingsModal) settingsModal.classList.add('active');
        });
    }

    if (btnExploreFirst) {
        btnExploreFirst.addEventListener('click', () => {
            if (welcomeModal) welcomeModal.classList.remove('active');
        });
    }

    // Mobile View Tab Switcher Logic
    const dashboardContainer = document.getElementById('dashboardContainer');
    const tabBtnParams = document.getElementById('tabBtnParams');
    const tabBtnPreview = document.getElementById('tabBtnPreview');
    const btnBackToParams = document.getElementById('btnBackToParams');

    function switchMobileView(view) {
        if (!dashboardContainer) return;
        if (view === 'preview') {
            dashboardContainer.classList.remove('view-params');
            dashboardContainer.classList.add('view-preview');
            if (tabBtnParams) tabBtnParams.classList.remove('active');
            if (tabBtnPreview) tabBtnPreview.classList.add('active');
            localStorage.setItem('letter_active_mobile_view', 'preview');
            // Set default view of live preview to 55% on mobile
            setZoom(0.55);
        } else {
            dashboardContainer.classList.remove('view-preview');
            dashboardContainer.classList.add('view-params');
            if (tabBtnParams) tabBtnParams.classList.add('active');
            if (tabBtnPreview) tabBtnPreview.classList.remove('active');
            localStorage.setItem('letter_active_mobile_view', 'params');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // Form and Letter State Auto-Save & Restoration
    function saveFormState() {
        localStorage.setItem('letter_form_date', dateInput.value);
        localStorage.setItem('letter_form_recipient', recipientSelect.value);
        localStorage.setItem('letter_form_custom_recipient', customRecipient.value);
        localStorage.setItem('letter_form_subject', subjectInput.value);
        localStorage.setItem('letter_form_prompt', promptInput.value);
        localStorage.setItem('letter_form_tone', toneSelect.value);
    }

    [dateInput, recipientSelect, customRecipient, subjectInput, promptInput, toneSelect].forEach(el => {
        if (el) {
            el.addEventListener('input', saveFormState);
            el.addEventListener('change', saveFormState);
        }
    });

    function restoreSavedState() {
        const savedDate = localStorage.getItem('letter_form_date');
        if (savedDate) dateInput.value = savedDate;

        const savedRecipient = localStorage.getItem('letter_form_recipient');
        if (savedRecipient) {
            recipientSelect.value = savedRecipient;
            if (savedRecipient === 'custom') {
                customRecipientGroup.style.display = 'flex';
                customRecipient.required = true;
            } else {
                customRecipientGroup.style.display = 'none';
                customRecipient.required = false;
            }
        }

        const savedCustomRecipient = localStorage.getItem('letter_form_custom_recipient');
        if (savedCustomRecipient) customRecipient.value = savedCustomRecipient;

        const savedSubject = localStorage.getItem('letter_form_subject');
        if (savedSubject) subjectInput.value = savedSubject;

        const savedPrompt = localStorage.getItem('letter_form_prompt');
        if (savedPrompt) promptInput.value = savedPrompt;

        const savedTone = localStorage.getItem('letter_form_tone');
        if (savedTone) toneSelect.value = savedTone;

        // Restore generated letter if any exists
        const savedLetterHtml = localStorage.getItem('letter_generated_html');
        const savedLetterRaw = localStorage.getItem('letter_generated_raw');
        if (savedLetterHtml && savedLetterHtml.trim()) {
            letterContainer.innerHTML = savedLetterHtml;
            generatedBodyRaw = savedLetterRaw || "";
            btnPrint.disabled = false;
            if (btnShare) btnShare.disabled = false;
            btnEdit.disabled = false;

            const savedMobileView = localStorage.getItem('letter_active_mobile_view');
            if (window.innerWidth <= 960 && savedMobileView === 'preview') {
                switchMobileView('preview');
            }
        }
    }

    restoreSavedState();

    // Reset Form button handler
    const btnClearForm = document.getElementById('btnClearForm');
    if (btnClearForm) {
        btnClearForm.addEventListener('click', () => {
            if (confirm('Start a fresh letter? This will clear the form fields and current letter.')) {
                localStorage.removeItem('letter_form_date');
                localStorage.removeItem('letter_form_recipient');
                localStorage.removeItem('letter_form_custom_recipient');
                localStorage.removeItem('letter_form_subject');
                localStorage.removeItem('letter_form_prompt');
                localStorage.removeItem('letter_form_tone');
                localStorage.removeItem('letter_generated_html');
                localStorage.removeItem('letter_generated_raw');

                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                dateInput.value = `${yyyy}-${mm}-${dd}`;
                recipientSelect.value = "The Principal,\nMalnad College of Engineering,\nHassan - 573202";
                customRecipientGroup.style.display = 'none';
                customRecipient.value = "";
                subjectInput.value = "";
                promptInput.value = "";
                toneSelect.value = "formal";
                letterContainer.innerHTML = "";
                generatedBodyRaw = "";
                btnPrint.disabled = true;
                if (btnShare) btnShare.disabled = true;
                btnEdit.disabled = true;
                if (window.innerWidth <= 960) {
                    switchMobileView('params');
                }
            }
        });
    }

    if (tabBtnParams) {
        tabBtnParams.addEventListener('click', () => switchMobileView('params'));
    }

    if (tabBtnPreview) {
        tabBtnPreview.addEventListener('click', () => switchMobileView('preview'));
    }

    if (btnBackToParams) {
        btnBackToParams.addEventListener('click', () => switchMobileView('params'));
    }

    // Toggle settings modal
    btnSettings.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    // Save Settings
    btnSaveSettings.addEventListener('click', () => {
        const geminiKey = geminiKeyInput.value.trim();

        if (geminiKey) {
            localStorage.setItem('gemini_api_key', geminiKey);
        } else {
            localStorage.removeItem('gemini_api_key');
        }

        alert('Settings saved successfully!');
        settingsModal.classList.remove('active');
    });

    // Recipient selection changes
    recipientSelect.addEventListener('change', () => {
        if (recipientSelect.value === 'custom') {
            customRecipientGroup.style.display = 'flex';
            customRecipient.required = true;
            customRecipient.focus();
        } else {
            customRecipientGroup.style.display = 'none';
            customRecipient.required = false;
        }
    });

    // Main Letter Generation Trigger
    btnGenerate.addEventListener('click', async () => {
        // On mobile devices, immediately switch view to live preview so user sees the generation animation
        if (window.innerWidth <= 960) {
            switchMobileView('preview');
        }

        const geminiApiKey = localStorage.getItem('gemini_api_key');

        if (!geminiApiKey) {
            alert('A Google Gemini API Key is required to generate letters. Opening settings modal...');
            settingsModal.classList.add('active');
            return;
        }

        // Form Validation
        if (!dateInput.value) {
            alert('Please select a letter date.');
            dateInput.focus();
            return;
        }
        if (!subjectInput.value.trim()) {
            alert('Please enter a letter subject.');
            subjectInput.focus();
            return;
        }
        if (!promptInput.value.trim()) {
            alert('Please describe what the letter should say.');
            promptInput.focus();
            return;
        }
        if (recipientSelect.value === 'custom' && !customRecipient.value.trim()) {
            alert('Please fill out the custom recipient address.');
            customRecipient.focus();
            return;
        }

        // Prep data
        let recipientText = recipientSelect.value;
        if (recipientText === 'custom') {
            recipientText = customRecipient.value.trim();
        }

        const dateObj = new Date(dateInput.value);
        const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }); // Formats to DD/MM/YYYY

        const subjectVal = subjectInput.value.trim();
        const promptVal = promptInput.value.trim();
        const toneVal = toneSelect.value;

        // Show Loader & Disable controls
        loaderText.textContent = "AI is writing your letter...";
        loader.classList.add('active');
        btnGenerate.disabled = true;
        btnEdit.disabled = true;
        btnPrint.disabled = true;
        if (btnShare) btnShare.disabled = true;

        try {
            let result;

            let toneText = "strictly formal, highly respectful, and written in a standard Indian collegiate letter format";
            if (toneVal === 'urgent') {
                toneText = "formal, respectful, but emphasizes urgency, swift response, and direct action";
            } else if (toneVal === 'persuasive') {
                toneText = "formal, highly encouraging, arguing the academic and developmental benefits of the event, convincing the authority respectfully";
            } else if (toneVal === 'request') {
                toneText = "polite, humble, highly request-oriented, using words like 'kindly request', 'would be highly grateful'";
            }

            const systemPrompt = `Write a professional, formal college permission letter for 'The Malnad Technical Club' at Malnad College of Engineering (MCE), Hassan.

CRITICAL INSTRUCTIONS:
1. Subject: Output a professional subject line at the very top starting with 'Subject: ' (e.g., 'Subject: Permission to Borrow Walkie-Talkies for ENIGMA Laser Show').
2. Body (strictly under 125 words): Write 2 to 3 brief, direct paragraphs based on the details provided:
   - Paragraph 1: State the request immediately in the first sentence (e.g., 'This is to request permission to...'). Keep it extremely direct.
   - Paragraph 2: Give a brief operational reason or assurance of responsibility.
   - Paragraph 3: Conclude with: 'We kindly request you to grant permission for the same.'
3. Tone: ${toneText}. Avoid verbose fluff, boilerplate adjectives, or generic AI filler words.
4. Closing: End the letter with exactly 'Yours sincerely,'.
5. Exclude date, recipient address, salutations ('Respected Sir/Madam'), and signature names (these are handled dynamically). Output ONLY the Subject line, body, and 'Yours sincerely,'.`;

            const userPrompt = `Recipient Designation: ${recipientText}
Letter Subject Idea: ${subjectVal}
Specific details to write about: ${promptVal}

Please write the letter body and professional subject line now.`;

            console.log("Using direct browser-side Gemini 2.5 Flash API...");
            loaderText.textContent = "AI is writing your letter (via Gemini 2.5)...";

            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}\n\n${userPrompt}`
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 2048,
                        temperature: 0.4
                    }
                })
            });

            const geminiResult = await response.json();

            if (!response.ok) {
                const errorMsg = geminiResult.error?.message || 'Gemini API Error';
                throw new Error(`Gemini API Error: ${errorMsg}`);
            }

            let generatedText = geminiResult.candidates[0].content.parts[0].text.trim();

            // AI Subject Generation Parsing
            let subjectLine = subjectVal; // Fallback to user input
            const subjectRegex = /^[sS]ubject\s*:\s*(.*?)$/m;
            const match = generatedText.match(subjectRegex);
            if (match && match[1]) {
                subjectLine = match[1].trim().replace(/\*+/g, '').replace(/^Subject:\s*/i, '');
                // Remove the subject line from the main text so it doesn't double-print
                generatedText = generatedText.replace(subjectRegex, '').trim();
            }

            generatedBodyRaw = generatedText;

            // Format Recipient with MCE standard formatting
            let recipientHtml = "";
            if (recipientText.toLowerCase().includes('the principal')) {
                recipientHtml = `To<br>The Principal<br>Malnad College of Engineering<br>Hassan-573201`;
            } else if (recipientText.toLowerCase().includes('the dean')) {
                recipientHtml = `To<br>The Dean (Student Affairs)<br>Malnad College of Engineering<br>Hassan-573201`;
            } else if (recipientText.toLowerCase().includes('the head of department')) {
                recipientHtml = `To<br>The Head of Department<br>Department of Computer Science & Engineering<br>Malnad College of Engineering<br>Hassan-573201`;
            } else {
                // For custom addresses, split by commas or newlines to structure it cleanly
                const lines = recipientText.split(/[,\n]/).map(line => line.trim()).filter(line => line);
                if (lines[0] && !lines[0].toLowerCase().startsWith('to')) {
                    recipientHtml = "To<br>" + lines.join('<br>');
                } else {
                    recipientHtml = lines.join('<br>');
                }
            }

            // Render output inside our CSS bounded paper box
            renderLetter(formattedDate, recipientHtml, subjectLine, generatedBodyRaw);

            // Enable Actions
            btnEdit.disabled = false;
            btnPrint.disabled = false;
            if (btnShare) btnShare.disabled = false;

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            loader.classList.remove('active');
            btnGenerate.disabled = false;
        }
    });

    // Render the final letter into the preview canvas with clean styling
    function renderLetter(date, recipientHtml, subject, rawBodyAndClosing) {
        // Formats the subject exactly like Subject: <strong>[Subject Text]</strong>
        const formattedSubject = `Subject: <strong>${subject}</strong>`;

        // Clean up the text by stripping "yours sincerely" and anything after it from the body paragraphs
        let cleanBody = rawBodyAndClosing;
        const closingIndex = cleanBody.toLowerCase().indexOf('yours sincerely');
        if (closingIndex !== -1) {
            cleanBody = cleanBody.substring(0, closingIndex).trim();
        }

        // Also strip "Respectfully yours" or other closings just in case
        const respectfullyIndex = cleanBody.toLowerCase().indexOf('respectfully yours');
        if (respectfullyIndex !== -1) {
            cleanBody = cleanBody.substring(0, respectfullyIndex).trim();
        }

        // Split the generated body by paragraphs to keep layout structure clean
        const paragraphs = cleanBody.split('\n\n');

        let processedTextHtml = "";

        // Automatically prepend Salutation
        processedTextHtml += `<div class="letter-salutation">Respected Sir/Madam,</div>`;

        paragraphs.forEach((p) => {
            const trimmed = p.trim();
            if (trimmed) {
                // Skip if AI accidentally generated "Respected Sir/Madam" again
                if (trimmed.toLowerCase().startsWith('respected') || trimmed.toLowerCase().startsWith('dear respected')) {
                    return;
                }

                processedTextHtml += `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            }
        });

        // Automatically append Closing
        processedTextHtml += `<div class="letter-closing">Yours sincerely,<br>The Malnad Technical Club<br>Malnad College of Engineering</div>`;

        // Assemble the full document structure
        letterContainer.innerHTML = `
            <div class="letter-date">${date}</div>
            <div class="letter-recipient">${recipientHtml}</div>
            <div class="letter-subject">${formattedSubject}</div>
            <div class="letter-body">
                ${processedTextHtml}
            </div>
        `;

        // Auto-save generated letter so refreshing never loses it
        localStorage.setItem('letter_generated_html', letterContainer.innerHTML);
        localStorage.setItem('letter_generated_raw', generatedBodyRaw);
    }

    // Toggle Manual Inline Editor
    btnEdit.addEventListener('click', () => {
        if (!isEditing) {
            // Enable editing
            isEditing = true;
            letterContainer.contentEditable = "true";
            letterContainer.focus();

            btnEdit.textContent = "Save Edits";
            btnEdit.classList.remove('btn-secondary');
            btnEdit.classList.add('btn-primary');
            editingStatus.style.display = 'flex';

            // Disable other controls while editing to prevent sync loss
            btnGenerate.disabled = true;
            btnPrint.disabled = true;
            if (btnShare) btnShare.disabled = true;
        } else {
            // Save edits
            isEditing = false;
            letterContainer.contentEditable = "false";

            btnEdit.textContent = "Edit Inline";
            btnEdit.classList.remove('btn-primary');
            btnEdit.classList.add('btn-secondary');
            editingStatus.style.display = 'none';

            btnGenerate.disabled = false;
            btnPrint.disabled = false;
            if (btnShare) btnShare.disabled = false;

            // Auto-save edited letter content
            localStorage.setItem('letter_generated_html', letterContainer.innerHTML);
        }
    });

    letterContainer.addEventListener('input', () => {
        if (isEditing) {
            localStorage.setItem('letter_generated_html', letterContainer.innerHTML);
        }
    });

    // PDF Name Generation Helper
    function getCleanFileName() {
        const dateVal = dateInput.value || new Date().toISOString().slice(0, 10);
        let subj = 'Letter';
        if (subjectInput && subjectInput.value.trim()) {
            subj = subjectInput.value.trim().slice(0, 28).replace(/[^a-zA-Z0-9_-]/g, '_');
        }
        return `MTC_Permission_${subj}_${dateVal}.pdf`;
    }

    // High-Resolution 300 DPI Client-Side A4 PDF Generator
    async function generatePdfInstance() {
        if (!a4Paper) return null;

        const clone = a4Paper.cloneNode(true);
        const rawBg = document.documentElement.style.getPropertyValue('--active-header-url') || 'url("header/header.png")';
        const cleanUrl = rawBg.replace(/url\(['"]?([^'"]+)['"]?\)/i, '$1').trim();

        // Exact unscaled A4 dimensions for crisp rendering
        clone.style.transform = 'none';
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '-99999px';
        clone.style.width = '650px';
        clone.style.height = '919px';
        clone.style.margin = '0';
        clone.style.borderRadius = '0';
        clone.style.boxShadow = 'none';
        clone.style.zIndex = '-9999';
        clone.style.backgroundImage = `url("${cleanUrl}")`;
        clone.style.backgroundSize = '100% 100%';
        clone.style.backgroundRepeat = 'no-repeat';
        clone.style.backgroundColor = '#ffffff';

        document.body.appendChild(clone);
        await new Promise(r => setTimeout(r, 60));

        try {
            const canvas = await html2canvas(clone, {
                scale: 2.5, // 2.5x standard screen gives ~1625 x 2297px crisp output
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            return pdf;
        } finally {
            if (clone.parentNode) {
                clone.parentNode.removeChild(clone);
            }
        }
    }

    // Automatic Direct Browser PDF Download
    btnPrint.addEventListener('click', async () => {
        if (isEditing) {
            btnEdit.click();
        }

        const originalText = btnPrint.innerHTML;
        btnPrint.disabled = true;
        btnPrint.innerHTML = `
            <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round" />
            </svg>
            Downloading...
        `;

        try {
            if (window.jspdf && window.html2canvas) {
                const pdf = await generatePdfInstance();
                if (pdf) {
                    const fileName = getCleanFileName();
                    pdf.save(fileName);
                    return;
                }
            }
            // Fallback to browser print dialog
            window.print();
        } catch (err) {
            console.error('PDF download error:', err);
            window.print();
        } finally {
            btnPrint.disabled = false;
            btnPrint.innerHTML = originalText;
        }
    });

    // Mobile & Desktop Native Share Option
    if (btnShare) {
        btnShare.addEventListener('click', async () => {
            if (isEditing) {
                btnEdit.click();
            }

            const originalText = btnShare.innerHTML;
            btnShare.disabled = true;
            btnShare.innerHTML = `
                <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-linecap="round" />
                </svg>
                Preparing...
            `;

            try {
                if (window.jspdf && window.html2canvas) {
                    const pdf = await generatePdfInstance();
                    if (pdf) {
                        const fileName = getCleanFileName();
                        const pdfBlob = pdf.output('blob');
                        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

                        // Check if Web Share API supports file sharing
                        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                            await navigator.share({
                                files: [pdfFile],
                                title: 'The Malnad Technical Club - Permission Letter',
                                text: subjectInput.value.trim() ? `Permission Letter: ${subjectInput.value.trim()}` : 'Permission Letter'
                            });
                            return;
                        } else if (navigator.share) {
                            // Web share without file support: download file and share text
                            pdf.save(fileName);
                            await navigator.share({
                                title: 'The Malnad Technical Club - Permission Letter',
                                text: subjectInput.value.trim() ? `Permission Letter: ${subjectInput.value.trim()}` : 'Permission Letter'
                            });
                            return;
                        } else {
                            // Web share not supported (e.g. desktop): download file directly
                            pdf.save(fileName);
                            alert('PDF file downloaded directly to your device! You can now attach and share it.');
                            return;
                        }
                    }
                }
                // Fallback
                window.print();
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share error:', err);
                    alert('Sharing could not be completed. The PDF will be downloaded directly.');
                    if (window.jspdf && window.html2canvas) {
                        const pdf = await generatePdfInstance();
                        if (pdf) pdf.save(getCleanFileName());
                    }
                }
            } finally {
                btnShare.disabled = false;
                btnShare.innerHTML = originalText;
            }
        });
    }

    // Zoom Controls State and Logic
    let zoomFactor = 1.0;
    const btnZoomIn = document.getElementById('btnZoomIn');
    const btnZoomOut = document.getElementById('btnZoomOut');
    const btnZoomReset = document.getElementById('btnZoomReset');
    const btnZoomFit = document.getElementById('btnZoomFit');
    const zoomPercent = document.getElementById('zoomPercent');
    const viewport = document.querySelector('.a4-viewport-container');

    function setZoom(factor) {
        // Clamp between 0.30 (mobile viewports) and 1.50
        zoomFactor = Math.max(0.30, Math.min(1.50, factor));

        // Set CSS custom property for responsive scaling wrapper and paper
        document.documentElement.style.setProperty('--zoom-factor', zoomFactor);

        // Update percentage badge
        if (zoomPercent) {
            zoomPercent.textContent = `${Math.round(zoomFactor * 100)}%`;
        }
    }

    function calculateFitZoom() {
        if (window.innerWidth <= 960) {
            // Default view of live preview in mobile view is 55%
            return 0.55;
        }
        if (!viewport) return 1.0;
        const viewportWidth = viewport.clientWidth || window.innerWidth;
        const viewportHeight = viewport.clientHeight || window.innerHeight;
        const factorX = (viewportWidth - 24) / 650;
        const factorY = (viewportHeight - 36) / 919;
        return Math.max(0.30, Math.min(factorX, factorY, 1.0));
    }

    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            setZoom(zoomFactor + 0.08);
        });
    }

    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            setZoom(zoomFactor - 0.08);
        });
    }

    // Reset button sets zoom to 100%
    if (btnZoomReset) {
        btnZoomReset.addEventListener('click', () => {
            setZoom(1.0);
        });
    }

    // Fit button automatically fits the document to the current screen
    if (btnZoomFit) {
        btnZoomFit.addEventListener('click', () => {
            setZoom(calculateFitZoom());
        });
    }

    // Auto-fit after DOM load (55% on mobile, fit on desktop)
    setTimeout(() => {
        setZoom(calculateFitZoom());
    }, 200);

    // Auto-adjust on window resize or orientation change
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const type = localStorage.getItem('selected_header_type') || 'club';
            if (activeHeaderLabel) {
                activeHeaderLabel.textContent = (window.innerWidth <= 680)
                    ? (type === 'event' ? 'Event' : 'Club')
                    : (type === 'event' ? 'Event Header' : 'Club Header');
            }
            if (window.innerWidth <= 960) {
                setZoom(0.55);
            } else {
                setZoom(calculateFitZoom());
            }
        }, 120);
    });

    // Interactive Particle Network
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 180 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Touch support on mobile devices
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 0) {
                mouse.x = e.touches[0].clientX;
                mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = (Math.random() - 0.5) * 0.7;
                this.radius = Math.random() * 2 + 1.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                // Mouse interaction (gentle attraction)
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x += dx * force * 0.015;
                        this.y += dy * force * 0.015;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const isDark = document.body.classList.contains('dark-theme');
                ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.55)' : 'rgba(79, 70, 229, 0.4)';
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Dynamically scale particle count based on screen area
            const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 20000));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animateParticles);
        }

        function connectParticles() {
            const isDark = document.body.classList.contains('dark-theme');
            const particleLineColor = isDark ? '99, 102, 241' : '79, 70, 229';
            const particleBaseOpacity = isDark ? 0.22 : 0.15;
            const mouseLineOpacity = isDark ? 0.3 : 0.22;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 110) {
                        let opacity = (110 - dist) / 110 * particleBaseOpacity;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${particleLineColor}, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Connect to mouse as well
                if (mouse.x !== null && mouse.y !== null) {
                    let dx = particles[i].x - mouse.x;
                    let dy = particles[i].y - mouse.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        let opacity = (mouse.radius - dist) / mouse.radius * mouseLineOpacity;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(${particleLineColor}, ${opacity})`;
                        ctx.lineWidth = 1.0;
                        ctx.stroke();
                    }
                }
            }
        }

        initParticles();
        animateParticles();
    }

});
