"use client";

import { useEffect, useRef } from 'react';

interface DepartmentData {
  segment2code: string;
  segment2: string;
}

interface Segment3Data {
  segment3: string;
  segment3code: string;
}

interface BudgetLineData {
  organizationcode: string;
  objectcode: string;
  object: string;
  ytd: string;
  adopted: string;
}

interface EmployeeData {
  employeeid: string;
  firstname: string;
  lastname: string;
  position: string;
  sum_totalpay: string;
}

interface ExpenseData {
  vendorname: string;
  description: string;
  sum_actual: string;
}

export default function DepartmentDetailsView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const formatMoney = (d: number): string => {
      return "$" + (+d).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    };

    const drawColoredProgressBar = (actual: number, budget: number): string => {
      const ratio = budget > 0 ? actual / budget : 0;
      const percentRounded = Math.round(ratio * 100);
      const barWidth = Math.min(ratio, 1) * 100;

      let color = "#00c0ff";
      if (ratio > 5) color = "#800000";
      else if (ratio > 2) color = "#ff0000";
      else if (ratio > 1.2) color = "#ff4000";
      else if (ratio > 1) color = "#ff8000";

      const thickness = Math.max(10, Math.min(30, Math.log10(budget + 1) * 5));
      const shadow = budget > 1000000 ? "0 0 8px rgba(255,0,0,0.7)" : "none";

      return `
        <div style="margin-top: 4px;">
          <div style="background:#222; border:1px dashed #555; height:${thickness}px; box-shadow:${shadow}; position: relative;">
            <div style="background:${color}; width:${barWidth}%; height:100%; transition: width 0.3s;"></div>
          </div>
          <div style="color:#ccc; font-size: 0.85rem; margin-top: 2px;">
            ${formatMoney(actual)} / ${formatMoney(budget)} (${percentRounded}%)
            ${ratio > 1 ? '<strong style="color:#f44; margin-left:8px;">OVER BUDGET</strong>' : ''}
          </div>
        </div>
      `;
    };

    const fetchJSON = async (url: string): Promise<any> => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      return res.json();
    };

    const populateDepartments = async (): Promise<void> => {
      const select = containerRef.current?.querySelector('#department-select') as HTMLSelectElement;
      const output = containerRef.current?.querySelector('#department-output') as HTMLElement;
      if (!select || !output) return;

      const url = `https://data.buffalony.gov/resource/xy5k-883e.json?$select=distinct segment2code,segment2&$where=entity='CITY' AND fundgroup='GENERAL FUND' AND fiscalyear='2025'&$order=segment2code`;

      try {
        const data: DepartmentData[] = await fetchJSON(url);
        select.innerHTML = '<option value="">-- Select Department --</option>';
        data.forEach((d) => {
          const option = document.createElement('option');
          option.value = d.segment2code;
          option.textContent = `${d.segment2code} - ${d.segment2}`;
          select.appendChild(option);
        });
      } catch (err) {
        console.error('Error loading departments:', err);
        output.textContent = 'Failed to load departments.';
      }

      select.addEventListener('change', () => {
        const code = select.value;
        output.innerHTML = '';
        if (code) loadSegment3Groups(code);
      });
    };

    const loadSegment3Groups = async (segment2code: string): Promise<void> => {
      const output = containerRef.current?.querySelector('#department-output') as HTMLElement;
      if (!output) return;

      const url = `https://data.buffalony.gov/resource/xy5k-883e.json?$select=distinct segment3,segment3code&$where=segment2code='${segment2code}' AND entity='CITY' AND fundgroup='GENERAL FUND' AND fiscalyear='2025'&$order=segment3code`;

      try {
        const segment3Groups: Segment3Data[] = await fetchJSON(url);
        if (!segment3Groups.length) {
          output.innerHTML = '<p>No sub-groups found for this department.</p>';
          return;
        }

        let html = '';
        for (const segment3 of segment3Groups) {
          html += `<h3 style="color:#ccc; margin-top:2rem; font-size:1.1rem;">${segment3.segment3 || 'Unknown'}</h3>`;
          html += await renderBudgetLines(segment2code, segment3);
        }

        output.innerHTML = html;
        attachClickHandlers(segment2code);
      } catch (err) {
        console.error('Error loading segment3 groups:', err);
        output.textContent = 'Failed to load department details.';
      }
    };

    const renderBudgetLines = async (segment2code: string, segment3: Segment3Data): Promise<string> => {
      const url = `https://data.buffalony.gov/resource/xy5k-883e.json?$select=organizationcode,objectcode,object,sum(actual) as ytd, sum(originalbudget) as adopted&$where=segment2code='${segment2code}' AND segment3code='${segment3.segment3code}' AND entity='CITY' AND fundgroup='GENERAL FUND' AND fiscalyear='2025'&$group=organizationcode,objectcode,object&$order=objectcode`;

      const drawColoredProgressBarInner = (actual: number, budget: number): string => {
        const ratio = budget > 0 ? actual / budget : 0;
        const percentRounded = Math.round(ratio * 100);
        const barWidth = Math.min(ratio, 1) * 100;

        let color = "#0ff";
        if (ratio > 5) color = "#800000";
        else if (ratio > 2) color = "#ff0000";
        else if (ratio > 1.2) color = "#ff4000";
        else if (ratio > 1) color = "#ff8000";

        const thickness = Math.max(10, Math.min(30, Math.log10(budget + 1) * 5));
        const glow = (ratio >= 0.9 && ratio <= 1) ? "0 0 8px rgba(255, 100, 100, 0.7)" : "none";

        return `
          <div style="margin-top: 4px;">
            <div style="background:#222; border:1px dashed #555; height:${thickness}px; box-shadow:${glow}; position: relative;">
              <div style="background:${color}; width:${barWidth}%; height:100%; transition: width 0.3s;"></div>
            </div>
            <div style="color:#ccc; font-size: 0.85rem; margin-top: 2px; text-align:center;">
              ${percentRounded}% ${ratio > 1 ? '<strong style="color:#f44; margin-left:8px;">OVER BUDGET</strong>' : ''}
            </div>
          </div>
        `;
      };

      try {
        const budgetLines: BudgetLineData[] = await fetchJSON(url);
        if (!budgetLines.length) return '<p style="color:#666;">No budget lines found.</p>';

        let html = `
          <div class="budget-table-wrapper" style="overflow-x:auto;">
          <table style="width:100%; min-width:480px; color:#ccc; border-collapse: collapse; margin-bottom: 1rem;">
            <thead>
              <tr style="border-bottom:1px dashed #777; text-align:left; font-size:0.85rem;">
                <th style="padding:6px; width: 80px;">Object</th>
                <th style="padding:6px;">Description</th>
                <th style="padding:6px; text-align:right;">Actual</th>
                <th style="padding:6px; text-align:right;">Budget</th>
                <th style="padding:6px; width:160px;">Progress</th>
              </tr>
            </thead>
            <tbody>
        `;

        for (const line of budgetLines) {
          const actual = +line.ytd;
          const budget = +line.adopted;

          html += `
            <tr class="budget-line" style="border-bottom:1px dashed #444; cursor:pointer; font-size:0.85rem;"
                data-segment2code="${segment2code}"
                data-segment3code="${segment3.segment3code}"
                data-organizationcode="${line.organizationcode}"
                data-objectcode="${line.objectcode}">
              <td style="padding:6px;">${line.objectcode}</td>
              <td style="padding:6px;">${line.object}</td>
              <td style="padding:6px; text-align:right;">${formatMoney(actual)}</td>
              <td style="padding:6px; text-align:right;">${formatMoney(budget)}</td>
              <td class="progress-cell">
                ${drawColoredProgressBarInner(actual, budget)}
              </td>
            </tr>
            <tr class="employee-details-row" style="display:none; background:#111; color:#0ff; font-size:0.8rem;">
              <td colspan="5" style="padding:6px 20px;">Loading...</td>
            </tr>
          `;
        }

        html += '</tbody></table></div>';
        return html;
      } catch (err) {
        console.error('Error loading budget lines:', err);
        return '<p style="color:#f66;">Failed to load budget lines.</p>';
      }
    };

    const attachClickHandlers = (segment2code: string): void => {
      const output = containerRef.current?.querySelector('#department-output') as HTMLElement;
      if (!output) return;
      
      const budgetRows = output.querySelectorAll('tr.budget-line') as NodeListOf<HTMLTableRowElement>;

      budgetRows.forEach((row, idx) => {
        row.addEventListener('click', async () => {
          const employeeRow = budgetRows[idx].nextElementSibling as HTMLTableRowElement;
          if (!employeeRow) return;

          if (employeeRow.style.display === 'table-row') {
            employeeRow.style.display = 'none';
            return;
          }

          employeeRow.style.display = 'table-row';
          employeeRow.cells[0].innerHTML = 'Loading data...';

          const { segment3code, organizationcode, objectcode } = row.dataset;

          try {
            const [employees, expenses] = await Promise.all([
              loadEmployees(segment2code, segment3code!, organizationcode!, objectcode!),
              loadExpenses(segment2code, segment3code!, organizationcode!, objectcode!)
            ]);

            let html = '';

            if (employees.length) {
              html += `<div style="color:#0ff; margin-bottom:0.5rem;">Employees:</div>`;
              html += employees.map(emp =>
                `<div style="margin:2px 0;">👤 ${emp.firstname} ${emp.lastname} — ${emp.position} — $${(+emp.sum_totalpay).toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</div>`
              ).join('');
            }

            if (expenses.length) {
              html += `<div style="color:#fc0; margin-top:1rem; margin-bottom:0.5rem;">Vendor Expenses:</div>`;
              html += expenses.map(exp =>
                `<div style="margin:2px 0;">🏢 ${exp.vendorname} — ${exp.description} — $${(+exp.sum_actual).toLocaleString(undefined, {minimumFractionDigits:2,maximumFractionDigits:2})}</div>`
              ).join('');
            }

            if (!employees.length && !expenses.length) {
              html = 'No employee or vendor data found for this line item.';
            }

            employeeRow.cells[0].innerHTML = html;
          } catch (err) {
            console.error('Error loading employee or expense data:', err);
            employeeRow.cells[0].textContent = 'Failed to load employee/expense data.';
          }
        });
      });
    };

    const loadEmployees = async (segment2code: string, segment3code: string, organizationcode: string, objectcode: string): Promise<EmployeeData[]> => {
      const url = `https://data.buffalony.gov/resource/hm3x-8br6.json?$select=employeeid,firstname,lastname,position,sum(totalpay) as sum_totalpay&$where=segment2code='${segment2code}' AND segment3code='${segment3code}' AND organizationcode='${organizationcode}' AND objectcode='${objectcode}' AND fiscalyear='2025'&$group=employeeid,firstname,lastname,position&$order=sum_totalpay DESC&$limit=100`;
      return await fetchJSON(url);
    };

    const loadExpenses = async (segment2code: string, segment3code: string, organizationcode: string, objectcode: string): Promise<ExpenseData[]> => {
      const url = `https://data.buffalony.gov/resource/bktd-jwim.json` +
        `?$select=vendorname,description,sum(actual) as sum_actual` +
        `&$where=fiscalyear='2025'` +
        ` AND segment2code='${segment2code}'` +
        ` AND segment3code='${segment3code}'` +
        ` AND organizationcode='${organizationcode}'` +
        ` AND objectcode='${objectcode}'` +
        `&$group=vendorname,description` +
        `&$order=sum_actual DESC` +
        `&$limit=100`;

      return await fetchJSON(url);
    };

    populateDepartments();
  }, []);

  return (
    <div ref={containerRef} className="max-w-screen-xl px-4 box-border overflow-x-hidden">
      <h2 className="text-xl py-2 my-8 mb-4 text-yellow-500 uppercase border-t-2 border-b-2 border-dashed border-white">Department Details</h2>
      <label htmlFor="department-select" className="text-gray-300">Choose a Department:</label>
      <select id="department-select" className="ml-2 p-2 bg-black text-gray-300 border border-gray-600"></select>
      <div id="department-output" className="max-w-screen-xl px-4 box-border overflow-x-hidden"></div>
    </div>
  );
}