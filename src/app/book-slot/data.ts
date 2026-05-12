export const SOCIETIES = [
  {id:1,name:"Prestige Lakeside Habitat", city:"Whitefield",    units:850,  hobbies:6},
  {id:2,name:"Brigade Metropolis",        city:"Marathahalli",  units:1200, hobbies:5},
  {id:3,name:"Sobha Dream Acres",         city:"Panathur",      units:2400, hobbies:7},
  {id:4,name:"Embassy Springs",           city:"Devanahalli",   units:600,  hobbies:4},
  {id:5,name:"Godrej Splendour",          city:"Whitefield",    units:940,  hobbies:5},
  {id:6,name:"Purva Panorama",            city:"Sarjapur Road", units:780,  hobbies:6},
  {id:7,name:"Salarpuria Sattva Senorita",city:"Hebbal",        units:1100, hobbies:4},
];

export const HOBBIES = [
  {id:1, emoji:"💃", name:"Classical Dance",    cat:"Performing Arts", tutors:2, rating:"4.8", age:"5+ yrs", desc:"Bharatanatyam & Kathak with certified instructors. Build grace, rhythm and cultural connect.", slots:14, new:true,  hot:false, col:["#1a0d2e","#2a1040"]},
  {id:2, emoji:"🎸", name:"Guitar",             cat:"Music",           tutors:1, rating:"4.6", age:"5+ yrs",   desc:"Western & Carnatic guitar from beginner to advanced. Learn theory, chords and solos.",            slots:9,  new:false, hot:false, col:["#0d1a0d","#142214"]},
  {id:3, emoji:"🧘", name:"Yoga & Mindfulness", cat:"Fitness",         tutors:2, rating:"4.9", age:"All ages",  desc:"Hatha & Vinyasa flows guided by certified yoga instructors. Suitable for all fitness levels.",    slots:18, new:true,  hot:true,  col:["#0d1a2e","#102035"]},
  {id:4, emoji:"🎨", name:"Sketching & Drawing",cat:"Visual Arts",     tutors:1, rating:"4.5", age:"5+ yrs",   desc:"Pencil sketching, charcoal art, cartooning & watercolour basics with a seasoned artist.",        slots:7,  new:false, hot:false, col:["#2e1a0d","#3a2210"]},
  {id:5, emoji:"🥋", name:"Karate",             cat:"Fitness",         tutors:1, rating:"4.7", age:"5+ yrs", desc:"Shotokan karate from a certified black belt. Discipline, focus and fitness all in one class.",    slots:11, new:false, hot:false, col:["#1a0d0d","#2a1515"]},
  {id:6, emoji:"🎹", name:"Keyboard & Piano",   cat:"Music",           tutors:1, rating:"4.6", age:"5+ yrs",   desc:"Western classical and Bollywood film music on keyboard. All beginners welcome.",                  slots:6,  new:false, hot:false, col:["#0d0d2e","#101035"]},
  {id:7, emoji:"🎭", name:"Theatre & Drama",    cat:"Performing Arts", tutors:1, rating:"4.7", age:"5+ yrs", desc:"Improv, scripted drama and stage confidence workshops. Builds communication and creativity.",     slots:8,  new:false, hot:true,  col:["#1a1a0d","#252510"]},
  {id:8, emoji:"📸", name:"Photography",        cat:"Visual Arts",     tutors:1, rating:"4.5", age:"5+ yrs",  desc:"DSLR & mobile photography basics, composition rules, and light editing techniques.",              slots:5,  new:false, hot:false, col:["#0a1520","#0e1e2a"]},
  {id:9, emoji:"🇫🇷",name:"French Language",   cat:"Language",        tutors:1, rating:"4.6", age:"5+ yrs",  desc:"Conversational French from A1 level. Great for travel, academics and culture.",                   slots:10, new:false, hot:false, col:["#0d1a2e","#111f35"]},
  {id:10, emoji:"🎤", name:"Vocals",             cat:"Music",           tutors:1, rating:"4.8", age:"5+ yrs",   desc:"Hindustani classical, Western vocals & voice modulation. Build strong vocal foundations.",      slots:12, new:false,  hot:false, col:["#2e0d1a","#35102a"]},
];

export const TUTORS: Record<number, any[]> = {
  1:[{name:"Priya Sharma",  emoji:"👩",    exp:"8 yrs",  rating:"4.9", bio:"Natyashastra-certified, trained under Kalakshetra",             visitDays:[0,2,4]},
     {name:"Meena Pillai",  emoji:"👩‍🦱", exp:"6 yrs",  rating:"4.7", bio:"Kathak specialist with 200+ students trained",                  visitDays:[1,3,5]}],
  2:[{name:"Karthik Raj",   emoji:"👨‍🎤", exp:"10 yrs", rating:"4.6", bio:"Berklee graduate, teaches Western & Carnatic guitar",            visitDays:[0,2,4,6]}],
  3:[{name:"Ananya Menon",  emoji:"🧘‍♀️",exp:"7 yrs",  rating:"4.9", bio:"200-hr RYT certified, specialises in therapeutic yoga",         visitDays:[0,1,3,5]},
     {name:"Suresh Kumar",  emoji:"🧘",    exp:"5 yrs",  rating:"4.8", bio:"Vinyasa & Power Yoga, 300+ hrs training",                       visitDays:[2,4,6]}],
  4:[{name:"Ravi Illustra", emoji:"👨‍🎨", exp:"9 yrs",  rating:"4.5", bio:"Fine arts graduate, featured in 3 city exhibitions",            visitDays:[1,3,5]}],
  5:[{name:"Sensei Madan",  emoji:"🥋",   exp:"15 yrs", rating:"4.8", bio:"3rd-degree black belt, state-level Karate champion",            visitDays:[0,2,4]}],
  6:[{name:"Lisa D'Souza",  emoji:"🎹",   exp:"12 yrs", rating:"4.7", bio:"Trinity College certified, teaches classical & film music",      visitDays:[1,3,5,6]}],
  7:[{name:"Amar Theatrics",emoji:"🎭",   exp:"7 yrs",  rating:"4.7", bio:"NSD alumnus, conducted workshops in 8 schools",                 visitDays:[0,2,4]}],
  8:[{name:"Shreya Lens",   emoji:"📸",   exp:"5 yrs",  rating:"4.5", bio:"Award-winning photojournalist & hobbyist instructor",           visitDays:[1,3,5]}],
  9:[{name:"Sophie Martin", emoji:"🇫🇷",  exp:"8 yrs",  rating:"4.6", bio:"Native French speaker from Lyon; Alliance Française certified", visitDays:[0,2,4,6]}],
  10:[{name:"Rahul Sharma", emoji:"👨‍🎤", exp:"6 yrs", rating:"4.8", bio:"Trained in Hindustani classical and light vocals, performed in multiple state shows.", visitDays:[0,1,3,5]}],
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAYS_FULL  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const START = new Date(2026,4,12); // Mon 12 May 2026

export function generateWeek(offsetWeeks: number = 0) {
  return DAYS_SHORT.map((d,i)=>{
    const dt = new Date(START); 
    dt.setDate(START.getDate() + (offsetWeeks * 7) + i);
    return {short:d, full:DAYS_FULL[i], num:dt.getDate(), mon:MONTHS[dt.getMonth()], label:`${DAYS_FULL[i]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]}`, date: dt};
  });
}

export const WEEK = generateWeek(0);

export function buildSlots(visitDays: number[], dayIdx: number) {
  const visit = visitDays.includes(dayIdx);
  return [
    {band:"Morning", slots:[
      {time:"10:00 AM", end:"10:45 AM", type:visit?"soc":"avail", label:visit?"Your society":"Available"},
      {time:"11:00 AM", end:"11:45 AM", type:visit?"soc":"avail", label:visit?"Your society":"Available"}
    ]},
    {band:"Afternoon", slots:[
      {time:"12:00 PM", end:"12:45 PM", type:visit?"soc":"avail", label:visit?"Your society":"Available"},
      {time:"01:00 PM", end:"01:45 PM", type:visit?"soc":"avail", label:visit?"Your society":"Available"},
      {time:"02:00 PM", end:"02:45 PM", type:visit?"soc":"avail", label:visit?"Your society":"Available"},
      {time:"03:00 PM", end:"03:45 PM", type:visit?"avail":"blocked", label:visit?"Available":"Booked"},
      {time:"04:00 PM", end:"04:45 PM", type:visit?"avail":"blocked", label:visit?"Available":"Booked"}
    ]},
    {band:"Evening", slots:[
      {time:"05:00 PM", end:"05:45 PM", type:"avail", label:"Available"},
      {time:"06:00 PM", end:"06:45 PM", type:"avail", label:"Available"},
      {time:"07:00 PM", end:"07:45 PM", type:"avail", label:"Available"},
      {time:"08:00 PM", end:"08:45 PM", type:"avail", label:"Available"}
    ]},
  ];
}

export function countAvailForDay(hobbyId: number, dayIdx: number){
  const tutors = TUTORS[hobbyId]||[];
  let a=0,s=0;
  tutors.forEach(t=>{
    buildSlots(t.visitDays, dayIdx).forEach(band=>{
      band.slots.forEach(sl=>{
        if(sl.type==="avail") a++;
        if(sl.type==="soc")   s++;
      });
    });
  });
  return {avail:a, soc:s, total:a+s};
}
