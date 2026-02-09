'use client';

import { colors } from '../styles/colors.js';
import Navigation from '../components/Navigation';  // Adjust path as needed



import React, { useState, useEffect } from 'react';

export default function CoursePortal() {
  const [selectedCalendar, setSelectedCalendar] = useState('schedule');
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [calendarUrls, setCalendarUrls] = useState({
    officeHours: '',
    schedule: ''
  });
  const [constants, setConstants] = useState({
    semester: 'Spring 2026',
    courseNumber: 'CS 340',
    courseTitle: 'Introduction to Computer Systems'
  });

  // Add this function inside your component, before the return statement
const renderTextWithLinks = (text) => {
  // Match markdown-style links: [text](url)
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  
  return parts.map((part, index) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const [, linkText, url] = linkMatch;
      return (
        <a 
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: colors.black,
            textDecoration: 'underline'          }}
        >
          {linkText}
        </a>
      );
    }
    return part;
  });
};

  useEffect(() => {
    // Load constants
    fetch('/data/constants.json')
      .then(response => response.json())
      .then(data => setConstants(data))
      .catch(error => console.error('Error loading constants:', error));

    // Load calendar config
    fetch('/data/calendar-config.json')
      .then(response => response.json())
      .then(config => {
        setCalendarUrls({
          schedule: config.scheduleEmbedUrl,
          officeHours: config.officeHoursEmbedUrl
        });
      })
      .catch(error => console.error('Error loading calendar config:', error));

    // Load announcements from JSON file
    fetch('/data/announcements.json')
      .then(response => response.json())
      .then(data => setAnnouncements(data))
      .catch(error => console.error('Error loading announcements:', error));

    // Load upcoming events from our API route
    fetchUpcomingEvents();
  }, []);



  const fetchUpcomingEvents = async () => {
    try {
      // Fetch from our API route (no CORS issues!)
      const response = await fetch('/api/calendar');
      const icsData = await response.text();
      
      const events = parseICS(icsData);
      setUpcomingEvents(events);
    } catch (error) {
      console.error('Error loading calendar events:', error);
      // Empty fallback
      setUpcomingEvents([]);
    }
  };

  const parseICS = (icsText) => {
    const events = [];
    const lines = icsText.split('\n');
    console.log(lines.length)
    let currentEvent = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
          console.log(line)


      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
        console.log("event started");

      } else if (line === 'END:VEVENT') {
        if (currentEvent.date && currentEvent.summary) {
          const eventDate = new Date(currentEvent.date);
          const now = new Date();
          
           console.log(
          'LOGGING',
          'summary:', currentEvent.summary,
          'raw date:', currentEvent.date,
          'eventDate:', formatDate(eventDate),
          'now:', now.toISOString(),
          'keep?', eventDate >= now
        );

          
          if (eventDate >= now) {
            events.push({
              date: formatDate(eventDate),
              event: currentEvent.summary,
              fullDate: eventDate
            });
          }
        }
        currentEvent = null;
      } else if (currentEvent) {
       if (line.startsWith('DTSTART')) {
  // Match date AND time: 20251211T160000 (now without Z since it's local)
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
  } else {
    // Fallback for date-only format
    const dateMatch = line.match(/(\d{4})(\d{2})(\d{2})/);
    if (dateMatch) {
      const [_, year, month, day] = dateMatch;
      currentEvent.date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
  }
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8);
        }
      }
    }

    console.log("DONE")
    // Sort by date and take next 4
    return events
      .sort((a, b) => a.fullDate - b.fullDate)
      .slice(0, 4);
  };

  const formatDate = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    header: {
      backgroundColor: colors.white,
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
      color: colors.darkGray,
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
    cardSection: {
      display: 'flex',
      flexDirection: 'column'
    },
    cardTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '12px'
    },
    card: (bgColor) => ({
      backgroundColor: bgColor,
      borderRadius: '16px',
      padding: '24px'
    }),
    announcementItem: {
      marginBottom: '24px'
    },
    announcementDate: {
      textDecoration: 'underline',
      fontWeight: '600',
      marginBottom: '8px',
      color: colors.black
    },
    announcementText: {
      color: colors.black,
      lineHeight: '1.6'
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
      minWidth: '50px',
      color: colors.black
    },
    upcomingEvent: {
      color: colors.black
    },
    emptyState: {
      color: colors.mediumGray,
      fontStyle: 'italic',
      textAlign: 'center',
      padding: '20px 0'
    },
    calendarSection: {
      marginTop: '32px',
      marginBottom: '32px'
    },
  calendarHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
    calendarTitle: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    toggleGroup: {
      display: 'flex',
      gap: '0px',
      margin: '0 auto'
    },
    toggleButton: (isActive, isFirst, isLast) => ({
        padding: '12px 24px',  // Change from '10px 20px'
  fontSize: '17px',      // Change from '16px'
      border: 'none',
      backgroundColor: isActive ? colors.navBlue : colors.hoverGray,
      cursor: 'pointer',
      fontWeight: isActive ? '600' : '500',
      fontSize: '16px',
      borderRadius: isFirst ? '8px 0 0 8px' : isLast ? '0 8px 8px 0' : '0px',
      transition: 'all 0.2s',
      minHeight: '44px',
      minWidth: '44px'
    }),
    footer: {
      backgroundColor: colors.lightGray,
      padding: '24px 32px',
      textAlign: 'center',
      marginTop: '48px',
      borderTop: `1px solid ${colors.tableBorder}`
    },
    creditText: {
      fontSize: '14px',
      color: colors.mediumGray,
      margin: 0
    },
    creditLink: {
      color: colors.black,
      textDecoration: 'underline',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
          .calendar-header-responsive {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .toggle-group-responsive {
            margin-left: 0 !important;
            margin-top: 12px;
          }
        }
        
        /* Focus indicators for keyboard navigation */
        a:focus-visible,
        button:focus-visible {
          outline: 3px solid colors.focusBlue;
          outline-offset: 2px;
        }
        
        /* Remove default focus outline, use focus-visible instead */
        a:focus:not(:focus-visible),
        button:focus:not(:focus-visible) {
          outline: none;
        }
      `}</style>
      
      <Navigation currentPage="Home" />

      
      <header style={styles.header}>
        <h1 style={styles.title}>{constants.courseNumber}</h1>
        <p style={styles.subtitle}>{constants.courseTitle}</p>
        <p style={styles.season}>{constants.semester}</p>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.grid} className="grid-responsive">
          <section style={styles.cardSection} aria-labelledby="announcements-heading">
            <h2 id="announcements-heading" style={styles.cardTitle}>Announcements</h2>
            <div style={styles.card(colors.cream)} aria-live="polite">
              {announcements.length > 0 ? (
                announcements.map((ann, i) => (
                  <article key={i} style={styles.announcementItem}>
                    <p style={styles.announcementDate}>{ann.date}</p>
<p style={styles.announcementText}>
  {renderTextWithLinks(ann.content)}
</p>                  </article>
                ))
              ) : (
                <p style={styles.emptyState}>No recent announcements</p>
              )}
            </div>
          </section>
          
          <section style={styles.cardSection} aria-labelledby="upcoming-heading">
            <h2 id="upcoming-heading" style={styles.cardTitle}>Upcoming</h2>
            <div style={styles.card(colors.hoverGray)} aria-live="polite">
              {upcomingEvents.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {upcomingEvents.map((item, i) => (
                    <li key={i} style={styles.upcomingItem}>
                      <span style={styles.upcomingDate}>{item.date}</span>
                      <span style={styles.upcomingEvent}>{item.event}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={styles.emptyState}>No upcoming events</p>
              )}
            </div>
          </section>
        </div>
        
        {/* Calendar with Toggle */}
        <section style={styles.calendarSection} aria-labelledby="calendar-heading">
          <div style={styles.calendarHeader} className="calendar-header-responsive">
            <div style={styles.toggleGroup} className="toggle-group-responsive" role="group" aria-label="Calendar view selection">
              <button
                onClick={() => setSelectedCalendar('schedule')}
                style={styles.toggleButton(selectedCalendar === 'schedule', true, false)}
                aria-pressed={selectedCalendar === 'schedule'}
              >
                Schedule & Deadlines
              </button>
              <button
                onClick={() => setSelectedCalendar('officeHours')}
                style={styles.toggleButton(selectedCalendar === 'officeHours', false, true)}
                aria-pressed={selectedCalendar === 'officeHours'}
              >
                Office Hours
              </button>
            </div>
          </div>
          <div style={{ width: '100%' }}>
            <iframe
              key={selectedCalendar}
              src={calendarUrls[selectedCalendar]}
              width="100%"
              height="750"
              style={{ border: 0 }}
              title={selectedCalendar === 'schedule' ? 'Course schedule and deadlines calendar' : 'Office hours calendar'}
            />
          </div>
        </section>
      </main>

      {/* Credit Section */}
      <footer style={styles.footer}>
        <p style={styles.creditText}>
          Website designed and built by Jule Schatz, Michelle Ru, and Janice Mei.
        </p>
      </footer>
    </div>
  );
}
