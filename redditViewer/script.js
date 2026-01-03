const postsGrid = document.getElementById("postsGrid");
const sentinel = document.getElementById("sentinel");
const subredditListEl = document.getElementById("subredditList");
const refreshButton = document.getElementById("refreshButton");
const postTemplate = document.getElementById("postCardTemplate");
const manageButton = document.getElementById("manageButton");
const managerOverlay = document.getElementById("managerOverlay");
const managerForm = document.getElementById("managerForm");
const subredditCheckboxes = document.getElementById("subredditCheckboxes");
const addSubredditButton = document.getElementById("addSubreddit");
const newSubredditInput = document.getElementById("newSubreddit");
const closeManager = document.getElementById("closeManager");
const cancelManager = document.getElementById("cancelManager");

let managerSubreddits = [];

const state = {
  subreddits: [],
  cursorBySubreddit: new Map(),
  nextSubredditIndex: 0,
  loading: false,
  managerUsed: false,
};

async function loadSubreddits() {
  try {
    const response = await fetch("subreddits.txt");
    if (!response.ok) throw new Error(`Unable to load subreddits: ${response.status}`);
    const text = await response.text();
    const subs = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    if (!subs.length) throw new Error("No subreddits found in subreddits.txt");
    state.subreddits = subs;
    renderSubredditList();
  } catch (error) {
    subredditListEl.textContent = error.message;
    throw error;
  }
}

function renderSubredditList() {
  subredditListEl.innerHTML = "";
  state.subreddits.forEach((sub) => {
    const pill = document.createElement("span");
    pill.className = "pill";
    pill.textContent = `r/${sub}`;
    subredditListEl.appendChild(pill);
  });
}

function pickNextSubreddit() {
  if (!state.subreddits.length) return null;
  const subreddit = state.subreddits[state.nextSubredditIndex];
  state.nextSubredditIndex = (state.nextSubredditIndex + 1) % state.subreddits.length;
  return subreddit;
}

function buildCard(data) {
  const { subreddit, author, title, permalink, score, num_comments, preview, thumbnail } = data;
  const card = postTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector(".subreddit").textContent = `r/${subreddit}`;
  card.querySelector(".author").textContent = `u/${author}`;
  card.querySelector(".title").textContent = title;
  card.querySelector(".excerpt").textContent = formatExcerpt(data.selftext);
  const thumbEl = card.querySelector(".thumbnail");
  const imageUrl = getImage(preview, thumbnail);
  if (imageUrl) {
    thumbEl.style.backgroundImage = `url(${imageUrl})`;
  } else {
    thumbEl.classList.add("placeholder");
  }
  card.querySelector(".score-value").textContent = Intl.NumberFormat().format(score);
  card.querySelector(".comments-value").textContent = Intl.NumberFormat().format(num_comments);
  const link = card.querySelector(".external");
  link.href = `https://reddit.com${permalink}`;
  link.setAttribute("aria-label", `Open post ${title} on Reddit`);
  return card;
}

function getImage(preview, thumbnail) {
  const previewImage = preview?.images?.[0]?.source?.url?.replace(/&amp;/g, "&");
  if (previewImage && previewImage.startsWith("http")) return previewImage;
  if (thumbnail && thumbnail.startsWith("http")) return thumbnail;
  return null;
}

function formatExcerpt(text) {
  if (!text) return "Link post";
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= 180) return trimmed;
  return `${trimmed.slice(0, 180)}…`;
}

async function loadPostsBatch(batchSize = 9) {
  if (state.loading || !state.subreddits.length) return;
  state.loading = true;
  const posts = [];

  for (let i = 0; i < batchSize; i++) {
    const subreddit = pickNextSubreddit();
    if (!subreddit) break;
    const after = state.cursorBySubreddit.get(subreddit) || "";
    try {
      const resp = await fetch(
        `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=9&raw_json=1&after=${after}`
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      const afterToken = json?.data?.after;
      if (afterToken) state.cursorBySubreddit.set(subreddit, afterToken);
      const children = json?.data?.children || [];
      children.forEach(({ data: post }) => {
        if (!post || post.stickied) return;
        posts.push(post);
      });
    } catch (error) {
      console.error(`Failed to load r/${subreddit}:`, error);
    }
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => fragment.appendChild(buildCard(post)));
  postsGrid.appendChild(fragment);
  state.loading = false;
}

function setupInfiniteScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadPostsBatch();
        }
      });
    },
    {
      rootMargin: "600px 0px",
      threshold: 0,
    }
  );
  observer.observe(sentinel);
}

function resetFeed() {
  state.cursorBySubreddit.clear();
  state.nextSubredditIndex = 0;
  postsGrid.innerHTML = "";
  loadPostsBatch();
}

function handleShuffle() {
  state.subreddits = shuffle([...state.subreddits]);
  renderSubredditList();
  resetFeed();
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function openManager() {
  if (!managerOverlay) return;
  managerSubreddits = [...state.subreddits];
  populateManager();
  managerOverlay.hidden = false;
  newSubredditInput?.focus();
}

function closeManagerOverlay() {
  if (managerOverlay) managerOverlay.hidden = true;
}

function hideManagerButton() {
  if (manageButton) {
    manageButton.style.display = "none";
  }
}

function populateManager() {
  if (!subredditCheckboxes) return;
  subredditCheckboxes.innerHTML = "";
  managerSubreddits.forEach((subreddit) => {
    const id = `sub-${subreddit}`;
    const row = document.createElement("label");
    row.className = "checkbox";
    row.setAttribute("for", id);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.name = "subreddits";
    checkbox.value = subreddit;
    checkbox.checked = true;

    const text = document.createElement("span");
    text.textContent = `r/${subreddit}`;

    row.append(checkbox, text);
    subredditCheckboxes.appendChild(row);
  });
}

function addSubredditFromInput() {
  if (!newSubredditInput) return;
  const value = newSubredditInput.value.trim().replace(/^r\\//i, "");
  if (!value) return;
  const lower = value.toLowerCase();
  const existing = new Set(managerSubreddits.map((s) => s.toLowerCase()));
  if (existing.has(lower)) {
    newSubredditInput.value = "";
    return;
  }
  managerSubreddits.push(value);
  newSubredditInput.value = "";
  populateManager();
}

function handleManagerSubmit(event) {
  event.preventDefault();
  if (!managerForm) return;
  if (newSubredditInput && newSubredditInput.value.trim()) {
    addSubredditFromInput();
  }
  const selected = Array.from(managerForm.elements)
    .filter((el) => el.name === "subreddits" && el.checked)
    .map((el) => el.value)
    .filter(Boolean);

  if (!selected.length) {
    closeManagerOverlay();
    return;
  }

  const unique = Array.from(new Set(selected.map((s) => s.trim()))).filter(Boolean);
  state.subreddits = unique;
  managerSubreddits = unique;
  state.managerUsed = true;
  renderSubredditList();
  resetFeed();
  closeManagerOverlay();
  if (state.managerUsed) hideManagerButton();
}

async function init() {
  try {
    await loadSubreddits();
    await loadPostsBatch();
    setupInfiniteScroll();
  } catch (error) {
    console.error(error);
  }
}

refreshButton.addEventListener("click", handleShuffle);
if (manageButton) manageButton.addEventListener("click", openManager);
if (addSubredditButton) addSubredditButton.addEventListener("click", addSubredditFromInput);
if (closeManager) closeManager.addEventListener("click", closeManagerOverlay);
if (cancelManager) cancelManager.addEventListener("click", closeManagerOverlay);
if (managerForm) managerForm.addEventListener("submit", handleManagerSubmit);

init();
