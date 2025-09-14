import 'what-input'
import '../src/reset.css'
import '../src/box-sizing.css'
import '../src/a11y.css'

export const metadata = {
  title: 'Is React Translated Yet?',
  description: 'The global React community is translating react.dev into multiple languages',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}