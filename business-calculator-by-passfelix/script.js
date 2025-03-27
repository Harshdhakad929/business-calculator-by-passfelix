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

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast ${type}`;
    toastMessage.textContent = message;
    
    // Set appropriate icon
    const icon = toast.querySelector('i');
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-times-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-circle';
    }
    
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
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
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple hardcoded credentials for demo
    if(username === 'admin' && password === '123') {
        // Animate login transition
        document.getElementById('loginSection').style.transform = 'rotateY(90deg)';
        document.getElementById('loginSection').style.opacity = '0';
        
        setTimeout(() => {
            document.getElementById('loginSection').classList.add('hidden');
            document.getElementById('calculatorSection').classList.remove('hidden');
            document.getElementById('calculatorSection').style.transform = 'rotateY(-90deg)';
            
            setTimeout(() => {
                document.getElementById('calculatorSection').style.transform = 'rotateY(0)';
            }, 50);
        }, 500);
        
        loadHistory();
        // Add first empty item
        addItem();
        showToast('Login successful');
        
        // Initialize UPI section state
        toggleUpiSection();
        
        // Set up UPI ID input listener for real-time QR generation
        document.getElementById('upiId').addEventListener('input', updateQrPreview);
        document.getElementById('paymentNote').addEventListener('input', updateQrPreview);
    } else {
        // Shake animation for wrong credentials
        const loginSection = document.getElementById('loginSection');
        loginSection.style.animation = 'shake 0.5s';
        setTimeout(() => {
            loginSection.style.animation = '';
        }, 500);
        
        showToast('Invalid credentials. Use admin/123', 'error');
    }
}

function logout() {
    // Animate logout transition
    document.getElementById('calculatorSection').style.transform = 'rotateY(90deg)';
    
    setTimeout(() => {
        document.getElementById('calculatorSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('loginSection').style.transform = 'rotateY(-90deg)';
        document.getElementById('loginSection').style.opacity = '1';
        
        setTimeout(() => {
            document.getElementById('loginSection').style.transform = 'rotateY(0)';
        }, 50);
    }, 500);
    
    showToast('Logged out successfully');
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
    const discountAmount = totalBeforeDiscount * (discount/100);
    const afterDiscount = totalBeforeDiscount - discountAmount;
    const taxAmount = afterDiscount * (tax/100);
    const finalPrice = afterDiscount + taxAmount;
    
    // Display price
    document.getElementById(`price-${itemId}`).textContent = `$${finalPrice.toFixed(2)}`;
    
    // Calculate total
    calculateTotal();
}

// Calculate total of all items
function calculateTotal() {
    const rows = document.getElementById('itemsList').querySelectorAll('tr');
    let total = 0;
    let items = [];
    
    rows.forEach(row => {
        const itemId = row.id.split('-')[1];
        const product = document.getElementById(`productName-${itemId}`).value || 'Product';
        const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
        const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
        const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
        const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
        const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;
        const price = parseFloat(document.getElementById(`price-${itemId}`).textContent.replace('$', '')) || 0;
        
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
    
    // Update current total in status bar
    document.getElementById('currentTotal').textContent = `$${total.toFixed(2)}`;
    
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
            <span>$${total.toFixed(2)}</span>
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
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const upiId = document.getElementById('upiId').value;
    
    let items = [];
    let total = 0;
    
    rows.forEach(row => {
        const itemId = row.id.split('-')[1];
        const product = document.getElementById(`productName-${itemId}`).value || 'Product';
        const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
        const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
        const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
        const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
        const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;
        const price = parseFloat(document.getElementById(`price-${itemId}`).textContent.replace('$', '')) || 0;
        
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
    
    // Save to drafts
    let drafts = JSON.parse(localStorage.getItem('calcDrafts') || '[]');
    
    drafts.unshift({
        shopName,
        businessType,
        paymentType,
        gstNumber,
        invoiceNumber,
        upiId,
        items,
        total,
        timestamp: new Date().toLocaleString()
    });
    
    // Keep only last 10 drafts
    if(drafts.length > 10) drafts.pop();
    
    localStorage.setItem('calcDrafts', JSON.stringify(drafts));
    showToast('Draft saved successfully');
}

// Generate printable bill
function generateBill() {
    const rows = document.getElementById('itemsList').querySelectorAll('tr');
    if(rows.length === 0) {
        showToast('Please add items to generate bill', 'warning');
        return;
    }
    
    const shopName = document.getElementById('shopName').value || 'My Shop';
    const businessType = document.getElementById('businessType').value;
    const paymentType = document.getElementById('paymentType').value;
    const gstNumber = document.getElementById('gstNumber').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const upiId = document.getElementById('upiId').value;
    const paymentNote = document.getElementById('paymentNote').value || `Payment for ${invoiceNumber}`;
    const now = new Date();
    
    let itemsHtml = '';
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    
    rows.forEach(row => {
        const itemId = row.id.split('-')[1];
        const product = document.getElementById(`productName-${itemId}`).value || 'Product';
        const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
        const price = parseFloat(document.getElementById(`price-${itemId}`).textContent.replace('$', '')) || 0;
        const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
        const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
        const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
        const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;
        
        const basePrice = cost * (1 + margin/100);
        const totalBeforeDiscount = basePrice * qty;
        const discountAmount = totalBeforeDiscount * (discount/100);
        const afterDiscount = totalBeforeDiscount - discountAmount;
        const taxAmount = afterDiscount * (tax/100);
        
        subtotal += price;
        totalTax += taxAmount;
        totalDiscount += discountAmount;
        
        itemsHtml += `
            <tr>
                <td>${product}</td>
                <td>${qty}</td>
                <td>$${basePrice.toFixed(2)}</td>
                <td>${discount}%</td>
                <td>${tax}%</td>
                <td>$${price.toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Generate UPI QR code if payment type is UPI
    let qrCodeHtml = '';
    if (paymentType === 'upi') {
        if (!upiId) {
            showToast('Please enter UPI ID for UPI payments', 'warning');
            return;
        }
        
        qrCodeHtml = `
            <div class="qr-code-container">
                <h3><i class="fas fa-qrcode"></i> Scan to Pay</h3>
                <div id="billQrCode"></div>
                <div class="payment-instructions">
                    <p>Scan this QR code with any UPI app to complete payment</p>
                    <p><strong>UPI ID:</strong> ${upiId}</p>
                    <p><strong>Amount:</strong> $${subtotal.toFixed(2)}</p>
                </div>
            </div>
        `;
    }
    
    const billHtml = `
        <div class="bill-header">
            <h2>${shopName}</h2>
            <p>${businessType === 'retail' ? 'Retail Store' : 'Wholesale Business'}</p>
            <p>Invoice: ${invoiceNumber}</p>
            ${gstNumber ? `<p>GSTIN: ${gstNumber}</p>` : ''}
            <p>Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
            <p>Payment Method: ${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}</p>
        </div>
        
        <table class="bill-items">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Discount</th>
                    <th>Tax</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        
        <div class="bill-total">
            <div style="margin-bottom: 5px;">Subtotal: $${(subtotal - totalTax).toFixed(2)}</div>
            ${totalDiscount > 0 ? `<div style="margin-bottom: 5px;">Discount: -$${totalDiscount.toFixed(2)}</div>` : ''}
            ${totalTax > 0 ? `<div style="margin-bottom: 5px;">Tax: +$${totalTax.toFixed(2)}</div>` : ''}
            <div style="font-size: 20px;">Total: $${subtotal.toFixed(2)}</div>
        </div>
        
        ${qrCodeHtml}
        
        <div class="bill-footer">
            <p>Thank you for your business!</p>
            <p>Generated by Business Calculator by PassFelix</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="printBill()" class="btn-info"><i class="fas fa-print"></i> Print Bill</button>
            <button onclick="document.getElementById('printBill').classList.add('hidden')" class="btn-danger"><i class="fas fa-times"></i> Close</button>
        </div>
    `;
    
    const printBill = document.getElementById('printBill');
    printBill.innerHTML = billHtml;
    printBill.classList.remove('hidden');
    
    // Generate QR code AFTER adding the HTML to the bill
    if (paymentType === 'upi') {
        generateUpiQrCode('billQrCode', upiId, subtotal.toFixed(2), paymentNote);
    }
    
    // Auto-save to history
    const shopSettings = {
        shopName,
        businessType,
        paymentType,
        gstNumber,
        invoiceNumber,
        upiId: paymentType === 'upi' ? upiId : undefined
    };
    
    let items = [];
    let total = 0;
    
    rows.forEach(row => {
        const itemId = row.id.split('-')[1];
        const product = document.getElementById(`productName-${itemId}`).value || 'Product';
        const cost = parseFloat(document.getElementById(`costPrice-${itemId}`).value) || 0;
        const margin = parseFloat(document.getElementById(`profitMargin-${itemId}`).value) || 0;
        const qty = parseInt(document.getElementById(`quantity-${itemId}`).value) || 1;
        const discount = parseFloat(document.getElementById(`discount-${itemId}`).value) || 0;
        const tax = parseFloat(document.getElementById(`taxRate-${itemId}`).value) || 0;
        const price = parseFloat(document.getElementById(`price-${itemId}`).textContent.replace('$', '')) || 0;
        
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
    
    saveToHistory({
        ...shopSettings,
        items,
        total,
        timestamp: now.toLocaleString()
    });
    
    showToast('Bill generated and saved to history');
}

// Print bill function
function printBill() {
    window.print();
}

// Save calculation to localStorage
function saveToHistory(data) {
    let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    
    history.unshift(data);
    
    // Keep only last 50 entries
    if(history.length > 50) history.pop();
    
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
                <strong>${item.shopName}</strong>
                <span style="color: var(--primary);">$${item.total.toFixed(2)}</span>
            </div>
            <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                ${item.timestamp} | ${item.invoiceNumber || 'No Invoice'}
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
                Items: ${item.items.length} | Total: $${item.total.toFixed(2)}
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
        // CSV header
        output = 'Shop Name,Business Type,Payment Type,GST Number,Invoice Number,UPI ID,Total,Date,Items Count\n';
        
        // CSV rows
        history.forEach(item => {
            output += `"${item.shopName}",${item.businessType},${item.paymentType},"${item.gstNumber || ''}","${item.invoiceNumber || ''}","${item.upiId || ''}",${item.total},"${item.timestamp}",${item.items.length}\n`;
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
            output += `TOTAL: $${item.total.toFixed(2)}\n\n`;
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
});