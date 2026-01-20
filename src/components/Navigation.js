'use client';
import { colors } from '../styles/colors';

export default function Navigation({ currentPage }) {
  const navItems = [
    { label: 'Home', color: colors.navCream, group: 1, href: '/' },
    { label: 'Syllabus', color: colors.navCream, group: 1, href: '/syllabus' },
    { label: 'Staff', color: colors.navCream, group: 1, href: '/staff' },
    { label: 'Content', color: colors.navCream, group: 1, href: '/content' },
    { label: 'MPs', color: colors.navCream, group: 1, href: '/mps' },
    { label: 'PrairieLearn', color: colors.navOrange, group: 2, href: 'https://us.prairielearn.com/pl/course_instance/193960' },
    { label: 'Campuswire', color: colors.navBlue, group: 3, href: 'https://campuswire.com/c/G0463FDE3/feed' }
  ];

  const styles = {
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
    })
  };

  return (
    <>
      <style jsx>{`
        @media (max-width: 768px) {
          .nav-container {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .nav-group {
            width: 100%;
            justify-content: center;
          }
          .nav-spacer {
            display: none;
          }
        }
      `}</style>
      
      <nav style={styles.nav} className="nav-container" role="navigation" aria-label="Main navigation">
      <div style={styles.navGroup} className="nav-group">
        {navItems.filter(item => item.group === 1).map((item, i) => {
          const groupItems = navItems.filter(it => it.group === 1);
          const isFirstInGroup = i === 0;
          const isLastInGroup = i === groupItems.length - 1;
          return (
            <a
              key={item.label}
              href={item.href}
              style={styles.navButton(item.color, isFirstInGroup, isLastInGroup)}
              aria-current={item.label === currentPage ? 'page' : undefined}
            >
              {item.label}
            </a>
          );
        })}
      </div>
      <div style={styles.navGroupSpacer} className="nav-spacer" />
      <div style={styles.navGroup} className="nav-group">
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
      <div style={styles.navGroupSpacer} className="nav-spacer" />
      <div style={styles.navGroup} className="nav-group">
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
    </>
  );
}
