"use client";

import { useState, useEffect } from 'react';
import AppropriationsView from '../components/AppropriationsView';
import RevenuesView from '../components/RevenuesView';
import DepartmentDetailsView from '../components/DepartmentDetailsView';

export default function Home() {
  const [activeTab, setActiveTab] = useState('revenues');
  const [footerText, setFooterText] = useState('');

  const handleTabClick = (target: string) => {
    setActiveTab(target);
  };

  useEffect(() => {
    const signalPhrase = `Taro sez... Council on the brink of bankruptcy and plunder. — 2025/06/24`;
    const asciiBox = (text: string) => {
      const lines = text.split('\n');
      const width = Math.max(...lines.map(line => line.length));
      const top = `+${'-'.repeat(width + 2)}+`;
      const bottom = top;
      const boxed = lines.map(line => `| ${line.padEnd(width, ' ')} |`).join('\n');
      return `${top}\n${boxed}\n${bottom}`;
    };
    setFooterText(asciiBox(signalPhrase));
  }, []);

  return (
    <>
      <div className="perforation left">
        {Array.from({ length: 20 }).map((_, i) => <div key={i} className="hole"></div>)}
      </div>
      <div className="perforation right">
        {Array.from({ length: 20 }).map((_, i) => <div key={i} className="hole"></div>)}
      </div>

      <main className="flex flex-col items-center relative z-10">
        <h1>City of Buffalo Budget Tracker</h1>
        <p>Tracking Fiscal Year 2025 — General Fund Budget</p>

        <div className="tabs">
          <div
            className={`tab ${activeTab === 'revenues' ? 'active' : ''}`}
            onClick={() => handleTabClick('revenues')}
          >
            Revenues
          </div>
          <div
            className={`tab ${activeTab === 'appropriations' ? 'active' : ''}`}
            onClick={() => handleTabClick('appropriations')}
          >
            Appropriations
          </div>
          <div
            className={`tab ${activeTab === 'department-details' ? 'active' : ''}`}
            onClick={() => handleTabClick('department-details')}
          >
            Department Details
          </div>
        </div>

        <div id="appropriations" className={`view ${activeTab === 'appropriations' ? 'active' : ''}`}>
          <AppropriationsView />
        </div>

        <div id="revenues" className={`view ${activeTab === 'revenues' ? 'active' : ''}`}>
          <RevenuesView />
        </div>

        <div id="department-details" className={`view ${activeTab === 'department-details' ? 'active' : ''}`}>
          <DepartmentDetailsView />
        </div>
      </main>

      <footer>
        <pre id="cypher-footer">{footerText}</pre>
      </footer>
    </>
  );
}