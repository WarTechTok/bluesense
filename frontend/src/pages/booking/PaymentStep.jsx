// frontend/src/pages/booking/PaymentStep.jsx
import React, { useState } from 'react';
import PaymentUpload from '../../components/booking/PaymentUpload';

function PaymentStep({ formData, handleChange, nights, pricePerNight, totalPrice, downpayment, selectedSession }) {
  const [paymentProof, setPaymentProof] = useState(null);

  const handlePaymentProof = (proof) => {
    setPaymentProof(proof);
    handleChange({ target: { name: 'paymentProof', value: proof } });
  };

  const paymentMethods = [
    { id: 'cash', icon: '💵', title: 'Cash Payment', desc: 'Pay upon arrival' },
    { id: 'gcash', icon: '📱', title: 'GCash', desc: 'Quick mobile payment' },
    { id: 'gotyme', icon: '💳', title: 'GoTyme Bank', desc: 'Digital banking' },
  ];

  return (
    <div className="step-container">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-wallet"></i>
        </div>
        <div className="step-title">
          <h2>Payment Method</h2>
          <p>Choose how you'd like to complete your payment</p>
        </div>
      </div>
      
      {/* Payment Methods Grid */}
      <div className="payment-methods-section">
        <h3 className="section-title">Select Payment Method</h3>
        <div className="payment-methods-grid">
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              className={`payment-method-card ${formData.paymentMethod === method.id ? 'selected' : ''}`}
              onClick={() => handleChange({ target: { name: 'paymentMethod', value: method.id } })}
            >
              <div className="payment-method-icon">
                <span>{method.icon}</span>
              </div>
              <div className="payment-method-info">
                <h4>{method.title}</h4>
                <p>{method.desc}</p>
              </div>
              <div className="payment-method-radio">
                {formData.paymentMethod === method.id ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <div className="radio-circle"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Payment Summary */}
      <div className="payment-summary-section">
        <h3 className="section-title">Payment Summary</h3>
        <div className="payment-summary-card">
          <div className="payment-summary-row">
            <span>Package Rate</span>
            <span>₱{pricePerNight.toLocaleString()}</span>
          </div>
          <div className="payment-summary-row">
            <span>Number of {selectedSession === '22hrs' ? 'Hours' : 'Days'}</span>
            <span>{nights}</span>
          </div>
          <div className="payment-summary-divider"></div>
          <div className="payment-summary-row total-row">
            <span>Total Amount</span>
            <span>₱{totalPrice.toLocaleString()}</span>
          </div>
          <div className="payment-summary-row downpayment-row">
            <span>Downpayment Required</span>
            <span>₱{downpayment.toLocaleString()}</span>
          </div>
          <div className="payment-summary-row">
            <span>Remaining Balance</span>
            <span>₱{(totalPrice - downpayment).toLocaleString()}</span>
          </div>
        </div>
        <div className="payment-info-note">
          <i className="fas fa-info-circle"></i>
          <span>Downpayment is required to secure your reservation. Balance can be paid upon arrival.</span>
        </div>
      </div>
      
      {/* Payment Upload (conditional) */}
      <PaymentUpload
        paymentMethod={formData.paymentMethod}
        onPaymentProofUpload={handlePaymentProof}
        totalPrice={totalPrice}
        downpayment={downpayment}
      />

      {/* Display uploaded file info */}
      {paymentProof && (
        <div className="uploaded-file-info">
          <div className="file-info-card">
            <i className="fas fa-file-upload"></i>
            <div className="file-details">
              <strong>Payment Proof Uploaded:</strong>
              <span>{paymentProof.name || 'File uploaded successfully'}</span>
              {paymentProof.size && (
                <small>{(paymentProof.size / 1024).toFixed(2)} KB</small>
              )}
            </div>
            <button 
              type="button" 
              className="remove-file-btn"
              onClick={() => {
                setPaymentProof(null);
                handleChange({ target: { name: 'paymentProof', value: null } });
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentStep;