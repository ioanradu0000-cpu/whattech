import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
export function NotFoundPage(){return <main className="notFound wrap"><Seo title="Page not found" description="The requested WhatTech page could not be found."/><h1>That page isn’t in our database.</h1><p>The link may be outdated, or the product page has not been published.</p><Link className="primaryButton" to="/">Return home</Link></main>}
