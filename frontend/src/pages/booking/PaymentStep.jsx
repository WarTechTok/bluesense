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
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-wallet"></i>
        <h2>Payment Method</h2>
        <p>Choose how you'd like to complete your payment</p>
      </div>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label><i className="fas fa-credit-card"></i> Select Payment Method <span className="required">*</span></label>
          <div className="payment-methods-grid">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className={`payment-method-card ${formData.paymentMethod === method.id ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'paymentMethod', value: method.id } })}
              >
                <div className="payment-method-icon">{method.icon}</div>
                <h4>{method.title}</h4>
                <p>{method.desc}</p>
                {formData.paymentMethod === method.id && (
                  <div className="check-mark"><i className="fas fa-check"></i></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label><i className="fas fa-file-invoice-dollar"></i> Payment Summary</label>
          <div className="payment-summary-card">
            <div className="summary-row">
              <span>Package Rate</span>
              <strong>₱{pricePerNight.toLocaleString()}</strong>
            </div>
            <div className="summary-row">
              <span>Duration ({selectedSession === '22hrs' ? 'Hours' : 'Days'})</span>
              <strong>{nights}</strong>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <strong>₱{totalPrice.toLocaleString()}</strong>
            </div>
            <div className="summary-row highlight">
              <span>Downpayment Required</span>
              <strong>₱{downpayment.toLocaleString()}</strong>
            </div>
            <div className="summary-row">
              <span>Remaining Balance</span>
              <strong>₱{(totalPrice - downpayment).toLocaleString()}</strong>
            </div>
          </div>
          <div className="payment-info-note">
            <i className="fas fa-info-circle"></i>
            <span>Downpayment secures your reservation. Complete balance can be paid on arrival.</span>
          </div>
        </div>
      </div>

      <PaymentUpload
        paymentMethod={formData.paymentMethod}
        onPaymentProofUpload={handlePaymentProof}
        totalPrice={totalPrice}
        downpayment={downpayment}
      />

      {paymentProof && (
        <div className="uploaded-file-info">
          <i className="fas fa-check-circle"></i>
          <span>{paymentProof.name || 'Payment proof uploaded successfully'}</span>
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
      )}
    </div>
  );
}

export default PaymentStep;