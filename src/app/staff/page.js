'use client';

import React, { useState } from 'react';

const colors = {
  white: '#FFFFFF',
  black: '#000000',
  cream: '#F5F1E8',
  navCream: '#F5F1E8',
  navOrange: '#FFD4A3',
  navBlue: '#C5E3F6',
  lightGray: '#F5F5F5',
  mediumGray: '#666666',
  darkGray: '#333333',
  focusBlue: '#0066CC'
};

// Sample staff data - replace with your actual data
const professors = [
  { 
    id: 1, 
    name: 'Luther Tychonievich', 
    bio: 'This is a short biography about the professor. You can add more details about their research, teaching interests, and background here.'
  },
  { 
    id: 2, 
    name: 'Jule Schatz', 
    bio: 'This is a short biography about the professor. You can add more details about their research, teaching interests, and background here.'
  }
];

const graduateTAs = [
  { 
    id: 3, 
    name: 'Daixuan Li', 
    bio: 'This is a short biography about the graduate TA. You can add details about their research area and teaching experience.'
  },
  { 
    id: 4, 
    name: 'Otto Piramuthu', 
    bio: 'This is a short biography about the graduate TA. You can add details about their research area and teaching experience.'
  },
  { 
    id: 5, 
    name: 'Andrea Watkins', 
    bio: 'This is a short biography about the graduate TA. You can add details about their research area and teaching experience.'
  }
];

const undergraduateCAs = [
  { 
    id: 6, 
    name: 'Roma Chandra', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  },
  { 
    id: 7, 
    name: 'Janice Mei', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  },
  { 
    id: 8, 
    name: 'Michelle Ru',
    image: '/profile_img/michelle_ru.jpeg', 
    bio: 'Michelle is a senior studying CS + Chemistry with a minor in statistics. She took CS 340 in Fall of 2024 and has been a CA since Spring of 2025. Her favorite MP is UTF-8. Outside of school she likes to bake, watch movies, and hang out with her friends.'
  },
  { 
    id: 9, 
    name: 'Nick Tetreault', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  },
  { 
    id: 10, 
    name: 'Kavya Sachdeva', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  },
  { 
    id: 11, 
    name: 'Frank Schmidt', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  },
  { 
    id: 12, 
    name: 'Arunima Suri', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  },
  { 
    id: 13, 
    name: 'Sarah Xu', 
    bio: 'This is a short biography about the undergraduate CA. You can add details about their interests and experience.'
  }
];

const StaffCard = ({ person }) => {
  const [isFlipped, setIsFlipped] = useState(false);

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
            backgroundColor: colors.cream,
            borderRadius: '16px',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            boxSizing: 'border-box'
          }}
        >
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.black,
            margin: 0,
            textAlign: 'center'
          }}>
            {person.name}
          </h3>
          
  {/* Avatar */}
  <div
    style={{
      width: '120px',
      height: '120px',
      backgroundColor: '#B8C9D9',
      borderRadius: '20px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {person.image ? (
        <img 
          src={person.image} 
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
              fontSize: '12px',
              color: colors.mediumGray,
              margin: 0,
              textAlign: 'center'
            }}>
              Short Bio
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
            backgroundColor: colors.cream,
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
            fontWeight: '700',
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
  const navItems = [
    { label: 'Home', color: colors.navCream, group: 1, href: '/' },
    { label: 'Syllabus', color: colors.navCream, group: 1, href: '/syllabus' },
    { label: 'Staff', color: colors.navCream, group: 1, href: '/staff' },
    { label: 'Content', color: colors.navCream, group: 1, href: '/content' },
    { label: 'MPs', color: colors.navCream, group: 1, href: '/mps' },
    { label: 'PraireLearn', color: colors.navOrange, group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: colors.navBlue, group: 3, href: '/campuswire' }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    nav: {
      backgroundColor: 'transparent',
      borderBottom: 'none',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0px'
    },
    navGroup: {
      display: 'flex',
      gap: '0px'
    },
    navGroupSpacer: {
      width: '16px'
    },
    navButton: (color, isFirstInGroup, isLastInGroup) => ({
      padding: '8px 16px',
      borderRadius: isFirstInGroup && isLastInGroup ? '8px' : isFirstInGroup ? '8px 0 0 8px' : isLastInGroup ? '0 8px 8px 0' : '0px',
      border: 'none',
      backgroundColor: color || 'transparent',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '15px',
      textDecoration: 'none',
      color: 'inherit',
      display: 'inline-block'
    }),
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 32px'
    },
    pageTitle: {
      fontSize: '36px',
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: '32px',
      color: colors.black,
      letterSpacing: '-0.02em'
    },
    sectionTitle: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '24px',
      color: colors.black,
      letterSpacing: '-0.01em',
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
      gridTemplateColumns: 'repeat(4, 220px)',
      gap: '24px',
      justifyContent: 'center',
      marginBottom: '48px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.nav} role="navigation" aria-label="Main navigation">
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 1).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 1);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
                aria-current={item.label === 'Staff' ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div style={styles.navGroupSpacer} />
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 2).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 2);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <div style={styles.navGroupSpacer} />
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 3).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 3);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <h1 style={styles.pageTitle}>Staff</h1>
        
        {/* Professors Section */}
        <section>
          <h2 style={styles.sectionTitle}>Professors</h2>
          <div style={styles.cardsContainer}>
            {professors.map(professor => (
              <StaffCard key={professor.id} person={professor} />
            ))}
          </div>
        </section>

        {/* Graduate TAs Section */}
        <section>
          <h2 style={styles.sectionTitle}>Graduate TAs</h2>
          <div style={styles.cardsContainer}>
            {graduateTAs.map(ta => (
              <StaffCard key={ta.id} person={ta} />
            ))}
          </div>
        </section>

        {/* Undergraduate CAs Section */}
        <section>
          <h2 style={styles.sectionTitle}>Undergraduate CAs</h2>
          <div style={styles.cardsContainerCAs}>
            {undergraduateCAs.map(ca => (
              <StaffCard key={ca.id} person={ca} />
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