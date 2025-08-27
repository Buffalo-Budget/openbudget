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
      <div className="fixed top-0 bottom-0 left-0 w-5 flex flex-col items-center justify-between py-2 z-0 pointer-events-none border-r-2 border-dashed border-neutral-400">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-black border border-neutral-400"></div>
        ))}
      </div>
      <div className="fixed top-0 bottom-0 right-0 w-5 flex flex-col items-center justify-between py-2 z-0 pointer-events-none border-l-2 border-dashed border-neutral-400">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-black border border-neutral-400"></div>
        ))}
      </div>

      <main className="flex flex-col items-center relative z-10 mt-20">
        <h1 className="text-center text-green-500 text-2xl pb-2 border-b-2 border-dashed border-green-500" style={{ fontFamily: '"Share Tech Mono", monospace' }}>
          City of Buffalo Budget Tracker
        </h1>
        <p>Tracking Fiscal Year 2025 — General Fund Budget</p>

        <div className="fixed top-0 left-0 right-0 bg-neutral-900 flex justify-center z-50 border-b-2 border-dashed border-neutral-600">
          <div
            className={`px-8 py-4 cursor-pointer border-b-2 hover:bg-neutral-800 ${activeTab === 'revenues'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400'
              }`}
            onClick={() => handleTabClick('revenues')}
          >
            Revenues
          </div>
          <div
            className={`px-8 py-4 cursor-pointer border-b-2 hover:bg-neutral-800 ${activeTab === 'appropriations'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400'
              }`}
            onClick={() => handleTabClick('appropriations')}
          >
            Appropriations
          </div>
          <div
            className={`px-8 py-4 cursor-pointer border-b-2 hover:bg-neutral-800 ${activeTab === 'department-details'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400'
              }`}
            onClick={() => handleTabClick('department-details')}
          >
            Department Details
          </div>
        </div>

        <div className={`p-8 ${activeTab === 'appropriations' ? 'block' : 'hidden'}`}>
          <AppropriationsView />
        </div>

        <div className={`p-8 ${activeTab === 'revenues' ? 'block' : 'hidden'}`}>
          <RevenuesView />
        </div>

        <div className={`p-8 ${activeTab === 'department-details' ? 'block' : 'hidden'}`}>
          <DepartmentDetailsView />
        </div>
      </main>

      <footer className="mt-16 text-center text-xs text-neutral-600 whitespace-pre-wrap font-mono bg-black px-8 py-4 min-h-14">
        <pre className="font-mono whitespace-pre text-neutral-400 bg-black p-4 text-center border-t-2 border-neutral-300">
          {footerText}
        </pre>
      </footer>
    </>
  );
}