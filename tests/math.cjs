const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const math=require('../dist/math.js');
for(let level=0;level<math.levels.length;level++){
 for(let i=0;i<1000;i++){
  const q=math.generate(level);
  assert.equal(new Set(q.choices).size,4);
  assert(q.choices.includes(q.answer));
  assert(q.choices.every(n=>Number.isInteger(n)&&n>=0&&n<=math.levels[level].max));
  const eq=q.equation.replaceAll('\u00d7','*').replaceAll('x',String(q.answer)).replaceAll('?',String(q.answer)).replaceAll('−','-');
  assert(/^[0-9 +*\-=]+$/.test(eq));
  const [left,right]=eq.split('=');
  assert.equal(vm.runInNewContext(left),Number(right),q.equation);
  if(level>=2&&level<=4){assert(q.a>=10&&q.b>=10);}
  if(level===3)assert(q.a%10+q.b%10>=10);
  if(level===4)assert(q.a%10<q.b%10);
  if(level>=8){assert.equal(q.a,level-7);assert(q.b>=1&&q.b<=12);assert.equal(q.answer,q.a*q.b);}
  if(level===2)assert(q.op==='+'?q.a%10+q.b%10<10:q.a%10>=q.b%10);
 }
 assert.equal(math.advance(level,3),level);
 assert.equal(math.advance(level,4),Math.min(level+1,math.levels.length-1));
}
const nodes={};const node=()=>({innerHTML:'',textContent:'',hidden:false,disabled:false,classList:{add(){}}});
let now=0;const timers=new Set();let timerCount=0;
const store={};const context=vm.createContext({Date:{now:()=>now},setInterval:()=>{const id=++timerCount;timers.add(id);return id;},clearInterval:id=>timers.delete(id),GardenMath:math,document:{querySelector:s=>nodes[s]??(nodes[s]=node()),querySelectorAll:()=>[]},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v}});
vm.runInContext(fs.readFileSync(require.resolve('../dist/app.js'),'utf8'),context);
vm.runInContext(`
start(0);
for(let i=0;i<5;i++){check({dataset:{value:current.answer},classList:{add(){}}});if(i<4)question();}
finish();if(savedLevel!==1)throw Error('Did not advance');
start(1);
for(let i=0;i<5;i++){hint();check({dataset:{value:current.answer},classList:{add(){}}});if(i<4)question();}
finish();if(savedLevel!==1)throw Error('Assisted answers advanced');
start(0);independent=0;finish();if(savedLevel!==1)throw Error('Replay reset progress');
start(levels.length-1);independent=5;finish();if(savedLevel!==levels.length-1)throw Error('Final level');
`,context);
assert.equal(store['garden-level'],String(math.levels.length-1));
console.log('Passed: 20,000 equations, level constraints, choices, promotion, hints, saved progress, replay and final level.');

vm.runInContext(`
if([0,1,2,3,4,5].map(gradeFor).join(',')!=='D,C,B,B+,A,A+')throw Error('Grades');
if(formatTime(125000)!=='02:05')throw Error('Time formatting');
for(const kind of ['tens','carry','borrow']){
 const html=renderEquation({kind,a:42,b:15,op:'?'});
 if(!html.includes('vertical-equation')||!html.includes('minus'))throw Error('Vertical rendering');
}
if(renderEquation({kind:'missing',equation:'x + 5 = 10'}).includes('vertical-equation'))throw Error('Missing number layout');
start(2);if(!app.innerHTML.includes('id="timer"'))throw Error('Missing timer display');
`,context);
assert.equal(timers.size,1);
now=65000;
vm.runInContext('updateTimer()',context);
assert.equal(nodes['#timer'].textContent,'Time 01:05');
vm.runInContext('round=4;check({dataset:{value:current.answer},classList:{add(){}}});',context);
assert.equal(timers.size,0);
now=90000;
vm.runInContext('finish()',context);
assert(nodes['#app'].innerHTML.includes('01:05'));
assert(nodes['#app'].innerHTML.includes('grade-badge'));
vm.runInContext('start(0);home()',context);
assert.equal(timers.size,0);
console.log('Passed: vertical layout, grade scale, elapsed timer, stop at last answer, results, exit cleanup.');

vm.runInContext(`
for(let table=1;table<=12;table++){
 showTable(table);
 if(!document.querySelector('#table-facts').innerHTML.includes('<strong>'+table*12+'</strong>'))throw Error('Table chart');
 start(7+table);
 if(current.kind!=='multiply'||current.a!==table)throw Error('Table selection');
}
home();
`,context);
assert.equal(timers.size,0);
console.log('Passed: all 12 table charts and practice selections.');
