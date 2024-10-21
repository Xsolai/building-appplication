"use client";
import React from 'react';
import { useRouter } from 'next/navigation';


const Support = () => {
    const router = useRouter();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const sectionClass = isMobile ? 'mb-4' : 'mb-6';
  const headingClass = isMobile ? 'text-xl mb-2' : 'text-2xl mb-3';
  const subHeadingClass = isMobile ? 'text-xl mb-2' : 'text-sm mb-3';
  const listItemClass = isMobile ? 'ml-4 mb-1' : 'ml-6 mb-2';
  const paragraphClass = isMobile ? 'text-sm' : 'text-sm';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className={`${headingClass} text-black`}>Support</h1>

      <section className={sectionClass}>
        <h2 className={`${subHeadingClass} font-bold text-black`}>Kontaktinformationen</h2>
        <p className={'${paragraphClass} text-sm text-gray-700'}>
        Unser Support-Team steht Ihnen Montag bis Freitag von 9:00 bis 17:00 Uhr zur Verfügung.
        </p>
        <ol className={`list-disc ${listItemClass} text-gray-700`}>
          <li className={paragraphClass}>E-Mail: support@bauantrag-portal.de</li>
          <li className={paragraphClass}>Telefon: +49 123 456 789</li>
        </ol>
      </section>

      <section className={sectionClass}>
        <h2 className={`${subHeadingClass} font-semibold text-black`}>Hilfe-Center</h2>
        <p className={'${paragraphClass} text-sm text-gray-700'}>
        In unserem Hilfe-Center finden Sie Antworten auf häufig gestellte Fragen und Anleitungen zu den wichtigsten Funktionen unseres Portals.
        </p>
      </section>

      <section className={sectionClass}>
        <h2 className={`${subHeadingClass} font-semibold text-black`}>Technischer Support</h2>
        <p className={'${paragraphClass} text-sm text-gray-700'}>
        Bei technischen Problemen können Sie uns direkt per E-Mail oder Telefon kontaktieren. Alternativ nutzen Sie unser Kontaktformular, und wir melden uns schnellstmöglich bei Ihnen.
        </p>
      </section>
    </div>
  );
};

export default Support;