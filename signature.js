// ============================================================
// PRC PPCR - Digital Signature Capture
// ============================================================

const signaturePads = {};

function initSignaturePads() {
  if (!document.getElementById('signature-modal')) {
    createSignatureModalHTML();
  }

  ['patient', 'provider', 'receiving'].forEach((type) => {
    const canvas = document.getElementById(`sig-canvas-${type}`);
    if (!canvas) return;

    // Prevent double-init
    if (signaturePads[type]) return;

    const pad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      minWidth: 0.7,
      maxWidth: 3.0,
    });
    signaturePads[type] = pad;
    resizeCanvas(canvas);
  });

  window.addEventListener('resize', () => {
    ['patient', 'provider', 'receiving'].forEach((type) => {
      const canvas = document.getElementById(`sig-canvas-${type}`);
      if (canvas) resizeCanvas(canvas);
    });
  });
}

function resizeCanvas(canvas) {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  canvas.getContext('2d').scale(ratio, ratio);

  const type = canvas.dataset.type;
  if (signaturePads[type]) {
    const data = signaturePads[type].toData();
    signaturePads[type].clear();
    if (data && data.length) signaturePads[type].fromData(data);
  }
}

function createSignatureModalHTML() {
  const modal = document.createElement('div');
  modal.id = 'signature-modal';
  modal.style.cssText = `
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75);
    z-index: 9999; padding: 10px; overflow-y: auto;
  `;
  modal.innerHTML = `
    <div style="background: white; max-width: 800px; margin: 20px auto; border-radius: 12px; padding: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 3px solid #dc2626; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="font-size: 20px; font-weight: bold; color: #dc2626;">✍️ Digital Signatures</h2>
        <button type="button" onclick="closeSignatureModal()" style="background:#dc2626; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">✕ Close</button>
      </div>

      ${['patient', 'provider', 'receiving']
        .map(
          (type) => `
        <div style="margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label style="font-weight: bold; font-size: 14px; text-transform: capitalize; color: #1f2937;">
              ${type === 'receiving' ? 'Receiving Provider' : type} Signature
            </label>
            <button type="button" onclick="clearSignature('${type}')" style="background:#6b7280; color:white; border:none; padding: 5px 14px; border-radius: 5px; font-size: 12px; font-weight: 600; cursor:pointer;">Clear</button>
          </div>
          <canvas id="sig-canvas-${type}" data-type="${type}" style="border: 2px dashed #9ca3af; border-radius: 8px; width: 100%; height: 220px; touch-action: none; background: white; cursor: crosshair;"></canvas>
        </div>
      `
        )
        .join('')}

      <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <button type="button" onclick="closeSignatureModal()" style="background: #6b7280; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancel</button>
        <button type="button" onclick="saveSignatures()" style="background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Save Signatures</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openSignatureModal() {
  const modal = document.getElementById('signature-modal');
  if (!modal) createSignatureModalHTML();
  document.getElementById('signature-modal').style.display = 'block';

  setTimeout(() => {
    initSignaturePads();
    ['patient', 'provider', 'receiving'].forEach((type) => {
      const existing = getStoredSignature(type);
      if (existing && signaturePads[type]) {
        try {
          signaturePads[type].fromDataURL(existing);
        } catch (e) {
          console.warn('Failed to restore signature', type, e);
        }
      }
    });
  }, 100);
}

function closeSignatureModal() {
  const modal = document.getElementById('signature-modal');
  if (modal) modal.style.display = 'none';
}

function clearSignature(type) {
  if (signaturePads[type]) signaturePads[type].clear();
}

function saveSignatures() {
  const signatures = {};
  let savedCount = 0;
  ['patient', 'provider', 'receiving'].forEach((type) => {
    if (signaturePads[type] && !signaturePads[type].isEmpty()) {
      const dataURL = signaturePads[type].toDataURL('image/png');
      signatures[type] = dataURL;
      localStorage.setItem(`sig_${type}`, dataURL);
      savedCount++;
    }
  });
  localStorage.setItem('ppcr_signatures', JSON.stringify(signatures));
  alert(`✅ ${savedCount} signature(s) saved.`);
  closeSignatureModal();
}

function getStoredSignature(type) {
  return localStorage.getItem(`sig_${type}`);
}

function getSignatures() {
  try {
    return JSON.parse(localStorage.getItem('ppcr_signatures') || '{}');
  } catch {
    return {};
  }
}

function clearAllSignatures() {
  ['patient', 'provider', 'receiving'].forEach((t) =>
    localStorage.removeItem(`sig_${t}`)
  );
  localStorage.removeItem('ppcr_signatures');
}

// Expose to window
window.openSignatureModal = openSignatureModal;
window.closeSignatureModal = closeSignatureModal;
window.clearSignature = clearSignature;
window.saveSignatures = saveSignatures;
window.getSignatures = getSignatures;
window.clearAllSignatures = clearAllSignatures;

console.log('✍️ signature.js loaded (larger canvas)');