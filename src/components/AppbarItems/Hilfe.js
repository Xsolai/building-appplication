"use client";
import React from 'react';
import { useRouter } from 'next/navigation';


const Hlife = () => {
    const router = useRouter();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const sectionClass = isMobile ? 'mb-4' : 'mb-6';
  const headingClass = isMobile ? 'text-xl mb-2' : 'text-2xl mb-3';
  const subHeadingClass = isMobile ? 'text-lg mb-2' : 'text-sm mb-3';
  const listItemClass = isMobile ? 'ml-4 mb-1' : 'ml-6 mb-2';
  const paragraphClass = isMobile ? 'text-sm' : 'text-sm';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className={`${headingClass} font-bold text-black`}>Hilfe</h1>

      <section className={sectionClass}>
        <h2 className={`${subHeadingClass} font-semibold text-black`}>Erste Schritte</h2>
        <ol className={`list-decimal ${listItemClass} text-gray-700`}>
          <li className={paragraphClass}>Registrieren Sie sich auf unserer Plattform mit Ihrer E-Mail-Adresse.</li>
          <li className={paragraphClass}>Nach der Registrierung erhalten Sie eine Bestätigungsmail mit einem Aktivierungslink.</li>
          <li className={paragraphClass}>Nach dem Einloggen können Sie direkt mit der Einreichung Ihrer Bauanträge beginnen.</li>
        </ol>
      </section>

      <section className={sectionClass}>
        <h2 className={`${subHeadingClass} font-semibold text-black`}>Antragsprüfung Schritt-für-Schritt</h2>
        <ol className={`list-decimal ${listItemClass} text-gray-700`}>
          <li className={paragraphClass}>Bauantrag hochladen: Laden Sie die relevanten Pläne und Dokumente hoch.</li>
          <li className={paragraphClass}>Automatische Prüfung starten: Unsere Software analysiert Ihren Antrag in Echtzeit und prüft die Übereinstimmung mit den Bebauungsplänen, Brandschutzrichtlinien und Abstandsflächen.</li>
          <li className={paragraphClass}>Ergebnis erhalten: Nach der Prüfung erhalten Sie ein detailliertes Prüfprotokoll mit Hinweisen und Empfehlungen.</li>
        </ol>
      </section>

      <section className={sectionClass}>
        <h2 className={`${subHeadingClass} font-semibold text-black`}>Häufige Fragen</h2>
        <ul className={`list-disc ${listItemClass} text-gray-700`}>
          <li className={paragraphClass}>Wie lange dauert die Prüfung eines Bauantrags?</li>
          <li className={paragraphClass}>Die Prüfung dauert in der Regel nur wenige Minuten.</li>
          <li className={paragraphClass}>Welche Dateiformate werden unterstützt?</li>
          <li className={paragraphClass}>Wir akzeptieren gängige Formate wie PDF, DWG und DXF.</li>
        </ul>
      </section>
    </div>
  );
};

export default Hlife;