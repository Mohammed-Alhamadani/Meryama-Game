(function(root){
const levels=[
['Little sums','Add within 10','add',10],['Plus and minus','Add and subtract within 20','mixed',20],['Two-digit explorers','Two-digit numbers without carrying or borrowing','tens',99],['Cross the tens','Two-digit addition with carrying','carry',99],['Borrow a ten','Two-digit subtraction with borrowing','borrow',99],['Find x','Missing numbers: x + 5 = 10','missing',20],['Bigger mysteries','Missing numbers with two-digit numbers','missing',99],['Three-number challenge','Add and subtract three numbers','three',99]
].map(([title,description,kind,max])=>({title,description,kind,max}));
for(let table=1;table<=12;table++)levels.push({title:`${table} times table`,description:`Practice ${table} times 1 through 12`,kind:'multiply',max:table*12,table});
function generate(index,random=Math.random){
const s=levels[index],n=(lo,hi)=>lo+Math.floor(random()*(hi-lo+1));
let a,b,c,answer,equation,help,op='+';
if(s.kind==='multiply'){a=s.table;b=n(1,12);answer=a*b;op='\u00d7';equation=`${a} ${op} ${b} = ?`;help=`${a} groups of ${b}: ${Array(a).fill(b).join(' + ')}. Add the groups together.`;}
else if(s.kind==='add'||s.kind==='mixed'){a=n(1,s.max-1);b=n(1,s.max-a);if(s.kind==='mixed'&&random()<.5){a+=b;op='−';}}
else if(s.kind==='tens'){const at=n(1,7),bt=n(1,9-at),au=n(0,9),bu=n(0,9-au);a=at*10+au;b=bt*10+bu;if(random()<.5){a+=b;op='−';}}
else if(s.kind==='carry'){const at=n(1,7),bt=n(1,8-at),au=n(1,9),bu=n(10-au,9);a=at*10+au;b=bt*10+bu;}
else if(s.kind==='borrow'){const at=n(2,9),bt=n(1,at-1),au=n(0,8),bu=n(au+1,9);a=at*10+au;b=bt*10+bu;op='−';}
else if(s.kind==='missing'){const low=s.max===99?10:1;a=n(low,s.max-low);b=n(low,s.max-a);const total=a+b,form=n(0,3);answer=form===2?total:a;equation=[`x + ${b} = ${total}`,`${b} + x = ${total}`,`x − ${b} = ${a}`,`${total} − x = ${b}`][form];help=[`What number added to ${b} makes ${total}? Try ${total} − ${b}.`,`What do you add to ${b} to reach ${total}? Try ${total} − ${b}.`,`Work backwards: add ${b} to ${a}.`,`How much was taken from ${total} to leave ${b}? Try ${total} − ${b}.`][form];}
else{a=n(10,50);b=n(1,25);c=n(1,Math.min(24,a+b));answer=a+b-c;equation=`${a} + ${b} − ${c} = ?`;help=`First find ${a} + ${b}. Then subtract ${c}.`;}
if(answer===undefined){answer=op==='+'?a+b:a-b;equation=`${a} ${op} ${b} = ?`;help=a<20&&b<20?(op==='+'?`Start at ${a} and count ${b} more.`:`Start at ${a} and count back ${b}.`):op==='+'?'Add the ones first, then the tens. Ten ones make one extra ten.':'Subtract the ones first, then the tens. If you need more ones, exchange one ten for ten ones.';}
const pool=Array.from({length:s.max+1},(_,i)=>i).filter(v=>v!==answer),choices=[answer];for(let i=0;i<3;i++)choices.push(pool.splice(n(0,pool.length-1),1)[0]);for(let i=choices.length-1;i>0;i--){const j=n(0,i);[choices[i],choices[j]]=[choices[j],choices[i]];}return{answer,equation,help,choices,a,b,c,op,kind:s.kind};
}
const advance=(level,score)=>score>=4?Math.min(level+1,levels.length-1):level;
root.GardenMath={levels,generate,advance};if(typeof module!=='undefined')module.exports=root.GardenMath;
})(globalThis);
