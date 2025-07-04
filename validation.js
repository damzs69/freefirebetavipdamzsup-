// Configuration
const validRecipientNames = ["Yanti", "Damzs", "JB Damzs Store"];
const validAccountNumber = "082129071128";
const minPaymentAmount = 10000;

// Global variables
let expectedAmount = minPaymentAmount;
let currentWIBTime = new Date();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateWIBTimeDisplay();
    setInterval(updateWIBTimeDisplay, 1000);
});

// WIB Time Functions (UTC+7)
function getCurrentWIBTime() {
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    return new Date(now.getTime() + wibOffset);
}

function formatWIBTime(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}.${minutes}.${seconds} WIB`;
}

function updateWIBTimeDisplay() {
    currentWIBTime = getCurrentWIBTime();
    document.getElementById('currentWIB').textContent = formatWIBTime(currentWIBTime);
}

// Step 1 Validation
function validateStep1() {
    const phone = document.getElementById('phone').value;
    const username = document.getElementById('username').value;
    const amount = parseInt(document.getElementById('amount').value) || 0;
    
    // Reset errors
    document.getElementById('phoneError').textContent = '';
    document.getElementById('usernameError').textContent = '';
    document.getElementById('amountError').textContent = '';
    
    let isValid = true;
    
    // Validate phone
    if (!phone.startsWith('62') || phone.length !== 13 || isNaN(phone)) {
        document.getElementById('phoneError').textContent = 'Nomor harus diawali 62 dan 13 digit angka!';
        isValid = false;
    }
    
    // Validate username
    if (username.trim() === '') {
        document.getElementById('usernameError').textContent = 'Username tidak boleh kosong!';
        isValid = false;
    }
    
    // Validate amount
    if (amount < minPaymentAmount) {
        document.getElementById('amountError').textContent = `Minimal pembayaran Rp ${minPaymentAmount.toLocaleString()}`;
        isValid = false;
    }
    
    if (isValid) {
        expectedAmount = amount;
        document.getElementById('displayAmount').textContent = amount.toLocaleString();
        window.location.href = "validation.html";
    }
}

function backToStep1() {
    window.location.href = "form.html";
}

function resetPaymentForm() {
    document.getElementById('paymentProof').value = '';
    document.getElementById('proofPreview').src = '';
    document.getElementById('proofPreview').classList.add('hidden');
    document.getElementById('proofError').textContent = '';
    document.getElementById('scanningStatus').classList.add('hidden');
    document.getElementById('ocrResult').classList.add('hidden');
    document.getElementById('ocrResult').textContent = '';
    document.getElementById('validationResult').innerHTML = '';
}

// Payment Processing
function processPaymentProof() {
    const paymentProof = document.getElementById('paymentProof').files[0];
    if (!paymentProof) {
        document.getElementById('proofError').textContent = 'Harap pilih bukti transfer!';
        return;
    }

    // Show preview
    const preview = document.getElementById('proofPreview');
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(paymentProof);

    // Start scanning
    document.getElementById('proofError').textContent = '';
    document.getElementById('scanningStatus').classList.remove('hidden');
    document.getElementById('ocrResult').classList.add('hidden');
    document.getElementById('validationResult').innerHTML = '';

    // Simulate OCR processing (3 seconds)
    setTimeout(() => {
        performUltraStrictVerification();
    }, 3000);
}

function performUltraStrictVerification() {
    const nowWIB = getCurrentWIBTime();
    const threeMinutesAgo = new Date(nowWIB.getTime() - 3 * 60000);
    
    // Simulated OCR data
    const ocrData = {
        recipientName: validRecipientNames[Math.floor(Math.random() * validRecipientNames.length)],
        accountNumber: validAccountNumber,
        amount: expectedAmount,
        transferTime: new Date(nowWIB.getTime() - Math.floor(Math.random() * 4) * 60000), // 0-3 minutes ago
        status: "Berhasil"
    };
    
    // 10% chance to simulate invalid data
    if (Math.random() < 0.1) {
        ocrData.amount = expectedAmount + 1000;
        ocrData.transferTime = new Date(nowWIB.getTime() - (4 + Math.floor(Math.random() * 10)) * 60000); // 4-13 minutes ago
    }
    
    // Format OCR result
    const ocrText = `
        Hasil Pemindaian:
        Nama Penerima: ${ocrData.recipientName}
        Nomor Tujuan: ${ocrData.accountNumber}
        Jumlah Transfer: Rp ${ocrData.amount.toLocaleString()}
        Waktu Transfer: ${formatWIBTime(ocrData.transferTime)}
        Status: ${ocrData.status}
    `;
    
    // Show OCR results
    document.getElementById('scanningStatus').classList.add('hidden');
    document.getElementById('ocrResult').classList.remove('hidden');
    document.getElementById('ocrResult').textContent = ocrText;
    
    // Perform ultra-strict validation
    validatePaymentWithUltraStrictRules(ocrData, nowWIB);
}

function validatePaymentWithUltraStrictRules(ocrData, currentWIBTime) {
    const threeMinutesAgo = new Date(currentWIBTime.getTime() - 3 * 60000);
    
    // 1. Validate recipient name
    const isNameValid = validRecipientNames.includes(ocrData.recipientName);
    
    // 2. Validate account number
    const isAccountValid = ocrData.accountNumber === validAccountNumber;
    
    // 3. Validate amount (must be exact)
    const isAmountValid = ocrData.amount === expectedAmount;
    
    // 4. Validate time (within 3 minutes)
    let isTimeValid = true;
    let timeError = '';
    
    if (ocrData.transferTime > currentWIBTime) {
        isTimeValid = false;
        timeError = '❌ Waktu transfer LEBIH BARU dari waktu server';
    } else if (ocrData.transferTime < threeMinutesAgo) {
        isTimeValid = false;
        timeError = `❌ Waktu transfer SUDAH LEBIH DARI 3 MENIT (Transfer: ${formatWIBTime(ocrData.transferTime)}, Server: ${formatWIBTime(currentWIBTime)})`;
    }
    
    // 5. Photo validation (simulated)
    const isPhotoValid = Math.random() > 0.1; // 90% valid
    
    // Check all validations
    const isValid = isNameValid && isAccountValid && isAmountValid && isTimeValid && isPhotoValid;
    
    // Display results
    const validationResult = document.getElementById('validationResult');
    
    if (isValid) {
        // Store verified data
        localStorage.setItem('verifiedName', ocrData.recipientName);
        localStorage.setItem('verifiedAccount', ocrData.accountNumber);
        localStorage.setItem('verifiedAmount', 'Rp ' + ocrData.amount.toLocaleString());
        localStorage.setItem('verifiedTime', formatWIBTime(ocrData.transferTime));
        
        validationResult.innerHTML = `
            <div class="success-box">
                <h3>✅ VERIFIKASI BERHASIL</h3>
                <div class="verification-checklist">
                    <p>Semua kriteria terpenuhi:</p>
                    <div class="verification-item">
                        <input type="checkbox" checked disabled>
                        <label>Nama penerima valid</label>
                    </div>
                    <div class="verification-item">
                        <input type="checkbox" checked disabled>
                        <label>Nomor DANA valid</label>
                    </div>
                    <div class="verification-item">
                        <input type="checkbox" checked disabled>
                        <label>Jumlah transfer tepat</label>
                    </div>
                    <div class="verification-item">
                        <input type="checkbox" checked disabled>
                        <label>Waktu transfer valid</label>
                    </div>
                    <div class="verification-item">
                        <input type="checkbox" checked disabled>
                        <label>Foto bukti valid</label>
                    </div>
                </div>
                <button onclick="completePayment()">LANJUTKAN</button>
            </div>
        `;
    } else {
        // Show specific errors
        let errorMessages = [];
        
        if (!isNameValid) {
            errorMessages.push("❌ Nama penerima tidak valid");
        }
        
        if (!isAccountValid) {
            errorMessages.push("❌ Nomor DANA tidak valid");
        }
        
        if (!isAmountValid) {
            errorMessages.push(`❌ Jumlah transfer Rp ${ocrData.amount.toLocaleString()} tidak sesuai (harus Rp ${expectedAmount.toLocaleString()})`);
        }
        
        if (!isTimeValid) {
            errorMessages.push(timeError);
        }
        
        if (!isPhotoValid) {
            errorMessages.push("❌ Foto bukti tidak valid (buram/tampak diedit)");
        }
        
        validationResult.innerHTML = `
            <div class="error-box">
                <h3>❌ VERIFIKASI GAGAL</h3>
                <p>Sistem menolak karena:</p>
                <ul style="color: #ff5555;">
                    ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                </ul>
                <div class="strict-rules">
                    <p>UPLOAD ULANG BUKTI TRANSFER YANG:</p>
                    <ol>
                        <li>Nama penerima TEPAT</li>
                        <li>Nomor DANA TEPAT</li>
                        <li>Jumlah TRANSFER TEPAT</li>
                        <li>Waktu transfer ≤3 menit yang lalu</li>
                        <li>Foto JELAS dan ASLI</li>
                    </ol>
                </div>
            </div>
        `;
    }
}

function completePayment() {
    window.location.href = "success.html";
}

// On success page load
if (window.location.pathname.includes("success.html")) {
    document.getElementById('verifiedName').textContent = localStorage.getItem('verifiedName');
    document.getElementById('verifiedAccount').textContent = localStorage.getItem('verifiedAccount');
    document.getElementById('verifiedAmount').textContent = localStorage.getItem('verifiedAmount');
    document.getElementById('verifiedTime').textContent = localStorage.getItem('verifiedTime');
}