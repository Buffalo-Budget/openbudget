<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>City of Buffalo Budget Auditor</title>

  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <script src="https://d3js.org/d3.v7.min.js"></script>

  <style>
    body {
      background: #000;
      font-family: 'Courier New', monospace;
      color: #ccc;
      margin: 0;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      padding-top: 100px; /* adjust this to match the tabs height */
    }
.tabs {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #111; /* or any dark background */
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
}

.tab {
  margin: 0 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: white;
}

.tab.active {
  background: #444;
  border-radius: 4px;
}

    .tab:hover {
      background: #222;
    }

    .view {
      display: none;
      padding: 2rem;
    }

    .view.active {
      display: block;
    }

    .perforation::before {
  content: none; /* disable the box-shadow holes */
}

.perforation {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between; /* evenly distribute holes */
  padding: 10px 0;
  z-index: 0;
  pointer-events: none;
}

.hole {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #000;
  border: 1px solid #aaa;
}


    .perforation.left {
      left: 0;
      border-right: 2px dashed #555;
    }

    .perforation.right {
      right: 0;
      border-left: 2px dashed #555;
    }

    

    #d3-budget {
      position: relative;
      z-index: 1;
      max-width: 900px;
      width: 100%;
      font-family: 'Share Tech Mono', monospace;
    }

    h1 {
      text-align: center;
      color: green;
      font-family: 'Share Tech Mono', monospace;
      font-size: 1.5rem;
      border-bottom: 2px dashed #0f0;
      padding-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.25rem;
      border-top: 2px dashed #fff;
      border-bottom: 2px dashed #fff;
      padding: 0.5rem 0;
      margin: 2rem 0 1rem;
      color: #0f0;
      text-transform: uppercase;
    }

    details summary {
      border-bottom: 1px dashed #999;
      padding: 0.25rem 0;
      color: #0ff;
      font-weight: bold;
      text-transform: uppercase;
    }

    details summary:hover {
      background-color: #111;
    }

    .ascii-box {
      padding: 1rem;
      margin: 0.5rem 0;
      border: 1px dashed #999;
      background: #111;
    }

    .progress-bar-container {
      height: 10px;
      background: #000;
      border: 1px dashed #aaa;
      overflow: hidden;
      margin: 0.25rem 0;
    }

    .progress-bar-inner {
      height: 10px;
      background: #0ff;
    }

    .progress-label {
      font-size: 0.75rem;
      color: #ccc;
    }

    .overage-bar {
      height: 10px;
      margin-top: 2px;
      background: #000;
      border: 1px dashed #666;
      overflow: hidden;
    }

    .overage-inner {
      height: 10px;
      background: #f76400;
    }

    footer {
      margin-top: 4rem;
      text-align: center;
      font-size: 0.75rem;
      color: #666;
      white-space: pre-wrap;
    }
    
    .ascii-header {
  font-family: 'Share Tech Mono', monospace;
  font-size: 1.2rem;
  color: #0f0;
  text-align: center;
  margin: 2rem 0 1rem;
  white-space: pre;
}
footer {
  margin-top: 4rem;
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #ccc;
  background: #000;
  padding: 1rem 2rem;
  white-space: pre-wrap;
  min-height: 3.5rem; /* reserve space */
}

  </style>
</head>

<body>
  <div class="perforation left">
  <!-- 40 holes (or as many as needed) -->
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
</div>

<div class="perforation right">
  <!-- Copy same number of holes here -->
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
  <div class="hole"></div>
</div>


  <h1>City of Buffalo Budget Tracker</h1>
  <p>Tracking Fiscal Year 2025 — General Fund Budget</p>

  <div class="tabs">
    <div class="tab active" data-target="#revenues">Revenues</div>
    <div class="tab " data-target="#appropriations">Appropriations</div>
    <div class="tab" data-target="#department-details">Department Details</div>
    
  </div>

  <div id="appropriations" class="view">
    <div id="d3-budget-appropriations"></div>
  </div>

  <div id="revenues" class="view active">
    <div id="d3-budget-revenues"></div>
  </div>

    <div id="department-details" class="view">
  <div id="d3-budget-departments">
  <h2 style="color: yellow">Department Details</h2>
  <label for="department-select" style="color:#ccc">Choose a Department:</label>
  <select id="department-select" style="margin: 0.5rem;"></select>
  <div id="department-output"></div> <!-- ✅ new ID for output -->
</div>

</div>

  <script>
    const tabs = document.querySelectorAll('.tab');
    const views = document.querySelectorAll('.view');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        views.forEach(v => v.classList.remove('active'));

        tab.classList.add('active');
        document.querySelector(tab.dataset.target).classList.add('active');
      });
    });
  </script>
<footer>
  <pre id="cypher-footer"></pre>
</footer>

<script src="./js/footer.js">


</script>


<script src="./js/budgets.js"></script>
<script>
async function populateDepartments() {
  const select = document.getElementById('department-select');
  const output = document.getElementById('department-output');

  const url = "https://data.buffalony.gov/resource/xy5k-883e.json?$select=distinct segment2code,segment2&$where=entity='CITY' AND fundgroup='GENERAL FUND' AND fiscalyear='2025'&$order=segment2code";
  
  try {
    const data = await (await fetch(url)).json();

    data.forEach(d => {
      const option = document.createElement('option');
      option.value = d.segment2code;
      option.textContent = d.segment2;
      select.appendChild(option);
    });

    select.addEventListener('change', async () => {
      const code = select.value;

      if (!code) return;

      const detailUrl = `https://data.buffalony.gov/resource/xy5k-883e.json?$where=segment2code='${code}' AND entity='CITY' AND fundgroup='GENERAL FUND' AND fiscalyear='2025'`;

      const details = await (await fetch(detailUrl)).json();

      output.innerHTML = `
        <h3 style="color:#fff;">${select.selectedOptions[0].text}</h3>
        <pre>${JSON.stringify(details, null, 2)}</pre>
      `;
    });

  } catch (err) {
    console.error("Error loading departments:", err);
    output.textContent = "Failed to load departments.";
  }
}

document.addEventListener('DOMContentLoaded', populateDepartments);
</script>

</body>
</html>

