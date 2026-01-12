'use client';
import Navigation from '../../components/Navigation';  // Add this import at the top

import React from 'react';
import { allSyllabuses } from '.contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { colors } from '../../styles/colors';

export default function SyllabusPage() {
  const syllabus = allSyllabuses[0];
  
  if (!syllabus) {
    return <div>Syllabus not found</div>;
  }

  const MDXContent = useMDXComponent(syllabus.body.code);

  // Process ToC without requiring numbers (only if toc exists)
  const processedToc = syllabus.toc ? syllabus.toc.reduce((acc, item) => {
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
  }, []) : [];

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.white,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
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
      backgroundColor: colors.cream,
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
      color: colors.black,
      letterSpacing: '-0.01em'
    },
    tocSection: {
      marginBottom: '24px'
    },
    tocSectionTitle: {
      fontWeight: '600',
      marginBottom: '10px',
      fontSize: '16px',
      color: colors.black
    },
    tocLink: {
      textDecoration: 'none',
      color: colors.black,
      display: 'block'
    },
    tocSubsection: {
      fontSize: '15px',
      marginLeft: '16px',
      marginTop: '8px',
      color: colors.mediumGray
    }
  };

  return (
    <div style={styles.container}>
      <Navigation currentPage="Syllabus" />


      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar with Table of Contents */}
        {processedToc.length > 0 && (
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
        )}

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
          color: ${colors.black};
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        
        .syllabus-content h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid ${colors.tableBorder};
          margin-top: 56px;
          color: ${colors.black};
          line-height: 1.25;
          letter-spacing: -0.01em;
        }
        
        .syllabus-content h3 {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 16px;
          margin-top: 36px;
          color: ${colors.black};
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
          color: ${colors.darkGray};
          font-size: 18px;
        }
        
        /* Lists */
        .syllabus-content ul {
          margin: 20px 0;
          padding-left: 32px;
          line-height: 1.75;
        }
        
        .syllabus-content li {
          margin-bottom: 14px;
          color: ${colors.darkGray};
          font-size: 18px;
        }
        
        /* Strong text */
        .syllabus-content strong {
          font-weight: 600;
          color: ${colors.black};
        }
        
        /* Links in body text - simple black underline */
        .syllabus-content a {
          color: ${colors.black};
          text-decoration: underline;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
          transition: opacity 0.2s ease;
        }
        
        .syllabus-content a:hover {
          opacity: 0.7;
        }
        
        .syllabus-content a:focus {
          outline: 3px solid ${colors.focusBlue};
          outline-offset: 3px;
          border-radius: 3px;
        }
        
        /* Table of contents */
        .toc-link {
          color: ${colors.black} !important;
          font-weight: 600;
          transition: opacity 0.2s ease;
        }
        
        .toc-link:hover {
          opacity: 0.6;
        }
        
        .toc-link:focus {
          outline: 3px solid ${colors.focusBlue};
          outline-offset: 2px;
        }
        
        .toc-link-sub {
          color: ${colors.mediumGray} !important;
          transition: opacity 0.2s ease;
        }
        
        .toc-link-sub:hover {
          opacity: 0.6;
        }
        
        .toc-link-sub:focus {
          outline: 3px solid ${colors.focusBlue};
          outline-offset: 2px;
        }
        
        /* Focus visible */
        *:focus-visible {
          outline: 3px solid ${colors.focusBlue};
          outline-offset: 2px;
        }
        
        /* Code styling */
        .syllabus-content code {
          background: ${colors.lightGray};
          padding: 3px 7px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 18px;
          color: ${colors.black};
          font-weight: 500;
        }
        
        .syllabus-content pre {
          background: ${colors.darkGray};
          color: ${colors.lightGray};
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
