'use client';

import React, { useState } from 'react';

export default function ContentPage() {
  const [sortBy, setSortBy] = useState('week');

  const navItems = [
    { label: 'Home', color: '#fff8e5', group: 1, href: '/' },
    { label: 'Syllabus', color: '#fff8e5', group: 1, href: '/syllabus' },
    { label: 'Staff', color: '#fff8e5', group: 1, href: '/staff' },
    { label: 'Content', color: '#fff8e5', group: 1, href: '/content' },
    { label: 'MPs', color: '#fff8e5', group: 1, href: '/mps' },
    { label: 'PraireLearn', color: '#fce8d0', group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: '#dbeafe', group: 3, href: '/campuswire' }
  ];

  const weekData = [
    {
      week: 6,
      topic: 'Topic 6',
      tags: [
        { label: 'Exam 3', color: '#e0e7ff' },
        { label: 'Python', color: '#fef3c7' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1', 'Text 2']
    },
    {
      week: 5,
      topic: 'Topic 5',
      tags: [
        { label: 'Exam 2', color: '#dcfce7' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1', 'Text 2']
    },
    {
      week: 4,
      topic: 'Topic 4',
      tags: [
        { label: 'Exam 2', color: '#dcfce7' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1', 'Text 2']
    },
    {
      week: 3,
      topic: 'Topic 3',
      tags: [
        { label: 'Exam 1', color: '#e0e7ff' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1']
    },
    {
      week: 2,
      topic: 'Topic 2',
      tags: [
        { label: 'Exam 1', color: '#e0e7ff' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1']
    },
    {
      week: 1,
      topic: 'Topic 1',
      tags: [
        { label: 'Exam 1', color: '#e0e7ff' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1']
    }
  ];

  const topicData = [
    {
      topic: 'Learning C',
      tags: [
        { label: 'Exam 1', color: '#e0e7ff' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1', 'Text 2']
    },
    {
      topic: 'Hardware',
      tags: [
        { label: 'Exam 1', color: '#e0e7ff' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1', 'Text 2']
    },
    {
      topic: 'Binary Data',
      tags: [
        { label: 'Exam 2', color: '#dcfce7' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1', 'Text 2']
    },
    {
      topic: 'Caching',
      tags: [
        { label: 'Exam 2', color: '#dcfce7' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1']
    },
    {
      topic: 'Memory',
      tags: [
        { label: 'Exam 2', color: '#dcfce7' },
        { label: 'C', color: '#e0e7ff' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1']
    },
    {
      topic: 'Learning Python',
      tags: [
        { label: 'Exam 3', color: '#e0e7ff' },
        { label: 'Python', color: '#fef3c7' }
      ],
      lectures: ['Lecture 1', 'Lecture 2'],
      texts: ['Text 1']
    }
  ];

  const displayData = sortBy === 'week' ? weekData : topicData;

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
      fontSize: '14px',
      textDecoration: 'none',
      color: 'inherit',
      display: 'inline-block'
    }),
    mainContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '32px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '32px'
    },
    sortContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    sortLabel: {
      fontSize: '16px',
      fontWeight: '500'
    },
    sortButton: (active) => ({
      padding: '6px 16px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: active ? '#fef3c7' : 'transparent',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px'
    }),
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px'
    },
    card: {
      backgroundColor: '#fff8e5',
      borderRadius: '16px',
      padding: '24px'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '12px'
    },
    tagsContainer: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    tag: (color) => ({
      padding: '4px 12px',
      borderRadius: '12px',
      backgroundColor: color,
      fontSize: '13px',
      fontWeight: '500'
    }),
    section: {
      marginBottom: '12px'
    },
    sectionTitle: {
      fontWeight: 'bold',
      marginBottom: '4px'
    },
    list: {
      marginLeft: '20px',
      marginTop: '4px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Navigation */}
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
                style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
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
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div style={styles.sortContainer}>
            <span style={styles.sortLabel}>Sort By</span>
            <button
              style={styles.sortButton(sortBy === 'week')}
              onClick={() => setSortBy('week')}
            >
              Week
            </button>
            <button
              style={styles.sortButton(sortBy === 'topic')}
              onClick={() => setSortBy('topic')}
            >
              Topic
            </button>
          </div>
          <h1 style={styles.title}>Content</h1>
          <div style={{ width: '150px' }} /> {/* Spacer for centering */}
        </div>

        {/* Topic Cards */}
        <div style={styles.grid}>
          {displayData.map((item, i) => (
            <div key={i} style={styles.card}>
              <h2 style={styles.cardTitle}>
                {sortBy === 'week' ? `Week ${item.week}: ${item.topic}` : item.topic}
              </h2>
              <div style={styles.tagsContainer}>
                {item.tags.map((tag, j) => (
                  <span key={j} style={styles.tag(tag.color)}>
                    {tag.label}
                  </span>
                ))}
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Lectures</div>
                <ul style={styles.list}>
                  {item.lectures.map((lecture, j) => (
                    <li key={j}>{lecture}</li>
                  ))}
                </ul>
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Texts</div>
                <ul style={styles.list}>
                  {item.texts.map((text, j) => (
                    <li key={j}>{text}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}