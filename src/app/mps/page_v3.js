'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { allMPs } from '.contentlayer/generated';

export default function MPsPage() {
  const [mps, setMps] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState({});

  useEffect(() => {
    // Load MPs configuration
    fetch('/data/mps.json')
      .then(response => response.json())
      .then(data => {
        setMps(data.mps);
      })
      .catch(error => console.error('Error loading MPs:', error));

    // Load calendar events to get release and due dates
    fetchCalendarDates();
  }, []);

  const fetchCalendarDates = async () => {
    try {
      // First get the calendar URL from config
      const configResponse = await fetch('/data/calendar-config.json');
      const config = await configResponse.json();
      const calendarUrl = config.scheduleEmbedUrl;
      
      // Then fetch the calendar data
      const response = await fetch(`/api/calendar?url=${encodeURIComponent(calendarUrl)}`);
      const icsData = await response.text();
      const events = parseICSForDates(icsData);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  const parseICSForDates = (icsText) => {
    const events = {};
    const lines = icsText.split('\n');
    let currentEvent = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.date && currentEvent.summary) {
          const summary = currentEvent.summary.toLowerCase();
          const isRelease = summary.includes('released');
          events[currentEvent.summary] = {
            date: formatDate(new Date(currentEvent.date)),
            rawDate: new Date(currentEvent.date),
            isRelease
          };
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('DTSTART')) {
          const dateMatch = line.match(/(\d{4})(\d{2})(\d{2})/);
          if (dateMatch) {
            currentEvent.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
          }
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8).trim();
        }
      }
    }

    return events;
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month - 1]} ${day}`;
  };

  const getStatus = (releaseDate, dueDate) => {
    const now = new Date();
    
    if (!releaseDate || releaseDate > now) {
      return 'inactive'; // Not released yet
    }
    
    if (!dueDate) {
      return 'active'; // Released but no due date
    }
    
    const gracePeriodEnd = new Date(dueDate);
    gracePeriodEnd.setHours(gracePeriodEnd.getHours() + 24);
    
    if (now > gracePeriodEnd) {
      return 'inactive'; // Past grace period
    }
    
    if (now > dueDate) {
      return 'grace'; // In grace period
    }
    
    return 'active'; // Between release and due
  };

  // Create array of all 10 MPs (0-9)
  const allMPsList = Array.from({ length: 10 }, (_, i) => {
    const mpData = mps.find(mp => mp.number === i);
    const mpContent = allMPs.find(mp => mp.number === i);
    
    // Auto-generate calendar event names
    const releaseEventName = `MP${i} Release`;
    const dueEventName = `MP${i}`;
    
    const releaseEvent = calendarEvents[releaseEventName];
    const dueEvent = calendarEvents[dueEventName];
    
    const now = new Date();
    const isReleased = !releaseEvent || (releaseEvent.rawDate <= now);
    const status = getStatus(releaseEvent?.rawDate, dueEvent?.rawDate);
    
    return {
      number: i,
      title: mpData?.title || `Machine Problem ${i}`,
      dueDate: dueEvent ? dueEvent.date : null,
      releaseDate: releaseEvent ? releaseEvent.date : null,
      hasSpec: !!mpContent,
      isAvailable: !!mpData && isReleased,
      status: status
    };
  });

  const navItems = [
    { label: 'Home', color: colors.navCream, group: 1, href: '/' },
    { label: 'Syllabus', color: colors.navCream, group: 1, href: '/syllabus' },
    { label: 'Staff', color: colors.navCream, group: 1, href: '/staff' },
    { label: 'Content', color: colors.navCream, group: 1, href: '/content' },
    { label: 'MPs', color: colors.navCream, group: 1, href: '/mps' },
    { label: 'PraireLearn', color: colors.navOrange, group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: colors.navBlue, group: 3, href: '/campuswire' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#86efac'; // Light green
      case 'grace': return '#fcd34d'; // Light yellow
      case 'inactive': return colors.lightGray; // Gray
      default: return colors.lightGray;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'grace': return 'Grace Period';
      case 'inactive': return 'Inactive';
      default: return 'Inactive';
    }
  };

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
      padding: '48px 32px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: colors.black
    },
    subtitle: {
      fontSize: '18px',
      color: colors.mediumGray
    },
    mpList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    mpRow: (isAvailable) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '20px 24px',
      backgroundColor: isAvailable ? colors.white : colors.lightGray,
      borderRadius: '12px',
      border: `2px solid ${isAvailable ? colors.tableBorder : colors.borderLight}`,
      opacity: isAvailable ? 1 : 0.5,
      cursor: isAvailable ? 'pointer' : 'not-allowed',
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s'
    }),
    mpNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: colors.black,
      minWidth: '80px'
    },
    mpTitle: {
      flex: '1',
      fontSize: '18px',
      fontWeight: '500',
      color: colors.black
    },
    statusTag: (status) => ({
      padding: '6px 16px',
      backgroundColor: getStatusColor(status),
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      color: colors.black,
      minWidth: '100px',
      textAlign: 'center'
    }),
    mpDue: {
      fontSize: '15px',
      color: colors.mediumGray,
      minWidth: '100px'
    }
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        a:focus-visible,
        button:focus-visible {
          outline: 3px solid ${colors.focusBlue};
          outline-offset: 2px;
        }
        
        .mp-row-clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
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
                aria-current={item.label === 'MPs' ? 'page' : undefined}
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
        <div style={styles.header}>
          <h1 style={styles.title}>Machine Problems</h1>
          <p style={styles.subtitle}>Complete all 10 MPs throughout the semester</p>
        </div>

        {/* MP List */}
        <div style={styles.mpList}>
          {allMPsList.map((mp) => (
            mp.isAvailable && mp.hasSpec ? (
              <a
                key={mp.number}
                href={`/mps/${mp.number}`}
                style={styles.mpRow(true)}
                className="mp-row-clickable"
              >
                <div style={styles.mpNumber}>MP{mp.number}</div>
                <div style={styles.mpTitle}>{mp.title}</div>
                <div style={styles.statusTag(mp.status)}>
                  {getStatusText(mp.status)}
                </div>
                {mp.dueDate && (
                  <div style={styles.mpDue}>Due: {mp.dueDate}</div>
                )}
              </a>
            ) : (
              <div
                key={mp.number}
                style={styles.mpRow(mp.isAvailable)}
              >
                <div style={styles.mpNumber}>MP{mp.number}</div>
                <div style={styles.mpTitle}>{mp.title}</div>
                <div style={styles.statusTag(mp.status)}>
                  {getStatusText(mp.status)}
                </div>
                {mp.dueDate && (
                  <div style={styles.mpDue}>Due: {mp.dueDate}</div>
                )}
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
