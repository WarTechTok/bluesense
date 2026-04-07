import React from 'react';

const StepIndicator = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Guest Info', icon: 'fas fa-user' },
    { num: 2, label: 'Dates', icon: 'fas fa-calendar-alt' },
    { num: 3, label: 'Payment', icon: 'fas fa-credit-card' },
    { num: 4, label: 'Review', icon: 'fas fa-check-circle' },
  ];

  return (
    <div className="step-indicator">
      {steps.map((item) => (
        <div key={item.num} className={`step-item ${currentStep >= item.num ? 'active' : ''} ${currentStep === item.num ? 'current' : ''}`}>
          <div className="step-circle">{currentStep > item.num ? <i className="fas fa-check"></i> : item.num}</div>
          <div className="step-label"><i className={item.icon}></i><span>{item.label}</span></div>
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;