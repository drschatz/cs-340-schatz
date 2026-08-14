'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { allMPs } from '.contentlayer/generated';
import Navigation from '../../components/Navigation';

export default function StaffOnlyPage() {
  const [mps, setMps] = useState([]);
  const [staffLinks, setStaffLinks] = useState({ reportIssue: null, docs: [] });

  useEffect(() => {
    fetch('/data/mps.json')
      .then(response => response.json())
      .then(data => setMps(data.mps || []))
      .catch(error => console.error('Error loading MPs:', error));

    fetch('/data/staff-links.json')
      .then(response => response.json())
      .then(data => setStaffLinks({
        reportIssue: data.reportIssue || null,
        docs: data.docs || []
      }))
      .catch(error => console.error('Error loading staff links:', error));
  }, []);

  // Staff view: show ALL entries regardless of the `ready` flag. For each
  // entry, build the rows of spec links (parts expand into their own links).
  const rows = mps.map((mp) => {
    const isCustom = !!mp.eventMatch;

    if (isCustom) {
      const slug = mp.slug;
      const content = allMPs.find(c => c.slug === slug);
      return {
        key: slug,
        label: mp.label || mp.title || slug,
        ready: mp.ready === true,
        links: content ? [{ label: mp.label || mp.title || slug, href: `/mps/${slug}` }] : []
      };
    }

    if (mp.parts && mp.parts.length > 0) {
      const links = mp.parts.map((part) => {
        const slug = part.slug || `mp${part.id}`;
        const has = allMPs.find(c => c.slug === slug);
        return has ? { label: `MP${part.id} ${part.title || ''}`.trim(), href: `/mps/${slug}` } : null;
      }).filter(Boolean);
      return {
        key: `mp${mp.number}`,
        label: `MP${mp.number}${mp.title ? ' — ' + mp.title : ''}`,
        ready: mp.ready === true,
        links
      };
    }

    const slug = mp.slug || `mp${mp.number}`;
    const has = allMPs.find(c => c.slug === slug);
    return {
      key: slug,
      label: `MP${mp.number}${mp.title ? ' — ' + mp.title : ''}`,
      ready: mp.ready === true,
      links: has ? [{ label: `MP${mp.number}`, href: `/mps/${slug}` }] : []
    };
  });

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    mainContent: {
      maxWidth: '900px',
      margin: '0 auto',
      padding: '48px 32px'
    },
    header: {
      marginBottom: '16px'
    },
    title: {
      fontSize: '40px',
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: '8px'
    },
    notice: {
      fontSize: '15px',
      color: colors.mediumGray,
      backgroundColor: colors.cream,
      border: `1px solid ${colors.borderLight}`,
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '40px',
      lineHeight: 1.6
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: colors.black,
      marginTop: '40px',
      marginBottom: '20px',
      paddingBottom: '10px',
      borderBottom: `2px solid ${colors.tableBorder}`
    },
    mpGroup: {
      marginBottom: '24px'
    },
    mpGroupHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '18px',
      fontWeight: '600',
      color: colors.black,
      marginBottom: '10px'
    },
    readyTag: (ready) => ({
      fontSize: '12px',
      fontWeight: '600',
      padding: '3px 10px',
      borderRadius: '6px',
      backgroundColor: ready ? colors.statusActive : colors.lightGray,
      color: ready ? colors.black : colors.mediumGray
    }),
    linkList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      paddingLeft: '4px'
    },
    specLink: {
      fontSize: '16px',
      color: colors.black,
      textDecoration: 'underline',
      textUnderlineOffset: '3px'
    },
    emptyNote: {
      fontSize: '14px',
      color: colors.mediumGray,
      fontStyle: 'italic'
    },
    docLink: {
      display: 'block',
      fontSize: '16px',
      color: colors.black,
      textDecoration: 'underline',
      textUnderlineOffset: '3px',
      marginBottom: '10px'
    },
    reportButton: {
      display: 'inline-block',
      padding: '12px 22px',
      backgroundColor: colors.navBlue,
      color: colors.black,
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '10px',
      textDecoration: 'none',
      marginBottom: '8px'
    }
  };

  return (
    <div style={styles.container}>
      <Navigation currentPage="Staff" />

      <main style={styles.mainContent}>
        <div style={styles.header}>
          <h1 style={styles.title}>Staff Access</h1>
        </div>

        <div style={styles.notice}>
          Internal staff page, do not share with students. Specs marked <strong>not ready</strong> may
          still change before release.
        </div>

        <h2 style={styles.sectionTitle}>Staff Resources</h2>

        {staffLinks.docs.map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.docLink}
          >
            {doc.label}
          </a>
        ))}

        <h2 style={styles.sectionTitle}>MP Specs</h2>

        {staffLinks.reportIssue && (
          <div style={{ marginBottom: '24px' }}>
            <a
              href={staffLinks.reportIssue.href}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.reportButton}
            >
              {staffLinks.reportIssue.label}
            </a>
          </div>
        )}

        {rows.map((row) => (
          <div key={row.key} style={styles.mpGroup}>
            <div style={styles.mpGroupHeader}>
              <span>{row.label}</span>
              <span style={styles.readyTag(row.ready)}>
                {row.ready ? 'Ready' : 'Not ready'}
              </span>
            </div>
            {row.links.length > 0 ? (
              <div style={styles.linkList}>
                {row.links.map((link) => (
                  <a key={link.href} href={link.href} style={styles.specLink}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : (
              <div style={styles.emptyNote}>No spec page yet.</div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
