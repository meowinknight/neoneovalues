let questionsByCategory = {}; 
let categoryOrder = ["economics", "resource_management", "culture", "authority", "nation", "foreign", "technology", "social_control", "territorial_organization"]; 
let currentCategoryIndex = 0; 
let currentQuestions = {}; 
let results = {}; 
// MOD: navigation history for the "Previous question" button
let answerHistory = []; // entries: { catIndex, nodeId }
let currentNodeId = null;

// MOD: "redo one category" mode (quiz.html?redo=<category>&r=<existing results>)
const quizParams = new URLSearchParams(window.location.search);
const redoCategory = quizParams.get('redo');
let originalResultsParam = quizParams.get('r');
if (redoCategory && categoryOrder.includes(redoCategory)) {
  try { results = JSON.parse(originalResultsParam || '{}') || {}; } catch (e) { results = {}; }
  if (typeof nvSanitizeResults === 'function') results = nvSanitizeResults(results);
  categoryOrder = [redoCategory];
}

function showRedoBanner() {
  const banner = document.getElementById('redo-banner');
  if (!banner || !(redoCategory && categoryOrder.length === 1)) return;
  const title = (typeof categoryTitles !== 'undefined' && categoryTitles[redoCategory]) || redoCategory.replace(/_/g, ' ');
  banner.innerHTML = '';
  banner.appendChild(document.createTextNode('Changing your ' + title + ' answer \u2014 your other answers are kept. '));
  const cancel = document.createElement('a');
  cancel.href = 'results.html?r=' + (originalResultsParam || '');
  cancel.textContent = 'Cancel';
  banner.appendChild(cancel);
  banner.style.display = 'block';
}

// MOD: files that loaded but are out of date or empty (for example after a partial upload)
function checkSiteFiles() {
  const missing = [];
  if (typeof resultsMapping === 'undefined' || typeof categoryTitles === 'undefined' ||
      typeof labelMapping === 'undefined' || typeof ideologyGroups === 'undefined' ||
      typeof descriptions === 'undefined') missing.push('data.js');
  if (typeof nvMakeOutcomeBox !== 'function' || typeof nvReachableLeaves !== 'function') missing.push('criteria.js');
  if (missing.length && window.nvShowQuizWarning) {   // this list is more precise than the generic notice, so it replaces it
    window.nvShowQuizWarning('Part of the site is missing or out of date (' + missing.join(', ') + '). The quiz still works, ' +
      'but the value previews are off, and your results page needs these files. Upload them again and reload.');
  }
}

function startQuiz(data) {
  questionsByCategory = data;
  checkSiteFiles();
  showRedoBanner();
  startCategory(categoryOrder[currentCategoryIndex]);
}

// MOD: prefer the embedded copy (works when the page is opened straight from disk),
// fall back to fetching the JSON when served over http(s).
if (window.NV_QUESTIONS_TREE) {
  startQuiz(window.NV_QUESTIONS_TREE);
} else {
  fetch('questions_tree.json')
    .then(res => res.json())
    .then(startQuiz)
    .catch(err => {
      document.getElementById('question').innerText =
        'Could not load the questions. Open the quiz through a web server, or make sure questions_tree.js is present.';
      console.error(err);
    });
}

function loadCategory(category) {
  currentQuestions = {};
  questionsByCategory[category].forEach(q => currentQuestions[q.id] = q);
}

function startCategory(category) {
  loadCategory(category);
  const firstId = questionsByCategory[category][0].id;
  currentNodeId = firstId;
  renderNode(currentQuestions[firstId]);
}

// MOD: step back one question (also works across category boundaries)
function goBack() {
  if (answerHistory.length === 0) return;
  const prev = answerHistory.pop();
  currentCategoryIndex = prev.catIndex;
  // forget results of this category and any later one, they will be re-answered
  categoryOrder.forEach((c, i) => { if (i >= prev.catIndex) delete results[c]; });
  loadCategory(categoryOrder[currentCategoryIndex]);
  currentNodeId = prev.nodeId;
  renderNode(currentQuestions[prev.nodeId]);
}

function selectOption(nextId) {
  const category = categoryOrder[currentCategoryIndex];
  const node = currentQuestions[nextId];
  answerHistory.push({ catIndex: currentCategoryIndex, nodeId: currentNodeId });
  if (!node.options) {
    results[category] = node.id;
    currentCategoryIndex++;
    if (currentCategoryIndex < categoryOrder.length) {
      startCategory(categoryOrder[currentCategoryIndex]);
    } else {
      // MOD: also pass the results in the URL, because localStorage is not shared
      // between pages in some browsers when files are opened straight from disk.
      try { localStorage.setItem('quizResults', JSON.stringify(results)); } catch (e) {}
      window.location.href = 'results.html?r=' + encodeURIComponent(JSON.stringify(results));
    }
  } else {
    currentNodeId = node.id;
    renderNode(node);
  }
}

// MOD: progress indicator ("Category 3 of 9" + a bar), refreshed on every question
function updateProgress(optionCount) {
  const box = document.getElementById('quiz-progress');
  if (!box) return;
  const total = categoryOrder.length;
  const idx = currentCategoryIndex;
  const category = categoryOrder[idx];
  const title = (typeof categoryTitles !== 'undefined' && categoryTitles[category]) || category.replace(/_/g, ' ');
  const questionNumber = answerHistory.filter(h => h.catIndex === idx).length + 1;

  box.textContent = '';

  const top = document.createElement('div');
  top.className = 'nv-progress-top';
  const left = document.createElement('span');
  left.className = 'nv-progress-title';
  left.textContent = title;
  const right = document.createElement('span');
  right.textContent = (total > 1 ? 'Category ' + (idx + 1) + ' of ' + total + ' \u00B7 ' : '') + 'Question ' + questionNumber;
  top.appendChild(left);
  top.appendChild(right);
  box.appendChild(top);

  const bar = document.createElement('div');
  bar.className = 'nv-progress-bar';
  for (let i = 0; i < total; i++) {
    const seg = document.createElement('span');
    seg.className = i < idx ? 'done' : (i === idx ? 'current' : '');
    bar.appendChild(seg);
  }
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '1');
  bar.setAttribute('aria-valuemax', String(total));
  bar.setAttribute('aria-valuenow', String(idx + 1));
  box.appendChild(bar);

  const hint = document.createElement('div');
  hint.className = 'nv-kbd-hint';
  hint.textContent = 'Tip: press 1\u2013' + optionCount + ' to answer' + (answerHistory.length ? ', \u2190 to go back' : '');
  box.appendChild(hint);

  box.style.display = 'block';
}

// MOD: keyboard shortcuts: number keys pick an answer, left arrow / backspace goes back
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  const tag = ((e.target && e.target.tagName) || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (/^[1-9]$/.test(e.key)) {
    const answers = document.querySelectorAll('#buttons button.nv-answer');
    const target = answers[Number(e.key) - 1];
    if (target) { e.preventDefault(); target.click(); }
  } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
    const prev = document.querySelector('#buttons button.nv-prev');
    if (prev) { e.preventDefault(); prev.click(); }
  }
});

function renderNode(node) {
  const questionEl = document.getElementById('question');
  const buttonsDiv = document.getElementById('buttons');
  buttonsDiv.innerHTML = '';
  questionEl.innerText = node.text || "";
  if (node.options && node.options.length > 3) {
    buttonsDiv.classList.add('multi-column');
  } else {
    buttonsDiv.classList.remove('multi-column');
  }
  node.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'nv-answer';
    const keyBadge = document.createElement('span');
    keyBadge.className = 'nv-key';
    keyBadge.setAttribute('aria-hidden', 'true');
    keyBadge.textContent = String(node.options.indexOf(opt) + 1);
    btn.appendChild(keyBadge);
    const textSpan = document.createElement('span');
    textSpan.className = 'nv-answer-text';
    textSpan.innerText = opt.text;
    btn.appendChild(textSpan);
    // MOD: show the icon + name of the value(s) this answer leads to.
    // If the helper files did not load, skip the previews instead of hiding the answers.
    try {
      const outcomeBox = nvMakeOutcomeBox(nvReachableLeaves(currentQuestions, opt.next));
      if (outcomeBox) btn.appendChild(outcomeBox);
    } catch (err) { /* previews are optional */ }
    if (opt.color) btn.style.backgroundColor = opt.color;
    btn.onclick = () => selectOption(opt.next);
    buttonsDiv.appendChild(btn);
  });
  // MOD: Previous question button (hidden on the very first question)
  if (answerHistory.length > 0) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'nv-prev';
    prevBtn.innerText = '\u2190 Previous question';
    prevBtn.onclick = goBack;
    buttonsDiv.appendChild(prevBtn);
  }
  try { updateProgress(node.options.length); } catch (err) { /* the progress bar is optional */ }
}
