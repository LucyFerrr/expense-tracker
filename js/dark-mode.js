"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const historyContainer = document.querySelector(".transaction-history");
  let style =
    document.getElementById("scrollbar-style") ||
    document.createElement("style");

  /*=============================================================================
// Function Name: applyDarkMode
// Description: Function to apply dark mode styles
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
  const applyDarkMode = () => {
    darkModeState = true;

    style.id = "scrollbar-style";
    style.innerHTML = `
      .transaction-list::-webkit-scrollbar-track {
        background: #333;
      }
    `;

    document.head.appendChild(style);
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");

    myChart.options.scales.x.grid.color = "#fff";
    myChart.options.scales.y.grid.color = "#fff";
    myChart.options.scales.x.title.color = "#fff";
    historyContainer.style.backgroundColor = "#282829";

    renderChart(document.getElementById("interval").value);
  };

  /*=============================================================================
// Function Name: applyDarkMode
// Description: Function to apply light mode styles
// Arguments: None
// Return Value: None
//---------------------------------------------------------------------------*/
  const applyLightMode = () => {
    darkModeState = false;

    style.id = "scrollbar-style";
    style.innerHTML = `
      .transaction-list::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
    `;
    body.classList.add("light-mode");
    body.classList.remove("dark-mode");

    myChart.options.scales.x.grid.color = "#000";
    myChart.options.scales.y.grid.color = "#000";
    myChart.options.scales.x.title.color = "#000";
    historyContainer.style.backgroundColor = "#fff";
    renderChart(document.getElementById("interval").value);
  };

  const darkMode = localStorage.getItem("darkMode") === "true";

  if (darkMode) {
    slider.checked = true;
    applyDarkMode();
  } else {
    applyLightMode();
  }

  slider.addEventListener("change", () => {
    if (slider.checked) {
      localStorage.setItem("darkMode", "true");
      applyDarkMode();
    } else {
      localStorage.setItem("darkMode", "false");
      applyLightMode();
    }
  });
});
