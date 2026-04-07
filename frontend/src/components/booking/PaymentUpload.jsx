// frontend/src/components/booking/PaymentUpload.jsx
import React, { useState } from 'react';

function PaymentUpload({ paymentMethod, onPaymentProofUpload, totalPrice, downpayment }) {
  const [proofFile, setProofFile] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProofFile(file);
    } else {
      alert('Please upload an image file (PNG, JPG, JPEG)');
    }
  };

  const handleUpload = async () => {
    if (!proofFile && !referenceNumber) {
      alert('Please provide either payment proof image or reference number');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    if (proofFile) formData.append('paymentProof', proofFile);
    if (referenceNumber) formData.append('referenceNumber', referenceNumber);
    formData.append('paymentMethod', paymentMethod);
    formData.append('amount', downpayment);

    try {
      const response = await fetch('/api/payments/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      const data = await response.json();
      if (response.ok) {
        onPaymentProofUpload(data.payment);
        alert('Payment proof uploaded successfully!');
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  if (paymentMethod === 'cash') {
    return (
      <div className="payment-cash-info">
        <i className="fas fa-money-bill-wave"></i>
        <div>
          <h4>Cash Payment</h4>
          <p>Pay <strong>₱{downpayment.toLocaleString()}</strong> upon arrival</p>
          <p className="cash-note">Remaining balance: ₱{(totalPrice - downpayment).toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-upload-section">
      <h4><i className="fas fa-upload"></i> Payment Proof Required</h4>
      <p className="payment-info-text">
        Send your payment to:<br/>
        <strong>GCash: 09XX XXX XXXX (Catherine's Oasis)</strong><br/>
        <strong>GoTyme: XXXXXXXX-XXXX</strong>
      </p>
      
      <div className="upload-group">
        <label>Screenshot of Payment</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {proofFile && <span className="file-name">✓ {proofFile.name}</span>}
      </div>
      
      <div className="upload-group">
        <label>OR Reference Number</label>
        <input 
          type="text" 
          placeholder="Enter GCash/GoTyme reference number"
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
        />
      </div>
      
      <button 
        className="upload-proof-btn" 
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Submit Payment Proof'}
      </button>
      
      <div className="payment-note">
        <i className="fas fa-info-circle"></i>
        <small>Your booking will be confirmed after payment verification (within 24 hours)</small>
      </div>
    </div>
  );
}

export default PaymentUpload;