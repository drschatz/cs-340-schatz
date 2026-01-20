export default function RootLayout({ children }) {
 return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
export const metadata = {
  title: 'CS 340',
  description: 'Introduction to Computer Systems at UIUC',
  icons: {
    icon: '/favicon.ico',
  }
}
