const ACTIONS = [
  { id: "hire-dancers", name: "Hire Dancers", category: "Culture", icon: "💃", cost: 300, baseRevenue: 500, appealDelta: 18, reputationDelta: 2, jobsDelta: 4 },
  { id: "mariachi-band", name: "Mariachi Band", category: "Culture", icon: "🎺", cost: 250, baseRevenue: 420, appealDelta: 14, reputationDelta: 2, jobsDelta: 3 },
  { id: "parade-float", name: "Parade Float", category: "Culture", icon: "🎉", cost: 220, baseRevenue: 380, appealDelta: 16, reputationDelta: 1, jobsDelta: 3 },
  { id: "ofrenda-workshop", name: "Ofrenda Workshop", category: "Culture", icon: "🕯️", cost: 180, baseRevenue: 280, appealDelta: 12, reputationDelta: 4, jobsDelta: 2 },
  { id: "sell-masks", name: "Sell Masks", category: "Commerce", icon: "🎭", cost: 200, baseRevenue: 400, appealDelta: 8, reputationDelta: 1, jobsDelta: 2 },
  { id: "food-stall", name: "Food Stall", category: "Commerce", icon: "🌮", cost: 150, baseRevenue: 300, appealDelta: 6, reputationDelta: 1, jobsDelta: 3 },
  { id: "artisan-crafts", name: "Artisan Crafts", category: "Commerce", icon: "🪅", cost: 170, baseRevenue: 320, appealDelta: 7, reputationDelta: 2, jobsDelta: 2 },
  { id: "photo-booth", name: "Photo Booth", category: "Commerce", icon: "📸", cost: 120, baseRevenue: 220, appealDelta: 5, reputationDelta: 1, jobsDelta: 1 },
  { id: "security-team", name: "Security Team", category: "Logistics", icon: "🛡️", cost: 160, baseRevenue: 0, appealDelta: 2, reputationDelta: 8, jobsDelta: 3, upgradeKey: "security" },
  { id: "cleanup-crew", name: "Cleanup Crew", category: "Logistics", icon: "🧹", cost: 110, baseRevenue: 0, appealDelta: 2, reputationDelta: 7, jobsDelta: 2, upgradeKey: "cleanup" },
  { id: "health-permit", name: "Health Permit", category: "Logistics", icon: "✅", cost: 90, baseRevenue: 0, appealDelta: 0, reputationDelta: 6, jobsDelta: 0, upgradeKey: "permit" },
  { id: "canopies", name: "Canopies / Indoor Area", category: "Logistics", icon: "⛱️", cost: 130, baseRevenue: 0, appealDelta: 3, reputationDelta: 3, jobsDelta: 1, upgradeKey: "canopies" },
  { id: "social-media-ads", name: "Social Media Ads", category: "Marketing", icon: "📱", cost: 140, baseRevenue: 240, appealDelta: 7, reputationDelta: 0, jobsDelta: 1 },
  { id: "tourist-partnership", name: "Tourist Partnership", category: "Marketing", icon: "🚌", cost: 210, baseRevenue: 330, appealDelta: 10, reputationDelta: 2, jobsDelta: 1 }
];

const UPGRADE_META = [
  { key: "security", name: "Security Team", icon: "🛡️" },
  { key: "permit", name: "Health Permit", icon: "✅" },
  { key: "cleanup", name: "Cleanup Crew", icon: "🧹" },
  { key: "canopies", name: "Canopies / Indoor Area", icon: "⛱️" }
];

const EVENTS = [
  {
    id: "rainstorm",
    name: "Rainstorm",
    icon: "🌧️",
    description: "A sudden rainstorm rolls in.",
    apply(ctx, input) {
      if (input.state.ownedUpgrades.canopies) {
        ctx.eventMultiplier *= 0.9;
        ctx.notes.push("Canopies absorbed most damage: revenue -10%.");
      } else {
        ctx.eventMultiplier *= 0.75;
        ctx.notes.push("No shelter in place: revenue -25%.");
      }
    }
  },
  {
    id: "police-inspection",
    name: "Police Inspection",
    icon: "🚓",
    description: "Inspectors check permits and safety standards.",
    apply(ctx, input) {
      if (input.state.ownedUpgrades.permit) {
        ctx.reputationDelta += 3;
        ctx.notes.push("Permit ready: reputation +3.");
      } else {
        ctx.reputationDelta -= 8;
        ctx.notes.push("Missing permit confidence: reputation -8.");
      }
    }
  },
  {
    id: "influencer-visit",
    name: "Influencer Visit",
    icon: "📣",
    description: "A travel influencer starts filming your event.",
    apply(ctx, input) {
      if (input.action.category === "Commerce") {
        ctx.eventMultiplier *= 1.25;
        ctx.notes.push("Commerce spotlight: revenue +25%.");
      } else {
        ctx.notes.push("No commerce focus this round, no bonus.");
      }
    }
  },
  {
    id: "sponsor-donation",
    name: "Sponsor Donation",
    icon: "🎁",
    description: "A sponsor considers donating to your festival.",
    apply(ctx, input) {
      if (input.state.reputation >= 60) {
        ctx.bonusRevenue += 150;
        ctx.notes.push("Strong reputation unlocked +$150 donation.");
      } else {
        ctx.notes.push("Reputation too low for sponsor support.");
      }
    }
  },
  {
    id: "heatwave",
    name: "Heatwave",
    icon: "☀️",
    description: "Hot weather puts pressure on food sales.",
    apply(ctx, input) {
      if (input.action.id !== "food-stall") {
        ctx.notes.push("Food operations not central this round.");
        return;
      }
      if (input.state.ownedUpgrades.canopies) {
        ctx.eventMultiplier *= 0.95;
        ctx.notes.push("Shade helped food sales: revenue -5%.");
      } else {
        ctx.eventMultiplier *= 0.85;
        ctx.notes.push("Heat hurt food sales: revenue -15%.");
      }
    }
  },
  {
    id: "transportation-strike",
    name: "Transportation Strike",
    icon: "🚧",
    description: "City transport disruption limits visitor arrivals.",
    apply(ctx) {
      ctx.attendance -= 120;
      ctx.penaltyCost += 70;
      ctx.notes.push("Attendance -120, emergency shuttle setup cost $70.");
    }
  },
  {
    id: "crowd-surge",
    name: "Crowd Surge",
    icon: "🔥",
    description: "Unexpected crowds flood event areas.",
    apply(ctx, input) {
      ctx.eventMultiplier *= 1.15;
      if (input.state.ownedUpgrades.security) {
        ctx.notes.push("Security handled the surge, revenue +15%.");
      } else {
        ctx.reputationDelta -= 5;
        ctx.notes.push("Revenue +15% but reputation -5 without security.");
      }
    }
  },
  {
    id: "artisan-trend",
    name: "Artisan Trend",
    icon: "🧵",
    description: "Local handmade goods go viral this weekend.",
    apply(ctx, input) {
      if (input.action.id === "artisan-crafts" || input.action.id === "sell-masks") {
        ctx.eventMultiplier *= 1.2;
        ctx.notes.push("Masks/Crafts trend boosted revenue +20%.");
      } else {
        ctx.notes.push("Trend did not match this action.");
      }
    }
  },
  {
    id: "cleanup-complaint",
    name: "Cleanup Complaint",
    icon: "🗑️",
    description: "Neighbors complain about post-event waste.",
    apply(ctx, input) {
      if (input.state.ownedUpgrades.cleanup) {
        ctx.notes.push("Cleanup crew prevented complaints.");
      } else {
        ctx.reputationDelta -= 10;
        ctx.notes.push("No cleanup team: reputation -10.");
      }
    }
  },
  {
    id: "cultural-feature",
    name: "Cultural Feature",
    icon: "📰",
    description: "A local channel highlights your cultural impact.",
    apply(ctx, input) {
      if (input.action.category === "Culture") {
        ctx.appealDelta += 8;
        ctx.notes.push("Culture spotlight raised appeal +8.");
      } else {
        ctx.notes.push("No culture action selected this round.");
      }
    }
  }
];

function createInitialState() {
  return {
    round: 1,
    maxRounds: 3,
    budget: 1000,
    totalRevenue: 0,
    totalSpent: 0,
    appeal: 36,
    reputation: 38,
    lastAttendance: 300,
    jobsCreated: 0,
    attendanceHistory: [],
    selectedActionId: null,
    activeCategory: "All",
    usedEventIds: [],
    roundLog: [],
    gameOver: false,
    categoryPicks: { Culture: 0, Commerce: 0, Logistics: 0, Marketing: 0 },
    ownedUpgrades: { canopies: false, security: false, permit: false, cleanup: false }
  };
}

let state = createInitialState();

const elements = {
  body: document.body,
  statsBar: document.querySelector(".stats-bar"),
  actionsSection: document.getElementById("actionsSection"),
  tabs: document.getElementById("tabs"),
  cardsGrid: document.getElementById("cardsGrid"),
  confirmBtnMobile: document.getElementById("confirmBtn"),
  confirmBtnDesktop: document.getElementById("confirmBtnDesktop"),
  detailsBtn: document.getElementById("detailsBtn"),
  navActionsBtn: document.getElementById("navActionsBtn"),
  navDetailsBtn: document.getElementById("navDetailsBtn"),
  navResultsBtn: document.getElementById("navResultsBtn"),
  roundHint: document.getElementById("roundHint"),
  detailsSheet: document.getElementById("detailsSheet"),
  detailsBackdrop: document.getElementById("detailsBackdrop"),
  closeDetailsBtn: document.getElementById("closeDetailsBtn"),
  roundLogDesktop: document.getElementById("roundLogDesktop"),
  roundLogMobile: document.getElementById("roundLogMobile"),
  eventRevealDesktop: document.getElementById("eventRevealDesktop"),
  eventRevealMobile: document.getElementById("eventRevealMobile"),
  eventTitleDesktop: document.getElementById("eventTitleDesktop"),
  eventDescDesktop: document.getElementById("eventDescDesktop"),
  eventImpactDesktop: document.getElementById("eventImpactDesktop"),
  eventTitleMobile: document.getElementById("eventTitleMobile"),
  eventDescMobile: document.getElementById("eventDescMobile"),
  eventImpactMobile: document.getElementById("eventImpactMobile"),
  upgradesListDesktop: document.getElementById("upgradesListDesktop"),
  upgradesListMobile: document.getElementById("upgradesListMobile"),
  toastContainer: document.getElementById("toastContainer"),
  resultsScreen: document.getElementById("resultsScreen"),
  confettiLayer: document.getElementById("confettiLayer"),
  restartBtn: document.getElementById("restartBtn"),
  counters: {
    budget: document.getElementById("budgetValue"),
    revenue: document.getElementById("revenueValue"),
    appeal: document.getElementById("appealValue"),
    reputation: document.getElementById("reputationValue"),
    attendance: document.getElementById("attendanceValue"),
    jobs: document.getElementById("jobsValue"),
    round: document.getElementById("roundValue")
  },
  report: {
    spent: document.getElementById("reportSpent"),
    revenue: document.getElementById("reportRevenue"),
    net: document.getElementById("reportNet"),
    attendance: document.getElementById("reportAttendance"),
    jobs: document.getElementById("reportJobs"),
    social: document.getElementById("reportSocial"),
    badges: document.getElementById("badges"),
    feedbackList: document.getElementById("feedbackList")
  }
};

function getConfirmButtons() {
  return [elements.confirmBtnMobile, elements.confirmBtnDesktop].filter(Boolean);
}

function init() {
  renderTabs();
  renderCards();
  renderRoundLog();
  renderUpgrades();
  updateStats(true);
  updateRoundHint();
  updateConfirmButton();
  updateResultsButton();
  wireEvents();
  setupMobileStatsCompaction();
}

function wireEvents() {
  elements.tabs.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button || state.gameOver) {
      return;
    }
    state.activeCategory = button.dataset.category;
    renderTabs();
    renderCards();
  });

  elements.cardsGrid.addEventListener("click", (event) => {
    const card = event.target.closest(".action-card");
    if (!card || state.gameOver) {
      return;
    }

    createRipple(card, event);

    const action = ACTIONS.find((item) => item.id === card.dataset.id);
    if (!action) {
      return;
    }

    if (action.cost > state.budget) {
      card.classList.add("shake");
      setTimeout(() => card.classList.remove("shake"), 320);
      showToast("Not enough budget!", "error");
      return;
    }

    state.selectedActionId = action.id;
    syncSelectedCard();
    updateRoundHint();
    updateConfirmButton();
  });

  getConfirmButtons().forEach((button) => {
    button.addEventListener("click", handleConfirmRound);
  });
  elements.detailsBtn.addEventListener("click", openDetailsSheet);
  elements.navDetailsBtn.addEventListener("click", openDetailsSheet);
  elements.closeDetailsBtn.addEventListener("click", closeDetailsSheet);
  elements.detailsBackdrop.addEventListener("click", closeDetailsSheet);

  elements.navActionsBtn.addEventListener("click", () => {
    closeDetailsSheet();
    elements.actionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  elements.navResultsBtn.addEventListener("click", () => {
    if (!state.gameOver) {
      return;
    }
    showResults();
  });

  elements.restartBtn.addEventListener("click", resetGame);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDetailsSheet();
    }
    if (event.key === "Enter" && !state.gameOver) {
      handleConfirmRound();
    }
  });
}

function setupMobileStatsCompaction() {
  let ticking = false;

  const updateCompactState = () => {
    const isMobileViewport = window.matchMedia("(max-width: 759px)").matches;
    const shouldCompact = isMobileViewport && window.scrollY > 28;
    elements.statsBar.classList.toggle("mobile-collapsed", shouldCompact);
  };

  const onScroll = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(() => {
      updateCompactState();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateCompactState);
  updateCompactState();
}

function openDetailsSheet() {
  elements.detailsBackdrop.hidden = false;
  elements.detailsSheet.classList.add("open");
  elements.detailsBackdrop.classList.add("show");
  elements.detailsSheet.setAttribute("aria-hidden", "false");
  elements.body.classList.add("no-scroll");
}

function closeDetailsSheet() {
  elements.detailsSheet.classList.remove("open");
  elements.detailsBackdrop.classList.remove("show");
  elements.detailsSheet.setAttribute("aria-hidden", "true");
  elements.body.classList.remove("no-scroll");
  setTimeout(() => {
    if (!elements.detailsBackdrop.classList.contains("show")) {
      elements.detailsBackdrop.hidden = true;
    }
  }, 220);
}

function renderTabs() {
  const categories = ["All", ...new Set(ACTIONS.map((item) => item.category))];
  elements.tabs.innerHTML = categories
    .map((category) => {
      const activeClass = state.activeCategory === category ? "active" : "";
      return `<button class="tab-btn ${activeClass}" data-category="${category}" role="tab" aria-selected="${state.activeCategory === category}">${category}</button>`;
    })
    .join("");
}

function renderCards() {
  const filtered = state.activeCategory === "All"
    ? ACTIONS
    : ACTIONS.filter((item) => item.category === state.activeCategory);

  elements.cardsGrid.innerHTML = filtered.map(createCardHtml).join("");
  syncSelectedCard();
}

function createCardHtml(action) {
  const disabled = action.cost > state.budget;
  const selected = state.selectedActionId === action.id;
  const disabledClass = disabled ? "disabled" : "";
  const selectedClass = selected ? "selected" : "";
  const needText = disabled ? `Need ${formatMoney(action.cost - state.budget)} more` : "";
  const categoryClass = action.category.toLowerCase();

  return `
    <article class="action-card ${disabledClass} ${selectedClass}" data-id="${action.id}" data-category="${action.category}" tabindex="0" aria-label="${action.name}">
      <div class="card-top ${categoryClass}">
        <div class="card-title-wrap">
          <span class="card-icon" aria-hidden="true">${action.icon}</span>
          <h3 class="card-name">${action.name}</h3>
        </div>
        <span class="card-tag">${action.category}</span>
      </div>
      <div class="card-finance">
        <div class="finance-pill cost">
          <span>Cost</span>
          <strong>${formatMoney(action.cost)}</strong>
        </div>
        <div class="finance-pill revenue">
          <span>Base Revenue</span>
          <strong>${formatMoney(action.baseRevenue)}</strong>
        </div>
      </div>
      <div class="card-deltas">
        <span class="delta appeal"><span>Appeal</span><strong>${formatSigned(action.appealDelta)}</strong></span>
        <span class="delta rep"><span>Reputation</span><strong>${formatSigned(action.reputationDelta)}</strong></span>
        <span class="delta jobs"><span>Jobs</span><strong>${formatSigned(action.jobsDelta)}</strong></span>
      </div>
      <div class="card-foot">
        ${disabled ? `<p class="need-note">${needText}</p>` : '<p class="tap-note">Tap to select</p>'}
        <span class="selected-badge">Selected</span>
      </div>
    </article>
  `;
}

function syncSelectedCard() {
  const cards = elements.cardsGrid.querySelectorAll(".action-card");
  cards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.id === state.selectedActionId);
  });
}

function updateRoundHint() {
  if (state.gameOver) {
    elements.roundHint.textContent = "Game complete. View results or restart.";
    return;
  }
  if (!state.selectedActionId) {
    elements.roundHint.textContent = `Choose exactly one action card for Round ${state.round}.`;
    return;
  }
  const selected = ACTIONS.find((item) => item.id === state.selectedActionId);
  elements.roundHint.textContent = `Round ${state.round}: ready to launch ${selected.name}.`;
}

function updateConfirmButton() {
  const buttons = getConfirmButtons();

  if (state.gameOver) {
    buttons.forEach((button) => {
      button.disabled = true;
      button.textContent = "Festival Complete";
    });
    return;
  }

  if (!state.selectedActionId) {
    buttons.forEach((button) => {
      button.disabled = false;
      button.textContent = `Confirm Round ${state.round} Choice`;
    });
    return;
  }

  const selected = ACTIONS.find((item) => item.id === state.selectedActionId);
  buttons.forEach((button) => {
    button.disabled = false;
    button.textContent = `Confirm: ${selected.name}`;
  });
}

function updateResultsButton() {
  elements.navResultsBtn.disabled = !state.gameOver;
}

function handleConfirmRound() {
  if (state.gameOver) {
    return;
  }
  if (!state.selectedActionId) {
    showToast("Pick one card before confirming.", "error");
    getConfirmButtons().forEach((button) => {
      button.classList.add("shake");
      setTimeout(() => button.classList.remove("shake"), 330);
    });
    return;
  }

  const action = ACTIONS.find((item) => item.id === state.selectedActionId);
  if (!action) {
    return;
  }

  if (action.cost > state.budget) {
    showToast("Not enough budget!", "error");
    return;
  }

  applyRound(action);
}

function applyRound(action) {
  state.budget -= action.cost;
  state.totalSpent += action.cost;
  state.appeal = clamp(state.appeal + action.appealDelta, 0, 100);
  state.reputation = clamp(state.reputation + action.reputationDelta, 0, 100);
  state.jobsCreated += action.jobsDelta;
  state.categoryPicks[action.category] += 1;

  if (action.upgradeKey) {
    state.ownedUpgrades[action.upgradeKey] = true;
  }

  const event = drawEvent();
  const context = {
    attendance: computeAttendance(),
    eventMultiplier: 1,
    bonusRevenue: 0,
    penaltyCost: 0,
    appealDelta: 0,
    reputationDelta: 0,
    notes: []
  };

  event.apply(context, { state, action });

  state.appeal = clamp(state.appeal + context.appealDelta, 0, 100);
  state.reputation = clamp(state.reputation + context.reputationDelta, 0, 100);
  context.attendance = Math.max(80, Math.round(context.attendance));
  state.lastAttendance = context.attendance;

  if (context.penaltyCost > 0) {
    state.budget -= context.penaltyCost;
    state.totalSpent += context.penaltyCost;
  }

  const revenueMultiplier = 1 + context.attendance / 2000;
  const roundRevenue = Math.max(
    0,
    Math.round(action.baseRevenue * revenueMultiplier * context.eventMultiplier + context.bonusRevenue)
  );

  state.totalRevenue += roundRevenue;
  state.budget += roundRevenue;
  state.attendanceHistory.push(context.attendance);

  state.roundLog.unshift({
    round: state.round,
    actionName: action.name,
    actionIcon: action.icon,
    eventName: event.name,
    eventIcon: event.icon,
    attendance: context.attendance,
    revenue: roundRevenue,
    totalCost: action.cost + context.penaltyCost,
    notes: context.notes.join(" ")
  });

  revealEvent(event, state.roundLog[0]);
  renderRoundLog();
  renderUpgrades();
  updateStats(false);

  showToast(`${event.icon} ${event.name}: ${context.notes[0] || "Round updated."}`, "info");

  state.selectedActionId = null;

  if (state.round >= state.maxRounds) {
    state.gameOver = true;
    updateRoundHint();
    updateConfirmButton();
    updateResultsButton();
    renderCards();
    closeDetailsSheet();
    setTimeout(showResults, 550);
    return;
  }

  state.round += 1;
  updateRoundHint();
  updateConfirmButton();
  updateResultsButton();
  renderCards();
}

function drawEvent() {
  let pool = EVENTS.filter((event) => !state.usedEventIds.includes(event.id));
  if (pool.length === 0) {
    state.usedEventIds = [];
    pool = [...EVENTS];
  }
  const picked = pool[Math.floor(Math.random() * pool.length)];
  state.usedEventIds.push(picked.id);
  return picked;
}

function computeAttendance() {
  const randomSwing = Math.floor(Math.random() * 101) - 50;
  const baseAttendance = 300;
  return Math.round(baseAttendance + state.appeal * 8 + state.reputation * 5 + randomSwing);
}

function revealEvent(event, roundResult) {
  const title = `${event.icon} ${event.name}`;
  const description = event.description;
  const impact = `${roundResult.notes} Attendance ${roundResult.attendance.toLocaleString()} | Revenue ${formatMoney(roundResult.revenue)}`;

  elements.eventTitleDesktop.textContent = title;
  elements.eventDescDesktop.textContent = description;
  elements.eventImpactDesktop.textContent = impact;

  elements.eventTitleMobile.textContent = title;
  elements.eventDescMobile.textContent = description;
  elements.eventImpactMobile.textContent = impact;

  [elements.eventRevealDesktop, elements.eventRevealMobile].forEach((node) => {
    if (!node) {
      return;
    }
    node.classList.remove("reveal");
    void node.offsetWidth;
    node.classList.add("reveal");
  });
}

function renderRoundLog() {
  const html = state.roundLog.length === 0
    ? '<li class="empty">Your round history will appear here.</li>'
    : state.roundLog.map((entry) => {
      const delta = entry.revenue - entry.totalCost;
      return `
        <li>
          <p class="log-title">Round ${entry.round}: ${entry.actionIcon} ${entry.actionName}</p>
          <p class="log-line">Event: ${entry.eventIcon} ${entry.eventName}</p>
          <p class="log-line">Attendance ${entry.attendance.toLocaleString()} | Revenue ${formatMoney(entry.revenue)} | Net ${delta >= 0 ? "+" : ""}${formatMoney(delta)}</p>
        </li>
      `;
    }).join("");

  elements.roundLogDesktop.innerHTML = html;
  elements.roundLogMobile.innerHTML = html;
}

function renderUpgrades() {
  const html = UPGRADE_META.map((upgrade) => {
    const active = state.ownedUpgrades[upgrade.key];
    return `<li class="${active ? "active" : "inactive"}">${upgrade.icon} ${upgrade.name}: ${active ? "Owned" : "Not owned"}</li>`;
  }).join("");

  elements.upgradesListDesktop.innerHTML = html;
  elements.upgradesListMobile.innerHTML = html;
}

function updateStats(initial) {
  animateCounter(elements.counters.budget, state.budget, formatMoney, initial ? 0 : 450);
  animateCounter(elements.counters.revenue, state.totalRevenue, formatMoney, initial ? 0 : 450);
  animateCounter(elements.counters.appeal, state.appeal, formatPlain, initial ? 0 : 420);
  animateCounter(elements.counters.reputation, state.reputation, formatPlain, initial ? 0 : 420);
  animateCounter(elements.counters.attendance, state.lastAttendance, formatPlain, initial ? 0 : 460);
  animateCounter(elements.counters.jobs, state.jobsCreated, formatPlain, initial ? 0 : 450);

  const roundLabel = `${Math.min(state.round, state.maxRounds)}/${state.maxRounds}`;
  if (elements.counters.round.textContent !== roundLabel) {
    elements.counters.round.textContent = roundLabel;
    elements.counters.round.classList.remove("counter-pop");
    void elements.counters.round.offsetWidth;
    elements.counters.round.classList.add("counter-pop");
  }
}

function animateCounter(element, target, formatter, duration) {
  const start = Number(element.dataset.value ?? target);
  const end = Number(target);

  if (duration <= 0 || Math.abs(end - start) < 1) {
    element.dataset.value = String(end);
    element.textContent = formatter(end);
    return;
  }

  const begin = performance.now();

  function tick(now) {
    const progress = Math.min((now - begin) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (end - start) * eased;
    element.textContent = formatter(value);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    element.dataset.value = String(end);
    element.textContent = formatter(end);
    element.classList.remove("counter-pop");
    void element.offsetWidth;
    element.classList.add("counter-pop");
  }

  requestAnimationFrame(tick);
}

function showResults() {
  const avgAttendance = state.attendanceHistory.length
    ? Math.round(state.attendanceHistory.reduce((sum, n) => sum + n, 0) / state.attendanceHistory.length)
    : 0;
  const netImpact = state.totalRevenue - state.totalSpent;

  elements.report.spent.textContent = formatMoney(state.totalSpent);
  elements.report.revenue.textContent = formatMoney(state.totalRevenue);
  elements.report.net.textContent = formatMoney(netImpact);
  elements.report.attendance.textContent = avgAttendance.toLocaleString();
  elements.report.jobs.textContent = String(state.jobsCreated);
  elements.report.social.textContent = `${Math.round(state.appeal)} / ${Math.round(state.reputation)}`;

  renderBadges(avgAttendance, netImpact);
  renderFeedback(avgAttendance, netImpact);

  elements.resultsScreen.classList.add("show");
  elements.resultsScreen.setAttribute("aria-hidden", "false");

  if (netImpact > 0) {
    launchConfetti();
    showToast("Festival ended in profit. Great finish!", "success");
  } else {
    showToast("Festival closed with losses. Try a new strategy.", "error");
  }
}

function renderBadges(avgAttendance, netImpact) {
  const badges = [];

  if (avgAttendance >= 780) {
    badges.push({ name: "Tourism Magnet", tone: "good" });
  }

  if (state.reputation >= 70 && state.categoryPicks.Culture + state.categoryPicks.Logistics >= 2) {
    badges.push({ name: "Community Builder", tone: "good" });
  }

  if (netImpact >= 500) {
    badges.push({ name: "Profit Pro", tone: "good" });
  }

  if (state.reputation < 40 || netImpact < 0) {
    badges.push({ name: "Needs Planning", tone: "bad" });
  }

  if (!badges.length) {
    badges.push({ name: "Steady Organizer", tone: "warn" });
  }

  elements.report.badges.innerHTML = badges.map((badge) => `<span class="badge ${badge.tone}">${badge.name}</span>`).join("");
}

function renderFeedback(avgAttendance, netImpact) {
  const notes = [];

  if (state.categoryPicks.Culture >= 2) {
    notes.push("Cultural investments raised your appeal and kept attendance momentum high.");
  }

  if (state.categoryPicks.Commerce >= 2) {
    notes.push("Commerce-heavy rounds converted visitor interest into stronger revenue.");
  }

  if (state.ownedUpgrades.security || state.ownedUpgrades.cleanup || state.ownedUpgrades.permit) {
    notes.push("Operational upgrades reduced event risk and stabilized trust.");
  }

  if (avgAttendance < 650) {
    notes.push("Attendance stayed modest; pair marketing with culture earlier.");
  }

  if (state.reputation < 50) {
    notes.push("Reputation dipped in key moments, so logistics cards should come sooner.");
  }

  if (netImpact > 0) {
    notes.push("Positive net impact shows balanced planning and timing.");
  }

  while (notes.length < 2) {
    notes.push("A mixed strategy can create safer upside in short festivals.");
  }

  elements.report.feedbackList.innerHTML = notes.slice(0, 3).map((item) => `<li>${item}</li>`).join("");
}

function launchConfetti() {
  const colors = ["#f75158", "#ffd166", "#06d6a0", "#118ab2", "#ff8fab", "#f7b801"];
  elements.confettiLayer.innerHTML = "";

  for (let i = 0; i < 72; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 1.6}s`;
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    elements.confettiLayer.appendChild(piece);
  }

  setTimeout(() => {
    elements.confettiLayer.innerHTML = "";
  }, 4500);
}

function resetGame() {
  state = createInitialState();

  elements.resultsScreen.classList.remove("show");
  elements.resultsScreen.setAttribute("aria-hidden", "true");
  elements.confettiLayer.innerHTML = "";

  setEventWaitingState();
  closeDetailsSheet();

  renderTabs();
  renderCards();
  renderRoundLog();
  renderUpgrades();
  updateStats(true);
  updateRoundHint();
  updateConfirmButton();
  updateResultsButton();

  showToast("New festival run started.", "success");
}

function setEventWaitingState() {
  const title = "Waiting for your move";
  const description = "After you confirm an action, a random event will trigger.";
  const impact = "No effect yet.";

  elements.eventTitleDesktop.textContent = title;
  elements.eventDescDesktop.textContent = description;
  elements.eventImpactDesktop.textContent = impact;

  elements.eventTitleMobile.textContent = title;
  elements.eventDescMobile.textContent = description;
  elements.eventImpactMobile.textContent = impact;

  elements.eventRevealDesktop.classList.remove("reveal");
  elements.eventRevealMobile.classList.remove("reveal");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 260);
  }, 2200);
}

function createRipple(card, event) {
  const rect = card.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 520);
}

function formatMoney(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${Math.abs(rounded).toLocaleString()}`;
}

function formatPlain(value) {
  return String(Math.round(value));
}

function formatSigned(value) {
  const rounded = Math.round(value);
  return `${rounded >= 0 ? "+" : ""}${rounded}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

setEventWaitingState();
init();
