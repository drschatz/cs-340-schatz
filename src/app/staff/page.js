'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import Navigation from '../../components/Navigation';  // Add this import at the top


const StaffCard = ({ person }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Auto-prepend /profile_img/ if image is provided
  const imagePath = person.image ? `/profile_img/${person.image}` : null;

  return (
    <div
      className="flip-card"
      style={{
        width: '220px',
        height: '280px',
        cursor: 'pointer'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className="flip-card-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of card */}
        <div
          className="flip-card-front"
          style={{
            position: 'absolute',
            width: '220px',
            height: '280px',
            backfaceVisibility: 'hidden',
            backgroundColor: colors.lightGray,
            border: `2px solid ${colors.tableBorder}`,
            borderRadius: '16px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            boxSizing: 'border-box'
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.black,
            margin: 0,
            textAlign: 'center'
          }}>
            {person.name}
          </h3>
          
          {person.callMe && (
            <p style={{
              fontSize: '14px',
              color: colors.mediumGray,
              margin: 0,
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              ({person.callMe})
            </p>
          )}
          
          {/* Avatar */}
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: colors.navBlue,
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {imagePath ? (
              <img 
                src={imagePath} 
                alt={person.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <svg width="60" height="60" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="28" r="16" fill={colors.black} />
                <path d="M12 72C12 55 24 48 40 48C56 48 68 55 68 72" fill={colors.black} />
              </svg>
            )}
          </div>
            
          <p style={{
            fontSize: '13px',
            color: colors.mediumGray,
            margin: 0,
            textAlign: 'center'
          }}>
            Click to see bio
          </p>
        </div>

        {/* Back of card */}
        <div
          className="flip-card-back"
          style={{
            position: 'absolute',
            width: '220px',
            height: '280px',
            backfaceVisibility: 'hidden',
            backgroundColor: colors.lightGray,
            border: `2px solid ${colors.tableBorder}`,
            borderRadius: '16px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotateY(180deg)',
            overflow: 'auto',
            boxSizing: 'border-box'
          }}
        >
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.black,
            margin: '0 0 16px 0',
            textAlign: 'center'
          }}>
            {person.name}
          </h3>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.6',
            color: colors.darkGray,
            margin: 0,
            textAlign: 'center'
          }}>
            {person.bio}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function StaffPage() {
  const [staffData, setStaffData] = useState([]);

  useEffect(() => {
    // Load staff data from JSON
    fetch('/data/staff.json')
      .then(response => response.json())
      .then(data => setStaffData(data.staff))
      .catch(error => console.error('Error loading staff:', error));
  }, []);

  const professors = staffData.filter(person => person.role === 'professor');
  const courseStaff = staffData.filter(person => person.role === 'staff');


  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 32px'
    },
    pageTitle: {
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: '48px',
      color: colors.black
    },
    sectionTitle: {
      fontSize: '32px',
      fontWeight: '600',
      marginBottom: '32px',
      marginTop: '64px',
      color: colors.black,
      textAlign: 'center'
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 220px))',
      gap: '24px',
      justifyContent: 'center',
      marginBottom: '48px'
    },
    cardsContainerCAs: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, 220px)',
      gap: '24px',
      justifyContent: 'center',
      marginBottom: '48px'
    }
  };

  return (
    <div style={styles.container}>
      <Navigation currentPage="Staff" />


      {/* Main Content */}
      <main style={styles.mainContent}>
        <h1 style={styles.pageTitle}>Course Staff</h1>
        {/* Course Staff Section */}
        <section>
          <div style={styles.cardsContainerCAs}>
            {courseStaff.map((staff, idx) => (
              <StaffCard key={idx} person={staff} />
            ))}
          </div>
        </section>
      </main>

      <style jsx global>{`
        .flip-card-front,
        .flip-card-back {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
