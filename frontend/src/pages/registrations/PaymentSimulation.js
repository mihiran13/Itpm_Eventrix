import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { registrationsAPI } from '../../services/api';
import { FiCreditCard, FiCheckCircle, FiLock, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PaymentSimulation.css';

const PaymentSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const eventTitle = location.state?.eventTitle || 'Event';
  const amount = location.state?.amount || 0;

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    if (name === 'expiry') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    if (name === 'cvv') value = value.replace(/\D/g, '').substring(0, 3);
    setCardData({ ...cardData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardData.cardNumber || !cardData.expiry || !cardData.cvv || !cardData.cardName) {
      toast.error('Please fill in all card details');
      return;
    }
    setProcessing(true);
    try {
      const res = await registrationsAPI.simulatePayment(id, { paymentMethod: 'credit_card' });
      setTransactionId(res.data.payment.transactionId);
      setCompleted(true);
      toast.success('Payment successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadTicket = async () => {
    try {
      const res = await registrationsAPI.getETicket(id);
      const t = res.data.ticketData;
      const ticketContent = `
===========================================
        EVENTRIX E-TICKET
===========================================

Event: ${t.eventTitle}
Date: ${t.eventDate ? new Date(t.eventDate).toLocaleDateString() : 'TBA'}
Venue: ${t.eventVenue?.name || 'Online'}
Faculty: ${t.faculty || 'All'}

-------------------------------------------
Attendee: ${t.attendeeName}
Email: ${t.attendeeEmail}
Registration #: ${t.registrationNumber}
Status: ${t.status}
Payment: ${t.paymentStatus} ($${t.paymentAmount || 0})

-------------------------------------------
QR Data: ${t.qrData}
===========================================
      `;
      const blob = new Blob([ticketContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${t.registrationNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('E-Ticket downloaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download ticket');
    }
  };

  if (completed) {
    return (
      <div className="payment-page">
        <div className="payment-card success-card">
          <FiCheckCircle className="success-icon" />
          <h2>Payment Successful!</h2>
          <p>Your payment for <strong>{eventTitle}</strong> has been confirmed.</p>
          <div className="transaction-info">
            <span className="label">Transaction ID</span>
            <span className="value">{transactionId}</span>
            <span className="label">Amount Paid</span>
            <span className="value">${amount}</span>
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={handleDownloadTicket}>
              <FiDownload /> Download E-Ticket
            </button>
            <button className="btn-secondary" onClick={() => navigate('/my-registrations')}>
              View My Registrations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-header">
          <FiCreditCard size={24} />
          <h2>Payment</h2>
          <p className="payment-note"><FiLock size={12} /> Simulated Payment (No real charges)</p>
        </div>

        <div className="payment-summary">
          <span>Event: {eventTitle}</span>
          <span className="payment-amount">${amount}</span>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Cardholder Name</label>
            <input type="text" name="cardName" value={cardData.cardName} onChange={handleChange} placeholder="John Doe" className="form-input" />
          </div>
          <div className="form-group">
            <label>Card Number</label>
            <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleChange} placeholder="1234 5678 9012 3456" className="form-input" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiry</label>
              <input type="text" name="expiry" value={cardData.expiry} onChange={handleChange} placeholder="MM/YY" className="form-input" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input type="text" name="cvv" value={cardData.cvv} onChange={handleChange} placeholder="123" className="form-input" />
            </div>
          </div>
          <button type="submit" className="btn-primary pay-btn" disabled={processing}>
            {processing ? 'Processing...' : `Pay $${amount}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentSimulation;
