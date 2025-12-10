'use client';

import React, { useState, useEffect } from 'react';
import { allReadings } from '.contentlayer/generated';

export default function ContentPage() {
  const [sortOrder, setSortOrder] = useState('desc');
  const [lectures, setLectures] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load sort order from localStorage on mount
  useEffect(() => {
    const savedSortOrder = localStorage.getItem('contentSortOrder');
    if (savedSortOrder) {
      setSortOrder(savedSortOrder);
    }
  }, []);

  // Save sort order to localStorage when it changes
  const handleSortToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    localStorage.setItem('contentSortOrder', newSortOrder);
  };

  useEffect(() => {
    // Load lectures from JSON
    fetch('/data/content.json')
      .then(response => response.json())
      .then(data => {
        // Enrich lectures with reading data from Contentlayer
        const enrichedLectures = data.lectures.map(lecture => ({
          ...lecture,
          textObjects: lecture.texts.map(slug => {
            const reading = allReadings.find(r => r.slug === slug);
            return reading ? {
              name: reading.title,
              url: reading.url
            } : {
              name: slug,
              url: `/readings/${slug}`
            };
          })
        }));
        setLectures(enrichedLectures);
      })
      .catch(error => console.error('Error loading content:', error));
  }, []);

  // Format date from M/D to "Month D"

  const monthNamesShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                         'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const monthNamesLong = ['january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december'];

const normalizeDate = (dateStr) => {
  // dateStr expected as "M/D"
  const [month, day] = dateStr.split('/');
  const m = parseInt(month) - 1;
  const d = parseInt(day);

  const short = `${monthNamesShort[m]} ${d}`;   // "feb 14"
  const long  = `${monthNamesLong[m]} ${d}`;    // "february 14"

  return [short, long, dateStr]; // return all matchable forms
};

  const formatDate = (dateStr) => {
    const [month, day] = dateStr.split('/');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  // Sort lectures by date
  const sortedLectures = sortOrder === 'desc' 
    ? [...lectures].reverse()
    : [...lectures];

  const filteredLectures = sortedLectures.filter(lecture => {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();
  const matchesTopic = lecture.topic.toLowerCase().includes(query);
  const matchesReadings = lecture.textObjects?.some(text =>
    text.name.toLowerCase().includes(query)
  );

  const dateMatches = normalizeDate(lecture.date).some(
    d => d.toLowerCase().includes(query)
  );

  return matchesTopic || dateMatches || matchesReadings;
});


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
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '32px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '24px',
      position: 'relative'
    },
    searchContainer: {
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'center'
    },
    searchInput: {
      width: '100%',
      maxWidth: '500px',
      padding: '12px 16px',
      fontSize: '16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    tableHeader: {
      backgroundColor: '#dbeafe',
      textAlign: 'left'
    },
    th: {
      padding: '16px',
      fontWeight: '700',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#374151',
      borderBottom: '2px solid #e5e7eb'
    },
    tr: {
      borderBottom: '2px solid rgba(0,0,0,0.18)',
      backgroundColor: '#fff'
    },
    trAlt: {
      borderBottom: '2px solid rgba(0,0,0,0.18)',
      backgroundColor: '#f9fafb'
    },
    trLast: {
      borderBottom: 'none',
      backgroundColor: '#fff'
    },
    trLastAlt: {
      borderBottom: 'none',
      backgroundColor: '#f9fafb'
    },
    td: {
      padding: '20px 16px',
      verticalAlign: 'top'
    },
    dateCell: {
      width: '120px'
    },
    dateText: {
      fontWeight: '600',
      fontSize: '16px',
      color: '#000'
    },
    topicCell: {
      width: '300px'
    },
    topicText: {
      fontWeight: '400',
      fontSize: '16px',
      color: '#000'
    },
    linksCell: {
      width: 'auto'
    },
    lectureLinks: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    lectureLink: {
      padding: '6px 12px',
      backgroundColor: '#fff',
      borderRadius: '6px',
      textDecoration: 'none',
      color: '#000',
      fontSize: '15px',
      fontWeight: '500',
      border: '1px solid rgba(0,0,0,0.1)',
      transition: 'all 0.2s',
      display: 'inline-block'
    },
    lectureLinkDisabled: {
      padding: '6px 12px',
      backgroundColor: '#f3f4f6',
      borderRadius: '6px',
      textDecoration: 'none',
      color: '#9ca3af',
      fontSize: '15px',
      fontWeight: '500',
      border: '1px solid rgba(0,0,0,0.05)',
      cursor: 'not-allowed',
      display: 'inline-block',
      pointerEvents: 'none'
    },
    textsCell: {
      width: '250px'
    },
    textLink: {
      display: 'block',
      color: '#000',
      textDecoration: 'underline',
      marginBottom: '6px',
      fontSize: '16px',
      textUnderlineOffset: '2px'
    }
  };

  return (
    <div style={styles.container}>
      <style jsx>{`
        a:focus-visible,
        button:focus-visible {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }
        
        .lecture-link:hover {
          background-color: #f3f4f6;
          border-color: rgba(0,0,0,0.2);
        }
        
        tbody tr:hover {
          background-color: rgba(0,0,0,0.02);
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
                aria-current={item.label === 'Content' ? 'page' : undefined}
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
          <h1 style={styles.title}>Content</h1>
        </div>

        {/* Search Box */}
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by topic, date, or reading..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        {/* Table */}
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th 
                style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} 
                onClick={handleSortToggle}
              >
                Date {sortOrder === 'desc' ? '↓' : '↑'}
              </th>
              <th style={styles.th}>Topic</th>
              <th style={styles.th}>Lecture Materials</th>
              <th style={styles.th}>Related Readings</th>
            </tr>
          </thead>
          <tbody>
            {filteredLectures.map((lecture, i) => (
              <tr 
                key={i}
                style={
                  i === filteredLectures.length - 1 
                    ? (i % 2 === 0 ? styles.trLast : styles.trLastAlt)
                    : (i % 2 === 0 ? styles.tr : styles.trAlt)
                }
              >
                <td style={{...styles.td, ...styles.dateCell}}>
                  <div style={styles.dateText}>
                    {formatDate(lecture.date)}
                  </div>
                </td>
                <td style={{...styles.td, ...styles.topicCell}}>
                  <div style={styles.topicText}>
                    {lecture.topic}
                  </div>
                </td>
                <td style={{...styles.td, ...styles.linksCell}}>
                  <div style={styles.lectureLinks}>
                    <a 
                      href={lecture.slides_google || '#'} 
                      style={lecture.slides_google ? styles.lectureLink : styles.lectureLinkDisabled}
                      className={lecture.slides_google ? 'lecture-link' : ''}
                      target={lecture.slides_google ? '_blank' : undefined}
                      rel={lecture.slides_google ? 'noopener noreferrer' : undefined}
                    >
                      Slides
                    </a>
                    <a 
                      href={lecture.slides_pdf || '#'} 
                      style={lecture.slides_pdf ? styles.lectureLink : styles.lectureLinkDisabled}
                      className={lecture.slides_pdf ? 'lecture-link' : ''}
                    >
                      Annotated
                    </a>
                    <a 
                      href={lecture.recording || '#'} 
                      style={lecture.recording ? styles.lectureLink : styles.lectureLinkDisabled}
                      className={lecture.recording ? 'lecture-link' : ''}
                      target={lecture.recording ? '_blank' : undefined}
                      rel={lecture.recording ? 'noopener noreferrer' : undefined}
                    >
                      Recording
                    </a>
                  </div>
                </td>
                <td style={{...styles.td, ...styles.textsCell}}>
                  {lecture.textObjects && lecture.textObjects.map((text, k) => (
                    <a 
                      key={k} 
                      href={text.url} 
                      style={styles.textLink}
                    >
                      {text.name}
                    </a>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
