"use client";

import { useEffect, useRef } from 'react';

interface RevenueData {
  segment8code: string;
  segment8: string;
  objectcode: string;
  object: string;
  ytd: string;
  adopted: string;
}

interface RevenueDeptData {
  segment2code: string;
  segment2: string;
  objectcode: string;
  object: string;
  ytd: string;
  adopted: string;
}

declare const d3: any;

export default function RevenuesView() {
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
        revenueBySource: "https://data.buffalony.gov/resource/cvx5-9drv.json?$select=segment8code,segment8,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity='CITY'%20AND%20fundgroup='GENERAL%20FUND'%20and%20fiscalyear='2025'&$group=segment8code,segment8,objectcode,object&$order=segment8code asc, objectcode%20asc",
        revenueByDept: "https://data.buffalony.gov/resource/cvx5-9drv.json?$select=segment2code,segment2,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity=%27CITY%27%20AND%20fundgroup=%27GENERAL%20FUND%27%20and%20fiscalyear=%272025%27&$group=segment2code,segment2,objectcode,object&$order=segment2code%20asc,%20objectcode%20asc"
      };

      try {
        const [revSourceData, revDeptData] = await Promise.all([
          d3.json(urls.revenueBySource) as Promise<RevenueData[]>,
          d3.json(urls.revenueByDept) as Promise<RevenueDeptData[]>
        ]);

        const revContainer = d3.select(containerRef.current);
        revContainer.selectAll("*").remove(); // Clear previous content

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

        // Revenues by Source
        revContainer.append("h2")
          .text("Revenues by Source")
          .attr("class", "text-xl py-2 my-8 mb-4 text-green-500 uppercase border-t-2 border-b-2 border-dashed border-white");
        const bySegment8 = d3.group(revSourceData, (d: RevenueData) => d.segment8);
        bySegment8.forEach((entries: RevenueData[], seg8: string) => {
          const actual = d3.sum(entries, (d: RevenueData) => +d.ytd);
          const adopted = d3.sum(entries, (d: RevenueData) => +d.adopted);
          const details = revContainer.append("details");
          const summary = details.append("summary")
            .attr("class", "py-1 text-cyan-400 font-bold uppercase cursor-pointer border-b border-dashed border-gray-400 hover:bg-neutral-900")
            .html(`${entries[0].segment8code} ${seg8} ${drawBar(actual, adopted)}`);
          const inner = details.append("div").attr("class", "ml-4 mt-2");
          entries.sort((a, b) => d3.ascending(a.objectcode, b.objectcode));
          entries.forEach((d: RevenueData) => {
            const row = inner.append("div");
            styleBox(row).attr("class", "p-4 my-2 bg-neutral-800 border border-dashed border-gray-400");
            row.append("div").text(`${d.objectcode} - ${d.object}`);
            row.append("div").html(drawBar(+d.ytd, +d.adopted));
          });
        });

        // Revenue by Department
        revContainer.append("h2")
          .text("Revenue by Department")
          .attr("class", "text-xl py-2 my-8 mb-4 mt-8 text-green-500 uppercase border-t-2 border-b-2 border-dashed border-white");
        const revByDept = d3.group(revDeptData, (d: RevenueDeptData) => d.segment2);
        revByDept.forEach((entries: RevenueDeptData[], seg2: string) => {
          const totalActual = d3.sum(entries, (d: RevenueDeptData) => +d.ytd);
          const totalAdopted = d3.sum(entries, (d: RevenueDeptData) => +d.adopted);
          const details = revContainer.append("details");
          const summary = details.append("summary")
            .attr("class", "py-1 text-cyan-400 font-bold uppercase cursor-pointer border-b border-dashed border-gray-400 hover:bg-neutral-900")
            .html(`${entries[0].segment2code} ${seg2 || "Unknown Dept"} ${drawBar(totalActual, totalAdopted)}`);
          const inner = details.append("div").attr("class", "ml-4 mt-2");
          const byObject = d3.group(entries, (d: RevenueDeptData) => d.object);
          byObject.forEach((objEntries: RevenueDeptData[], objName: string) => {
            const objActual = d3.sum(objEntries, (d: RevenueDeptData) => +d.ytd);
            const objAdopted = d3.sum(objEntries, (d: RevenueDeptData) => +d.adopted);
            const block = inner.append("div");
            styleBox(block).attr("class", "p-4 my-2 bg-neutral-950 border border-dashed border-gray-400");
            block.append("div").text(`${objEntries[0].objectcode} - ${objName}`);
            block.append("div").html(drawBar(objActual, objAdopted));
          });
        });

      } catch (error) {
        console.error('Error loading revenues data:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = '<p style="color: red;">Failed to load revenues data</p>';
        }
      }
    };

    loadData();
  }, []);

  return <div ref={containerRef} className="relative z-10 max-w-4xl w-full font-mono"></div>;
}