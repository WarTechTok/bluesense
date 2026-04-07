import React from 'react';

const PaymentStep = ({ formData, handleChange, nights, pricePerNight, totalPrice }) => {
  return (
    <div className="step-card">
      <div className="step-header">
        <i className="fas fa-wallet"></i>
        <h2>Payment Method</h2>
        <p>Choose how you'd like to pay</p>
      </div>
      <div className="payment-methods">
        {[
          { id: 'cash', icon: '💵', title: 'Cash Payment', desc: 'Pay upon arrival at the property' },
          { id: 'gcash', icon: '📱', title: 'GCash', desc: 'Quick and easy mobile payment' },
          { id: 'gotyme', icon: '💳', title: 'GoTyme Bank', desc: 'Digital banking made simple' },
        ].map((method) => (
          <div key={method.id} className={`payment-card ${formData.paymentMethod === method.id ? 'selected' : ''}`}>
            <input type="radio" id={method.id} name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleChange} />
            <label htmlFor={method.id}>
              <div className="payment-icon">{method.icon}</div>
              <div className="payment-info"><h4>{method.title}</h4><p>{method.desc}</p></div>
              <div className="payment-check">{formData.paymentMethod === method.id && <i className="fas fa-check-circle"></i>}</div>
            </label>
          </div>
        ))}
      </div>
      {nights > 0 && (
        <div className="payment-summary">
          <div className="payment-summary-row"><span>Room rate ({nights} night{nights !== 1 ? 's' : ''})</span><span>₱{pricePerNight.toLocaleString()} × {nights}</span></div>
          <div className="payment-summary-row total"><span>Total Amount Due</span><span>₱{totalPrice.toLocaleString()}</span></div>
          <div className="payment-note"><i className="fas fa-info-circle"></i><p>For e-wallet payments, you'll receive payment instructions after booking confirmation.</p></div>
        </div>
      )}
    </div>
  );
};

export default PaymentStep;