"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Sidebar from '../common/SideBar';

const UberUns = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const sectionClass = isMobile ? 'mb-6' : 'mb-8';
  const headingClass = isMobile ? 'text-xl mb-2' : 'text-2xl mb-4';
  const paragraphClass = isMobile ? 'text-sm' : 'text-base';
  const subHeadingClass = isMobile ? 'text-xl mb-2' : 'text-sm mb-3';

  return (
    <>
      <Head>
        <title>Über uns | Unser Portal</title>
        <meta name="description" content="Erfahren Sie mehr über unsere Vision, unser Team und unser Produkt zur Revolutionierung des Bauantragsprozesses in Deutschland." />
      </Head>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className={`${headingClass} font-bold text-black`}>Über uns</h1>

        <section className={sectionClass}>
          <h2 className={`${subHeadingClass} font-bold text-black`}>Unsere Vision</h2>
          <p className={'${paragraphClass} text-sm text-gray-700'}>
            Mit unserem Portal möchten wir den Bauantragsprozess in Deutschland revolutionieren, indem wir eine digitale Plattform bieten, die den Genehmigungsprozess für Bauvorhaben vereinfacht und beschleunigt. Unser Ziel ist es, Gemeinden und öffentlichen Institutionen den Zugang zu einem automatisierten, rechtlich abgesicherten und nutzerfreundlichen Tool zu bieten.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={`${subHeadingClass} font-bold text-black`}>Wer wir sind</h2>
          <p className={'${paragraphClass} text-sm text-gray-700'}>
            Das Portal wurde in Zusammenarbeit mit führenden Experten für Bauplanung, Recht und Softwareentwicklung entwickelt. Wir arbeiten eng mit Gemeinden und Bausachverständigen zusammen, um sicherzustellen, dass die Anforderungen des Baugesetzbuchs (BauGB) und der Brandschutzrichtlinien in vollem Umfang berücksichtigt werden. Unsere Partner, darunter Dirk Noll, Thomas Fehling, Alexander Wirth und Nina Bondkirch, bringen ihre Expertise ein, um das Portal stetig zu verbessern.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={`${subHeadingClass} font-bold text-black`}>Unser Produkt</h2>
          <p className={'${paragraphClass} text-sm text-gray-700'}>
            Unser Portal bietet eine vollumfassende Lösung für die Validierung von Bauanträgen. Es prüft automatisiert Bebauungspläne (B-Pläne), Brandschutzanforderungen und Abstandsflächenregelungen. Das System ist auf die besonderen Bedürfnisse von Kommunen und Bauämtern zugeschnitten, um den Genehmigungsprozess effizienter und kostengünstiger zu gestalten.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={`${subHeadingClass} font-bold text-black`}>Zukunftsvision</h2>
          <p className={'${paragraphClass} text-sm text-gray-700'}>
            Wir streben an, das Portal um zusätzliche Funktionen wie erweiterte Analysen und Schnittstellen zu weiteren Verwaltungssystemen zu ergänzen, um die Digitalisierung im Bauwesen weiter voranzutreiben.
          </p>
        </section>
      </div>
    </>
  );
};

export default UberUns;