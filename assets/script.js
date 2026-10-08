(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const closeMenu = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));

  const theme = document.getElementById("theme-toggle");
  const applyTheme = (dark) => {
    document.body.classList.toggle("dark", dark);
    theme.setAttribute("aria-pressed", String(dark));
    theme.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
  };
  try {
    applyTheme(localStorage.getItem("hkv-theme") === "dark");
  } catch {
    applyTheme(false);
  }
  theme.addEventListener("click", () => {
    const dark = !document.body.classList.contains("dark");
    applyTheme(dark);
    try {
      localStorage.setItem("hkv-theme", dark ? "dark" : "light");
    } catch {}
  });

  const search = document.getElementById("publication-search");
  if (search) {
    const items = Array.from(
      document.querySelectorAll("#publication-list .publication"),
    );
    const yearFilter = document.getElementById("publication-year");
    const typeFilter = document.getElementById("publication-type");
    const count = document.getElementById("publication-count");
    const pagination = document.querySelector(".publication-pagination");
    const pageLabel = document.getElementById("publication-page");
    const previous = document.getElementById("publication-prev");
    const next = document.getElementById("publication-next");
    const empty = document.getElementById("publication-empty");
    const size = 12;
    let page = 1;
    const update = (reset = false) => {
      if (reset) page = 1;
      const words = search.value
        .toLocaleLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const matches = items.filter(
        (item) =>
          words.every((word) =>
            item.textContent.toLocaleLowerCase().includes(word),
          ) &&
          (yearFilter.value === "all" ||
            item.dataset.year === yearFilter.value) &&
          (typeFilter.value === "all" ||
            item.dataset.type === typeFilter.value),
      );
      const pages = Math.max(1, Math.ceil(matches.length / size));
      page = Math.min(page, pages);
      const start = (page - 1) * size;
      const visible = new Set(matches.slice(start, start + size));
      items.forEach((item) => {
        item.hidden = !visible.has(item);
      });
      empty.hidden = matches.length > 0;
      pagination.hidden = matches.length <= size;
      count.textContent = matches.length
        ? `Showing ${start + 1}–${Math.min(start + size, matches.length)} of ${matches.length} publications`
        : "0 publications found";
      pageLabel.textContent = `Page ${page} of ${pages}`;
      previous.disabled = page === 1;
      next.disabled = page === pages;
    };
    search.addEventListener("input", () => update(true));
    yearFilter.addEventListener("change", () => update(true));
    typeFilter.addEventListener("change", () => update(true));
    document
      .getElementById("publication-reset")
      .addEventListener("click", () => {
        search.value = "";
        yearFilter.value = typeFilter.value = "all";
        update(true);
      });
    previous.addEventListener("click", () => {
      page--;
      update();
    });
    next.addEventListener("click", () => {
      page++;
      update();
    });
    update();
  }

  const scholarSearch = document.getElementById("scholar-search");
  if (scholarSearch) {
    const items = Array.from(document.querySelectorAll(".scholar-card"));
    const status = document.getElementById("scholar-status");
    const count = document.getElementById("scholar-count");
    const update = () => {
      const words = scholarSearch.value
        .toLocaleLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      let shown = 0;
      items.forEach((item) => {
        const match =
          words.every((word) =>
            item.textContent.toLocaleLowerCase().includes(word),
          ) &&
          (status.value === "all" || item.dataset.status === status.value);
        item.hidden = !match;
        if (match) shown++;
      });
      count.textContent = `${shown} doctoral ${shown === 1 ? "record" : "records"} shown`;
    };
    scholarSearch.addEventListener("input", update);
    status.addEventListener("change", update);
    update();
  }

  const metricsPanel = document.getElementById("scholar-metrics");
  if (metricsPanel) {
    // On page load, show the latest saved figures. The button uses the live API.
    const refreshButton = document.getElementById("scholar-refresh");
    const refreshLabel = document.getElementById("scholar-refresh-label");
    const refreshStatus = document.getElementById("scholar-refresh-status");
    const snapshot = () =>
      JSON.stringify({
        values: Array.from(
          metricsPanel.querySelectorAll("[data-metric]"),
          (cell) => cell.textContent,
        ),
        since: document.getElementById("scholar-recent").textContent,
        annual: Array.from(
          document.querySelectorAll("#scholar-chart li"),
          (item) => item.getAttribute("aria-label"),
        ),
      });
    let refreshing = false;
    const refreshMetrics = async (manual = false) => {
      if (refreshing) return;
      refreshing = true;
      const previous = snapshot();
      refreshButton.disabled = true;
      refreshButton.setAttribute("aria-busy", "true");
      refreshLabel.textContent = "Refreshing…";
      if (manual) refreshStatus.textContent = "";
      const controller = new AbortController();
      const timer = setTimeout(
        () => controller.abort(),
        manual ? 45000 : 10000,
      );
      try {
        const options = { cache: "no-store", signal: controller.signal };
        let url = new URL(
          "https://raw.githubusercontent.com/harsh-verma-nitj/harsh-verma-nitj.github.io/main/assets/scholar-metrics.json",
        );
        if (manual) {
          const configResponse = await fetch(
            `assets/scholar-config.json?t=${Date.now()}`,
            options,
          );
          if (!configResponse.ok) throw new Error("Configuration unavailable");
          const config = await configResponse.json();
          if (!config.live_endpoint) {
            refreshStatus.textContent =
              "Live refresh is not connected yet. View Google Scholar for current totals.";
            return;
          }
          url = new URL(config.live_endpoint);
          if (url.protocol !== "https:") throw new Error("Invalid endpoint");
          refreshStatus.textContent = "Checking Google Scholar…";
        }
        url.searchParams.set("t", Date.now());
        const response = await fetch(url.toString(), options);
        if (!response.ok) throw new Error("Figures unavailable");
        const data = await response.json();
        const updated = new Date(data.updated_at);
        const integer = (value) => Number.isSafeInteger(value) && value >= 0;
        const valid =
          data.profile_id === "h0edtgIAAAAJ" &&
          !Number.isNaN(updated.getTime()) &&
          integer(data.recent_since) &&
          data.recent_since >= 2000 &&
          ["citations", "h_index", "i10_index"].every(
            (key) =>
              data.metrics &&
              data.metrics[key] &&
              integer(data.metrics[key].all) &&
              integer(data.metrics[key].recent) &&
              data.metrics[key].recent <= data.metrics[key].all,
          ) &&
          Array.isArray(data.annual_citations) &&
          data.annual_citations.length > 0 &&
          data.annual_citations.length <= 8 &&
          data.annual_citations.every(
            (item, i, list) =>
              integer(item.year) &&
              integer(item.citations) &&
              (i === 0 || item.year > list[i - 1].year),
          );
        if (!valid) throw new Error("Invalid figures");
        const currentUpdated = new Date(
          document.getElementById("scholar-updated").getAttribute("datetime"),
        );
        if (updated < currentUpdated) {
          if (manual) throw new Error("Outdated response");
          return;
        }
        metricsPanel.querySelectorAll("[data-metric]").forEach((cell) => {
          cell.textContent =
            data.metrics[cell.dataset.metric][
              cell.dataset.period
            ].toLocaleString("en-US");
        });
        document.getElementById("scholar-recent").textContent =
          `Since ${data.recent_since}`;
        const time = document.getElementById("scholar-updated");
        time.dateTime = data.updated_at;
        time.textContent = updated.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        });
        const maximum = Math.max(
          1,
          ...data.annual_citations.map((item) => item.citations),
        );
        const fragment = document.createDocumentFragment();
        data.annual_citations.forEach((item) => {
          const li = document.createElement("li");
          li.setAttribute(
            "aria-label",
            `${item.year}: ${item.citations} citations`,
          );
          const column = document.createElement("span");
          column.className = "citation-column";
          const bar = document.createElement("span");
          bar.className = "citation-bar";
          bar.style.setProperty(
            "--bar-height",
            `${(item.citations / maximum) * 100}%`,
          );
          const value = document.createElement("span");
          value.className = "citation-value";
          value.textContent = item.citations;
          bar.append(value);
          column.append(bar);
          const year = document.createElement("span");
          year.className = "citation-year";
          year.textContent = item.year;
          li.append(column, year);
          fragment.append(li);
        });
        document.getElementById("scholar-chart").replaceChildren(fragment);
        if (manual)
          refreshStatus.textContent =
            previous === snapshot()
              ? "Checked Google Scholar just now. Figures are unchanged."
              : "Current Google Scholar figures loaded.";
      } catch {
        // Keep all last-verified values and their actual update date.
        if (manual)
          refreshStatus.textContent =
            "Could not check Google Scholar. Showing the last verified figures.";
      } finally {
        clearTimeout(timer);
        refreshing = false;
        refreshButton.disabled = false;
        refreshButton.setAttribute("aria-busy", "false");
        refreshLabel.textContent = "Refresh";
      }
    };
    refreshButton.addEventListener("click", () => refreshMetrics(true));
    refreshMetrics();
  }

  if (/\/(?:index\.html)?$/.test(location.pathname)) {
    const routes = {
      "#publications": "publications.html",
      "#experience": "experience.html",
      "#supervision": "supervision.html",
      "#research": "research.html",
      "#projects": "research.html#projects",
      "#patents": "research.html#patents",
      "#consultancy": "research.html#consultancy",
      "#contact": "contact.html",
    };
    if (routes[location.hash]) location.replace(routes[location.hash]);
  }
})();
