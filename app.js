// ============================================================
// PRC PPCR - Main Application Logic
// ============================================================

const API_URL = localStorage.getItem('ppcr_api_url') || 'https://prc-ppcr-backend-production.up.railway.app/api';
console.log('🔌 API URL:', API_URL);
console.log('🌐 Origin:', window.location.origin);

// ------------------------------------------------------------
// AUTH
// ------------------------------------------------------------
function getToken() {
  return localStorage.getItem('ppcr_token');
}

function setToken(token) {
  localStorage.setItem('ppcr_token', token);
}

function logout() {
  if (!confirm('Log out?')) return;
  localStorage.removeItem('ppcr_token');
  location.reload();
}

// ------------------------------------------------------------
// COLLECT FORM DATA
// ------------------------------------------------------------
function collectFormData() {
  const getRadio = (name) =>
    document.querySelector(`input[name="${name}"]:checked`)?.value || null;
  const getValue = (name) => {
    const el = document.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() || null : null;
  };
  const getCheckboxValues = (name) => {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (c) => c.value
    );
  };

  const injuredParts = [];
  document.querySelectorAll('.body-part.active').forEach((p) => {
    injuredParts.push(p.dataset.part);
  });

  return {
    serial_no: document.getElementById('serialNo')?.value || null,

    incident_data: {
      nature_of_call: getRadio('nature_call'),
      type_of_emergency: getRadio('type_emergency'),
      call_date: getValue('call_date'),
      call_time: getValue('call_time'),
      location: getValue('location'),
      same_as_address: document.querySelector('[name="same_as_address"]')?.checked || false,
      mobile: getValue('mobile'),
      at_scene: getValue('at_scene'),
      at_patient: getValue('at_patient'),
      depart_scene: getValue('depart_scene'),
      at_arrival: getValue('at_arrival'),
      at_handover: getValue('at_handover'),
      clear_time: getValue('clear_time'),
      station_code: getValue('station_code'),
      ambulance_unit: getValue('ambulance_unit'),
      response_area: getRadio('response_area'),
      facility_type: getRadio('facility_type'),
    },

    patient_data: {
      name: getValue('patient_name'),
      age: getValue('patient_age'),
      gender: getValue('patient_gender'),
      address: getValue('patient_address'),
      contact: getValue('patient_contact'),
      nok: getValue('nok_name'),
      nok_contact: getValue('nok_contact'),
      treatment_refused: document.querySelector('[name="treatment_refused"]')?.checked || false,
      transport_refused: document.querySelector('[name="transport_refused"]')?.checked || false,
      treat_scene: document.querySelector('[name="treat_scene"]')?.checked || false,
      stood_down: document.querySelector('[name="stood_down"]')?.checked || false,
      time_onset: getValue('onset_time'),
      date_onset: getValue('onset_date'),
    },

    primary_survey: {
      cspine: getRadio('cspine'),
      airway: getRadio('airway'),
      breathing: getRadio('breathing'),
      pulse: getRadio('pulse'),
      skin: getRadio('skin'),
      caprefill: getRadio('caprefill'),
    },

    vital_signs: {
      pulse_1: getValue('pulse_1'),
      pulse_2: getValue('pulse_2'),
      pulse_3: getValue('pulse_3'),
      rr_1: getValue('rr_1'),
      rr_2: getValue('rr_2'),
      rr_3: getValue('rr_3'),
      rq_1: getValue('rq_1'),
      rq_2: getValue('rq_2'),
      rq_3: getValue('rq_3'),
      spo2_1: getValue('spo2_1'),
      spo2_2: getValue('spo2_2'),
      spo2_3: getValue('spo2_3'),
      bp_1: getValue('bp_1'),
      bp_2: getValue('bp_2'),
      bp_3: getValue('bp_3'),
      temp_1: getValue('temp_1'),
      temp_2: getValue('temp_2'),
      temp_3: getValue('temp_3'),
      pupils_1: getValue('pupils_1'),
      pupils_2: getValue('pupils_2'),
      pupils_3: getValue('pupils_3'),
      pain_1: getValue('pain_1'),
      pain_2: getValue('pain_2'),
      pain_3: getValue('pain_3'),
      bg_1: getValue('bg_1'),
      bg_2: getValue('bg_2'),
      bg_3: getValue('bg_3'),
      gcs_eye: getValue('gcs_eye'),
      gcs_verbal: getValue('gcs_verbal'),
      gcs_motor: getValue('gcs_motor'),
      gcs_total: getValue('gcs_total'),
    },

    care_management: {
      checked: [
        ...getCheckboxValues('cm_airway'),
        ...getCheckboxValues('cm_breathing'),
        ...getCheckboxValues('cm_circulation'),
        ...getCheckboxValues('cm_immobilization'),
        ...getCheckboxValues('cm_wound'),
        ...getCheckboxValues('cm_misc'),
      ],
      other: {
        airway: getValue('cm_airway_other'),
        breathing: getValue('cm_breathing_other'),
        circulation: getValue('cm_circulation_other'),
        immobilization: getValue('cm_immobilization_other'),
        wound: getValue('cm_wound_other'),
        misc: getValue('cm_misc_other'),
      },
    },

    patient_assessment: {
      loc_loss: getRadio('loc_loss'),
      loc_arrival: getRadio('loc_arrival'),
      injured_parts: injuredParts,
      exam_findings: getCheckboxValues('exam_findings'),
      burn_class: getRadio('burn_class'),
      burn_percent: getValue('burn_percent'),
      mechanism: {
        checked: getCheckboxValues('mechanism'),
        other: getValue('mechanism_other'),
      },
      cessation: {
        coronary: getRadio('coronary'),
        collapse: getRadio('collapse'),
        time_collapse: getValue('cess_time_collapse'),
        time_chestpain: getValue('cess_time_chestpain'),
        time_cpr: getValue('cess_time_cpr'),
        time_analysis: getValue('cess_time_analysis'),
        time_defib: getValue('cess_time_defib'),
        time_duration: getValue('cess_time_duration'),
        time_pulse: getValue('cess_time_pulse'),
        time_transferred: getValue('cess_time_transferred'),
        time_hospital_cpr: getValue('cess_time_hospital_cpr'),
      },
      refusal: {
        patient_sig: getValue('refusal_patient_sig'),
        witness1: getValue('refusal_witness1'),
        date_signed: getValue('refusal_date'),
        witness2: getValue('refusal_witness2'),
      },
    },

    sample_history: {
      s: getValue('sample_s'),
      a: getValue('sample_a'),
      m: getValue('sample_m'),
      p: getValue('sample_p'),
      l: getValue('sample_l'),
      e: getValue('sample_e'),
    },

    nature_illness: {
      checked: getCheckboxValues('nature_illness'),
    },

    mechanism: {
      checked: getCheckboxValues('mechanism'),
      other: getValue('mechanism_other'),
    },

    narrative: {
      notes: getValue('narrative_notes'),
      death_indicators: getCheckboxValues('death_indicators'),
      death_nature: getValue('death_nature'),
    },

    cessation: {
      coronary: getRadio('coronary'),
      collapse: getRadio('collapse'),
      time_collapse: getValue('cess_time_collapse'),
      time_chestpain: getValue('cess_time_chestpain'),
      time_cpr: getValue('cess_time_cpr'),
      time_analysis: getValue('cess_time_analysis'),
      time_defib: getValue('cess_time_defib'),
      time_duration: getValue('cess_time_duration'),
      time_pulse: getValue('cess_time_pulse'),
      time_transferred: getValue('cess_time_transferred'),
      time_hospital_cpr: getValue('cess_time_hospital_cpr'),
    },

    refusal: {
      patient_sig: getValue('refusal_patient_sig'),
      witness1: getValue('refusal_witness1'),
      date_signed: getValue('refusal_date'),
      witness2: getValue('refusal_witness2'),
    },

    provider_info: {
      name: getValue('provider_name'),
      license: getValue('provider_license'),
      datetime: getValue('provider_datetime'),
      receiving_name: getValue('receiving_name'),
      receiving_license: getValue('receiving_license'),
      receiving_datetime: getValue('receiving_datetime'),
    },

    additional_info: getValue('additional_info'),
  };
}

// ------------------------------------------------------------
// SAVE REPORT — offline-first with auto-retry
// ------------------------------------------------------------
async function saveReport() {
  try {
    const report = collectFormData();
    report.client_uuid = uuidv4();
    report.created_at = new Date().toISOString();
    report.synced = false;
    report.retry_count = 0;
    report.status = 'draft';
    report.signatures = getSignatures();

    // 1. Save locally (always works)
    await saveReportToDB(report);
    console.log('✅ Saved locally:', report.client_uuid);

    // 2. Try to sync immediately
    if (navigator.onLine) {
      try {
        await syncSingleReport(report);
        await markReportSynced(report.client_uuid);
        showToast('✅ Report saved and synced to admin!', 'success');
      } catch (syncErr) {
        console.warn('Sync failed:', syncErr.message);
        showToast('💾 Saved locally. Will retry automatically.', 'warning');
        registerBackgroundSync();
      }
    } else {
      showToast('💾 Saved offline. Will sync when online.', 'warning');
      registerBackgroundSync();
    }

    // Update the pending banner
    updatePendingBanner();
    return report;
  } catch (err) {
    console.error('Save failed:', err);
    showToast('❌ Save failed: ' + err.message, 'error');
    return null;
  }
}
// ------------------------------------------------------------
// SYNC SINGLE REPORT — with detailed error reporting
// ------------------------------------------------------------
async function syncSingleReport(report) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  // Token is OPTIONAL now — include only if we have one
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${API_URL}/reports`;
  console.log('📤 POST', url);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(report),
    });
  } catch (netErr) {
    throw new Error(`Cannot reach server (${netErr.message})`);
  }

  if (!res.ok) {
    let errMsg = `Server error ${res.status}`;
    try {
      const err = await res.json();
      errMsg = err.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

// ------------------------------------------------------------
// SYNC ALL
// ------------------------------------------------------------
async function syncAllReports() {
  const unsynced = await getUnsyncedReports();

  if (unsynced.length === 0) {
    showToast('✅ All reports are already synced!', 'success');
    return;
  }

  if (!navigator.onLine) {
    showToast(`📴 You're offline. ${unsynced.length} report(s) waiting.`, 'warning');
    return;
  }

  showToast(`🔄 Syncing ${unsynced.length} report(s)…`, 'info');

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const r of unsynced) {
    try {
      await syncSingleReport(r);
      await markReportSynced(r.client_uuid);
      success++;
    } catch (err) {
      console.warn('Sync failed:', r.client_uuid, err.message);
      errors.push(err.message);
      failed++;
    }
  }

  if (success > 0 && failed === 0) {
    showToast(`✅ Synced ${success} report(s) successfully!`, 'success');
  } else if (success > 0 && failed > 0) {
    showToast(`⚠️ Synced ${success}, failed ${failed}`, 'warning');
  } else {
    showToast(`❌ Failed: ${errors[0] || 'Unknown error'}`, 'error');
  }

  updatePendingBanner();
}

// ------------------------------------------------------------
// BACKGROUND SYNC
// ------------------------------------------------------------
async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register('sync-reports');
      console.log('🔄 Background sync registered');
    } catch (err) {
      console.warn('Background sync registration failed:', err);
    }
  }
}

// ------------------------------------------------------------
// PDF EXPORT
// ------------------------------------------------------------
async function handleExportPDF() {
  try {
    const report = collectFormData();
    report.serial_no = document.getElementById('serialNo')?.value || 'DRAFT';
    report.signatures = getSignatures();
    await exportToPDF(report);
  } catch (err) {
    console.error('PDF export failed:', err);
    showToast('❌ PDF export failed: ' + err.message, 'error');
  }
}

// ------------------------------------------------------------
// CLEAR FORM
// ------------------------------------------------------------
function clearForm() {
  if (!confirm('Clear all form fields? This cannot be undone.')) return;

  document.querySelectorAll('input, select, textarea').forEach((el) => {
    if (el.type === 'checkbox' || el.type === 'radio') {
      el.checked = false;
    } else {
      el.value = '';
    }
  });

  document.querySelectorAll('.body-part').forEach((part) => {
    part.classList.remove('active');
  });

  clearAllSignatures();
  showToast('✅ Form cleared', 'success');
}

// ------------------------------------------------------------
// TOAST NOTIFICATIONS
// ------------------------------------------------------------
function showToast(msg, type = 'info') {
  // Remove existing toast
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  const bg = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[type] || 'bg-gray-800';

  toast.className = `${bg} text-white text-sm font-semibold px-5 py-3 rounded-lg shadow-2xl fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] max-w-[90vw]`;
  toast.style.animation = 'slideUp 0.3s ease';
  toast.textContent = msg;

  // Animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from { opacity: 0; transform: translate(-50%, 20px); }
      to   { opacity: 1; transform: translate(-50%, 0); }
    }
  `;
  if (!document.getElementById('toast-style')) {
    style.id = 'toast-style';
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ------------------------------------------------------------
// PENDING SYNC BANNER
// ------------------------------------------------------------
async function updatePendingBanner() {
  try {
    const count = await countUnsynced();
    const existing = document.getElementById('pending-banner');

    if (count > 0 && navigator.onLine) {
      if (!existing) {
        const banner = document.createElement('div');
        banner.id = 'pending-banner';
        banner.className = 'bg-amber-500 text-white text-xs font-bold py-2 px-3 flex items-center justify-between no-print';
        banner.innerHTML = `
          <span>📤 ${count} report(s) pending sync</span>
          <button onclick="syncAllReports()" class="bg-white text-amber-600 px-3 py-1 rounded font-bold hover:bg-amber-50">Sync Now</button>
        `;
        const header = document.querySelector('header');
        if (header) header.after(banner);
      } else {
        existing.querySelector('span').textContent = `📤 ${count} report(s) pending sync`;
      }
    } else if (existing) {
      existing.remove();
    }
  } catch (err) {
    console.warn('Banner update failed:', err);
  }
}

// ------------------------------------------------------------
// SERVICE WORKER MESSAGES
// ------------------------------------------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_NOW') {
      console.log('📩 SW requested sync');
      syncAllReports().catch(console.warn);
    }
  });
}

// ------------------------------------------------------------
// NETWORK EVENTS
// ------------------------------------------------------------
window.addEventListener('online', () => {
  console.log('🌐 Back online');
  document.body.classList.remove('offline');
  showToast('🌐 Connection restored — syncing…', 'info');
  syncAllReports().then(() => updatePendingBanner()).catch(console.warn);
});

window.addEventListener('offline', () => {
  console.log('📴 Going offline');
  document.body.classList.add('offline');
  showToast('📴 Offline mode — data will save locally', 'warning');
});

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
window.addEventListener('load', async () => {
  // IndexedDB
  try {
    await openDB();
  } catch (err) {
    console.error('IndexedDB init failed:', err);
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', reg.scope);

      // Check for updates
      reg.update().catch(() => {});
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  }

  // Offline state
  if (!navigator.onLine) document.body.classList.add('offline');

  // Pending sync banner + auto retry
  await updatePendingBanner();

  // Auto-sync if online and has pending
  if (navigator.onLine) {
    const pending = await countUnsynced();
    if (pending > 0) {
      console.log(`📊 ${pending} report(s) pending — auto-syncing`);
      setTimeout(() => {
        syncAllReports().then(() => updatePendingBanner());
      }, 2000);
    }
  }

  // Refresh banner every 30 seconds
  setInterval(updatePendingBanner, 30000);
});



// ------------------------------------------------------------
// EXPOSE
// ------------------------------------------------------------
window.collectFormData = collectFormData;
window.saveReport = saveReport;
window.syncAllReports = syncAllReports;
window.handleExportPDF = handleExportPDF;
window.clearForm = clearForm;
window.logout = logout;
window.showToast = showToast;

console.log('🚀 app.js loaded — API:', API_URL);

// ============================================================
// PWA INSTALLATION LOGIC (Works on HTTP & HTTPS)
// ============================================================
let deferredPrompt;

// Capture native prompt if available (Only works on HTTPS or localhost)
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('📲 Native PWA install prompt captured');
});

// Handle button click
async function installPWA() {
    if (deferredPrompt) {
        // Show the native install prompt (if on HTTPS)
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
    } else {
        // Fallback instructions for local HTTP or iOS
        alert(
            "📱 TO INSTALL THIS APP:\n\n" +
            "🤖 ANDROID (Chrome):\n" +
            "1. Tap the 3-dot menu (⋮) at the top right.\n" +
            "2. Tap 'Add to Home screen' or 'Install app'.\n\n" +
            "🍎 iPHONE / iPAD (Safari):\n" +
            "1. Tap the Share button (square with up arrow).\n" +
            "2. Scroll down and tap 'Add to Home Screen'."
        );
    }
}

// Hide button ONLY if the app is already running in standalone mode (already installed)
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
    console.log('📱 Running as installed PWA');
    const installBtn = document.getElementById('install-pwa-btn');
    if (installBtn) installBtn.style.display = 'none';
}

window.installPWA = installPWA;