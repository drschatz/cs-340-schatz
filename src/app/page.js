'use client';

import React from 'react';

export default function CoursePortal() {
  const announcements = [
    {
      date: 'Tuesday, March 30',
      content: 'blah blah blah yay exam grades good'
    },
    {
      date: 'Tuesday, March 23',
      content: 'exam soon practice out !'
    }
  ];

  const upcoming = [
    { date: '4/02', event: 'MP: Allocator' },
    { date: '4/05', event: 'Homework 3' },
    { date: '4/11', event: 'MP: HTTP' },
    { date: '4/18', event: 'Exam 3' },
    { date: '4/22', event: 'Homework 4' }
  ];

  const navItems = [
    { label: 'Home', color: '#fff8e5', group: 1, href: '/' },
    { label: 'Syllabus', color: '#fff8e5', group: 1, href: '/syllabus' },
    { label: 'Staff', color: '#fff8e5', group: 1, href: '/staff' },
    { label: 'Content', color: '#fff8e5', group: 1, href: '/content' },
    { label: 'MPs', color: '#fff8e5', group: 1, href: '/mps' },
    { label: 'PraireLearn', color: '#fce8d0', group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: '#dbeafe', group: 3, href: '/campuswire' }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#fff',
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
    navItems: {
      display: 'flex',
      gap: '0px',
      alignItems: 'center'
    },
    navButton: (color, isFirstInGroup, isLastInGroup) => ({
      padding: '8px 16px',
      borderRadius: isFirstInGroup && isLastInGroup ? '8px' : isFirstInGroup ? '8px 0 0 8px' : isLastInGroup ? '0 8px 8px 0' : '0px',
      border: 'none',
      backgroundColor: color || 'transparent',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px'
    }),
    header: {
      backgroundColor: '#fff',
      borderBottom: 'none',
      padding: '24px 32px',
      textAlign: 'center'
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    subtitle: {
      fontSize: '18px',
      color: '#374151',
      marginBottom: '4px'
    },
    season: {
      fontSize: '18px',
      fontWeight: 'bold'
    },
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '8px 32px 32px 32px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '24px',
      marginBottom: '32px'
    },
    card: (bgColor) => ({
      backgroundColor: bgColor,
      borderRadius: '16px',
      padding: '24px'
    }),
    cardTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '24px'
    },
    announcementItem: {
      marginBottom: '24px'
    },
    announcementDate: {
      textDecoration: 'underline',
      fontWeight: '600',
      marginBottom: '8px'
    },
    announcementText: {
      color: '#1f2937'
    },
    upcomingItem: {
      display: 'flex',
      gap: '16px',
      marginBottom: '12px',
      fontSize: '16px',
      alignItems: 'center'
    },
    upcomingDate: {
      fontWeight: '600',
      minWidth: '50px'
    },
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navGroup}>
          {navItems.filter(item => item.group === 1).map((item, i) => {
            const groupItems = navItems.filter(it => it.group === 1);
            const isFirstInGroup = i === 0;
            const isLastInGroup = i === groupItems.length - 1;
            return (
              <a
                key={item.label}
                href={item.href}
                style={{
                  ...styles.navButton(item.color, isFirstInGroup, isLastInGroup),
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-block'
                }}
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
                style={{
                  ...styles.navButton(item.color, isFirstInGroup, isLastInGroup),
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-block'
                }}
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
                style={{
                  ...styles.navButton(item.color, isFirstInGroup, isLastInGroup),
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'inline-block'
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
      <div style={styles.header}>
        <h1 style={styles.title}>CS 340</h1>
        <p style={styles.subtitle}>Introduction to Computer Systems</p>
        <p style={styles.season}>Spring 2026</p>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.grid}>
          <div style={styles.card('#fff8e5')}>
            <h2 style={styles.cardTitle}>Announcements</h2>
            {announcements.map((ann, i) => (
              <div key={i} style={styles.announcementItem}>
                <p style={styles.announcementDate}>{ann.date}</p>
                <p style={styles.announcementText}>{ann.content}</p>
              </div>
            ))}
          </div>
          <div style={styles.card('#f3f4f6')}>
            <h2 style={styles.cardTitle}>Upcoming</h2>
            {upcoming.map((item, i) => (
              <div key={i} style={styles.upcomingItem}>
                <span style={styles.upcomingDate}>{item.date}</span>
                <span>{item.event}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '32px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Course Calendar
          </h2>
          <div style={{ width: '100%' }}>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=c_a62149e6b0852481fc6a1ec5bf34e6e5667a40419f5eeaaea14c647dbf7daa4d%40group.calendar.google.com&ctz=America%2FChicago"
              width="100%"
              height="750"
            />
          </div>
        </div>
      </div>
    </div>
  );
}