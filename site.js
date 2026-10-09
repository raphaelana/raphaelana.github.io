"use strict";

document.documentElement.classList.add("js");
const pages = ["about", "research", "publications", "resume"];
function showPage() {
  if (location.hash === "#main-content") {
    document.getElementById("main-content").focus();
    return;
  }
  const requested = location.hash.slice(1);
  const current = pages.includes(requested) ? requested : "about";
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === "page-" + current);
  });
  document.querySelectorAll("[data-page]").forEach(link => {
    const active = link.dataset.page === current;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", showPage);
showPage();

const news = document.getElementById("news");
const newsButton = document.getElementById("news-toggle");
newsButton.addEventListener("click", () => {
  const open = news.classList.toggle("expanded");
  newsButton.textContent = open ? "Show less" : "Show older news";
  newsButton.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll("[data-bib]").forEach(button => {
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", button.dataset.bib);
  button.addEventListener("click", () => {
    const open = document.getElementById(button.dataset.bib).classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll(".bibtex .copy").forEach(button => {
  button.setAttribute("aria-live", "polite");
  button.addEventListener("click", async () => {
    const citation = button.nextElementSibling;
    try {
      await navigator.clipboard.writeText(citation.textContent);
      button.textContent = "Copied";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(citation);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "Selected — press Ctrl/Cmd+C";
    }
    clearTimeout(button.resetTimer);
    button.resetTimer = setTimeout(() => { button.textContent = "Copy"; }, 3500);
  });
});
