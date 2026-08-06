'use client';

import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { allMPs } from '.contentlayer/generated';
import Navigation from '../../components/Navigation';

// Ignore any calendar events before this date (previous-semester due dates).
const SEMESTER_START = new Date(2026, 7, 1); // Aug 1, 2026 (month is 0-indexed)

export default function MPsPage() {
  const [mps, setMps] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    // Load MPs configuration
    fetch('/data/mps.json')
      .then(response => response.json())
      .then(data => {
        setMps(data.mps || []);
      })
      .catch(error => console.error('Error loading MPs:', error));

    // Load calendar events to get due dates
    fetchCalendarDates();
  }, []);

  const fetchCalendarDates = async () => {
    try {
      const response = await fetch('/api/calendar');
      const icsData = await response.text();
      const events = parseICSForDates(icsData);
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  };

  // Parse the ICS feed into a flat list of { summary, date, rawDate }.
  const parseICSForDates = (icsText) => {
    const events = [];
    const lines = icsText.split('\n');
    let currentEvent = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        // Only keep events on/after the semester start (Aug 1, 2026) so
        // due dates from previous semesters don't get matched.
        if (
          currentEvent.date &&
          currentEvent.summary &&
          currentEvent.date >= SEMESTER_START
        ) {
          events.push({
            summary: currentEvent.summary,
            date: formatDate(currentEvent.date),
            rawDate: currentEvent.date
          });
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith('DTSTART')) {
          const dateTimeMatch = line.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
          if (dateTimeMatch) {
            const [_, year, month, day, hour, minute, second] = dateTimeMatch;
            currentEvent.date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            );
          } else {
            const dateMatch = line.match(/(\d{4})(\d{2})(\d{2})/);
            if (dateMatch) {
              const [_, year, month, day] = dateMatch;
              currentEvent.date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
          }
        } else if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8).trim();
        }
      }
    }

    return events;
  };

  // Extract the MP identifier (e.g. "1", "1.1", "3.2") that appears right after "MP".
  const extractMpId = (summary) => {
    const match = summary.match(/MP\s*(\d+(?:\.\d+)?)/i);
    return match ? match[1] : null;
  };

  // Find the official (non-suggested) due-date event for a whole MP number.
  // Rule: summary contains "Due", does NOT contain "Suggested", and the id
  // right after "MP" equals the MP number.
  const findOfficialDue = (mpNumber) => {
    return calendarEvents.find(ev => {
      const s = ev.summary;
      if (!/due/i.test(s)) return false;
      if (/suggested/i.test(s)) return false;
      return extractMpId(s) === String(mpNumber);
    }) || null;
  };

  // Find the suggested due-date event for a specific part (e.g. "1.1").
  // Rule: summary contains "Due" and "Suggested", and the id equals the part id.
  const findSuggestedDue = (partId) => {
    return calendarEvents.find(ev => {
      const s = ev.summary;
      if (!/due/i.test(s)) return false;
      if (!/suggested/i.test(s)) return false;
      return extractMpId(s) === partId;
    }) || null;
  };

  // Find the release event for a given MP or part id (e.g. "1.1" or "2").
  // Rule: summary contains "Release" and the id matches.
  const findRelease = (id) => {
    return calendarEvents.find(ev => {
      const s = ev.summary;
      if (!/release/i.test(s)) return false;
      return extractMpId(s) === String(id);
    }) || null;
  };

  // Find a due event by matching a keyword in the summary (for non-MP items
  // like the environment checkoff, whose event has no "MP <n>" id).
  const findDueByKeyword = (keyword) => {
    if (!keyword) return null;
    const kw = keyword.toLowerCase();
    return calendarEvents.find(ev => {
      const s = ev.summary.toLowerCase();
      return /due/i.test(s) && !/suggested/i.test(s) && s.includes(kw);
    }) || null;
  };

  const formatDate = (date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[month]} ${day}`;
  };

  // Status is driven by release + official due date.
  // Before release -> inactive. Released & before due -> active.
  // Past due but within grace -> grace. Past grace -> inactive.
  // noGrace: skip the grace window (past due goes straight to inactive).
  const getStatus = (releaseDate, dueDate, noGrace = false) => {
    const now = new Date();

    // Not yet released (or no release info) -> inactive.
    if (!releaseDate || releaseDate > now) {
      return 'inactive';
    }

    if (!dueDate) {
      return 'active'; // Released, no known due date
    }

    const dueDateEnd = new Date(dueDate);
    dueDateEnd.setHours(23, 59, 59, 999);

    // No grace period: once past the due date, it's inactive.
    if (noGrace) {
      return now > dueDateEnd ? 'inactive' : 'active';
    }

    // Grace period ends 24 hours after 11:59pm of the due date.
    const gracePeriodEnd = new Date(dueDate);
    gracePeriodEnd.setHours(23, 59, 59, 999);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 1);

    if (now > gracePeriodEnd) {
      return 'inactive'; // Past grace period
    }

    if (now > dueDateEnd) {
      return 'grace'; // In grace period
    }

    return 'active'; // Released and before/through the due date
  };

  // Build the display list straight from the config file.
  const mpList = mps.map((mp) => {
    // Non-MP items (e.g. the environment check-off) carry an explicit slug,
    // a display label, and a keyword to match their calendar events by name
    // instead of by "MP <n>" id.
    const isCustom = !!mp.eventMatch;

    if (isCustom) {
      const dueEvent = findDueByKeyword(mp.eventMatch);
      const releaseEvent = calendarEvents.find(ev => {
        const s = ev.summary.toLowerCase();
        return /(open|release)/i.test(s) && s.includes(mp.eventMatch.toLowerCase());
      }) || null;
      const content = allMPs.find(c => c.slug === mp.slug);

      return {
        number: mp.slug,          // used only as a React key
        label: mp.label || mp.title,
        title: mp.title || '',
        slug: mp.slug,
        isMultiPart: false,
        isCustom: true,
        parts: [],
        dueDate: dueEvent ? dueEvent.date : null,
        status: getStatus(releaseEvent?.rawDate, dueEvent?.rawDate, true),
        hasSpec: !!content
      };
    }

    const mpSlug = mp.slug || `mp${mp.number}`;
    const mpContent = allMPs.find(c => c.slug === mpSlug)
      || allMPs.find(c => c.number === mp.number);
    const officialEvent = findOfficialDue(mp.number);
    const officialDateLabel = officialEvent ? officialEvent.date : null;
    const officialDue = officialEvent ? officialEvent.rawDate : null;

    const parts = (mp.parts || []).map((part) => {
      const suggestedEvent = findSuggestedDue(part.id);
      const releaseEvent = findRelease(part.id);
      const partContent = allMPs.find(c => c.slug === part.slug);

      const releaseLabel = releaseEvent ? releaseEvent.date : null;
      const suggestedLabel = suggestedEvent ? suggestedEvent.date : officialDateLabel;

      // Display a release -> suggested range when both ends are known.
      let rangeLabel;
      if (releaseLabel && suggestedLabel) {
        rangeLabel = `${releaseLabel} – ${suggestedLabel}`;
      } else {
        rangeLabel = suggestedLabel || releaseLabel || null;
      }

      // A part is "active" once released, through the MP's official due date.
      const partStatus = getStatus(releaseEvent?.rawDate, officialDue);

      return {
        id: part.id,
        title: part.title || `Part ${part.id}`,
        slug: part.slug || `mp${part.id}`,
        rangeLabel,
        status: partStatus,
        hasSpec: !!partContent
      };
    });

    let status;
    if (parts.length > 0) {
      // Parent is active if ANY part is active; grace if any is in grace;
      // otherwise inactive.
      if (parts.some(p => p.status === 'active')) {
        status = 'active';
      } else if (parts.some(p => p.status === 'grace')) {
        status = 'grace';
      } else {
        status = 'inactive';
      }
    } else {
      // Single MP: gate on its own release + due.
      const releaseEvent = findRelease(mp.number);
      status = getStatus(releaseEvent?.rawDate, officialDue);
    }

    return {
      number: mp.number,
      label: `MP${mp.number}`,
      title: mp.title || `Machine Problem ${mp.number}`,
      slug: mpSlug,
      isMultiPart: parts.length > 0,
      isCustom: false,
      parts,
      dueDate: officialDateLabel,
      status,
      hasSpec: !!mpContent
    };
  });

  const toggleExpanded = (number) => {
    setExpanded(prev => ({ ...prev, [number]: !prev[number] }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.statusActive;
      case 'grace': return colors.statusGrace;
      case 'inactive': return colors.statusInactive;
      default: return colors.statusInactive;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
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
    mpList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    mpRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '20px 24px',
      minHeight: '76px',
      boxSizing: 'border-box',
      backgroundColor: colors.white,
      borderRadius: '12px',
      border: `2px solid ${colors.tableBorder}`,
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s',
      width: '100%',
      textAlign: 'left',
      font: 'inherit',
      cursor: 'pointer'
    },
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
      textAlign: 'center',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box'
    }),
    statusSlot: {
      minWidth: '110px',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    mpDue: {
      fontSize: '15px',
      color: colors.mediumGray,
      minWidth: '120px',
      flexShrink: 0,
      textAlign: 'right'
    },
    chevron: (isOpen) => ({
      fontSize: '14px',
      color: colors.mediumGray,
      width: '16px',
      minWidth: '16px',
      flexShrink: 0,
      transition: 'transform 0.2s',
      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)'
    }),
    // Empty spacer in part rows matching the chevron column, so a part's
    // "MP" label lines up horizontally with the parent's "MP" label.
    chevronSpacer: {
      width: '16px',
      minWidth: '16px',
      flexShrink: 0
    },
    partList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginTop: '8px'
    },
    partRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '24px',
      padding: '14px 24px',
      backgroundColor: colors.lightGray,
      borderRadius: '10px',
      border: `1px solid ${colors.borderLight}`,
      textDecoration: 'none',
      color: 'inherit',
      transition: 'all 0.2s'
    },
    partId: {
      fontSize: '18px',
      fontWeight: '600',
      color: colors.black,
      minWidth: '80px'
    },
    partTitle: {
      flex: '1',
      fontSize: '16px',
      color: colors.black
    },
    // Timeline cell: fixed label + fixed-width date, both left-anchored so
    // the label never shifts with the length of the date range.
    partTimeline: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '15px',
      color: colors.mediumGray,
      minWidth: '300px',
      flexShrink: 0
    },
    partTimelineLabel: {
      fontWeight: '500',
      color: colors.black,
      whiteSpace: 'nowrap'
    },
    partTimelineValue: {
      whiteSpace: 'nowrap'
    }
  };

  const renderStatusAndDue = (status, dueLabel) => (
    <>
      <div style={styles.statusSlot} data-cell="status">
        {(status === 'active' || status === 'grace') && (
          <div style={styles.statusTag(status)}>
            {getStatusText(status)}
          </div>
        )}
      </div>
      <div style={styles.mpDue} data-cell="due">Due: {dueLabel || 'N/A'}</div>
    </>
  );

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

        .part-row-clickable:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        /* On desktop the meta wrapper is transparent to layout, so the
           status + due cells sit directly in the row's flex line. */
        .mp-row-meta {
          display: contents;
        }

        /* Below full width: the meta block (status + due) becomes a single
           flex unit that stays inline and right-aligned while it fits, and
           drops to its own line as a whole when it doesn't — so the date is
           never pushed off the edge, and there's no gap between behaviors. */
        @media (max-width: 900px) {
          .mp-row-mobile,
          .part-row-mobile {
            flex-wrap: wrap;
            min-height: 0;
            row-gap: 10px;
          }

          .mp-title-cell {
            min-width: 140px;
          }

          .mp-row-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-left: auto;
          }

          .mp-row-meta > div[data-cell="status"] {
            min-width: 0 !important;
          }

          .mp-row-meta > div[data-cell="due"] {
            min-width: 0 !important;
          }

          .part-row-mobile .part-timeline {
            min-width: 0 !important;
            margin-left: auto;
          }
        }

        /* Phone widths: force the meta/timeline onto its own full line,
           left-aligned, and let the title wrap freely. */
        @media (max-width: 560px) {
          .mp-row-mobile > div,
          .part-row-mobile > div {
            white-space: normal;
          }

          .mp-row-meta {
            flex-basis: 100%;
            width: 100%;
            margin-left: 0;
          }

          .mp-row-meta > div {
            text-align: left !important;
          }

          .part-row-mobile .part-timeline {
            flex-basis: 100%;
            width: 100%;
            margin-left: 0;
            flex-wrap: wrap;
          }
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
          {mpList.map((mp) => {
            if (mp.isMultiPart) {
              const isOpen = !!expanded[mp.number];
              return (
                <div key={mp.number}>
                  <button
                    type="button"
                    style={styles.mpRow}
                    className="mp-row-clickable mp-row-mobile"
                    onClick={() => toggleExpanded(mp.number)}
                    aria-expanded={isOpen}
                  >
                    <div style={styles.chevron(isOpen)}>▶</div>
                    <div style={styles.mpNumber}>MP{mp.number}</div>
                    <div style={styles.mpTitle} className="mp-title-cell">{mp.title}</div>
                    <div className="mp-row-meta">
                      {renderStatusAndDue(mp.status, mp.dueDate)}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={styles.partList}>
                      {mp.parts.map((part) => (
                        part.hasSpec ? (
                          <a
                            key={part.id}
                            href={`/mps/${part.slug}`}
                            style={styles.partRow}
                            className="part-row-clickable part-row-mobile"
                          >
                            <div style={styles.chevronSpacer}></div>
                            <div style={styles.partId}>MP{part.id}</div>
                            <div style={styles.partTitle} className="mp-title-cell">{part.title}</div>
                            <div style={styles.partTimeline} className="part-timeline">
                              <span style={styles.partTimelineLabel}>Suggested Timeline:</span>
                              <span style={styles.partTimelineValue}>{part.rangeLabel || 'N/A'}</span>
                            </div>
                          </a>
                        ) : (
                          <div key={part.id} style={styles.partRow} className="part-row-mobile">
                            <div style={styles.chevronSpacer}></div>
                            <div style={styles.partId}>MP{part.id}</div>
                            <div style={styles.partTitle} className="mp-title-cell">{part.title}</div>
                            <div style={styles.partTimeline} className="part-timeline">
                              <span style={styles.partTimelineLabel}>Suggested Timeline:</span>
                              <span style={styles.partTimelineValue}>{part.rangeLabel || 'N/A'}</span>
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Custom non-MP item (e.g. environment check-off)
            if (mp.isCustom) {
              const inner = (
                <>
                  <div style={styles.chevronSpacer}></div>
                  <div style={styles.mpTitle} className="mp-title-cell">{mp.label}</div>
                  <div className="mp-row-meta">
                    {renderStatusAndDue(mp.status, mp.dueDate)}
                  </div>
                </>
              );
              return mp.hasSpec ? (
                <a
                  key={mp.number}
                  href={`/mps/${mp.slug}`}
                  style={styles.mpRow}
                  className="mp-row-clickable mp-row-mobile"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={mp.number}
                  style={{ ...styles.mpRow, opacity: 0.5, cursor: 'not-allowed' }}
                  className="mp-row-mobile"
                >
                  {inner}
                </div>
              );
            }

            // Single-part MP
            return mp.hasSpec ? (
              <a
                key={mp.number}
                href={`/mps/${mp.slug}`}
                style={styles.mpRow}
                className="mp-row-clickable mp-row-mobile"
              >
                <div style={styles.chevronSpacer}></div>
                <div style={styles.mpNumber}>MP{mp.number}</div>
                <div style={styles.mpTitle} className="mp-title-cell">{mp.title}</div>
                <div className="mp-row-meta">
                  {renderStatusAndDue(mp.status, mp.dueDate)}
                </div>
              </a>
            ) : (
              <div key={mp.number} style={{ ...styles.mpRow, opacity: 0.5, cursor: 'not-allowed' }} className="mp-row-mobile">
                <div style={styles.chevronSpacer}></div>
                <div style={styles.mpNumber}>MP{mp.number}</div>
                <div style={styles.mpTitle} className="mp-title-cell">{mp.title}</div>
                <div className="mp-row-meta">
                  {renderStatusAndDue(mp.status, mp.dueDate)}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
