import React, { useState, useMemo } from 'react';

const DATA = [
  { id: 1, type: 'phrasal', phrase: 'give up', meaning: 'stop trying / quit', example: 'She gave up smoking last year.', level: 'A2' },
  { id: 2, type: 'phrasal', phrase: 'take off', meaning: 'remove clothing / leave quickly', example: 'The plane took off on time.', level: 'A2' },
  { id: 3, type: 'phrasal', phrase: 'look after', meaning: 'take care of', example: 'Can you look after my dog?', level: 'A2' },
  { id: 4, type: 'phrasal', phrase: 'bring up', meaning: 'mention / raise (a topic) / raise a child', example: "Don't bring up politics at dinner.", level: 'B1' },
  { id: 5, type: 'phrasal', phrase: 'put off', meaning: 'postpone / discourage', example: 'They put off the meeting until Friday.', level: 'B1' },
  { id: 6, type: 'phrasal', phrase: 'run into', meaning: 'meet by chance / encounter', example: 'I ran into an old friend yesterday.', level: 'B1' },
  { id: 7, type: 'phrasal', phrase: 'carry on', meaning: 'continue', example: 'Please carry on with your work.', level: 'A2' },
  { id: 8, type: 'phrasal', phrase: 'break down', meaning: 'stop working / get upset', example: 'Her car broke down on the highway.', level: 'B1' },
  { id: 9, type: 'phrasal', phrase: 'figure out', meaning: 'understand / solve', example: 'We need to figure out a solution.', level: 'B1' },
  { id: 10, type: 'phrasal', phrase: 'set up', meaning: 'arrange / establish', example: 'They set up a new company last month.', level: 'B2' },
  { id: 1001, type: 'idiom', phrase: 'break the ice', meaning: 'do or say something to relieve tension', example: 'A joke at the start of the meeting helped break the ice.', level: 'B1' },
  { id: 1002, type: 'idiom', phrase: 'hit the hay', meaning: 'go to bed', example: "I'm tired — I'm going to hit the hay.", level: 'A2' },
  { id: 1003, type: 'idiom', phrase: 'piece of cake', meaning: 'something very easy', example: 'That test was a piece of cake.', level: 'A2' },
  { id: 1004, type: 'idiom', phrase: 'cost an arm and a leg', meaning: 'very expensive', example: 'Their new car cost an arm and a leg.', level: 'B2' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [count, setCount] = useState(5);
  const [lastPicked, setLastPicked] = useState([]);
  const [mode, setMode] = useState('browse'); // browse | quiz | flashcard
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const levels = useMemo(() => ['A2','B1','B2','C1'], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA.filter(d => {
      if (filterType !== 'all' && d.type !== filterType) return false;
      if (levelFilter !== 'all' && d.level !== levelFilter) return false;
      if (!q) return true;
      return (
        d.phrase.toLowerCase().includes(q) ||
        d.meaning.toLowerCase().includes(q) ||
        d.example.toLowerCase().includes(q)
      );
    });
  }, [query, filterType, levelFilter]);

  function pickRandom() {
    const pool = filtered.length ? filtered : DATA;
    const picks = [];
    const used = new Set();
    for (let i=0;i<Math.min(count,pool.length);i++) {
      let idx, attempts=0;
      do {
        idx = Math.floor(Math.random()*pool.length);
        attempts++;
      } while (used.has(idx) && attempts<100);
      used.add(idx);
      picks.push(pool[idx]);
    }
    setLastPicked(picks);
    setMode('browse');
  }

  function exportCSV(items = lastPicked.length ? lastPicked : filtered) {
    const header = ['Type','Phrase','Meaning','Example','Level'];
    const rows = items.map(i => [i.type,i.phrase,i.meaning,i.example,i.level]);
    const csv = [header, ...rows].map(r => r.map(cell => `"\${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'phrasal_idioms_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function startQuiz() {
    const pool = filtered.length ? filtered : DATA;
    if (!pool.length) return;
    const correct = pool[Math.floor(Math.random()*pool.length)];
    const distractors = [];
    while (distractors.length<3) {
      const d = pool[Math.floor(Math.random()*pool.length)];
      if (d.id !== correct.id && !distractors.find(x => x.id===d.id)) distractors.push(d);
    }
    const options = [...distractors, correct].sort(()=>Math.random()-0.5);
    setQuizQuestion({ prompt: correct.meaning, correctId: correct.id, options });
    setShowAnswer(false);
    setMode('quiz');
  }

  function answerQuiz(id) {
    setShowAnswer(true);
    setLastPicked([DATA.find(d => d.id === id)]);
  }

  function nextFlashcard() {
    const pool = filtered.length ? filtered : DATA;
    if (!pool.length) return;
    const card = pool[Math.floor(Math.random()*pool.length)];
    setLastPicked([card]);
    setMode('flashcard');
    setShowAnswer(false);
  }

  return (
    <div className="container">
      <h1>IELTS Phrasal Verbs & Idioms Generator</h1>

      <div className="controls">
        <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm kiếm phrase / meaning / example" />
        <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="phrasal">Phrasal verbs</option>
          <option value="idiom">Idioms</option>
        </select>
        <select value={levelFilter} onChange={e=>setLevelFilter(e.target.value)}>
          <option value="all">All levels</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <div>
          <label className="muted">Số lượng: </label>
          <input type="number" value={count} min={1} max={20} onChange={e=>setCount(Number(e.target.value))} />
        </div>
      </div>

      <div className="buttons">
        <button className="btn primary" onClick={pickRandom}>Random</button>
        <button className="btn" onClick={()=>{setMode('browse'); setLastPicked([])}}>Clear</button>
        <button className="btn" onClick={startQuiz}>Quiz</button>
        <button className="btn" onClick={nextFlashcard}>Flashcard</button>
        <button className="btn" onClick={()=>exportCSV()}>Export CSV</button>
      </div>

      <div>
        {mode==='quiz' && quizQuestion && (
          <div className="card">
            <div><strong>Quiz — chọn PHRASE phù hợp với nghĩa:</strong></div>
            <div className="muted">"{quizQuestion.prompt}"</div>
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', marginTop:8}}>
              {quizQuestion.options.map(opt => (
                <button key={opt.id} className="btn" onClick={()=>answerQuiz(opt.id)} style={{textAlign:'left'}}>{opt.phrase}</button>
              ))}
            </div>
            {showAnswer && (
              <div style={{marginTop:10}}>
                <strong>Đáp án:</strong>
                {lastPicked[0] && (
                  <div className="item" style={{marginTop:8}}>
                    <div>
                      <div style={{fontWeight:600}}>{lastPicked[0].phrase}</div>
                      <div className="muted">{lastPicked[0].meaning}</div>
                      <div className="example">{lastPicked[0].example}</div>
                    </div>
                  </div>
                )}
                <div style={{marginTop:8}}><button className="btn" onClick={startQuiz}>Next quiz</button></div>
              </div>
            )}
          </div>
        )}

        {mode==='flashcard' && lastPicked[0] && (
          <div className="card">
            <div style={{fontSize:18, fontWeight:600}}>{lastPicked[0].phrase}</div>
            <div className="muted">Level: {lastPicked[0].level} • Type: {lastPicked[0].type}</div>
            {!showAnswer ? (
              <div style={{marginTop:8}}><button className="btn" onClick={()=>setShowAnswer(true)}>Show meaning & example</button></div>
            ) : (
              <div style={{marginTop:8}}>
                <div style={{fontWeight:600}}>Meaning</div>
                <div className="muted">{lastPicked[0].meaning}</div>
                <div className="example">{lastPicked[0].example}</div>
                <div style={{marginTop:8, display:'flex', gap:8}}>
                  <button className="btn" onClick={nextFlashcard}>Next</button>
                  <button className="btn" onClick={()=>exportCSV([lastPicked[0]])}>Export this</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode==='browse' && (
          <div>
            <div className="muted">Results: {filtered.length} items {lastPicked.length ? `(picked ${lastPicked.length})` : ''}</div>
            <div className="grid" style={{marginTop:8}}>
              {(lastPicked.length ? lastPicked : filtered.slice(0,50)).map(item => (
                <div key={item.id} className="item">
                  <div>
                    <div style={{fontWeight:600}}>{item.phrase}</div>
                    <div className="muted">{item.meaning}</div>
                    <div className="example">{item.example}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div className="muted">Type: {item.type}</div>
                    <div className="muted">Level: {item.level}</div>
                    <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:6}}>
                      <button className="btn" onClick={()=>{ setLastPicked([item]); setMode('flashcard'); setShowAnswer(true); }}>Flashcard</button>
                      <button className="btn" onClick={()=>exportCSV([item])}>Export</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer>Tip: use search and filters to focus on phrasal verbs or idioms, then use Quiz or Flashcard mode for practice.</footer>
    </div>
  );
}
