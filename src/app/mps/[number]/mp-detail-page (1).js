'use client';

import { allMPs } from '.contentlayer/generated'
import { notFound } from 'next/navigation'
import { colors } from '../../../styles/colors'
import { useState, useEffect } from 'react'

export default function MPPage({ params }) {
  const mp = allMPs.find((m) => m.number.toString() === params.number)
  const [dates, setDates] = useState({ release: null, due: null })
  const [toc, setToc] = useState([])

  useEffect(() => {
    fetchMPDates()
    generateTOC()
  }, [])

  const generateTOC = () => {
    if (!mp) return
    
    // Extract h1 and h2 headers from the markdown
    const headers = []
    const htmlContent = mp.body.html
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    doc.querySelectorAll('h1, h2').forEach((heading) => {
      const level = heading.tagName.toLowerCase()
      const text = heading.textContent
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      
      // Add ID to heading for linking
      heading.id = id
      
      headers.push({
        level,
        text,
        id
      })
    })
    
    setToc(headers)
  }

  const fetchMPDates = async () => {
    try {
      // First get the calendar URL from config
      const configResponse = await fetch('/data/calendar-config.json')
      const config = await configResponse.json()
      const calendarUrl = config.scheduleCalendar
      
      // Then fetch the calendar data
      const response = await fetch(`/api/calendar?url=${encodeURIComponent(calendarUrl)}`)
      const icsData = await response.text()
      const { release, due } = parseICSForMPDates(icsData, params.number)
      setDates({ release, due })
    } catch (error) {
      console.error('Error loading calendar:', error)
    }
  }

  const parseICSForMPDates = (icsText, mpNumber) => {
    const lines = icsText.split('\n')
    let currentEvent = null
    let release = null
    let due = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === 'BEGIN:VEVENT') {
        currentEvent = {}
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.date && currentEvent.summary) {
          const summary = currentEvent.summary.toLowerCase()
          // Match exact MP number with word boundaries (MP1, MP 1, etc.) but not MP10 when looking for MP1
          const mpPattern = new RegExp(`\\bmp\\s*${mpNumber}\\b`, 'i')
          
          if (mpPattern.test(summary)) {
            if (summary.includes('release')) {
              release = formatDateWithTime(currentEvent.date, currentEvent.time)
            } else if (summary.includes('due')) {
              due = formatDateWithTime(currentEvent.date, null, true) // true = add 11:59pm
            } else if (!summary.includes('release') && !due) {
              // If it's just "MP1" with no qualifier, assume it's the due date
              due = formatDateWithTime(currentEvent.date, null, true)
            }
          }
        }
        currentEvent = null
      } else if (currentEvent) {
        if (line.startsWith('DTSTART')) {
          const dateMatch = line.match(/(\d{4})(\d{2})(\d{2})/)
          const timeMatch = line.match(/T(\d{2})(\d{2})(\d{2})/)
          if (dateMatch) {
            currentEvent.date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
            if (timeMatch) {
              currentEvent.time = `${timeMatch[1]}:${timeMatch[2]}`
            }
          }
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8).trim()
        }
      }
    }

    return { release, due }
  }

  const formatDateWithTime = (dateStr, timeStr = null, isDue = false) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    let timeDisplay = ''
    if (isDue) {
      timeDisplay = ' at 11:59pm'
    } else if (timeStr) {
      // Convert 24-hour to 12-hour format
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'pm' : 'am'
      const hour12 = hour % 12 || 12
      timeDisplay = ` at ${hour12}:${minutes}${ampm}`
    }
    
    return `${monthNames[month - 1]} ${day}${timeDisplay}`
  }

  if (!mp) {
    notFound()
  }

  const navItems = [
    { label: 'Home', color: colors.navCream, group: 1, href: '/' },
    { label: 'Syllabus', color: colors.navCream, group: 1, href: '/syllabus' },
    { label: 'Staff', color: colors.navCream, group: 1, href: '/staff' },
    { label: 'Content', color: colors.navCream, group: 1, href: '/content' },
    { label: 'MPs', color: colors.navCream, group: 1, href: '/mps' },
    { label: 'PraireLearn', color: colors.navOrange, group: 2, href: '/prairielearn' },
    { label: 'Campuswire', color: colors.navBlue, group: 3, href: '/campuswire' }
  ]

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
      
      <div style={styles.mainContent}>
        {/* TOC Sidebar */}
        {toc.length > 0 && (
          <aside style={styles.sidebar}>
            <h2 style={styles.sidebarTitle}>Contents</h2>
            <nav>
              {toc.map((item, idx) => (
                <a
                  key={idx}
                  href={`#${item.id}`}
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
            <a href="/mps" style={styles.backLinkText}>← Back to MPs</a>
          </div>
          <h1 style={styles.title}>{mp.title}</h1>
          {mp.subtitle && (
            <p style={styles.subtitle}>{mp.subtitle}</p>
          )}
          <div style={styles.datesContainer}>
            <div style={styles.dateItem}>
              <span style={styles.dateLabel}>Released:</span> {dates.release || 'N/A'}
            </div>
            <div style={styles.dateItem}>
              <span style={styles.dateLabel}>Due:</span> {dates.due || 'N/A'}
            </div>
          </div>
        </header>
        
        <div 
          style={styles.content}
          className="mp-content"
          dangerouslySetInnerHTML={{ __html: mp.body.html }}
        />
      </article>
      </div>

      <style jsx global>{`
        .toc-link:hover {
          opacity: 0.6;
        }
        
        .mp-content h1 {
          font-size: 32px;
          font-weight: 700;
          margin-top: 48px;
          margin-bottom: 24px;
          color: ${colors.black};
          padding-bottom: 16px;
          border-bottom: 2px solid ${colors.tableBorder};
        }
        
        .mp-content h2 {
          font-size: 24px;
          font-weight: 600;
          margin-top: 36px;
          margin-bottom: 16px;
          color: ${colors.black};
        }
        
        .mp-content h3 {
          font-size: 20px;
          font-weight: 600;
          margin-top: 28px;
          margin-bottom: 12px;
          color: ${colors.black};
        }
        
        .mp-content p {
          margin-bottom: 20px;
          line-height: 1.75;
          color: ${colors.darkGray};
          font-size: 16px;
        }
        
        .mp-content ul, .mp-content ol {
          margin: 20px 0;
          padding-left: 32px;
          line-height: 1.75;
        }
        
        .mp-content li {
          margin-bottom: 12px;
          color: ${colors.darkGray};
          font-size: 16px;
        }
        
        .mp-content strong {
          font-weight: 600;
          color: ${colors.black};
        }
        
        .mp-content a {
          color: ${colors.black};
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        
        .mp-content a:hover {
          opacity: 0.7;
        }
        
        .mp-content code {
          background: ${colors.lightGray};
          padding: 3px 7px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          font-size: 14px;
          color: ${colors.black};
        }
        
        .mp-content pre {
          background: ${colors.darkGray};
          color: ${colors.lightGray};
          padding: 20px;
          border-radius: 12px;
          overflow-x: auto;
          margin: 24px 0;
        }
        
        .mp-content pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        
        .mp-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 24px 0;
        }
        
        .mp-content figure {
          margin: 32px 0;
        }
        
        .mp-content figcaption {
          text-align: center;
          font-size: 14px;
          color: ${colors.mediumGray};
          margin-top: 12px;
        }
      `}</style>
    </div>
  )
}

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
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '48px 32px',
    display: 'flex',
    gap: '80px',
    alignItems: 'flex-start'
  },
  sidebar: {
    flex: '0 0 260px',
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
    maxWidth: '900px'
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
    fontSize: '15px',
    fontWeight: '500'
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: colors.black
  },
  subtitle: {
    fontSize: '24px',
    color: colors.mediumGray,
    fontWeight: '400',
    marginBottom: '24px'
  },
  datesContainer: {
    display: 'flex',
    gap: '24px',
    fontSize: '16px',
    color: colors.mediumGray,
    marginTop: '16px'
  },
  dateItem: {
    fontSize: '16px',
    color: colors.mediumGray
  },
  dateLabel: {
    fontWeight: '500',
    color: colors.black
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: colors.darkGray
  }
}
