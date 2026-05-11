const buyBtn = document.getElementById('buyBtn');
const buyBtn2 = document.getElementById('buyBtn2');
const purchaseModal = document.getElementById('purchaseModal');
const closeModal = document.getElementById('closeModal');
const purchaseForm = document.getElementById('purchaseForm');
const emailInput = document.getElementById('emailInput');
const purchaseStatus = document.getElementById('purchaseStatus');

const openRedeemBtn = document.getElementById('openRedeemBtn');
const openRedeemBtn2 = document.getElementById('openRedeemBtn2');
const redeemModal = document.getElementById('redeemModal');
const closeRedeemModal = document.getElementById('closeRedeemModal');
const redeemForm = document.getElementById('redeemForm');
const redeemEmailInput = document.getElementById('redeemEmailInput');
const redeemLicenseInput = document.getElementById('redeemLicenseInput');
const redeemStatus = document.getElementById('redeemStatus');

function openPurchaseModal() {
  purchaseModal.classList.add('open');
  purchaseModal.setAttribute('aria-hidden', 'false');
}

function closePurchaseModal() {
  purchaseModal.classList.remove('open');
  purchaseModal.setAttribute('aria-hidden', 'true');
  purchaseStatus.textContent = '';
}

function openRedeemModalWindow() {
  redeemModal.classList.add('open');
  redeemModal.setAttribute('aria-hidden', 'false');
}

function closeRedeemModalWindow() {
  redeemModal.classList.remove('open');
  redeemModal.setAttribute('aria-hidden', 'true');
  redeemStatus.textContent = '';
}

buyBtn.addEventListener('click', openPurchaseModal);
buyBtn2.addEventListener('click', openPurchaseModal);
closeModal.addEventListener('click', closePurchaseModal);

if (openRedeemBtn) openRedeemBtn.addEventListener('click', openRedeemModalWindow);
if (openRedeemBtn2) openRedeemBtn2.addEventListener('click', openRedeemModalWindow);
if (closeRedeemModal) closeRedeemModal.addEventListener('click', closeRedeemModalWindow);

purchaseModal.addEventListener('click', (event) => {
  if (event.target === purchaseModal) {
    closePurchaseModal();
  }
});

redeemModal.addEventListener('click', (event) => {
  if (event.target === redeemModal) {
    closeRedeemModalWindow();
  }
});

purchaseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  purchaseStatus.textContent = '';

  const email = emailInput.value.trim();
  if (!email) {
    purchaseStatus.textContent = 'Please enter a valid email.';
    return;
  }

  purchaseStatus.textContent = 'Preparing secure checkout…';

  try {
    const response = await fetch('/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      purchaseStatus.textContent = data.details
        ? `${data.error} ${data.details}`
        : data.error || 'Checkout could not be started.';
      return;
    }

    purchaseStatus.textContent = 'Redirecting to secure payment page...';
    window.location.href = data.url;
  } catch (error) {
    console.error(error);
    purchaseStatus.textContent = 'Unable to connect to the backend. Start the server with `npm run dev` and try again.';
  }
});

redeemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  redeemStatus.textContent = '';

  const email = redeemEmailInput.value.trim();
  const license = redeemLicenseInput.value.trim();
  if (!email || !license) {
    redeemStatus.textContent = 'Email and license key are required.';
    return;
  }

  redeemStatus.textContent = 'Checking your license…';

  try {
    const response = await fetch('/api/validate-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, license }),
    });

    const data = await response.json();
    if (!response.ok || !data.valid) {
      redeemStatus.textContent = data.error || 'License not found or invalid.';
      return;
    }

    if (!data.downloadUrl) {
      redeemStatus.textContent = 'Validated, but no download URL was returned. Contact support.';
      return;
    }

    redeemStatus.textContent = 'Success. Starting download…';
    window.location.assign(data.downloadUrl);
  } catch (error) {
    console.error(error);
    redeemStatus.textContent = 'Unable to reach the server. Confirm the site is running and try again.';
  }
});

const params = new URLSearchParams(window.location.search);
if (params.get('payment') === 'success') {
  openRedeemModalWindow();
  redeemStatus.textContent = 'Payment received. Check your email for your license key, then enter it below to download.';
}
