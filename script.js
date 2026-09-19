/* ============================================================
   Jashn Studio — script.js
   1. paper bunting across the hero
   2. occasion switcher: theme + copy + filters packages and gallery
   3. booking form validation
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. bunting ---------- */

  const string = document.querySelector(".bunting__string");
  const flagGroup = document.querySelector(".bunting__flags");

  if (string && flagGroup && typeof string.getPointAtLength === "function") {
    const total = string.getTotalLength();
    const count = 22;

    for (let i = 0; i < count; i++) {
      const p = string.getPointAtLength((total / (count - 1)) * i);
      const flag = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const w = 11, h = 20;
      flag.setAttribute(
        "d",
        `M${p.x - w} ${p.y} L${p.x + w} ${p.y} L${p.x} ${p.y + h} Z`
      );
      flag.setAttribute("fill", i % 2 ? "var(--accent-2)" : "var(--accent)");
      flag.setAttribute("opacity", i % 3 === 0 ? "0.65" : "1");
      flagGroup.appendChild(flag);
    }
  }

  /* ---------- 2. occasion switcher ---------- */

  const copy = {
    "birthday": {
      lede: "Room styling for the days you want photographed. Tell us the date, we handle the setup, the cleanup, and the panic at 6pm.",
      note: "Cake table, balloon arch, name board. Set up in about three hours."
    },
    "anniversary": {
      lede: "Flowers, warm light and a place for the family photograph. We work around a house full of relatives without moving your furniture twice.",
      note: "Fresh flowers are cut that morning, so anniversary dates need three days' notice."
    },
    "farewell": {
      lede: "Office floors, college halls and everything between. Built to survive four hundred people leaning on it for photos.",
      note: "Weekday setups start at 7am so the room is ready before anyone walks in."
    },
    "baby-shower": {
      lede: "Comfortable first, pretty second. Low seating, canopies overhead, and nothing the guest of honour has to stand up for.",
      note: "Godh bharai setups include floor seating, a flower canopy and the gift table."
    }
  };

  const root = document.documentElement;
  const chips = Array.from(document.querySelectorAll(".chip"));
  const lede = document.getElementById("heroLede");
  const note = document.getElementById("occasionNote");
  const packages = Array.from(document.querySelectorAll("#packageList .card"));
  const tiles = Array.from(document.querySelectorAll("#galleryGrid .tile"));
  const empty = document.getElementById("packageEmpty");
  const occasionSelect = document.getElementById("occasion");

  function filter(list, occasion) {
    let shown = 0;
    list.forEach(function (el) {
      const match = el.dataset.occasion === occasion;
      el.classList.toggle("is-hidden", !match);
      if (match) shown++;
    });
    return shown;
  }

  function setOccasion(occasion) {
    root.setAttribute("data-occasion", occasion);

    chips.forEach(function (chip) {
      chip.setAttribute("aria-selected", String(chip.dataset.occasion === occasion));
    });

    if (copy[occasion]) {
      lede.textContent = copy[occasion].lede;
      note.textContent = copy[occasion].note;
    }

    const shown = filter(packages, occasion);
    filter(tiles, occasion);
    if (empty) empty.hidden = shown > 0;

    if (occasionSelect) occasionSelect.value = occasion;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      setOccasion(chip.dataset.occasion);
    });
  });

  // keyboard support for the chip row
  const chipRow = document.querySelector(".chips");
  if (chipRow) {
    chipRow.addEventListener("keydown", function (e) {
      const i = chips.indexOf(document.activeElement);
      if (i < 0) return;
      let next = null;
      if (e.key === "ArrowRight") next = chips[(i + 1) % chips.length];
      if (e.key === "ArrowLeft") next = chips[(i - 1 + chips.length) % chips.length];
      if (!next) return;
      e.preventDefault();
      next.focus();
      setOccasion(next.dataset.occasion);
    });
  }

  if (occasionSelect) {
    occasionSelect.addEventListener("change", function () {
      if (copy[occasionSelect.value]) setOccasion(occasionSelect.value);
    });
  }

  setOccasion(root.getAttribute("data-occasion") || "birthday");

  /* ---------- 3. booking form ---------- */

  const form = document.getElementById("bookingForm");
  if (!form) return;

  const status = document.getElementById("formStatus");

  function showError(name, message) {
    const input = form.elements[name];
    const slot = form.querySelector('[data-error-for="' + name + '"]');
    if (slot) slot.textContent = message;
    if (input && input.closest(".field")) {
      input.closest(".field").classList.toggle("field--invalid", Boolean(message));
    }
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate() {
    const problems = [];

    const name = form.elements.name.value.trim();
    showError("name", name ? "" : "We need a name for the booking.");
    if (!name) problems.push("name");

    const phone = form.elements.phone.value.replace(/\D/g, "");
    const phoneOk = phone.length === 10 || (phone.length === 12 && phone.startsWith("91"));
    showError("phone", phoneOk ? "" : "Enter a 10-digit mobile number.");
    if (!phoneOk) problems.push("phone");

    const dateValue = form.elements.date.value;
    let dateMsg = "";
    if (!dateValue) {
      dateMsg = "Pick the date of the event.";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dateValue) < today) dateMsg = "That date has passed. Pick a day from today onwards.";
    }
    showError("date", dateMsg);
    if (dateMsg) problems.push("date");

    return problems;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const problems = validate();

    if (problems.length) {
      status.textContent = "";
      const first = form.elements[problems[0]];
      if (first) first.focus();
      return;
    }

    // No backend here — wire this up to your form service or WhatsApp API.
    const when = new Date(form.elements.date.value).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
    status.textContent =
      "Sent. We'll call " + form.elements.name.value.trim() +
      " about " + when + ", usually the same evening.";
    form.reset();
    setOccasion(root.getAttribute("data-occasion"));
  });

  form.addEventListener("input", function (e) {
    if (e.target.closest(".field--invalid")) validate();
  });
})();
