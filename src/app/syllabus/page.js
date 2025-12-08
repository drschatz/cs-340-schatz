'use client';

import React from 'react';
import { allSyllabuses } from '@/.contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer/hooks';

export default function SyllabusPage() {
  const syllabus = allSyllabuses[0];
  
  if (!syllabus) {
    return <div>Syllabus not found</div>;
  }

  const MDXContent = useMDXComponent(syllabus.body.code);

  const navItems = [
    { label: 'Home', color: '#fff8e5', group: 1, href: '/' },
    { label: 'Syllabus', color: '#fff8e5', group: 1, href: '/syllabus' },
    { label: 'Staff', color: '#fff8e5', group: 1, href: '/staff' },
    { label: 'Content', color: '#fff8e5', group: 1, href: '/content' },
    { label: 'MPs', color: '#fff8e5', group: 1, href: '/mps' },
    { label: 'PraireLearn', color: '#fce8d0', group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: '#dbeafe', group: 3, href: '/campuswire' }
  ];

  // Process ToC without requiring numbers
  const processedToc = syllabus.toc.reduce((acc, item) => {
    if (item.level === 'two') {
      // Main section (##)
      acc.push({
        title: item.text,
        slug: item.slug,
        subsections: []
      });
    } else if (item.level === 'three' && acc.length > 0) {
      // Subsection (###) - add to last section
      acc[acc.length - 1].subsections.push({
        label: item.text,
        slug: item.slug
      });
    }
    return acc;
  }, []);

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
      maxWidth: '1600px',
      margin: '0 auto',
      padding: '32px',
      display: 'flex',
      gap: '80px',
      alignItems: 'flex-start'
    },
    sidebar: {
      flex: '0 0 260px',
      backgroundColor: '#fff8e5',
      borderRadius: '16px',
      padding: '28px',
      height: 'fit-content',
      position: 'sticky',
      top: '32px'
    },
    content: {
      flex: '1',
      maxWidth: '800px'
    },
    sidebarTitle: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '24px',
      color: '#000',
      letterSpacing: '-0.01em'
    },
    tocSection: {
      marginBottom: '24px'
    },
    tocSectionTitle: {
      fontWeight: '600',
      marginBottom: '10px',
      fontSize: '15px',
      color: '#000'
    },
    tocLink: {
      textDecoration: 'none',
      color: '#000',
      display: 'block'
    },
    tocSubsection: {
      fontSize: '14px',
      marginLeft: '16px',
      marginTop: '8px',
      color: '#555'
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
                aria-current={item.label === 'Syllabus' ? 'page' : undefined}
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
        {/* Sidebar with Table of Contents */}
        <aside style={styles.sidebar} role="navigation" aria-label="Table of contents">
          <h2 style={styles.sidebarTitle}>Contents</h2>
          <nav>
            {processedToc.map((section, idx) => (
              <div key={idx} style={styles.tocSection}>
                <div style={styles.tocSectionTitle}>
                  <a 
                    href={`#${section.slug}`} 
                    style={styles.tocLink}
                    className="toc-link"
                  >
                    {section.title}
                  </a>
                </div>
                {section.subsections.map((subsection, subIdx) => (
                  <div key={subIdx} style={styles.tocSubsection}>
                    <a 
                      href={`#${subsection.slug}`} 
                      style={styles.tocLink}
                      className="toc-link-sub"
                    >
                      {subsection.label}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.content} className="syllabus-content" id="main-content" role="main">
          <MDXContent />
        </main>
      </div>

      {/* Clean styles - headers are NOT links */}
      <style jsx global>{`
        /* Typography */
        .syllabus-content h1 {
          font-size: 42px;
          font-weight: 800;
          margin-bottom: 40px;
          color: #000;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        
        .syllabus-content h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e5e7eb;
          margin-top: 56px;
          color: #000;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        
        .syllabus-content h3 {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 16px;
          margin-top: 36px;
          color: #000;
          line-height: 1.4;
        }
        
        /* Remove any link styling from headers */
        .syllabus-content h1 a,
        .syllabus-content h2 a,
        .syllabus-content h3 a {
          color: inherit;
          text-decoration: none;
          pointer-events: none;
        }
        
        /* Body text */
        .syllabus-content p {
          margin-bottom: 20px;
          line-height: 1.75;
          color: #374151;
          font-size: 16px;
        }
        
        /* Lists */
        .syllabus-content ul {
          margin: 20px 0;
          padding-left: 32px;
          line-height: 1.75;
        }
        
        .syllabus-content li {
          margin-bottom: 14px;
          color: #374151;
          font-size: 16px;
        }
        
        /* Strong text */
        .syllabus-content strong {
          font-weight: 600;
          color: #000;
        }
        
        /* Links in body text - simple black underline */
        .syllabus-content a {
          color: #000;
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
          transition: opacity 0.2s ease;
        }
        
        .syllabus-content a:hover {
          opacity: 0.7;
        }
        
        .syllabus-content a:focus {
          outline: 3px solid #000;
          outline-offset: 3px;
          border-radius: 3px;
        }
        
        /* Table of contents */
        .toc-link {
          color: #000 !important;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        
        .toc-link:hover {
          opacity: 0.6;
        }
        
        .toc-link:focus {
          outline: 3px solid #000;
          outline-offset: 2px;
        }
        
        .toc-link-sub {
          color: #555 !important;
          transition: opacity 0.2s ease;
        }
        
        .toc-link-sub:hover {
          opacity: 0.6;
        }
        
        .toc-link-sub:focus {
          outline: 3px solid #000;
          outline-offset: 2px;
        }
        
        /* Focus visible */
        *:focus-visible {
          outline: 3px solid #000;
          outline-offset: 2px;
        }
        
        /* Code styling */
        .syllabus-content code {
          background: #f3f4f6;
          padding: 3px 7px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 14px;
          color: #000;
          font-weight: 500;
        }
        
        .syllabus-content pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 24px 0;
        }
        
        .syllabus-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
          font-weight: 400;
        }
        
        /* Responsive */
        @media (max-width: 1024px) {
          .syllabus-content h1 {
            font-size: 36px;
          }
          
          .syllabus-content h2 {
            font-size: 28px;
          }
          
          .syllabus-content h3 {
            font-size: 20px;
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
