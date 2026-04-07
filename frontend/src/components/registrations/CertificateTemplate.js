import React from 'react';
import { format } from 'date-fns';

const CertificateTemplate = ({ attendeeName, eventTitle, completionDate, regNumber }) => {
  return (
    <div 
      id="certificate-to-print"
      style={{
        width: '1000px',
        height: '700px',
        background: '#fff',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'serif'",
        overflow: 'hidden'
      }}
    >
      {/* Thick Navy Blue Border (Absolute Positioned for stability) */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        border: '30px solid #1a237e',
        pointerEvents: 'none',
        zIndex: 10
      }} />

      {/* Gold Inner Thin Border */}
      <div style={{
        position: 'absolute',
        top: '40px', left: '40px', right: '40px', bottom: '40px',
        border: '3px solid #c5a059',
        pointerEvents: 'none',
        zIndex: 5
      }} />

      {/* Main Content Container (to push everything inside the borders) */}
      <div style={{
        width: '850px',
        height: '550px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        zIndex: 1
      }}>
        {/* Eventrix Logo / Branding */}
        <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a237e', letterSpacing: '2px' }}>EVENTRIX</span>
          <div style={{ width: '3px', height: '35px', background: '#c5a059' }} />
          <span style={{ fontSize: '18px', letterSpacing: '4px', color: '#666' }}>OFFICIAL RECOGNITION</span>
        </div>

        <h1 style={{ fontSize: '64px', margin: '10px 0', color: '#1a237e', letterSpacing: '2px' }}>
          CERTIFICATE
        </h1>
        <h2 style={{ fontSize: '20px', margin: '0 0 40px 0', color: '#c5a059', fontWeight: 'normal', letterSpacing: '6px' }}>
          OF PARTICIPATION
        </h2>

        <p style={{ fontSize: '20px', color: '#555', margin: '0' }}>This is to certify that</p>
        
        <div style={{ margin: '20px 0', borderBottom: '2px solid #e0e0e0', width: '80%' }}>
          <h3 style={{ fontSize: '52px', color: '#1a237e', margin: '10px 0' }}>
            {attendeeName}
          </h3>
        </div>

        <p style={{ fontSize: '20px', color: '#555', maxWidth: '700px', lineHeight: '1.6' }}>
          has successfully attended and participated in the professional workshop titled
          <br />
          <strong style={{ fontSize: '28px', color: '#333', display: 'block', marginTop: '15px' }}>"{eventTitle}"</strong>
        </p>

        <p style={{ fontSize: '18px', color: '#555', marginTop: '25px' }}>
          Issued on this day, {format(new Date(completionDate), 'MMMM do, yyyy')}
        </p>

        {/* Signature & Seal Section (Shifted up to avoid border overlap) */}
        <div style={{ marginTop: '40px', display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontStyle: 'italic', fontSize: '28px', color: '#1a237e', fontFamily: 'cursive' }}>Eventrix Council</div>
            <div style={{ width: '200px', borderTop: '2px solid #333', margin: '5px auto', paddingTop: '5px', fontSize: '13px', fontWeight: 'bold' }}>OFFICIAL SIGNATURE</div>
          </div>

          {/* Verified Seal */}
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: '-20px',
            transform: 'translateX(-50%) rotate(-10deg)',
            width: '110px',
            height: '110px',
            border: '5px double #c5a059',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c5a059',
            background: 'white',
            zIndex: 2,
            boxShadow: '0 0 10px rgba(0,0,0,0.05)'
          }}>
              <span style={{ fontSize: '13px', fontWeight: '900' }}>VERIFIED</span>
              <div style={{ width: '80%', height: '1px', background: '#c5a059', margin: '3px 0' }} />
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>ID {regNumber}</span>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontStyle: 'italic', fontSize: '28px', color: '#1a237e', fontFamily: 'cursive' }}>Academic Board</div>
            <div style={{ width: '200px', borderTop: '2px solid #333', margin: '5px auto', paddingTop: '5px', fontSize: '13px', fontWeight: 'bold' }}>EXAMINER SIGNATURE</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;
