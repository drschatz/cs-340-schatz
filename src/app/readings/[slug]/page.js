'use client';

import { allReadings } from '.contentlayer/generated';
import { notFound } from 'next/navigation';
import { colors } from '../../../styles/colors';
import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';

export default function ContentPage({ params }) {
  const content = allReadings.find((c) => c.slug === params.slug);
  const [toc, setToc] = useState([]);

  useEffect(() => {
    generateTOC();
    addIdsToHeadings();
  }, []);

  const addIdsToHeadings = () => {
    // Manually add IDs to all h1 and h2 elements in the rendered content
    const contentElement = document.querySelector('.content-body');
    if (!contentElement) return;

    contentElement.querySelectorAll('h1, h2').forEach((heading) => {
      if (!heading.id) {
        const text = heading.textContent;
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        heading.id = id;
      }
    });
  };

  const generateTOC = () => {
    if (!content) return;
    
    // Extract h1 and h2 headers from the markdown
    const headers = [];
    const htmlContent = content.body.html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    doc.querySelectorAll('h1, h2').forEach((heading) => {
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent;
      // rehype-slug already added IDs, so just read them
      const id = heading.id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      headers.push({
        level,
        text,
        id
      });
    });
    
    setToc(headers);
  };

  if (!content) {
    notFound();
  }

  return (
    <div style={styles.container}>
      <Navigation currentPage="Content" />
      
      <div style={styles.mainContent} className="mainContent">
        {/* TOC Sidebar */}
        {toc.length > 0 && (
          <aside style={styles.sidebar} className="sidebar">
            <h2 style={styles.sidebarTitle}>Contents</h2>
            <nav>
              {toc.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      // Update URL hash
                      window.location.hash = item.id;
                    }
                  }}
                  style={item.level === 'h1' ? styles.tocH1 : styles.tocH2}
                  className="toc-link"
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Article */}
        <article style={styles.article}>
          <header style={styles.header}>
            <div style={styles.backLink}>
              <a href="/content" style={styles.backLinkText}>← Back to Content</a>
            </div>
            <h1 style={styles.title}>{content.title}</h1>
            {content.description && (
              <p style={styles.description}>{content.description}</p>
            )}
          </header>
          
          <div 
            style={styles.content}
            className="content-body"
            dangerouslySetInnerHTML={{ __html: content.body.html }}
          />
        </article>
      </div>

      <style jsx global>{`
        .toc-link:hover {
          opacity: 0.6;
        }
        
        /* Responsive layout */
        @media (max-width: 1024px) {
          .mainContent {
            flex-direction: column !important;
            gap: 32px !important;
          }
          
          .sidebar {
            flex: 1 !important;
            max-width: 100% !important;
            position: static !important;
          }
        }
        
        .content-body h1 {
          font-size: 36px;
          font-weight: 700;
          margin-top: 48px;
          margin-bottom: 24px;
          color: ${colors.black};
          padding-bottom: 16px;
          border-bottom: 2px solid ${colors.tableBorder};
        }
        
        .content-body h2 {
          font-size: 28px;
          font-weight: 600;
          margin-top: 36px;
          margin-bottom: 16px;
          color: ${colors.black};
        }
        
        .content-body h3 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 28px;
          margin-bottom: 12px;
          color: ${colors.black};
        }
        
        .content-body p {
          margin-bottom: 20px;
          line-height: 1.75;
          color: ${colors.darkGray};
          font-size: 18px;
        }
        
        .content-body ul, .content-body ol {
          margin: 20px 0;
          padding-left: 32px;
          line-height: 1.75;
        }
        
        .content-body li {
          margin-bottom: 12px;
          color: ${colors.darkGray};
          font-size: 18px;
        }
        
        .content-body strong {
          font-weight: 600;
          color: ${colors.black};
        }
        
        .content-body a {
          color: ${colors.black};
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        
        .content-body a:hover {
          opacity: 0.7;
        }
        
        .content-body code {
          background: ${colors.lightGray};
          padding: 3px 7px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 16px;
          color: ${colors.black};
        }
        
        .content-body pre {
          background: ${colors.darkGray};
          color: ${colors.lightGray};
          padding: 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 24px 0;
        }
        
        .content-body pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        
        .content-body img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 24px 0;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.white,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '48px 32px',
    display: 'flex',
    gap: '48px',
    alignItems: 'flex-start'
  },
  sidebar: {
    flex: '0 0 220px',
    backgroundColor: colors.cream,
    borderRadius: '16px',
    padding: '28px',
    position: 'sticky',
    top: '32px',
    maxHeight: 'calc(100vh - 100px)',
    overflowY: 'auto'
  },
  sidebarTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '24px',
    color: colors.black
  },
  tocH1: {
    display: 'block',
    color: colors.black,
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  tocH2: {
    display: 'block',
    color: colors.mediumGray,
    textDecoration: 'none',
    fontSize: '14px',
    marginLeft: '16px',
    marginBottom: '10px'
  },
  article: {
    flex: '1',
    width: '100%',
    minWidth: 0
  },
  header: {
    marginBottom: '48px'
  },
  backLink: {
    marginBottom: '24px'
  },
  backLinkText: {
    color: colors.black,
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500'
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: colors.black
  },
  description: {
    fontSize: '20px',
    color: colors.mediumGray,
    fontWeight: '400',
    marginTop: '16px'
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: colors.darkGray
  }
};
