import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Savoy Ventures OS',description:'The operating system that builds businesses. Founder command center for Dominic.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
