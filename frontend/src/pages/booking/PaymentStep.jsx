// src/pages/booking/PaymentStep.jsx
// ============================================
// PAYMENT STEP - Payment method selection with QR codes
// ============================================

import React, { useState, useRef } from 'react';

function PaymentStep({ formData, handleChange, nights, pricePerNight, totalPrice, downpayment, selectedSession }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handlePaymentProof = (file) => {
    handleChange({ target: { name: 'paymentProof', value: file } });
    
    // Create preview URL
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setPreviewUrl(null);
    handleChange({ target: { name: 'paymentProof', value: null } });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const paymentMethods = [
    { id: 'gcash', name: 'GCash', description: 'Scan QR code to pay' },
    { id: 'maya', name: 'Maya', description: 'Scan QR code to pay' },
    { id: 'seabank', name: 'SeaBank', description: 'Scan QR code to pay' },
    { id: 'gotyme', name: 'GoTyme', description: 'Scan QR code to pay' },
  ];

  // QR code images - replace with your actual QR code images
  const getQrCode = (method) => {
    const qrCodes = {
      gcash: '/images/qr/gcash-qr.jpg',
      maya: '/images/qr/maya-qr.jpg',
      seabank: '/images/qr/seabank-qr.jpg',
      gotyme: '/images/qr/gotyme-qr.jpg',
    };
    return qrCodes[method];
  };

  return (
    <div className="payment-step">
      <h3 className="section-title">Payment Method</h3>
      <p className="section-subtitle">Choose how you'd like to pay</p>
      
      <div className="payment-methods-grid">
        {paymentMethods.map((method) => (
          <label 
            key={method.id} 
            className={`payment-method-card ${formData.paymentMethod === method.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={formData.paymentMethod === method.id}
              onChange={handleChange}
            />
            <div className="payment-method-info">
              <div className="payment-method-name">{method.name}</div>
              <div className="payment-method-desc">{method.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      <div className="payment-summary-card">
        {formData.paymentType === 'fullpayment' ? (
          <div className="payment-summary-row highlight">
            <span>Total Amount to Pay</span>
            <span className="downpayment-highlight">₱{totalPrice.toLocaleString()}</span>
          </div>
        ) : (
          <>
            <div className="payment-summary-row">
              <span>Total Amount</span>
              <span>₱{totalPrice.toLocaleString()}</span>
            </div>
            <div className="payment-summary-row highlight">
              <span>Downpayment Required (30%)</span>
              <span className="downpayment-highlight">₱{downpayment.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Payment Type Selection */}
      <div className="payment-type-section">
        <h4 className="section-subtitle">Select Payment Type</h4>
        <div className="payment-type-options">
          <label className="payment-type-card">
            <input
              type="radio"
              name="paymentType"
              value="downpayment"
              checked={formData.paymentType === 'downpayment'}
              onChange={(e) => handleChange({ target: { name: 'paymentType', value: e.target.value } })}
            />
            <div className="payment-type-info">
              <div className="payment-type-name">Downpayment</div>
              <div className="payment-type-desc">Pay 30% now, balance upon arrival</div>
              <div className="payment-type-amount">₱{downpayment.toLocaleString()}</div>
            </div>
          </label>
          <label className="payment-type-card">
            <input
              type="radio"
              name="paymentType"
              value="fullpayment"
              checked={formData.paymentType === 'fullpayment'}
              onChange={(e) => handleChange({ target: { name: 'paymentType', value: e.target.value } })}
            />
            <div className="payment-type-info">
              <div className="payment-type-name">Full Payment</div>
              <div className="payment-type-desc">Pay total amount now</div>
              <div className="payment-type-amount">₱{totalPrice.toLocaleString()}</div>
            </div>
          </label>
        </div>
      </div>
      
      <div className="payment-info-note">
        {formData.paymentType === 'fullpayment' ? (
          <span>You are paying the full amount. No additional payment is needed upon arrival.</span>
        ) : (
          <span>You are paying 30% downpayment. The remaining 70% will be due upon arrival.</span>
        )}
      </div>

      {/* Show QR Code for selected digital payment method */}
      {formData.paymentMethod && (
        <div className="qr-code-section">
          <h4 className="qr-title">Scan QR Code to Pay</h4>
          <p className="qr-subtitle">Pay ₱{formData.paymentType === 'fullpayment' ? totalPrice.toLocaleString() : downpayment.toLocaleString()} using your {formData.paymentMethod.toUpperCase()} app</p>
          
          <div className="qr-code-container">
            <img 
              src={getQrCode(formData.paymentMethod)} 
              alt={`${formData.paymentMethod} QR Code`}
              className="qr-code-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/300x300/e2e8f0/64748b?text=${formData.paymentMethod.toUpperCase()}+QR+Code`;
              }}
            />
          </div>
          
          <div className="qr-instructions">
            <p>1. Open your {formData.paymentMethod.toUpperCase()} app</p>
            <p>2. Scan the QR code above</p>
            <p>3. Enter the amount: <strong>₱{formData.paymentType === 'fullpayment' ? totalPrice.toLocaleString() : downpayment.toLocaleString()}</strong></p>
            <p>4. Complete the payment and take a screenshot</p>
            <p>5. Upload your payment screenshot below</p>
          </div>
          
          {/* File Upload with Preview */}
          <div className="upload-section">
            <label className="upload-label">Payment Screenshot</label>
            <div className="upload-button-wrapper">
              <button 
                type="button" 
                className="upload-icon-btn"
                onClick={handleFileClick}
              >
                <i className="fas fa-paperclip"></i>
                <span>Attach Screenshot</span>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={(e) => handlePaymentProof(e.target.files[0])}
                className="hidden-file-input"
              />
            </div>
            
            {/* Image Preview */}
            {previewUrl && (
              <div className="image-preview-container">
                <div className="image-preview-header">
                  <i className="fas fa-image"></i>
                  <span>Screenshot Preview</span>
                  <button 
                    type="button" 
                    className="remove-file-btn"
                    onClick={removeFile}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="image-preview">
                  <img src={previewUrl} alt="Payment Screenshot" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentStep;