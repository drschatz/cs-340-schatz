import { allReadings } from '.contentlayer/generated'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return allReadings.map((reading) => ({
    slug: reading.slug,
  }))
}

export default function ReadingPage({ params }) {
  const reading = allReadings.find((r) => r.slug === params.slug)

  if (!reading) {
    notFound()
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <a href="/" style={styles.navLink}>← Back to Content</a>
      </nav>
      
      <article style={styles.article}>
        <header style={styles.header}>
          <h1 style={styles.title}>{reading.title}</h1>
          {reading.description && (
            <p style={styles.description}>{reading.description}</p>
          )}
        </header>
        
        <div 
          style={styles.content}
          dangerouslySetInnerHTML={{ __html: reading.body.html }}
        />
      </article>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  },
  nav: {
    padding: '20px 32px',
    borderBottom: '1px solid #e5e7eb'
  },
  navLink: {
    color: '#000',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500'
  },
  article: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '48px 32px'
  },
  header: {
    marginBottom: '48px'
  },
  title: {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#000'
  },
  description: {
    fontSize: '18px',
    color: '#6b7280',
    lineHeight: '1.6'
  },
  content: {
    fontSize: '16px',
    lineHeight: '1.8',
    color: '#374151'
  }
}
