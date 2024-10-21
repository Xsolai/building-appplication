"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

const Preismodell = () => {
    const router = useRouter();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
    const sectionClass = isMobile ? 'mb-6' : 'mb-8';
    const headingClass = isMobile ? 'text-xl mb-2' : 'text-2xl mb-4';
    const paragraphClass = isMobile ? 'text-sm' : 'text-base';

    return (
        <>
          <Head>
            <title>Preismodell</title>
            <meta name="description" />
          </Head>
          <div className="max-w-4xl mx-auto p-4">
            <h1 className={`${headingClass} font-bold text-black`}>Preismodell</h1>
    
            <section className={sectionClass}>
              <p className={'${paragraphClass} text-sm text-gray-700'}>
              Unser Preismodell ist einfach und transparent. Für jede Bauantragsprüfung berechnen wir einen festen Preis, der Ihnen Zugang zu unserer umfassenden Validierungssoftware bietet. Mit unserem automatisierten Prüfsystem sparen Sie wertvolle Zeit und reduzieren Fehlerquellen im Genehmigungsprozess.
              </p>
              <p className={'${paragraphClass} text-sm text-gray-700 py-9'}>
              Details der Preisgestaltung:
              </p>
            </section>
          </div>
        </>
      );
    };
    
    export default Preismodell;