let firstRun = localStorage.getItem("firstRun");
let savedStock = localStorage.getItem("lastStock") || "ASX:AXJO";
let chart = null;
let activeTab = 0;
const pill = document.getElementById("pill");

function saveStock(symbol){
  savedStock = symbol;
  localStorage.setItem("lastStock", symbol);
  reloadChart();
}

/* =========================
   AXJO CHART
========================= */
function initChart(){
  const isLight = document.body.classList.contains("light");

  // Clear old chart properly
  document.getElementById("chart").innerHTML = "";

  chart = new TradingView.widget({
    container_id: "chart",
    symbol: savedStock,
    interval: "D",
    theme: isLight ? "light" : "dark",
    style: "1",
    autosize: true,
    allow_symbol_change: true,
    hide_top_toolbar: false,
    hide_side_toolbar: false,
    withdateranges: true,
    loading_screen: { backgroundColor: "transparent" },
    overrides: {
      "paneProperties.background": "rgba(0,0,0,0)",
      "paneProperties.vertGridProperties.color":
        isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)",
      "paneProperties.horzGridProperties.color":
        isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)",
      "scalesProperties.backgroundColor": "rgba(0,0,0,0)"
    }
  });
}

/* Used when theme changes */
function reloadChart(){
  document.getElementById("chart").innerHTML = "";
  initChart();
}

/* =========================
   AUSTRALIA NEWS
========================= */
async function loadNews(){
  const url =
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent("https://news.google.com/rss/search?q=Australia+finance&hl=en-AU&gl=AU&ceid=AU:en");

  try {
    const res = await fetch(url);
    const data = await res.json();
    const box = document.getElementById("newsBox");
    box.innerHTML = "";

    data.items.slice(0,25).forEach(item=>{
      const div = document.createElement("div");
      div.className = "newsItem";
      div.innerHTML = `
        <a href="${item.link}" target="_blank">
          <div class="newsTitle">${item.title}</div>
          <div class="newsMeta">${new Date(item.pubDate).toLocaleString()}</div>
        </a>
      `;
      box.appendChild(div);
    });
  } catch(e) {
    document.getElementById("newsBox").innerHTML =
      "<div style='opacity:.6'>Failed to load Australian news</div>";
  }
}

/* =========================
   NAV SYSTEM
========================= */
function hoverTab(i){
  pill.style.transform = `translateX(${i*100}%)`;
}

function go(page){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
  document.getElementById("settingsPanel").classList.remove("show");

  if(page==="stock"){
    activeTab=0;
    pill.style.transform="translateX(0%)";
  }

  if(page==="news"){
    activeTab=2;
    pill.style.transform="translateX(200%)";
    loadNews(); // Load AU news only when opened
  }
}

/* SETTINGS */
function toggleSettings(){
  const panel=document.getElementById("settingsPanel");
  panel.classList.toggle("show");

  activeTab = panel.classList.contains("show") ? 1 : 0;
  pill.style.transform = `translateX(${activeTab*100}%)`;
}

/* =========================
   THEME SYSTEM
========================= */

/* Load saved theme */
const savedTheme = localStorage.getItem("theme");

if(savedTheme === "light"){
  document.body.classList.add("light");
} else if(savedTheme === "black"){
  document.body.classList.add("black");
} else {
  document.body.classList.remove("light");
  document.body.classList.remove("black");
}

/* Update nav icons based on theme */
function updateIcons(){
  const isLight = document.body.classList.contains("light");

  document.getElementById("stockIcon").src =
    isLight ? "icon/light-stock.png" : "icon/dark-stock.png";

  document.getElementById("settingsIcon").src =
    isLight ? "icon/light-settings.png" : "icon/dark-settings.png";

  document.getElementById("newsIcon").src =
    isLight ? "icon/light-news.png" : "icon/dark-news.png";
}

/* Dark Mode Trigger */
function dark(){
  document.body.classList.remove("light");
  localStorage.setItem("theme","dark");
  updateIcons();
  reloadChart();
}

/* Light Mode Trigger */
function light(){
  document.body.classList.add("light");
  localStorage.setItem("theme","light");
  updateIcons();
  reloadChart();
}

/* =========================
   LOAD APP EVENT
========================= */
window.addEventListener("load",()=>{
  updateIcons();
  initChart();

  if(!firstRun){
    toggleSettings();
    localStorage.setItem("firstRun", "done");
  }

  setTimeout(()=>{
    const loader = document.getElementById("loader");
    loader.style.opacity = "0";

    setTimeout(()=>{
      loader.style.display = "none";
    },400);
  },800);
});