const urls = {
  bySegment5: "https://data.buffalony.gov/resource/xy5k-883e.json?$select=segment5code,segment5,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity='CITY'%20AND%20fundgroup='GENERAL%20FUND'%20and%20fiscalyear='2025'&$group=segment5code,segment5,objectcode,object&$order=segment5code asc,objectcode%20asc",
  byDepartment: "https://data.buffalony.gov/resource/xy5k-883e.json?$select=segment2code,segment2,segment5code,segment5,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity='CITY'%20AND%20fundgroup='GENERAL%20FUND'%20and%20fiscalyear='2025'&$group=segment2code,segment2,segment5code,segment5,objectcode,object&$order=segment2code asc,segment5code%20asc",
  revenueBySource: "https://data.buffalony.gov/resource/cvx5-9drv.json?$select=segment8code,segment8,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity='CITY'%20AND%20fundgroup='GENERAL%20FUND'%20and%20fiscalyear='2025'&$group=segment8code,segment8,objectcode,object&$order=segment8code asc, objectcode%20asc",
  revenueByDept: "https://data.buffalony.gov/resource/cvx5-9drv.json?$select=segment2code,segment2,objectcode,object,sum(actual)as%20ytd,sum(originalbudget)as%20adopted&$where=entity=%27CITY%27%20AND%20fundgroup=%27GENERAL%20FUND%27%20and%20fiscalyear=%272025%27&$group=segment2code,segment2,objectcode,object&$order=segment2code%20asc,%20objectcode%20asc"
};

(async () => {
  const [revenueData, departmentData, revSourceData, revDeptData] = await Promise.all([
    d3.json(urls.bySegment5),
    d3.json(urls.byDepartment),
    d3.json(urls.revenueBySource),
    d3.json(urls.revenueByDept)
  ]);

  const appContainer = d3.select("#d3-budget-appropriations");
  const revContainer = d3.select("#d3-budget-revenues");

  const percent = (a, b) => b && b != 0 ? (a / b) : 0;
  const formatMoney = d => "$" + (+d).toLocaleString();

  const drawBar = (actual, adopted) => {
    const ratio = percent(actual, adopted);
    const barWidth = Math.min(ratio, 1) * 100;
    const overageRatio = ratio > 1 ? ratio - 1 : 0;
    const overageLayers = Math.floor(overageRatio);
    const remainderLayer = (overageRatio % 1) * 100;

    let overageBars = "";
    for (let i = 0; i < overageLayers; i++) {
      overageBars += `
        <div class="overage-bar">
          <div class="overage-inner" style="width:100%;"></div>
        </div>`;
    }

    if (remainderLayer > 0) {
      overageBars += `
        <div class="overage-bar">
          <div class="overage-inner" style="width:${remainderLayer}%;"></div>
        </div>`;
    }

    return `
      <div>
        <div class="progress-bar-container">
          <div class="progress-bar-inner" style="width:${barWidth}%"></div>
        </div>
        ${overageBars}
        <div class="progress-label">
          ${formatMoney(actual)} / ${formatMoney(adopted)} (${Math.round(ratio * 100)}%)
          ${ratio > 1 ? 'OVER BUDGET' : ''}
        </div>
      </div>
    `;
  };

  const styleBox = el => el.attr("class", "ascii-box");

  // === Appropriations View ===
  const byS5 = d3.group(revenueData, d => d.segment5);
  appContainer.append("h2").text("Appropriations by Type").style("color", "red");

  byS5.forEach((entries, seg5) => {
    const totalActual = d3.sum(entries, d => +d.ytd);
    const totalAdopted = d3.sum(entries, d => +d.adopted);

    const details = appContainer.append("details");
    const summary = details.append("summary")
      .style("cursor", "pointer")
      .style("font-weight", "bold")
      .style("color", "#fff")
      .style("padding", "0.5rem 0")
      .html(`${entries[0].segment5code} ${seg5} ${drawBar(totalActual, totalAdopted)}`);

    const inner = details.append("div").style("margin-left", "1rem").style("margin-top", "0.5rem");
    entries.sort((a, b) => d3.ascending(a.objectcode, b.objectcode));
    entries.forEach(d => {
      const row = inner.append("div");
      styleBox(row).style("background", "#181a1b");
      row.append("div").text(`${d.objectcode} - ${d.object}`);
      row.append("div").html(drawBar(+d.ytd, +d.adopted));
    });
  });

  appContainer.append("h2").text("Department Appropriations by Type").style("color", "red").style("margin-top", "2rem");
  const byS2 = d3.group(departmentData, d => d.segment2);
  byS2.forEach((entries, seg2) => {
    const deptTotalActual = d3.sum(entries, d => +d.ytd);
    const deptTotalAdopted = d3.sum(entries, d => +d.adopted);

    const details = appContainer.append("details");
    const summary = details.append("summary")
      .style("cursor", "pointer")
      .style("font-weight", "bold")
      .style("color", "#fff")
      .style("padding", "0.5rem 0")
      .html(`${entries[0].segment2code} ${seg2 || "Unknown Dept"} ${drawBar(deptTotalActual, deptTotalAdopted)}`);

    const inner = details.append("div").style("margin-left", "1rem").style("margin-top", "0.5rem");
    const bySegment5 = d3.group(entries, d => d.segment5);
    bySegment5.forEach((seg5entries, seg5name) => {
      const s5Actual = d3.sum(seg5entries, d => +d.ytd);
      const s5Adopted = d3.sum(seg5entries, d => +d.adopted);
      const block = inner.append("div");
      styleBox(block).style("background", "#111");
      block.append("div").text(seg5name || "Unknown Source").style("color", "#ccc");
      block.append("div").html(drawBar(s5Actual, s5Adopted));
    });
  });

  // === Revenues View ===
  revContainer.append("h2").text("Revenues by Source").style("color", "#0f0");
  const bySegment8 = d3.group(revSourceData, d => d.segment8);
  bySegment8.forEach((entries, seg8) => {
    const actual = d3.sum(entries, d => +d.ytd);
    const adopted = d3.sum(entries, d => +d.adopted);
    const details = revContainer.append("details");
    const summary = details.append("summary")
      .style("cursor", "pointer")
      .style("font-weight", "bold")
      .style("color", "#fff")
      .style("padding", "0.5rem 0")
      .html(`${entries[0].segment8code} ${seg8} ${drawBar(actual, adopted)}`);
    const inner = details.append("div").style("margin-left", "1rem").style("margin-top", "0.5rem");
    entries.sort((a, b) => d3.ascending(a.objectcode, b.objectcode));
    entries.forEach(d => {
      const row = inner.append("div");
      styleBox(row).style("background", "#181a1b");
      row.append("div").text(`${d.objectcode} - ${d.object}`);
      row.append("div").html(drawBar(+d.ytd, +d.adopted));
    });
  });

  revContainer.append("h2").text("Revenue by Department").style("color", "#0f0").style("margin-top", "2rem");
  const revByDept = d3.group(revDeptData, d => d.segment2);
  revByDept.forEach((entries, seg2) => {
    const totalActual = d3.sum(entries, d => +d.ytd);
    const totalAdopted = d3.sum(entries, d => +d.adopted);
    const details = revContainer.append("details");
    const summary = details.append("summary")
      .style("cursor", "pointer")
      .style("font-weight", "bold")
      .style("color", "#fff")
      .style("padding", "0.5rem 0")
      .html(`${entries[0].segment2code} ${seg2 || "Unknown Dept"} ${drawBar(totalActual, totalAdopted)}`);
    const inner = details.append("div").style("margin-left", "1rem").style("margin-top", "0.5rem");
    const byObject = d3.group(entries, d => d.object);
    byObject.forEach((objEntries, objName) => {
      const objActual = d3.sum(objEntries, d => +d.ytd);
      const objAdopted = d3.sum(objEntries, d => +d.adopted);
      const block = inner.append("div");
      styleBox(block).style("background", "#111");
      block.append("div").text(`${objEntries[0].objectcode} - ${objName}`);
      block.append("div").html(drawBar(objActual, objAdopted));
    });
  });
})();
