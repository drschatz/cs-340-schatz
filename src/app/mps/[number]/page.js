'use client';

import { allMPs } from '.contentlayer/generated'
import { notFound } from 'next/navigation'
import { colors } from '../../../styles/colors'
import { useState, useEffect } from 'react'
import Navigation from '../../../components/Navigation';  // Add this import at the top

// Ignore any calendar events before this date (previous-semester events).
const SEMESTER_START = '2026-08-01'

export default function MPPage({ params }) {
  const mp = allMPs.find((m) => m.slug === params.number)
  const [dates, setDates] = useState({ release: null, suggestedDue: null, due: null })
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
      // Just fetch from API - it handles the config internally
      const response = await fetch('/api/calendar')
      const icsData = await response.text()

      // Non-MP items (e.g. the environment check-off) don't have an
      // "MP <n>" id. Map their slug to a keyword found in the event summary.
      const nonMpKeywords = {
        envr: 'check-off'
      }

      if (nonMpKeywords[params.number]) {
        const { release, due } = parseICSByKeyword(icsData, nonMpKeywords[params.number])
        setDates({ release, suggestedDue: null, due })
        return
      }

      // Extract the numeric id from the slug: "mp1.1" -> "1.1", "mp2" -> "2".
      const idMatch = params.number.match(/mp\s*(\d+(?:\.\d+)?)/i)
      const mpId = idMatch ? idMatch[1] : params.number
      // The parent MP number (e.g. "1.1" -> "1"); same as mpId for single MPs.
      const parentId = mpId.split('.')[0]
      const isPart = mpId.includes('.')
      const { release, suggestedDue, due } = parseICSForMPDates(icsData, mpId, parentId, isPart)
      setDates({ release, suggestedDue, due })
    } catch (error) {
      console.error('Error loading calendar:', error)
    }
  }

  // Parse release/due for a non-MP item by matching a keyword in the summary.
  const parseICSByKeyword = (icsText, keyword) => {
    const lines = icsText.split('\n')
    const kw = keyword.toLowerCase()
    let currentEvent = null
    let release = null
    let due = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {}
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.date && currentEvent.summary && currentEvent.date >= SEMESTER_START) {
          const s = currentEvent.summary.toLowerCase()
          if (s.includes(kw)) {
            if (/(open|release)/i.test(s)) {
              release = formatDateWithTime(currentEvent.date, currentEvent.time)
            } else if (/due/i.test(s) && !/suggested/i.test(s)) {
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

  const parseICSForMPDates = (icsText, mpId, parentId, isPart) => {
    const lines = icsText.split('\n')
    let currentEvent = null
    let release = null
    let suggestedDue = null
    let due = null

    // Match "mp" + id, not followed by another digit or dot, so MP1 doesn't
    // match MP1.1 and MP1 doesn't match MP10.
    const idPattern = (id) => {
      const escaped = String(id).replace(/\./g, '\\.')
      return new RegExp(`\\bmp\\s*${escaped}(?![\\d.])`, 'i')
    }
    const selfPattern = idPattern(mpId)
    const parentPattern = idPattern(parentId)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line === 'BEGIN:VEVENT') {
        currentEvent = {}
      } else if (line === 'END:VEVENT' && currentEvent) {
        // Skip events before the semester start (ISO date strings sort lexically).
        if (currentEvent.date && currentEvent.summary && currentEvent.date >= SEMESTER_START) {
          const summary = currentEvent.summary.toLowerCase()
          const isReleaseEvent = summary.includes('release')
          const isDueEvent = summary.includes('due')
          const isSuggested = summary.includes('suggested')

          // Release date for this specific MP/part.
          if (isReleaseEvent && selfPattern.test(summary)) {
            release = formatDateWithTime(currentEvent.date, currentEvent.time)
          }

          // Suggested due date for this part (only on part pages).
          if (isPart && isDueEvent && isSuggested && selfPattern.test(summary)) {
            suggestedDue = formatDateWithTime(currentEvent.date, null, true)
          }

          // Official due date. For a part, this is the parent MP's deadline;
          // for a single MP, it's its own. Never a "suggested" event.
          if (isDueEvent && !isSuggested && parentPattern.test(summary)) {
            due = formatDateWithTime(currentEvent.date, null, true)
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

    return { release, suggestedDue, due }
  }

  const formatDateWithTime = (dateStr, timeStr = null, isDue = false) => {
    // Parse date in local timezone (not UTC)
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    const monthValue = date.getMonth();
    const dayValue = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
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
    
    return `${monthNames[monthValue]} ${dayValue}${timeDisplay}`
  }

  if (!mp) {
    notFound()
  }


  return (
    <div style={styles.container}>
    <Navigation currentPage="MPPage" />

      
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
          <h1 style={styles.title}>{mp.title} - {mp.subtitle}</h1>
          <div style={styles.datesContainer}>
            {dates.suggestedDue && (
              <div style={styles.dateItem}>
                <span style={styles.dateLabel}>Suggested Due:</span> {dates.suggestedDue}
              </div>
            )}
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
        
        .mp-content h1 {
          font-size: 36px;
          font-weight: 700;
          margin-top: 48px;
          margin-bottom: 24px;
          color: ${colors.black};
          padding-bottom: 16px;
          border-bottom: 2px solid ${colors.tableBorder};
        }
        
        .mp-content h2 {
          font-size: 28px;
          font-weight: 600;
          margin-top: 36px;
          margin-bottom: 16px;
          color: ${colors.black};
        }
        
        .mp-content h3 {
          font-size: 22px;
          font-weight: 600;
          margin-top: 28px;
          margin-bottom: 12px;
          color: ${colors.black};
        }
        
        .mp-content p {
          margin-bottom: 20px;
          line-height: 1.75;
          color: ${colors.darkGray};
          font-size: 18px;
        }
        
        .mp-content ul, .mp-content ol {
          margin: 20px 0;
          padding-left: 32px;
          line-height: 1.75;
        }
        
        .mp-content li {
          margin-bottom: 12px;
          color: ${colors.darkGray};
          font-size: 18px;
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
          font-size: 16px;
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
          font-size: 16px;
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
maxWidth: '1200px',
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
    maxWidth: '750px',
    width: '100%'
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
    fontSize: '20px',
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
