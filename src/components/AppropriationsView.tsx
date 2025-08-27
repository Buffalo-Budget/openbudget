"use client";

import { useEffect, useRef } from 'react';

interface BudgetData {
  segment5code: string;
  segment5: string;
  objectcode: string;
  object: string;
  ytd: string;
  adopted: string;
}

interface DepartmentData {
  segment2code: string;
  segment2: string;
  segment5code: string;
  segment5: string;
  objectcode: string;
  object: string;
  ytd: string;
  adopted: string;
}

declare const d3: any;

export default function AppropriationsView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const loadData = async () => {
      // Wait for d3 to be available
      if (typeof d3 === 'undefined') {
        setTimeout(loadData, 100);
        return;
      }
      const urls = {
        bySegment5: "https://data.buffalony.gov/resource/xy5k-883e.json?$select=segment5code,segment5,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity='CITY'%20AND%20fundgroup='GENERAL%20FUND'%20and%20fiscalyear='2025'&$group=segment5code,segment5,objectcode,object&$order=segment5code asc,objectcode%20asc",
        byDepartment: "https://data.buffalony.gov/resource/xy5k-883e.json?$select=segment2code,segment2,segment5code,segment5,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity='CITY'%20AND%20fundgroup='GENERAL%20FUND'%20and%20fiscalyear='2025'&$group=segment2code,segment2,segment5code,segment5,objectcode,object&$order=segment2code asc,segment5code%20asc"
      };

      try {
        const [revenueData, departmentData] = await Promise.all([
          d3.json(urls.bySegment5) as Promise<BudgetData[]>,
          d3.json(urls.byDepartment) as Promise<DepartmentData[]>
        ]);

        const appContainer = d3.select(containerRef.current);
        appContainer.selectAll("*").remove(); // Clear previous content

        const percent = (a: number, b: number): number => b && b != 0 ? (a / b) : 0;
        const formatMoney = (d: number): string => "$" + (+d).toLocaleString();

        const drawBar = (actual: number, adopted: number): string => {
          const ratio = percent(actual, adopted);
          const barWidth = Math.min(ratio, 1) * 100;
          const overageRatio = ratio > 1 ? ratio - 1 : 0;
          const overageLayers = Math.floor(overageRatio);
          const remainderLayer = (overageRatio % 1) * 100;

          let overageBars = "";
          for (let i = 0; i < overageLayers; i++) {
            overageBars += `
              <div class="h-2.5 mt-0.5 bg-black overflow-hidden border border-dashed border-gray-600">
                <div class="h-2.5 bg-orange-600" style="width:100%;"></div>
              </div>`;
          }

          if (remainderLayer > 0) {
            overageBars += `
              <div class="h-2.5 mt-0.5 bg-black overflow-hidden border border-dashed border-gray-600">
                <div class="h-2.5 bg-orange-600" style="width:${remainderLayer}%;"></div>
              </div>`;
          }

          return `
            <div>
              <div class="h-2.5 bg-black overflow-hidden my-1 border border-dashed border-gray-400">
                <div class="h-2.5 bg-cyan-400" style="width:${barWidth}%;"></div>
              </div>
              ${overageBars}
              <div class="text-xs text-neutral-400">
                ${formatMoney(actual)} / ${formatMoney(adopted)} (${Math.round(ratio * 100)}%)
                ${ratio > 1 ? 'OVER BUDGET' : ''}
              </div>
            </div>
          `;
        };

        const styleBox = (el: any) => el.attr("class", "p-4 my-2 bg-neutral-900 border border-dashed border-gray-400");

        // Appropriations by Type
        const byS5 = d3.group(revenueData, (d: BudgetData) => d.segment5);
        appContainer.append("h2")
          .text("Appropriations by Type")
          .attr("class", "text-xl py-2 my-8 mb-4 text-red-500 uppercase border-t-2 border-b-2 border-dashed border-white");

        byS5.forEach((entries: BudgetData[], seg5: string) => {
          const totalActual = d3.sum(entries, (d: BudgetData) => +d.ytd);
          const totalAdopted = d3.sum(entries, (d: BudgetData) => +d.adopted);

          const details = appContainer.append("details");
          const summary = details.append("summary")
            .attr("class", "py-1 text-cyan-400 font-bold uppercase cursor-pointer border-b border-dashed border-gray-400 hover:bg-neutral-900")
            .html(`${entries[0].segment5code} ${seg5} ${drawBar(totalActual, totalAdopted)}`);

          const inner = details.append("div").attr("class", "ml-4 mt-2");
          entries.sort((a, b) => d3.ascending(a.objectcode, b.objectcode));
          entries.forEach((d: BudgetData) => {
            const row = inner.append("div");
            styleBox(row).attr("class", "p-4 my-2 bg-neutral-800 border border-dashed border-gray-400");
            row.append("div").text(`${d.objectcode} - ${d.object}`);
            row.append("div").html(drawBar(+d.ytd, +d.adopted));
          });
        });

        // Department Appropriations by Type
        appContainer.append("h2")
          .text("Department Appropriations by Type")
          .attr("class", "text-xl py-2 my-8 mb-4 mt-8 text-red-500 uppercase border-t-2 border-b-2 border-dashed border-white");
        const byS2 = d3.group(departmentData, (d: DepartmentData) => d.segment2);
        byS2.forEach((entries: DepartmentData[], seg2: string) => {
          const deptTotalActual = d3.sum(entries, (d: DepartmentData) => +d.ytd);
          const deptTotalAdopted = d3.sum(entries, (d: DepartmentData) => +d.adopted);

          const details = appContainer.append("details");
          const summary = details.append("summary")
            .attr("class", "py-1 text-cyan-400 font-bold uppercase cursor-pointer border-b border-dashed border-gray-400 hover:bg-neutral-900")
            .html(`${entries[0].segment2code} ${seg2 || "Unknown Dept"} ${drawBar(deptTotalActual, deptTotalAdopted)}`);

          const inner = details.append("div").attr("class", "ml-4 mt-2");
          const bySegment5 = d3.group(entries, (d: DepartmentData) => d.segment5);
          bySegment5.forEach((seg5entries: DepartmentData[], seg5name: string) => {
            const s5Actual = d3.sum(seg5entries, (d: DepartmentData) => +d.ytd);
            const s5Adopted = d3.sum(seg5entries, (d: DepartmentData) => +d.adopted);
            const block = inner.append("div");
            styleBox(block).attr("class", "p-4 my-2 bg-neutral-950 border border-dashed border-gray-400");
            block.append("div").text(seg5name || "Unknown Source").attr("class", "text-gray-300");
            block.append("div").html(drawBar(s5Actual, s5Adopted));
          });
        });

      } catch (error) {
        console.error('Error loading appropriations data:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p style="color: red;">Failed to load appropriations data</p>';
        }
      }
    };

    loadData();
  }, []);

  return <div ref={containerRef} className="relative z-10 max-w-4xl w-full font-mono"></div>;
}