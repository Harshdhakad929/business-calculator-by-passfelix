// Create floating particles
function createParticles() {
    const colors = ['#6c5ce7', '#a29bfe', '#fd79a8', '#ffeaa7'];
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;
        
        // Apply styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.background = color;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        
        document.body.appendChild(particle);
    }
  }
  
  // Utility: Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');
    if (!toast || !toastMessage || !icon) return;
    toastMessage.textContent = message;
    toast.className = 'toast show';
    icon.className = 'fas';
    switch (type) {
        case 'error': toast.classList.add('error'); icon.classList.add('fa-times-circle'); break;
        case 'warning': toast.classList.add('warning'); icon.classList.add('fa-exclamation-triangle'); break;
        case 'info': toast.classList.add('info'); icon.classList.add('fa-info-circle'); break;
        default: toast.classList.add('success'); icon.classList.add('fa-check-circle');
    }
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// Get Final Bill Amount
function getFinalBillAmount() {
    const el = document.getElementById('currentTotal');
    if (!el) return 0;
    const txt = el.textContent.replace(/[^\d.-]/g, '');
    const amt = parseFloat(txt);
    return isNaN(amt) ? 0 : amt;
}

// Generate Bill (with QR if UPI)
function generateBill() {
    const shopName = document.getElementById('shopName').value || "Your Shop";
    const invoiceNumber = document.getElementById('invoiceNumber').value || "N/A";
    const currencySymbol = document.getElementById('currency').value;
    const paymentType = document.getElementById('paymentType').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhoneNumber').value;
    const upiId = document.getElementById('upiId')?.value || '';
    const paymentNote = document.getElementById('paymentNote')?.value || `Payment for Invoice ${invoiceNumber}`;
    const now = new Date();
    const billDate = now.toLocaleDateString();
    const billTime = now.toLocaleTimeString();

    // Build items table
    const itemsListBody = document.getElementById('itemsList');
    let itemsHtml = '';
    let calculatedSubtotal = 0;
    if (itemsListBody && itemsListBody.rows.length > 0) {
        for (const row of itemsListBody.rows) {
            const productName = row.cells[0].textContent || (row.cells[0].querySelector('input') ? row.cells[0].querySelector('input').value : "N/A");
            const quantity = row.cells[3].textContent || (row.cells[3].querySelector('input') ? row.cells[3].querySelector('input').value : "1");
            const priceText = row.cells[6].textContent.replace(currencySymbol, '').trim();
            const itemPrice = parseFloat(priceText) || 0;
            itemsHtml += `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${quantity}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${currencySymbol}${itemPrice.toFixed(2)}</td>
            </tr>`;
            calculatedSubtotal += itemPrice;
        }
    } else {
        itemsHtml += `<tr><td colspan="3" style="padding: 8px; text-align: center;">No items in the bill.</td></tr>`;
    }
    const totalAmount = getFinalBillAmount();

    // Bill HTML
    let billHtml = `
        <div style="font-family: 'Poppins', Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px auto; max-width: 450px; font-size: 14px; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 0 0 5px 0; font-size: 20px;">${shopName}</h2>
                <p style="margin: 0;">Invoice #: <strong>${invoiceNumber}</strong></p>
                <p style="margin: 0;">Date: ${billDate} | Time: ${billTime}</p>
            </div>
            ${customerName ? `<p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>` : ''}
            <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; font-size: 16px; text-align: center;">Order Details</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr style="background-color: #f0f0f0;">
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Qty</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
            <div style="text-align: right; margin-bottom: 10px;">
                <strong style="font-size: 18px;">Total: ${currencySymbol}${totalAmount.toFixed(2)}</strong>
            </div>
            <p style="margin: 5px 0;"><strong>Payment Mode:</strong> ${paymentType.toUpperCase()}</p>
    `;

    // Add QR Code if payment type is UPI
    if (paymentType === 'upi') {
        if (upiId && totalAmount > 0) {
            let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(shopName)}&am=${encodeURIComponent(totalAmount.toFixed(2))}&cu=INR&tn=${encodeURIComponent(paymentNote)}`;
            const tempQrContainer = document.createElement('div');
            new QRCode(tempQrContainer, {
                text: upiString,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
            const qrImgTag = tempQrContainer.querySelector('img');
            const qrCanvasTag = tempQrContainer.querySelector('canvas');
            let qrCodeDataUrl = '';
            if (qrImgTag && qrImgTag.src) qrCodeDataUrl = qrImgTag.src;
            else if (qrCanvasTag) qrCodeDataUrl = qrCanvasTag.toDataURL('image/png');
            if (qrCodeDataUrl) {
                billHtml += `
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                    <div style="text-align: center; margin-top: 15px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 16px;">Scan to Pay via UPI</h4>
                        <img src="${qrCodeDataUrl}" alt="UPI QR Code" style="width: 128px; height: 128px; border: 1px solid #eee; display: block; margin: 0 auto 10px auto;">
                        <p style="font-size: 0.9em; margin: 0;">UPI ID: ${upiId}</p>
                    </div>`;
            } else {
                billHtml += `<p style="text-align: center; color: red; margin-top: 10px;">Could not generate UPI QR Code.</p>`;
            }
        } else if (upiId) {
            billHtml += `<p style="text-align: center; color: orange; margin-top: 10px;">UPI QR Code cannot be generated for zero amount.</p>`;
        } else {
            billHtml += `<p style="text-align: center; color: orange; margin-top: 10px;">UPI ID not provided for QR Code generation.</p>`;
        }
    }

    billHtml += `
        <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
        <div class="no-print" style="text-align:center; margin-top:20px;">
            <button onclick="printBill()" class="btn-info no-print"><i class="fas fa-print"></i> Print Bill</button>
            <button onclick="shareOnWhatsApp()" class="btn-success no-print"><i class="fab fa-whatsapp"></i> Share on WhatsApp</button>
            <button onclick="document.getElementById('printBill').classList.add('hidden'); document.getElementById('printBill').innerHTML='';" class="btn-danger no-print"><i class="fas fa-times"></i> Close</button>
        </div>
        <p style="text-align: center; font-size: 0.9em; margin-bottom: 0;">Thank you for your business!</p>
        </div>
    `;

    const printBillDiv = document.getElementById('printBill');
    printBillDiv.innerHTML = billHtml;
    printBillDiv.classList.remove('hidden'); // <-- Ensures bill is visible
    showToast('Bill generated successfully.', 'success');
}

// Print Bill (wait for images/QR)
function printBill() {
    document.getElementById('printBill').innerHTML = generateBillHtml(); // Your bill HTML generator
    window.print();
    setTimeout(() => { document.getElementById('printBill').innerHTML = ''; }, 1000); // Optional: clear after print
}

// Example: Generate bill HTML from current form and items
function generateBillHtml() {
    // Get shop and invoice details
    const shopName = document.getElementById('shopName').value || 'Shop Name';
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const gstNumber = document.getElementById('gstNumber').value || '';
    const customerName = document.getElementById('customerName').value || '';
    const currency = document.getElementById('currency').value || '₹';
    const date = new Date().toLocaleString();

    // Get items from table
    const itemsTable = document.getElementById('itemsTable');
    let itemsRows = '';
    const rows = document.querySelectorAll('#itemsList tr');
    if (rows.length === 0) {
        itemsRows = `<tr><td colspan="7" style="text-align:center;">No items</td></tr>`;
    } else {
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 7) {
                itemsRows += `<tr>
                    <td>${cells[0].innerText}</td>
                    <td>${cells[1].innerText}</td>
                    <td>${cells[2].innerText}</td>
                    <td>${cells[3].innerText}</td>
                    <td>${cells[4].innerText}</td>
                    <td>${cells[5].innerText}</td>
                    <td>${cells[6].innerText}</td>
                </tr>`;
            }
        });
    }

    // Get total
    const total = document.getElementById('currentTotal').innerText || `${currency}0.00`;

    // Bill HTML
    return `
        <div class="bill-header" style="text-align:center;">
            <h2>${shopName}</h2>
            <div>GSTIN: ${gstNumber}</div>
            <div>Invoice #: ${invoiceNumber}</div>
            <div>Date: ${date}</div>
            ${customerName ? `<div>Customer: ${customerName}</div>` : ''}
        </div>
        <hr>
        <table class="bill-items" style="width:100%;border-collapse:collapse;margin:20px 0;">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Cost Price</th>
                    <th>Margin</th>
                    <th>Qty</th>
                    <th>Discount</th>
                    <th>Tax</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${itemsRows}
            </tbody>
        </table>
        <div class="bill-total" style="text-align:right;font-size:18px;font-weight:bold;">
            Total: ${total}
        </div>
        <div class="bill-footer" style="text-align:center;margin-top:30px;">
            <strong>Thank you for your business!</strong>
        </div>
    `;
}

// WhatsApp Share
function shareOnWhatsApp() {
    const customerPhoneNumberInput = document.getElementById('customerPhoneNumber');
    const customerPhoneNumber = customerPhoneNumberInput ? customerPhoneNumberInput.value : '';
    const shopName = document.getElementById('shopName').value || "Your Shop";
    const invoiceNumber = document.getElementById('invoiceNumber').value || "N/A";
    const currencySymbol = document.getElementById('currency').value;
    const totalAmount = getFinalBillAmount();
    if (!customerPhoneNumber) {
        showToast("Please enter customer's phone number (with country code).", 'warning');
        customerPhoneNumberInput?.focus();
        return;
    }
    const sanitizedPhoneNumber = customerPhoneNumber.replace(/\D/g, '');
    if (!sanitizedPhoneNumber) {
        showToast("Invalid phone number format. Please include country code.", 'error');
        customerPhoneNumberInput?.focus();
        return;
    }
    if (totalAmount <= 0) {
        showToast("Cannot share an empty or zero-value bill. Please add items and generate a bill.", 'warning');
        return;
    }
    let message = `Hello! Here is your bill summary from ${shopName}:\n\n`;
    message += `Invoice #: *${invoiceNumber}*\n`;
    message += `Total Amount: *${currencySymbol}${totalAmount.toFixed(2)}*\n\n`;
    message += `Items:\n`;
    const itemsListBody = document.getElementById('itemsList');
    if (itemsListBody && itemsListBody.rows.length > 0) {
        for (const row of itemsListBody.rows) {
            const productNameCell = row.cells[0];
            const quantityCell = row.cells[3];
            const priceCell = row.cells[6];
            const productName = productNameCell?.textContent || (productNameCell?.querySelector('input') ? productNameCell.querySelector('input').value : "N/A");
            const quantity = quantityCell?.textContent || (quantityCell?.querySelector('input') ? quantityCell.querySelector('input').value : "1");
            const priceText = (priceCell?.textContent || "0").replace(currencySymbol, '').trim();
            const itemPrice = parseFloat(priceText) || 0;
            message += `- ${productName} (Qty: ${quantity}) - ${currencySymbol}${itemPrice.toFixed(2)}\n`;
        }
    } else {
        message += `(No items listed in current calculation)\n`;
    }
    message += `\nThank you for your business!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sanitizedPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    showToast("Redirecting to WhatsApp...", 'info');
}

// CSV Export for ITR/Tracking
function exportSalesToCSV() {
    const items = document.querySelectorAll('#itemsList tr');
    if (items.length === 0) {
        showToast('No items to export.', 'warning');
        return;
    }
    const shopName = document.getElementById('shopName').value || '';
    const invoiceNumber = document.getElementById('invoiceNumber').value || '';
    const customerName = document.getElementById('customerName').value || '';
    const customerPhone = document.getElementById('customerPhoneNumber').value || '';
    const gstNumber = document.getElementById('gstNumber').value || '';
    const paymentType = document.getElementById('paymentType').value || '';
    const currencySymbol = document.getElementById('currency').value || '₹';
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    let csv = 'Date,Invoice Number,Shop Name,Customer Name,Customer Phone,GSTIN,Payment Type,Product Name,Cost Price,Margin,Quantity,Discount,Tax,Price,Currency\n';
    items.forEach(row => {
        const cols = row.querySelectorAll('td');
        const product = cols[0]?.querySelector('input')?.value || cols[0]?.textContent || '';
        const cost = cols[1]?.querySelector('input')?.value || cols[1]?.textContent || '';
        const margin = cols[2]?.querySelector('input')?.value || cols[2]?.textContent || '';
        const qty = cols[3]?.querySelector('input')?.value || cols[3]?.textContent || '';
        const discount = cols[4]?.querySelector('input')?.value || cols[4]?.textContent || '';
        const tax = cols[5]?.querySelector('input')?.value || cols[5]?.textContent || '';
        const price = cols[6]?.textContent || '';
        csv += [
            dateStr,
            `"${invoiceNumber}"`,
            `"${shopName}"`,
            `"${customerName}"`,
            `"${customerPhone}"`,
            `"${gstNumber}"`,
            `"${paymentType}"`,
            `"${product}"`,
            cost,
            margin,
            qty,
            discount,
            tax,
            price,
            `"${currencySymbol}"`
        ].join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_${invoiceNumber || dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
  
  // Toggle dark mode
  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const themeToggle = document.querySelector('.theme-toggle i');
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        themeToggle.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'disabled');
    }
  }
  
  // Toggle UPI payment section
  function toggleUpiSection() {
    const paymentType = document.getElementById('paymentType').value;
    const upiSection = document.getElementById('upiPaymentSection');
    
    if (paymentType === 'upi') {
        upiSection.style.display = 'block';
        upiSection.classList.add('active');
        updateQrPreview();
    } else {
        upiSection.style.display = 'none';
        upiSection.classList.remove('active');
    }
  }
  
  // Generate UPI QR Code
  function generateUpiQrCode(containerId, upiId, amount, note) {
    const qrContainer = document.getElementById(containerId);
    if (!qrContainer) {
        console.error("QR Code container not found");
        return false;
    }
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Validate UPI ID
    if (!upiId || !upiId.includes('@')) {
        qrContainer.innerHTML = '<p style="color:red; font-size:12px;">Enter valid UPI ID</p>';
        return false;
    }
    
    try {
        // Format UPI payment URL
        const qrData = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(document.getElementById('shopName').value || 'PassFelix Store')}&am=${amount}&tn=${encodeURIComponent(note || 'Payment')}`;
        
        // Generate new QR code with optimal size for scanning (2cm × 2cm)
        new QRCode(qrContainer, {
            text: qrData,
            width: 150,
            height: 150,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        return true;
    } catch (e) {
        console.error("QR Code generation failed:", e);
        qrContainer.innerHTML = '<p style="color:red; font-size:12px;">Failed to generate QR</p>';
        return false;
    }
  }
  
  // Update QR code preview in real-time
  function updateQrPreview() {
    const upiId = document.getElementById('upiId').value;
    const amount = document.getElementById('currentTotal').textContent.replace('$', '') || '0';
    const note = document.getElementById('paymentNote').value || `Payment for ${document.getElementById('invoiceNumber').value}`;
    
    generateUpiQrCode('qrCodePreview', upiId, amount, note);
  }
  
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.querySelector('.theme-toggle i').className = 'fas fa-sun';
  }
  
  // Simple login system
  function login() { // Keeping the name simple as requested
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    // Simple hardcoded credentials for demo
    if(email === 'admin@example.com' && password === '123') {
        // Animate login transition
        const authSection = document.getElementById('authSection');
        authSection.style.transform = 'rotateY(90deg)';
        authSection.style.opacity = '0';
        
        setTimeout(() => {
            authSection.classList.add('hidden');
            authSection.style.transform = ''; // Reset transform
            authSection.style.opacity = ''; // Reset opacity
  
            document.getElementById('calculatorSection').classList.remove('hidden');
            document.getElementById('calculatorSection').style.transform = 'rotateY(-90deg)';
            
            setTimeout(() => {
                document.getElementById('calculatorSection').style.transform = 'rotateY(0)';
            }, 100); // Slight delay for the second animation
        }, 500);
        
        loadHistory();
        showToast('Login successful');
        
        // Initialize UPI section state
        toggleUpiSection();
        
        // Set up UPI ID input listener for real-time QR generation
        document.getElementById('upiId').addEventListener('input', updateQrPreview);
        document.getElementById('paymentNote').addEventListener('input', updateQrPreview);
    } else {
        // Shake animation for wrong credentials
        const authSection = document.getElementById('authSection');
        authSection.style.animation = 'shake 0.5s';
        setTimeout(() => {
            authSection.style.animation = '';
        }, 500);
        
        showToast('Invalid credentials. Use admin/123', 'error');
    }
  }
  
  function logout() {
    // Animate logout transition
    document.getElementById('calculatorSection').style.transform = 'rotateY(90deg)';
    
    setTimeout(() => {
        document.getElementById('calculatorSection').classList.add('hidden');
        const authSection = document.getElementById('authSection');
        authSection.classList.remove('hidden');
        authSection.style.transform = 'rotateY(-90deg)';
        authSection.style.opacity = '1';
        
        setTimeout(() => {
            authSection.style.transform = 'rotateY(0)';
        }, 50);
    }, 500);
    
    showToast('Logged out successfully');
  }
  
  // Show Sign In Form
  function showSignInForm() {
    document.getElementById('signUpForm').classList.add('hidden');
    document.getElementById('signInForm').classList.remove('hidden');
  }
  
  // Show Sign Up Form
  function showSignUpForm() {
    document.getElementById('signInForm').classList.add('hidden');
    document.getElementById('signUpForm').classList.remove('hidden');
  }
  
  // Placeholder for sending OTP
  function sendOtp() {
      const mobile = document.getElementById('signInMobile').value;
      showToast(`OTP sent to ${mobile} (Placeholder)`, 'info');
  }
  
  // Placeholder for login with OTP
  function loginWithOtp() {
      const mobile = document.getElementById('signInMobile').value;
      const otp = document.getElementById('signInOtp').value;
      showToast(`Logging in with mobile ${mobile} and OTP ${otp} (Placeholder)`, 'info');
  }
  
  // Placeholder for Sign Up
  function signup() {
      showToast('Sign up functionality coming soon (Placeholder)', 'info');
  }
  
  // Tab navigation
  function showTab(tabName) {
    // Update active tab
    document.querySelectorAll('.tab').forEach((tab, index) => {
        tab.classList.remove('active');
        if((tabName === 'calculator' && index === 0) || 
           (tabName === 'history' && index === 1) ||
           (tabName === 'export' && index === 2)) {
            tab.classList.add('active');
        }
    });
    
    // Show selected tab
    document.getElementById('calculatorTab').classList.add('hidden');
    document.getElementById('historyTab').classList.add('hidden');
    document.getElementById('exportTab').classList.add('hidden');
    
    document.getElementById(`${tabName}Tab`).classList.remove('hidden');
    
    // Load data if needed
    if(tabName === 'history') {
        loadHistory();
    }
    if(tabName === 'export') {
        document.getElementById('exportOutput').innerHTML = '';
    }
  }
  
  // Add new item row
  function addItem() {
    const itemsList = document.getElementById('itemsList');
    const itemId = Date.now();
    
    const row = document.createElement('tr');
    row.id = `item-${itemId}`;
    row.innerHTML = `
        <td><input type="text" id="productName-${itemId}" placeholder="Product name" onchange="calculateItem(${itemId})"></td>
        <td><input type="number" id="costPrice-${itemId}" placeholder="0.00" step="0.01" onchange="calculateItem(${itemId})"></td>
        <td><input type="number" id="profitMargin-${itemId}" placeholder="0" value="30" step="0.01" onchange="calculateItem(${itemId})"></td>
        <td><input type="number" id="quantity-${itemId}" value="1" min="1" onchange="calculateItem(${itemId})"></td>
        <td><input type="number" id="discount-${itemId}" value="0" min="0" max="100" step="0.01" onchange="calculateItem(${itemId})"></td>
        <td><input type="number" id="taxRate-${itemId}" value="0" min="0" max="100" step="0.01" onchange="calculateItem(${itemId})"></td>
        <td id="price-${itemId}">$0.00</td>
        <td><button class="remove-item-btn" onclick="removeItem(${itemId})"><i class="fas fa-trash"></i></button></td>
    `;
    
    itemsList.appendChild(row);
    calculateItem(itemId);
    updateItemsCount();
    showToast('Item added');
  }
  
  // Remove item row
  function removeItem(itemId) {
    const row = document.getElementById(`item-${itemId}`);
    if(row) {
        row.remove();
        calculateTotal();
        updateItemsCount();
        showToast('Item removed');
    }
  }
  
  // Clear all items
  function clearAllItems() {
    if(confirm('Are you sure you want to clear all items?')) {
        document.getElementById('itemsList').innerHTML = '';
        calculateTotal();
        updateItemsCount();
        showToast('All items cleared', 'warning');
    }
  }
  
  // Update items count in status bar
  function updateItemsCount() {
    const count = document.getElementById('itemsList').querySelectorAll('tr').length;
    document.getElementById('itemsCount').textContent = count;
  }
  
  // Calculate single item
  function calculateItem(itemId) {
    const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
    const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
    const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
    const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
    const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;

    // Calculations
    const basePrice = cost * (1 + margin/100);
    const totalBeforeDiscount = basePrice * qty;
    // Ensure discountAmount does not exceed totalBeforeDiscount if needed, though max="100" on input helps
    const discountAmount = totalBeforeDiscount * (discount/100);
    const afterDiscount = totalBeforeDiscount - discountAmount;
    const taxAmount = afterDiscount * (tax/100);
    const finalPrice = afterDiscount + taxAmount;
    
    // Get selected currency symbol
    const currencySelect = document.getElementById('currency');
    const currencySymbol = currencySelect ? currencySelect.value : '$'; // Default to $ if not found

    // Display price
   document.getElementById(`price-${itemId}`).textContent = `${currencySymbol}${finalPrice.toFixed(2)}`;
  
    // Calculate total
    calculateTotal();
  }
  
  // Calculate total of all items
  function calculateTotal() {
    const rows = document.getElementById('itemsList').querySelectorAll('tr');
    let total = 0;
    let items = [];

    // Get selected currency symbol once for parsing
    const currencySelect = document.getElementById('currency');
    const currencySymbol = currencySelect ? currencySelect.value : '$';
    
    rows.forEach(row => {
        const itemId = row.id.split('-')[1];
        const product = document.getElementById(`productName-${itemId}`).value || 'Product';
        const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
        const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
        const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
        const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
        const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;
        const priceText = document.getElementById(`price-${itemId}`).textContent;
        const price = parseFloat(priceText.replace(currencySymbol, '')) || 0;
        
        total += price;
        
        items.push({
            product,
            cost,
            margin,
            qty,
            discount,
            tax,
            price
        });
    });
    
    // Update current total in status bar (currencySymbol already fetched above)
    document.getElementById('currentTotal').textContent = `${currencySymbol}${total.toFixed(2)}`;
    
    // Update business type badge
    const businessType = document.getElementById('businessType').value;
    const badge = document.getElementById('businessTypeBadge');
    badge.textContent = businessType === 'retail' ? 'Retail' : 'Wholesale';
    badge.className = `badge ${businessType === 'retail' ? 'badge-primary' : 'badge-warning'}`;
    
    // Display results
    const resultDetails = document.getElementById('resultDetails');
    resultDetails.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <strong>Total Items:</strong>
            <span>${rows.length}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 20px;">
            <strong>Grand Total:</strong>
            <span>${currencySymbol}${total.toFixed(2)}</span>
        </div>
    `;
    
    // Update QR preview if UPI is selected
    if (document.getElementById('paymentType').value === 'upi') {
        updateQrPreview();
    }
  }
  
  // Save as draft
  function saveAsDraft() {
    const rows = document.getElementById('itemsList').querySelectorAll('tr');
    if(rows.length === 0) {
        showToast('No items to save', 'warning');
        return;
    }
    
    const shopName = document.getElementById('shopName').value || 'My Shop';
    const businessType = document.getElementById('businessType').value;
    const paymentType = document.getElementById('paymentType').value;
    const gstNumber = document.getElementById('gstNumber').value;
    /**
     * Retrieves the value of the input element with the ID 'invoiceNumber'.
     * @type {string}
     */
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const upiId = document.getElementById('upiId').value;
    
    let items = [];
    let total = 0;
    
    // Get selected currency symbol once for parsing
    const currencySelect = document.getElementById('currency');
    const draftCurrencySymbol = currencySelect ? currencySelect.value : '$'; // Use a different name to avoid conflict if currencySymbol is global

    rows.forEach(row => {
        const itemId = row.id.split('-')[1];
        const product = document.getElementById(`productName-${itemId}`).value || 'Product';
        const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
        const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
        const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
        const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
        const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;
        const priceText = document.getElementById(`price-${itemId}`).textContent;
        const price = parseFloat(priceText.replace(draftCurrencySymbol, '')) || 0;
        
        total += price;
        
        items.push({
            product,
            cost,
            margin,
            qty,
            discount,
            tax,
            price
        });
    });
    
    // Save to drafts (draftCurrencySymbol is available here)
    let drafts = JSON.parse(localStorage.getItem('calcDrafts') || '[]');
    
    const now = new Date();
  
    drafts.unshift({
        id: Date.now(), // Add a unique ID for the draft
        shopName,
        businessType,
        gstNumber,
        invoiceNumber,
        upiId,
        items,
        total,
        currencySymbol: draftCurrencySymbol, // Save the currency symbol with the draft
        timestamp: new Date().toLocaleString()
    });
    
    // Keep only last 10 drafts
    if(drafts.length > 10) drafts.pop();
    
    localStorage.setItem('calcDrafts', JSON.stringify(drafts));
    showToast('Draft saved successfully');
  }
  
  // Generate monthly sequential invoice number
  function generateMonthlyInvoiceNumber() {
      const now = new Date();
      const currentMonthYear = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const localStorageKey = 'lastInvoice';
  
      let lastInvoice = JSON.parse(localStorage.getItem(localStorageKey) || '{}');
  
      let invoiceNumber = 1;
      if (lastInvoice.monthYear === currentMonthYear) {
          invoiceNumber = lastInvoice.number + 1;
      }
  
      const formattedInvoiceNumber = `INV-${currentMonthYear}-${invoiceNumber.toString().padStart(3, '0')}`;
  
      localStorage.setItem(localStorageKey, JSON.stringify({ monthYear: currentMonthYear, number: invoiceNumber }));
      return formattedInvoiceNumber;
  }

  // Consolidated and corrected generateBill function
    function generateBill() {
        const itemsTableBody = document.getElementById('itemsList');
        if (!itemsTableBody) {
            console.error("itemsList element not found");
            showToast('Error: Bill generation component missing.', 'error');
            return;
        }
        const items = itemsTableBody.querySelectorAll('tr');
    
        if (items.length === 0) {
            showToast('Please add items to generate bill', 'warning');
            return;
        }
    
        // Get details
        const shopName = document.getElementById('shopName')?.value || 'My Shop';
        const invoiceNumber = document.getElementById('invoiceNumber')?.value || 'INV-001';
        const customerName = document.getElementById('customerName')?.value || '';
        const customerPhone = document.getElementById('customerPhoneNumber')?.value || '';
        const gstNumber = document.getElementById('gstNumber')?.value || '';
        const paymentTypeElement = document.getElementById('paymentType');
        const paymentType = paymentTypeElement ? paymentTypeElement.options[paymentTypeElement.selectedIndex]?.text : 'N/A'; // Get text of selected option
        const currencySymbol = document.getElementById('currency')?.value || '₹';
        const now = new Date();
        const upiId = document.getElementById('upiId')?.value || '';
    
    
        // Build items table for the bill
        let itemsHtml = '';
        let subtotal = 0;
        items.forEach(row => {
            const cols = row.querySelectorAll('td');
            if (cols.length < 7) { // Ensure row has enough columns
                console.warn('Skipping malformed row in itemsList:', row);
                return;
            }
            
            // Correctly get product name from input inside the first td
            const productNameInput = cols[0]?.querySelector('input[type="text"]');
            const product = productNameInput ? productNameInput.value.trim() : 'N/A';
            
            // Correctly get quantity from input inside the fourth td
            const quantityInput = cols[3]?.querySelector('input[type="number"]');
            const qtyText = quantityInput ? quantityInput.value.trim() : '1';
            const totalPriceText = cols[6]?.textContent?.trim() || '0'; // This is the total selling price for this line item
    
            const qtyValue = parseFloat(qtyText);
            const totalSellingPriceValue = parseFloat(totalPriceText.replace(/[^\d.-]/g, '')) || 0; // Allow negative for discounts if any
    
            let sellingUnitPriceText = `${currencySymbol}0.00`;
            if (qtyValue !== 0) { // Avoid division by zero
                sellingUnitPriceText = currencySymbol + (totalSellingPriceValue / qtyValue).toFixed(2);
            }
    
            itemsHtml += `
                <tr>
                    <td style="padding: 5px; border: 1px solid #ddd;">${product}</td>
                    <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${qtyText}</td>
                    <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${sellingUnitPriceText}</td>
                    <td style="padding: 5px; border: 1px solid #ddd; text-align: right;">${currencySymbol}${totalSellingPriceValue.toFixed(2)}</td>
                </tr>
            `;
            subtotal += totalSellingPriceValue;
        });
    
        // Grand Total (can include taxes, discounts if calculated globally later)
        const grandTotal = subtotal; // For now, subtotal is grand total
    
        // Bill HTML
        const billHtml = `
            <div class="bill-container-actual" style="font-family: 'Poppins', sans-serif; padding: 20px; border: 1px solid #ccc; margin: 10px auto; max-width: 800px; background-color: #fff; color: #000;">
                <div style="text-align:center; margin-bottom:15px;">
                    <h2 style="margin-bottom:5px; font-size: 24px;">Invoice</h2>
                    <p style="margin:2px 0;"><strong>Shop Name:</strong> ${shopName}</p>
                    <p style="margin:2px 0;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p style="margin:2px 0;"><strong>Date:</strong> ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
                    ${gstNumber ? `<p style="margin:2px 0;"><strong>GSTIN:</strong> ${gstNumber}</p>` : ''}
                </div>
                <hr style="border-top: 1px dashed #ccc; margin-bottom: 15px;">
                <div style="margin-bottom:15px;">
                    <h4 style="margin-bottom:5px; font-size: 16px;">Bill To:</h4>
                    ${customerName ? `<p style="margin:2px 0;"><strong>Customer Name:</strong> ${customerName}</p>` : ''}
                    ${customerPhone ? `<p style="margin:2px 0;"><strong>Customer Phone:</strong> ${customerPhone}</p>` : ''}
                    ${(!customerName && !customerPhone) ? '<p style="margin:2px 0;">Walk-in Customer</p>' : ''}
                </div>
                
                <table style="width:100%; border-collapse:collapse; font-size: 14px;">
                    <thead>
                        <tr>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; text-align: left;">Item Name</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; text-align: right;">Quantity</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; text-align: right;">Unit Price</th>
                            <th style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; text-align: right;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div style="text-align:right; margin-top:15px; font-size: 14px;">
                    <p style="margin:3px 0;"><strong>Subtotal:</strong> ${currencySymbol}${subtotal.toFixed(2)}</p>
                    <!-- Add lines for global Discount, Taxes if applicable -->
                    <p style="margin:5px 0; font-size: 18px;"><strong>Grand Total:</strong> ${currencySymbol}${grandTotal.toFixed(2)}</p>
                    <p style="margin:3px 0;"><strong>Payment Type:</strong> ${paymentType}</p>
                    ${(paymentTypeElement?.value === 'upi' && upiId) ? `<p style="margin:3px 0;"><strong>UPI ID:</strong> ${upiId}</p>` : ''}
    
                </div>
                <hr style="border-top: 1px dashed #ccc; margin-top: 15px; margin-bottom: 15px;">
                <div class="no-print" style="text-align:center; margin-top:20px; margin-bottom:10px;">
                    <button onclick="printGeneratedBill()" class="btn-info no-print" style="padding: 8px 15px; margin: 5px;"><i class="fas fa-print"></i> Print Bill</button>
                    <button onclick="shareBillOnWhatsApp(
                        '${shopName}', 
                        '${invoiceNumber}', 
                        '${currencySymbol}', 
                        ${subtotal.toFixed(2)}, 
                        '${customerName}', 
                        '${customerPhone}')" 
                        class="btn-success no-print"><i class="fab fa-whatsapp"></i> Share on WhatsApp</button>
                    <button onclick="document.getElementById('printBill').classList.add('hidden'); document.getElementById('printBill').innerHTML='';" class="btn-danger no-print" style="padding: 8px 15px; margin: 5px;"><i class="fas fa-times"></i> Close</button>
                </div>
                <div style="text-align:center; margin-top:15px; font-size:12px; color: #555;">
                    <p style="margin:2px 0;">Thank you for your business!</p>
                    <p style="margin:2px 0;">Powered by Business Calculator by PassFelix</p>
                </div>
            </div>
        `;
    
        const billDiv = document.getElementById('printBill');
        if (billDiv) {
            billDiv.innerHTML = billHtml;
            billDiv.classList.remove('hidden');
            showToast('Bill generated successfully!', 'success');
        } else {
            console.error("printBill element not found");
            showToast('Error: Bill display area missing.', 'error');
        }
    }
    
    // New function to handle printing from the generated bill's button
    function printGeneratedBill() {
        window.print();
    }
    
    // This function is called by the main UI "Print Bill" button
    function printBill() { 
        const billDiv = document.getElementById('printBill');
        if (!billDiv || billDiv.classList.contains('hidden') || billDiv.innerHTML.trim() === '') {
            generateBill(); // Generate the bill first
            // Check if bill generation was successful and is now visible
            if (billDiv && !billDiv.classList.contains('hidden') && billDiv.innerHTML.trim() !== '') {
                printUsingNewWindow(); // Then print using the new window method
            }
        } else {
            printUsingNewWindow(); // Bill is already generated and visible, print it
        }
    }
  
  // Function to share bill details on WhatsApp 
 function shareBillOnWhatsApp(shopName, invoiceNumber, currencySymbol, subtotal, customerName = '', customerPhoneNumber = '') {
    
    const rows = document.getElementById('itemsList').querySelectorAll('tr');
      // Basic message for WhatsApp
      // Placeholder payment link - replace with your actual payment link generation logic
      const paymentLinkPlaceholder = "[Your Payment Link Here]";
  
      let itemsText = '';
      rows.forEach(row => {
          const itemId = row.id.split('-')[1];
          const product = document.getElementById(`productName-${itemId}`).value || 'Product';
          const qty = document.getElementById(`quantity-${itemId}`).value || '1'; // Keep as string for display consistency if not parsing
          const price = parseFloat(document.getElementById(`price-${itemId}`).textContent.replace(currencySymbol, '')) || 0;
          itemsText += `${product} (x${qty}): ${currencySymbol}${price.toFixed(2)}\n`;
      });
 
    let message = '';
    if (customerName) {
        message += `Dear ${customerName},\n\n`;
    }
    message += `Here is your bill from ${shopName}:\n\nInvoice Number: ${invoiceNumber}\n\nItems:\n${itemsText}\nTotal Amount: ${currencySymbol}${subtotal.toFixed(2)}\n\nPay here: ${paymentLinkPlaceholder}\n\nThank you!`;
  
      // Encode the message for a URL
      const encodedMessage = encodeURIComponent(message);
      // Create the WhatsApp sharing URL
      // Use 'api' for mobile apps, 'web' for WhatsApp Web
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${encodeURIComponent(customerPhoneNumber)}&text=${encodedMessage}`;
  
      // Open the WhatsApp link in a new tab
      window.open(whatsappUrl, '_blank');
  
      // Placeholder: Add logic here to generate a shareable link and provide a copy option.
  }
  
 // Renamed function to print content using a new window
// Print the bill using a new window (single correct implementation)
function printUsingNewWindow() {
    const billSection = document.getElementById('printBill');
    if (!billSection || !billSection.innerHTML.trim()) {
        showToast('Bill content not found for printing.', 'error');
        return;
    }

    // Open a new window and print only the bill content
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Bill</title>
            <link rel="stylesheet" href="styles.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                body { font-family: 'Poppins', Arial, sans-serif; margin: 20px; }
                @media print {
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${billSection.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();

    // Wait for all images (including QR code) to load before printing
    printWindow.onload = function() {
        const images = printWindow.document.images;
        if (images.length === 0) {
            printWindow.print();
            printWindow.close();
        } else {
            let loaded = 0;
            for (let img of images) {
                img.onload = img.onerror = function() {
                    loaded++;
                    if (loaded === images.length) {
                        printWindow.print();
                        printWindow.close();
                    }
                };
            }
        }
    };
}
  // Save calculation to localStorage
  function saveToHistory(data) {
   let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
  
   // Add a unique ID if not already present (for older history entries)
   if (!data.id) {
   data.id = Date.now();
   }
  
   history.unshift(data);
    
    localStorage.setItem('calcHistory', JSON.stringify(history));
  }
  
  // Load history from localStorage
  function loadHistory() {
    const history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    const historyList = document.getElementById('historyList');
    
    if(history.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #7f8c8d;">No calculation history yet</div>';
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div style="display: flex; justify-content: space-between;">
                <strong>${item.invoiceNumber || item.shopName || 'No Invoice'}</strong>
                <span style="color: var(--primary);">
   ${item.currencySymbol || '$'}${parseFloat(item.total || 0).toFixed(2)}
                </span>
            </div>
            <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
   ${item.timestamp}
            </div>
            <div style="font-size: 12px; margin-top: 5px;">
                <span class="badge ${item.businessType === 'retail' ? 'badge-primary' : 'badge-warning'}">
                    ${item.businessType === 'retail' ? 'Retail' : 'Wholesale'}
                </span>
                <span class="badge badge-info">
                    ${item.paymentType}
                </span>
                ${item.gstNumber ? `<span class="badge badge-success">GST: ${item.gstNumber}</span>` : ''}
                ${item.upiId ? `<span class="badge badge-primary">UPI: ${item.upiId}</span>` : ''}
   </div>
            <div style="font-size: 12px; margin-top: 5px;">
   Items: ${item.items.length}
            </div>
        </div>
    `).join('');
  }
  
  // Clear history
  function clearHistory() {
    if(confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('calcHistory');
        loadHistory();
        showToast('History cleared', 'warning');
    }
  }
  
  // Load drafts from localStorage
  function loadDrafts() {
      const drafts = JSON.parse(localStorage.getItem('calcDrafts') || '[]');
      const draftsList = document.getElementById('draftsList'); // Assuming you have a drafts list element
  
      if(drafts.length === 0) {
          if (draftsList) {
              draftsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #7f8c8d;">No saved drafts yet</div>';
          }
          return;
      }
  
      if (draftsList) {
          draftsList.innerHTML = drafts.map(draft => `
              <div class="history-item draft-item">
                  <div style="display: flex; justify-content: space-between;">
                      <strong>Draft: ${draft.invoiceNumber || draft.timestamp}</strong>
                      <span style="color: var(--secondary);">Draft</span>
                  </div>
                   <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                      ${draft.timestamp}
                   </div>
                  <div style="font-size: 12px; margin-top: 5px;">
                      <span class="badge ${draft.businessType === 'retail' ? 'badge-primary' : 'badge-warning'}">
                          ${draft.businessType === 'retail' ? 'Retail' : 'Wholesale'}
                      </span>
                       <span class="badge badge-info">Items: ${draft.items.length}</span>
                       <span class="badge badge-info">Total: ${draft.currencySymbol || '$'}${parseFloat(draft.total || 0).toFixed(2)}</span>
                  </div>
                  <div style="margin-top: 10px; text-align: right;">
                      <button class="btn-secondary btn-sm" onclick="loadDraft('${draft.id}')">Load Draft</button>
                      <button class="btn-danger btn-sm" onclick="deleteDraft('${draft.id}')">Delete Draft</button>
                  </div>
              </div>
          `).join('');
      }
  }
  
  // Export data
  function exportData() {
    const history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    const format = document.getElementById('exportFormat').value;
    let output = '';
    
    if(history.length === 0) {
   showToast('No data to export', 'warning');
   document.getElementById('exportOutput').innerHTML = 'No data to export';
   return;
    }
    
    if(format === 'csv') {
   // CSV header for tax/ITR purposes
   output = '"Invoice Number","Shop Name","Business Type","Payment Type","GST Number","Number of Items","Total Amount","Date","Time"\\n';
  
        // CSV rows for Excel sheet
        history.forEach(item => {
            const dateObj = new Date(item.timestamp);
            const date = dateObj.toLocaleDateString();
            const time = dateObj.toLocaleTimeString();
   const invoiceNumber = item.invoiceNumber || 'N/A';
   const shopName = item.shopName || 'N/A';
   const businessType = item.businessType || 'N/A';
   const paymentType = item.paymentType || 'N/A';
   const gstNumber = item.gstNumber || 'N/A';
   const numberOfItems = item.items ? item.items.length : 0;
   const totalAmount = item.total.toFixed(2);
  
   output += `"${invoiceNumber}","${shopName}","${businessType}","${paymentType}","${gstNumber}",${numberOfItems},${totalAmount},"${date}","${time}"\\n`;
        });
  
        // Create download link
        const blob = new Blob([output], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        document.getElementById('exportOutput').innerHTML = `
            <a href="${url}" download="business_calculations.csv" style="color: var(--primary);">
                <i class="fas fa-file-csv"></i> Download CSV File
            </a>
        `;
    }
    else if(format === 'json') {
        output = JSON.stringify(history, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        document.getElementById('exportOutput').innerHTML = `
            <pre style="max-height: 200px; overflow: auto; background: white; padding: 10px; border-radius: 5px;">${output}</pre>
            <a href="${url}" download="business_calculations.json" style="color: var(--primary); margin-top: 10px; display: inline-block;">
                <i class="fas fa-file-code"></i> Download JSON File
            </a>
        `;
    }
    else if(format === 'pdf') {
        showToast('PDF export coming soon!', 'warning');
        document.getElementById('exportOutput').innerHTML = `
            <div style="text-align: center; padding: 20px; background: var(--warning); color: var(--dark); border-radius: 10px;">
                <i class="fas fa-file-pdf" style="font-size: 24px;"></i>
                <p style="margin-top: 10px;">PDF export feature coming in the next update!</p>
            </div>
        `;
    }
    else {
        // Text summary
   output = 'BUSINESS CALCULATION HISTORY\n\n';
   history.forEach(item => {
   output += `SHOP: ${item.shopName}\n`;
   output += `DATE: ${item.timestamp}\n`;
   output += `TYPE: ${item.businessType === 'retail' ? 'Retail' : 'Wholesale'}\n`;
   output += `PAYMENT: ${item.paymentType}\n`;
            if(item.gstNumber) output += `GST: ${item.gstNumber}\n`;
            if(item.invoiceNumber) output += `INVOICE: ${item.invoiceNumber}\n`;
            if(item.upiId) output += `UPI ID: ${item.upiId}\n`;
   output += `ITEMS: ${item.items.length}\n`;
   output += `TOTAL: ${item.currencySymbol || '$'}${item.total.toFixed(2)}\n\n`;
        });
  
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        document.getElementById('exportOutput').innerHTML = `
            <pre style="max-height: 200px; overflow: auto; background: white; padding: 10px; border-radius: 5px;">${output}</pre>
            <a href="${url}" download="business_calculations.txt" style="color: var(--primary); margin-top: 10px; display: inline-block;">
                <i class="fas fa-file-alt"></i> Download Text File
            </a>
        `;
    }
    
    showToast('Export data prepared');
  }
  
  // Update QR code preview in real-time (ensure currency symbol is handled)
  function updateQrPreview() {
    const upiId = document.getElementById('upiId').value;
    const currencySymbol = document.getElementById('currency')?.value || '$';
    const amount = parseFloat(document.getElementById('currentTotal').textContent.replace(currencySymbol, '')) || '0';
    const note = document.getElementById('paymentNote').value || `Payment for ${document.getElementById('invoiceNumber').value}`;
    generateUpiQrCode('qrCodePreview', upiId, amount.toString(), note); // amount needs to be string for QR
  }
// This is a conceptual representation of what you'd add to your script.js

// Assume you have a function to get the final total amount of the bill
function getFinalBillAmount() {
    // This function needs to calculate or retrieve the accurate grand total
    // of the items in the current bill.
    // For example, it might parse the value from an element like '#currentTotal'
    // or sum up from an internal 'items' array.
    // Ensure this returns a numerical value.
    const currentTotalText = document.getElementById('currentTotal').textContent;
    // Example: "₹1,250.75" -> 1250.75
    const amount = parseFloat(currentTotalText.replace(/[^0-9.]/g, ''));
    return isNaN(amount) ? 0 : amount;
}

function generateBill() {
    const shopName = document.getElementById('shopName').value || "Your Shop";
    const invoiceNumber = document.getElementById('invoiceNumber').value || "N/A";
    const currencySymbol = document.getElementById('currency').value;
    const paymentType = document.getElementById('paymentType').value;
    const customerName = document.getElementById('customerName').value;

    // Start building the bill HTML
    let billHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px auto; max-width: 400px;">
            <h2 style="text-align: center;">${shopName}</h2>
            <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
            ${customerName ? `<p><strong>Customer:</strong> ${customerName}</p>` : ''}
            <hr>
            <h4>Items:</h4>
            <ul>`;

    // Loop through items from your items table or data structure
    // For demonstration, let's assume you have an array 'currentItems'
    // currentItems.forEach(item => {
    //     billHtml += `<li>${item.name} - ${item.qty} x ${currencySymbol}${item.price} = ${currencySymbol}${(item.qty * item.price).toFixed(2)}</li>`;
    // });
    // This part needs to be adapted to how you store and access bill items.
    // For now, let's add a placeholder for items.
    const itemsListBody = document.getElementById('itemsList');
    if (itemsListBody) {
        for (const row of itemsListBody.rows) {
            const productName = row.cells[0].textContent || row.cells[0].querySelector('input')?.value || "N/A";
            const quantity = row.cells[3].textContent || row.cells[3].querySelector('input')?.value || "N/A";
            const price = row.cells[6].textContent || "N/A"; // This is the final price per item
            billHtml += `<li>${productName} (Qty: ${quantity}) - ${price}</li>`;
        }
    }
    billHtml += `</ul><hr>`;

    const totalAmount = getFinalBillAmount();
    billHtml += `<h3 style="text-align: right;">Total: ${currencySymbol}${totalAmount.toFixed(2)}</h3>`;
    billHtml += `<p><strong>Payment Mode:</strong> ${paymentType.toUpperCase()}</p>`;

    // Add QR Code if payment type is UPI
    if (paymentType === 'upi') {
        const upiId = document.getElementById('upiId').value;
        const paymentNote = document.getElementById('paymentNote').value || `Payment for Invoice ${invoiceNumber}`;

        if (upiId && totalAmount > 0) {
            // Construct the UPI string
            // upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=CURRENCY&tn=TRANSACTION_NOTE
            let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}`;
            upiString += `&pn=${encodeURIComponent(shopName)}`;
            upiString += `&am=${encodeURIComponent(totalAmount.toFixed(2))}`;
            upiString += `&cu=INR`; // Standard currency code for INR
            upiString += `&tn=${encodeURIComponent(paymentNote)}`;

            // Create a temporary div to generate the QR code
            // This div doesn't need to be visible or permanently in the DOM
            const tempQrContainer = document.createElement('div');
            
            // Generate QR code using qrcode.js
            // The QRCode library usually appends a canvas or img to the container.
            new QRCode(tempQrContainer, {
                text: upiString,
                width: 150,  // Adjust size as needed for the bill
                height: 150,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H // Error correction level
            });

            // Get the QR code image data
            // qrcode.js might create an <img> or a <canvas>
            const qrImgTag = tempQrContainer.querySelector('img');
            const qrCanvasTag = tempQrContainer.querySelector('canvas');
            let qrCodeDataUrl = '';

            if (qrImgTag && qrImgTag.src) {
                qrCodeDataUrl = qrImgTag.src;
            } else if (qrCanvasTag) {
                qrCodeDataUrl = qrCanvasTag.toDataURL('image/png');
            }

            if (qrCodeDataUrl) {
                billHtml += `
                    <div style="text-align: center; margin-top: 15px;">
                        <h4>Scan to Pay via UPI</h4>
                        <img src="${qrCodeDataUrl}" alt="UPI QR Code" style="width: 150px; height: 150px; border: 1px solid #eee;">
                        <p style="font-size: 0.9em;">UPI ID: ${upiId}</p>
                    </div>`;
            } else {
                billHtml += `<p style="text-align: center; color: red;">Could not generate UPI QR Code.</p>`;
            }
        } else {
            billHtml += `<p style="text-align: center; color: orange;">UPI ID or Amount missing for QR Code generation.</p>`;
        }
    }

    billHtml += `<hr><p style="text-align: center; font-size: 0.8em;">Thank you for your business!</p></div>`;

    // Display the generated bill in the 'printBill' div
    const printBillDiv = document.getElementById('printBill');
    printBillDiv.innerHTML = billHtml;
    printBillDiv.classList.remove('hidden'); // Make it visible if it was hidden

    // Also, you might want to update the 'resultDetails' section
    const resultDetailsDiv = document.getElementById('resultDetails');
    if (resultDetailsDiv) {
        resultDetailsDiv.innerHTML = `Bill generated successfully. You can print it or save it.`;
    }
}
// This is a conceptual representation of what you'd add/modify in your script.js

// Ensure you have a function to get the final bill amount accurately.
// This function should parse the value from your '#currentTotal' span.
function getFinalBillAmount() {
    const currentTotalElement = document.getElementById('currentTotal');
    if (!currentTotalElement) return 0;

    const currentTotalText = currentTotalElement.textContent; // e.g., "₹1,250.75" or "$50.00"
    // Remove currency symbols, commas, and keep only numbers and decimal point
    const amountString = currentTotalText.replace(/[^\d.-]/g, '');
    const amount = parseFloat(amountString);
    return isNaN(amount) ? 0 : amount;
}

function generateBill() {
    const shopName = document.getElementById('shopName').value || "Your Shop";
    const invoiceNumber = document.getElementById('invoiceNumber').value || "N/A";
    const currencySymbol = document.getElementById('currency').value;
    const paymentType = document.getElementById('paymentType').value;
    const customerName = document.getElementById('customerName').value;
    // const customerPhoneNumber = document.getElementById('customerPhoneNumber').value; // Available if you want to display it

    const now = new Date();
    const billDate = now.toLocaleDateString();
    const billTime = now.toLocaleTimeString();

    // Start building the bill HTML
    let billHtml = `
        <div style="font-family: 'Poppins', Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px auto; max-width: 450px; font-size: 14px; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 0 0 5px 0; font-size: 20px;">${shopName}</h2>
                <p style="margin: 0;">Invoice #: <strong>${invoiceNumber}</strong></p>
                <p style="margin: 0;">Date: ${billDate} | Time: ${billTime}</p>
            </div>`;

    if (customerName) {
        billHtml += `<p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>`;
    }
    // If you want to display the phone number (not as a button):
    // if (customerPhoneNumber) {
    //     billHtml += `<p style="margin: 5px 0;"><strong>Contact:</strong> ${customerPhoneNumber}</p>`;
    // }

    billHtml += `<hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">`;
    billHtml += `<h4 style="margin: 0 0 10px 0; font-size: 16px; text-align: center;">Order Details</h4>`;
    billHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Qty</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                        </tr>
                    </thead>
                    <tbody>`;

    const itemsListBody = document.getElementById('itemsList');
    let calculatedSubtotal = 0;
    if (itemsListBody && itemsListBody.rows.length > 0) {
        for (const row of itemsListBody.rows) {
            const productName = row.cells[0].textContent || (row.cells[0].querySelector('input') ? row.cells[0].querySelector('input').value : "N/A");
            const quantity = row.cells[3].textContent || (row.cells[3].querySelector('input') ? row.cells[3].querySelector('input').value : "1");
            // Assuming cell 6 (index 6) contains the final calculated price for the item line
            const priceText = row.cells[6].textContent.replace(currencySymbol, '').trim();
            const itemPrice = parseFloat(priceText) || 0;

            billHtml += `<tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}</td>
                            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${quantity}</td>
                            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${currencySymbol}${itemPrice.toFixed(2)}</td>
                         </tr>`;
            calculatedSubtotal += itemPrice; // This assumes cell[6] is the total price for that line (qty * unit_price_after_discount_tax)
        }
    } else {
        billHtml += `<tr><td colspan="3" style="padding: 8px; text-align: center;">No items in the bill.</td></tr>`;
    }
    billHtml += `</tbody></table>`;

    const totalAmount = getFinalBillAmount(); // Use the grand total from your calculator logic

    billHtml += `<hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">`;
    billHtml += `<div style="text-align: right; margin-bottom: 10px;">
                    <strong style="font-size: 18px;">Total: ${currencySymbol}${totalAmount.toFixed(2)}</strong>
                 </div>`;
    billHtml += `<p style="margin: 5px 0;"><strong>Payment Mode:</strong> ${paymentType.toUpperCase()}</p>`;

    // Add QR Code if payment type is UPI
    if (paymentType === 'upi') {
        const upiId = document.getElementById('upiId').value;
        let paymentNote = document.getElementById('paymentNote').value;
        if (!paymentNote) {
            paymentNote = `Payment for Invoice ${invoiceNumber}`; // Default note
        }


        if (upiId && totalAmount > 0) {
            let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}`;
            upiString += `&pn=${encodeURIComponent(shopName)}`; // Payee Name
            upiString += `&am=${encodeURIComponent(totalAmount.toFixed(2))}`;
            upiString += `&cu=INR`; // Standard currency code for INR, adjust if your currency is different and UPI supports it
            upiString += `&tn=${encodeURIComponent(paymentNote)}`;

            const tempQrContainer = document.createElement('div');
            new QRCode(tempQrContainer, {
                text: upiString,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });

            const qrImgTag = tempQrContainer.querySelector('img');
            const qrCanvasTag = tempQrContainer.querySelector('canvas');
            let qrCodeDataUrl = '';

            if (qrImgTag && qrImgTag.src) {
                qrCodeDataUrl = qrImgTag.src;
            } else if (qrCanvasTag) {
                qrCodeDataUrl = qrCanvasTag.toDataURL('image/png');
            }

            if (qrCodeDataUrl) {
                billHtml += `
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                    <div style="text-align: center; margin-top: 15px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 16px;">Scan to Pay via UPI</h4>
                        <img src="${qrCodeDataUrl}" alt="UPI QR Code" style="width: 128px; height: 128px; border: 1px solid #eee; display: block; margin: 0 auto 10px auto;">
                        <p style="font-size: 0.9em; margin: 0;">UPI ID: ${upiId}</p>
                    </div>`;
            } else {
                billHtml += `<p style="text-align: center; color: red; margin-top: 10px;">Could not generate UPI QR Code.</p>`;
            }
        } else if (upiId) {
             billHtml += `<p style="text-align: center; color: orange; margin-top: 10px;">UPI QR Code cannot be generated for zero amount.</p>`;
        } else {
            billHtml += `<p style="text-align: center; color: orange; margin-top: 10px;">UPI ID not provided for QR Code generation.</p>`;
        }
    }

    billHtml += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">`;
    billHtml += `<p style="text-align: center; font-size: 0.9em; margin-bottom: 0;">Thank you for your business!</p>`;
    billHtml += `</div>`; // Close main bill div

    const printBillDiv = document.getElementById('printBill');
    printBillDiv.innerHTML = billHtml;
    printBillDiv.classList.remove('hidden');

    const resultDetailsDiv = document.getElementById('resultDetails');
    if (resultDetailsDiv) {
        resultDetailsDiv.innerHTML = `Bill generated successfully. Preview below or click 'Print Bill'.`;
    }
}

// Make sure you have a function to toggle UPI section visibility
// (You already have onchange="toggleUpiSection()" in your HTML)
function toggleUpiSection() {
    const paymentType = document.getElementById('paymentType').value;
    const upiSection = document.getElementById('upiPaymentSection');
    if (paymentType === 'upi') {
        upiSection.style.display = 'block';
        // Optionally, trigger QR preview update here if you have a live preview
        // updateQrCodePreview(); // You'd need to implement this function
    } else {
        upiSection.style.display = 'none';
    }
}

// Call toggleUpiSection on page load to set initial state
document.addEventListener('DOMContentLoaded', () => {
    toggleUpiSection();
    // ... any other initializations
});

// This is a conceptual representation of what you'd add/modify in your script.js

// Ensure you have a function to get the final bill amount accurately.
// This function should parse the value from your '#currentTotal' span.
function getFinalBillAmount() {
    const currentTotalElement = document.getElementById('currentTotal');
    if (!currentTotalElement) return 0;

    const currentTotalText = currentTotalElement.textContent; // e.g., "₹1,250.75" or "$50.00"
    // Remove currency symbols, commas, and keep only numbers and decimal point
    const amountString = currentTotalText.replace(/[^\d.-]/g, '');
    const amount = parseFloat(amountString);
    return isNaN(amount) ? 0 : amount;
}

function generateBill() {
    const shopName = document.getElementById('shopName').value || "Your Shop";
    const invoiceNumber = document.getElementById('invoiceNumber').value || "N/A";
    const currencySymbol = document.getElementById('currency').value;
    const paymentType = document.getElementById('paymentType').value;
    const customerName = document.getElementById('customerName').value;
    // const customerPhoneNumber = document.getElementById('customerPhoneNumber').value; // Available if you want to display it

    const now = new Date();
    const billDate = now.toLocaleDateString();
    const billTime = now.toLocaleTimeString();

    // Start building the bill HTML
    let billHtml = `
        <div style="font-family: 'Poppins', Arial, sans-serif; padding: 20px; border: 1px solid #ccc; margin: 20px auto; max-width: 450px; font-size: 14px; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 0 0 5px 0; font-size: 20px;">${shopName}</h2>
                <p style="margin: 0;">Invoice #: <strong>${invoiceNumber}</strong></p>
                <p style="margin: 0;">Date: ${billDate} | Time: ${billTime}</p>
            </div>`;

    if (customerName) {
        billHtml += `<p style="margin: 5px 0;"><strong>Customer:</strong> ${customerName}</p>`;
    }
    // If you want to display the phone number (not as a button):
    // if (customerPhoneNumber) {
    //     billHtml += `<p style="margin: 5px 0;"><strong>Contact:</strong> ${customerPhoneNumber}</p>`;
    // }

    billHtml += `<hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">`;
    billHtml += `<h4 style="margin: 0 0 10px 0; font-size: 16px; text-align: center;">Order Details</h4>`;
    billHtml += `<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Qty</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                        </tr>
                    </thead>
                    <tbody>`;

    const itemsListBody = document.getElementById('itemsList');
    let calculatedSubtotal = 0;
    if (itemsListBody && itemsListBody.rows.length > 0) {
        for (const row of itemsListBody.rows) {
            const productName = row.cells[0].textContent || (row.cells[0].querySelector('input') ? row.cells[0].querySelector('input').value : "N/A");
            const quantity = row.cells[3].textContent || (row.cells[3].querySelector('input') ? row.cells[3].querySelector('input').value : "1");
            // Assuming cell 6 (index 6) contains the final calculated price for the item line
            const priceText = row.cells[6].textContent.replace(currencySymbol, '').trim();
            const itemPrice = parseFloat(priceText) || 0;

            billHtml += `<tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">${productName}</td>
                            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${quantity}</td>
                            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${currencySymbol}${itemPrice.toFixed(2)}</td>
                         </tr>`;
            calculatedSubtotal += itemPrice; // This assumes cell[6] is the total price for that line (qty * unit_price_after_discount_tax)
        }
    } else {
        billHtml += `<tr><td colspan="3" style="padding: 8px; text-align: center;">No items in the bill.</td></tr>`;
    }
    billHtml += `</tbody></table>`;

    const totalAmount = getFinalBillAmount(); // Use the grand total from your calculator logic

    billHtml += `<hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">`;
    billHtml += `<div style="text-align: right; margin-bottom: 10px;">
                    <strong style="font-size: 18px;">Total: ${currencySymbol}${totalAmount.toFixed(2)}</strong>
                 </div>`;
    billHtml += `<p style="margin: 5px 0;"><strong>Payment Mode:</strong> ${paymentType.toUpperCase()}</p>`;

    // Add QR Code if payment type is UPI
    if (paymentType === 'upi') {
        const upiId = document.getElementById('upiId').value;
        let paymentNote = document.getElementById('paymentNote').value;
        if (!paymentNote) {
            paymentNote = `Payment for Invoice ${invoiceNumber}`; // Default note
        }


        if (upiId && totalAmount > 0) {
            let upiString = `upi://pay?pa=${encodeURIComponent(upiId)}`;
            upiString += `&pn=${encodeURIComponent(shopName)}`; // Payee Name
            upiString += `&am=${encodeURIComponent(totalAmount.toFixed(2))}`;
            upiString += `&cu=INR`; // Standard currency code for INR, adjust if your currency is different and UPI supports it
            upiString += `&tn=${encodeURIComponent(paymentNote)}`;

            const tempQrContainer = document.createElement('div');
            new QRCode(tempQrContainer, {
                text: upiString,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });

            const qrImgTag = tempQrContainer.querySelector('img');
            const qrCanvasTag = tempQrContainer.querySelector('canvas');
            let qrCodeDataUrl = '';

            if (qrImgTag && qrImgTag.src) {
                qrCodeDataUrl = qrImgTag.src;
            } else if (qrCanvasTag) {
                qrCodeDataUrl = qrCanvasTag.toDataURL('image/png');
            }

            if (qrCodeDataUrl) {
                billHtml += `
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                    <div style="text-align: center; margin-top: 15px;">
                        <h4 style="margin: 0 0 10px 0; font-size: 16px;">Scan to Pay via UPI</h4>
                        <img src="${qrCodeDataUrl}" alt="UPI QR Code" style="width: 128px; height: 128px; border: 1px solid #eee; display: block; margin: 0 auto 10px auto;">
                        <p style="font-size: 0.9em; margin: 0;">UPI ID: ${upiId}</p>
                    </div>`;
            } else {
                billHtml += `<p style="text-align: center; color: red; margin-top: 10px;">Could not generate UPI QR Code.</p>`;
            }
        } else if (upiId) {
             billHtml += `<p style="text-align: center; color: orange; margin-top: 10px;">UPI QR Code cannot be generated for zero amount.</p>`;
        } else {
            billHtml += `<p style="text-align: center; color: orange; margin-top: 10px;">UPI ID not provided for QR Code generation.</p>`;
        }
    }

    billHtml += `<hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">`;
    billHtml += `<p style="text-align: center; font-size: 0.9em; margin-bottom: 0;">Thank you for your business!</p>`;
    billHtml += `</div>`; // Close main bill div

    const printBillDiv = document.getElementById('printBill');
    printBillDiv.innerHTML = billHtml;
    printBillDiv.classList.remove('hidden');

    const resultDetailsDiv = document.getElementById('resultDetails');
    if (resultDetailsDiv) {
        resultDetailsDiv.innerHTML = `Bill generated successfully. Preview below or click 'Print Bill'.`;
    }
}

// Make sure you have a function to toggle UPI section visibility
// (You already have onchange="toggleUpiSection()" in your HTML)
function toggleUpiSection() {
    const paymentType = document.getElementById('paymentType').value;
    const upiSection = document.getElementById('upiPaymentSection');
    if (paymentType === 'upi') {
        upiSection.style.display = 'block';
        // Optionally, trigger QR preview update here if you have a live preview
        // updateQrCodePreview(); // You'd need to implement this function
    } else {
        upiSection.style.display = 'none';
    }
}

// Call toggleUpiSection on page load to set initial state
document.addEventListener('DOMContentLoaded', () => {
    toggleUpiSection();
    // ... any other initializations
});
// Add these functions to your script.js file

/**
 * Retrieves and parses the final bill amount from the UI.
 * @returns {number} The final bill amount, or 0 if not found or invalid.
 */
function getFinalBillAmount() {
    const currentTotalElement = document.getElementById('currentTotal');
    if (!currentTotalElement) {
        console.error("Element with ID 'currentTotal' not found.");
        return 0;
    }

    const currentTotalText = currentTotalElement.textContent; // e.g., "₹1,250.75" or "$50.00"
    // Remove currency symbols, commas, and keep only numbers and decimal point
    const amountString = currentTotalText.replace(/[^\d.-]/g, '');
    const amount = parseFloat(amountString);
    
    if (isNaN(amount)) {
        console.warn("Could not parse amount from 'currentTotal'. Text was:", currentTotalText);
        return 0;
    }
    return amount;
}

/**
 * Displays a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of toast: 'success', 'error', 'warning', 'info'.
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const icon = toast.querySelector('i');

    if (!toast || !toastMessage || !icon) {
        console.error('Toast elements not found in the DOM.');
        return;
    }

    toastMessage.textContent = message;
    
    // Reset classes
    toast.className = 'toast show'; // Base classes
    icon.className = 'fas'; // Reset icon classes

    switch (type) {
        case 'error':
            toast.classList.add('error');
            icon.classList.add('fa-times-circle');
            break;
        case 'warning':
            toast.classList.add('warning');
            icon.classList.add('fa-exclamation-triangle');
            break;
        case 'info':
            toast.classList.add('info');
            icon.classList.add('fa-info-circle');
            break;
        case 'success':
        default:
            toast.classList.add('success');
            icon.classList.add('fa-check-circle');
            break;
    }

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}


/**
 * Generates a WhatsApp message with bill details and opens WhatsApp.
 */
function shareOnWhatsApp() {
    const customerPhoneNumberInput = document.getElementById('customerPhoneNumber');
    const customerPhoneNumber = customerPhoneNumberInput ? customerPhoneNumberInput.value : '';
    
    const shopName = document.getElementById('shopName').value || "Your Shop";
    const invoiceNumber = document.getElementById('invoiceNumber').value || "N/A";
    const currencySymbol = document.getElementById('currency').value;
    const totalAmount = getFinalBillAmount();

    if (!customerPhoneNumber) {
        showToast("Please enter customer's phone number (with country code).", 'warning');
        customerPhoneNumberInput?.focus();
        return;
    }

    // Basic validation for phone number (presence of digits)
    const sanitizedPhoneNumber = customerPhoneNumber.replace(/\D/g, '');
    if (!sanitizedPhoneNumber) {
        showToast("Invalid phone number format. Please include country code.", 'error');
        customerPhoneNumberInput?.focus();
        return;
    }
    
    if (totalAmount <= 0) {
        showToast("Cannot share an empty or zero-value bill. Please add items and generate a bill.", 'warning');
        return;
    }
    
    // Construct a concise message for WhatsApp
    let message = `Hello! Here is your bill summary from ${shopName}:\n\n`;
    message += `Invoice #: *${invoiceNumber}*\n`;
    message += `Total Amount: *${currencySymbol}${totalAmount.toFixed(2)}*\n\n`;
    message += `Items:\n`;

    const itemsListBody = document.getElementById('itemsList');
    if (itemsListBody && itemsListBody.rows.length > 0) {
        for (const row of itemsListBody.rows) {
            const productNameCell = row.cells[0];
            const quantityCell = row.cells[3];
            const priceCell = row.cells[6];

            const productName = productNameCell?.textContent || (productNameCell?.querySelector('input') ? productNameCell.querySelector('input').value : "N/A");
            const quantity = quantityCell?.textContent || (quantityCell?.querySelector('input') ? quantityCell.querySelector('input').value : "1");
            const priceText = (priceCell?.textContent || "0").replace(currencySymbol, '').trim();
            const itemPrice = parseFloat(priceText) || 0;

            message += `- ${productName} (Qty: ${quantity}) - ${currencySymbol}${itemPrice.toFixed(2)}\n`;
        }
    } else {
        message += `(No items listed in current calculation)\n`;
    }

    message += `\nThank you for your business!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sanitizedPhoneNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    showToast("Redirecting to WhatsApp...", 'info');
}

  
  function exportSalesToCSV() {
    const items = document.querySelectorAll('#itemsList tr');
    if (items.length === 0) {
        showToast('No items to export.', 'warning');
        return;
    }
}
  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    
    // Add animation to inputs when focused
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateZ(20px)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = '';
        });
    });
    
    // Add event listener for logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', logout);
    }
    
    // Update business type when changed
    document.getElementById('businessType').addEventListener('change', calculateTotal);
    
    // Add keyframes for animations
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes fall {
            to { transform: translateY(calc(100vh + 20px)) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
  
    // Add event listeners for switching forms
    // (These are already in the HTML with onclick, but adding here for completeness/alternative)
    // document.querySelector('#signInForm .switch-form a').addEventListener('click', showSignUpForm);
    // document.querySelector('#signUpForm .switch-form a').addEventListener('click', showSignInForm);
  });
