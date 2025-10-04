<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>Buffalo Budget Tracker 2025</title>

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
    }
.tabs {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #111;
      display: flex;
      justify-content: center;
      border-bottom: 2px dashed #555;
      z-index: 10;
    }

    .tab {
      padding: 1rem 2rem;
      cursor: pointer;
      color: #ccc;
      border-bottom: 2px solid transparent;
    }

    .tab.active {
      border-color: #0ff;
      color: #0ff;
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
    
    #cypher-footer {
  font-family: monospace;
  white-space: pre;
  color: #ccc;
  background: #000;
  padding: 1em;
  border-top: 2px solid #ccc;
  text-align: center;
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
tr:hover {
  background-color: #111;
}

.expand-icon {
  display: inline-block;
  transition: transform 0.2s ease;
}

.employee-row + tr .expand-icon {
  transform: rotate(90deg);
}

/* Ensure main container fits screen width */
#department-output, #d3-budget-appropriations, #d3-budget-revenues {
  max-width: 100vw; /* max viewport width */
  padding-left: 1rem;
  padding-right: 1rem;
  box-sizing: border-box;
  overflow-x: hidden; /* prevent horizontal scroll from accidental overflow */
}

/* Responsive table wrapper */
#department-output > div, /* your table wrapper */
#department-output table {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: auto;
  box-sizing: border-box;
}

/* Allow horizontal scroll on small devices */
#department-output > div {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* smooth scrolling on iOS */
}

/* Table cells and headers wrap text properly */
#department-output table th,
#department-output table td {
  word-wrap: break-word;
  white-space: normal;
}

/* Optional: Reduce padding and font size on smaller screens */
@media (max-width: 480px) {
  #department-output table {
    font-size: 0.8rem;
  }
  #department-output table th,
  #department-output table td {
    padding: 4px 6px;
  }
}

.budget-table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.progress-cell {
  padding: 6px;
  min-width: 100px;
  width: 25vw;
  max-width: 160px;
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
    <select id="department-select"></select>
<div id="department-output"></div>

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

<script>
  const signalPhrase = `Taro sez... Council on the brink of bankruptcy and plunder. — 2025/06/24`;

const footerEl = document.getElementById("cypher-footer");

function asciiBox(text) {
  const lines = text.split('\n');
  const width = Math.max(...lines.map(line => line.length));
  const top = "+" + "-".repeat(width + 2) + "+";
  const bottom = top;
  const boxed = lines.map(line => "| " + line.padEnd(width, ' ') + " |").join("\n");
  return `${top}\n${boxed}\n${bottom}`;
}

// Set once, like it’s written in stone
footerEl.textContent = asciiBox(signalPhrase);


</script>


<script src="./js/budgets.js"></script>
<script src="./js/departments.js"></script>


</body>
</html>
