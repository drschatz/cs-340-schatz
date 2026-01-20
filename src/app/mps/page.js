'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { allMPs } from '.contentlayer/generated';
import Navigation from '../../components/Navigation';  // Add this import at the top


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
      // Just fetch from API - it handles the config internally
      const response = await fetch('/api/calendar');
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
          events[currentEvent.summary] = {
            date: formatDate(currentEvent.date),
            rawDate: currentEvent.date
          };
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('DTSTART')) {
          // Match date AND time: 20251211T160000 (local time after API conversion)
          const dateTimeMatch = line.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
          if (dateTimeMatch) {
            const [_, year, month, day, hour, minute, second] = dateTimeMatch;
            // Create local date object
            currentEvent.date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            );
             // ADD DEBUG CODE HERE
          } else {
            // Fallback for date-only format
            const dateMatch = line.match(/(\d{4})(\d{2})(\d{2})/);
            if (dateMatch) {
              const [_, year, month, day] = dateMatch;
              currentEvent.date = new Date(parseInt(year), parseInt(month), parseInt(day));
            }
          }
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8).trim();
        }
      }
    }

    return events;
  };

  // Helper function to find calendar event with flexible naming
  const findCalendarEvent = (mpNumber, eventType) => {
    // Try different variations of event names
    const variations = [
      `MP${mpNumber} ${eventType}`,
      `MP ${mpNumber} ${eventType}`,
      `mp${mpNumber} ${eventType}`,
      `mp ${mpNumber} ${eventType}`,
      `MP${mpNumber}${eventType}`,
      `MP ${mpNumber}${eventType}`,
    ];

    // Also try different capitalizations of the event type
    const typeVariations = [
      eventType.toLowerCase(),
      eventType.charAt(0).toUpperCase() + eventType.slice(1).toLowerCase(),
      eventType.toUpperCase()
    ];

    for (const baseVar of variations) {
      for (const typeVar of typeVariations) {
        const testName = baseVar.replace(eventType, typeVar);
        // Check exact match
        if (calendarEvents[testName]) {
          return calendarEvents[testName];
        }
        // Check case-insensitive match
        const match = Object.keys(calendarEvents).find(
          key => key.toLowerCase().trim() === testName.toLowerCase().trim()
        );
        if (match && calendarEvents[match]) {
          return calendarEvents[match];
        }
      }
    }

    // For "Due" events, also try just "MP0", "MP 0", etc. without "Due"
    if (eventType.toLowerCase() === 'due') {
      const simpleVariations = [
        `MP${mpNumber}`,
        `MP ${mpNumber}`,
        `mp${mpNumber}`,
        `mp ${mpNumber}`
      ];
      
      for (const variant of simpleVariations) {
        if (calendarEvents[variant]) {
          return calendarEvents[variant];
        }
        const match = Object.keys(calendarEvents).find(
          key => key.toLowerCase().trim() === variant.toLowerCase().trim()
        );
        if (match && calendarEvents[match]) {
          return calendarEvents[match];
        }
      }
    }

    return null;
  };

  const formatDate = (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month]} ${day}`;
  };

  const getStatus = (releaseDate, dueDate) => {
    const now = new Date();

    if (!releaseDate || releaseDate > now) {
      console.log("inactive");
      return 'inactive'; // Not released yet
    }
    
    if (!dueDate) {
      return 'active'; // Released but no due date
    }
    
    // Grace period ends 24 hours after 11:59pm of the due date
    // So if due date is Dec 10, grace period ends at 11:59pm Dec 11
    const gracePeriodEnd = new Date(dueDate);
    gracePeriodEnd.setHours(23, 59, 59, 999); // Set to 11:59:59.999pm of due date
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 1); // Add 1 day (so 11:59pm next day)
    
    if (now > gracePeriodEnd) {
      return 'inactive'; // Past grace period
    }
    
    // Check if we're past the due date (need to handle if due date has a time)
    const dueDateEnd = new Date(dueDate);
    dueDateEnd.setHours(23, 59, 59, 999); // End of due date
    
    if (now > dueDateEnd) {
      return 'grace'; // In grace period
    }
    
    return 'active'; // Between release and due
  };

  // Create array of all 11 MPs (0-10)
  const allMPsList = Array.from({ length: 11 }, (_, i) => {
    const mpData = mps.find(mp => mp.number === i);
    const mpContent = allMPs.find(mp => mp.number === i);
    
    // Use flexible lookup for calendar events
    const releaseEvent = findCalendarEvent(i, 'Released');
    const dueEvent = findCalendarEvent(i, 'Due');
    
    const now = new Date();

    const isReleased = !releaseEvent || (releaseEvent.rawDate <= now);
    const status = getStatus(releaseEvent?.rawDate, dueEvent?.rawDate);
    
    return {
      number: i,
      title: mpData?.title || `Machine Problem ${i}`,
      dueDate: dueEvent ? dueEvent.date : null,
      releaseDate: releaseEvent ? releaseEvent.date : null,
      hasSpec: !!mpContent,
      isAvailable: !!mpData,
      status: status
    };
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return colors.statusActive;
      case 'grace': return colors.statusGrace;
      case 'inactive': return colors.statusInactive;
      default: return colors.statusInactive;
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
      
      <Navigation currentPage="MPs" />


      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>MPs</h1>
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
                {(mp.status === 'active' || mp.status === 'grace') && (
                  <div style={styles.statusTag(mp.status)}>
                    {getStatusText(mp.status)}
                  </div>
                )}
                <div style={styles.mpDue}>Due: {mp.dueDate || 'N/A'}</div>
              </a>
            ) : (
              <div
                key={mp.number}
                style={styles.mpRow(mp.isAvailable)}
              >
                <div style={styles.mpNumber}>MP{mp.number}</div>
                <div style={styles.mpTitle}>{mp.title}</div>
                {(mp.status === 'active' || mp.status === 'grace') && (
                  <div style={styles.statusTag(mp.status)}>
                    {getStatusText(mp.status)}
                  </div>
                )}
                <div style={styles.mpDue}>Due: {mp.dueDate || 'N/A'}</div>
              </div>
            )
          ))}
        </div>
      </main>
    </div>
  );
}
