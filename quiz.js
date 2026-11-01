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

function startQuiz(data) {
  questionsByCategory = data;
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
    const textSpan = document.createElement('span');
    textSpan.className = 'nv-answer-text';
    textSpan.innerText = opt.text;
    btn.appendChild(textSpan);
    // MOD: show the icon + name of the value(s) this answer leads to
    const leaves = nvReachableLeaves(currentQuestions, opt.next);
    const outcomeBox = nvMakeOutcomeBox(leaves);
    if (outcomeBox) btn.appendChild(outcomeBox);
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
}
