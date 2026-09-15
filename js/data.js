/* =====================================================================
   DATA — the whole case. Scenes, hotspots, characters, dialogue,
   clues, deductions and the final accusation.
   Step forms used by dialogue/scripts:
     say(who, text)      -> a line of dialogue ('det' = detective, 'narr' = narration)
     clue(id)            -> add a clue to the notebook
     flag(name)          -> set a story flag
     unlock(sceneId)     -> reveal a location on the map
     note(charId, text)  -> add a fact to a suspect's card
     goto(sceneId)       -> travel
   ===================================================================== */
const say = (who, text) => ({ who, text });
const D = (t) => say('det', t);
const N = (t) => say('narr', t);
const clue = (id) => ({ clue: id });
const flag = (f) => ({ flag: f });
const unlock = (s) => ({ unlock: s });
const note = (c, t) => ({ note: [c, t] });
const goto = (s) => ({ goto: s });

const DATA = {};

/* ---------------- CHARACTERS ---------------- */
DATA.characters = {
  det: {
    name: 'Detective Ashcombe', role: 'You',
    look: { skin: '#f0c9a6', top: '#8b6b4a', bottom: '#3d3a5c', coat: '#8b6b4a', hat: 'deerstalker', hatColor: '#5a4a3a', hairStyle: 'short', hair: '#3a2a1a', nose: 'pointy', mouth: 'smirk', brows: 'raised', shape: 'thin', tie: '#c94f5a', notepad: true, arms: ['down', 'chin'] },
  },
  bramble: {
    name: 'Constable Bramble', role: 'Local police, technically',
    look: { skin: '#f3c9a3', top: '#3d3a5c', bottom: '#2b2136', hat: 'helmet', hatColor: '#2b2136', hairStyle: 'short', hair: '#8a6a3a', shape: 'round', cheeks: '#f4a7c1', mouth: 'smile', eyes: 'wide', buttons: true, belt: '#2b2136', nose: 'button', moustache: '#8a6a3a', arms: 'hips' },
    portraitBox: '-80 -365 160 190',
  },
  marigold: {
    name: 'Marigold Finch', role: 'Ticket clerk',
    look: { skin: '#f7d9c4', top: '#f2b134', bottom: '#5a3d7a', cardigan: true, hairStyle: 'bun', hair: '#c9532b', glasses: '#2b2136', cheeks: '#f4a7c1', mouth: 'grin', brows: 'raised', eyes: 'normal', ticketRoll: true, arms: ['down', 'wave'] },
  },
  tobias: {
    name: 'Tobias Crane', role: 'Ride mechanic',
    look: { skin: '#e0b48c', top: '#7a6a5a', overalls: '#3f6f8a', bottom: '#3f6f8a', hat: 'flatcap', hatColor: '#5a4a3a', hairStyle: 'sideburns', hair: '#4a3a2a', beard: '#4a3a2a', shape: 'thin', mouth: 'flat', brows: 'bushy', eyes: 'sleepy', smudge: true, toolbelt: true, nose: 'big', arms: 'fold' },
  },
  reg: {
    name: 'Reginald Bellwether', role: 'Aquarium owner & rival',
    look: { skin: '#f0c9a6', top: '#5a3d7a', bottom: '#3d2b63', coat: '#5a3d7a', tie: '#3f8f8a', hat: 'tophat', hatColor: '#2b2136', hairStyle: 'slick', hair: '#2b2136', moustache: '#2b2136', mouth: 'smirk', brows: 'raised', shape: 'stout', cane: true, nose: 'pointy', arms: ['down', 'down'] },
    portraitBox: '-80 -390 160 210',
  },
  doreen: {
    name: 'Doreen Quill', role: "The victim's sister, co-owner",
    look: { skin: '#f3d0b8', top: '#3f8f8a', bottom: '#3d2b63', shawl: '#5a3d7a', hairStyle: 'bun', hair: '#9a9aa5', brows: 'angry', mouth: 'frown', eyes: 'squint', nose: 'pointy', heels: true, muddy: true, keys: true, belt: '#2b2136', arms: 'fold' },
  },
  pip: {
    name: 'Pip Larkspur', role: 'Teenage ghost hunter',
    look: { skin: '#e8b892', top: '#3f8f8a', bottom: '#2b2136', hat: 'beanie', hatColor: '#c94f5a', headlamp: true, hairStyle: 'wild', hair: '#2b2136', freckles: true, camera: true, mouth: 'grin', eyes: 'wide', brows: 'raised', shape: 'thin', arms: ['down', 'point'] },
  },
  barty: {
    name: 'Bartholomew "Barty" Quill', role: 'The victim. Owner of Marshlight Fair.',
    look: { skin: '#f3c9a3', top: '#c94f5a', bottom: '#3d3a5c', hairStyle: 'wild', hair: '#5a3a2a', mouth: 'grin', eyes: 'normal', shape: 'thin', tie: '#f2b134', arms: 'wave' },
  },
};
Object.values(DATA.characters).forEach(c => { if (c.portraitBox) c.look.portraitBox = c.portraitBox; });

/* ---------------- CLUES ---------------- */
DATA.clues = {
  wraith_poster: { name: 'Wraith Poster', icon: 'poster', text: '"SEE THE MARSH WRAITH! Nightly sightings in the Ghost Train!" Doreen\'s handiwork, by the look of the handwriting. Scrawled at the bottom: "Attendance up 300%".' },
  betting_slips: { name: 'Betting Slips', icon: 'slips', text: 'A wad of losing betting slips stuffed under the ticket counter. Somebody at Marshlight Fair has very expensive luck.' },
  bartys_note: { name: "Barty's Note", icon: 'note', text: '"D — meet me in the tunnel at 9. We need to talk about the future. — B." Found in the victim\'s pocket. Barty was expecting someone.' },
  brass_lantern: { name: 'Brass Lantern', icon: 'lantern', text: "The Wraith's prop lantern, found beside the body. Heavy. Badly dented on one side. The glass pane is brand new — the putty around it is still soft." },
  muddy_footprints: { name: 'Muddy Footprints', icon: 'footprint', text: 'Small, narrow boot prints in the marsh mud, with a horseshoe-shaped heel. They lead from the body straight to the maintenance door.' },
  maint_door: { name: 'Maintenance Door', icon: 'door', text: 'A steel door at the back of the tunnel, locked from the outside. It was not forced. According to the mechanic, only two keys exist.' },
  fog_timer: { name: 'Fog Machine Timer', icon: 'timer', text: 'The fog machine\'s timer was set to start at 21:30 — on a night the fair was closed. Somebody wanted the tunnel full of fog at half past nine.' },
  cut_wire: { name: 'Cut Wire', icon: 'wire', text: 'The tunnel lighting cable, snipped cleanly at the control panel. Whoever did this knew exactly which wire to cut — and had a good pair of cutters.' },
  sales_contract: { name: 'Sales Contract', icon: 'contract', text: 'An agreement to sell Marshlight Fair to Reginald Bellwether, signed by Barty yesterday afternoon. The second signature line — for Doreen — is blank.' },
  hardware_receipt: { name: 'Hardware Receipt', icon: 'receipt', text: 'Pellow Hardware ("Open 6am for the fishing fleet"). Dated this morning, 06:14: one pane of lantern glass, one tin of putty. Found in the caravan\'s bin.' },
  doreen_boots: { name: "Doreen's Boots", icon: 'boots', text: 'A pair of small, narrow boots by the caravan door, caked in fresh marsh mud. The heels are shaped like horseshoes.' },
  key_hook: { name: 'Empty Key Hook', icon: 'hook', text: 'The key board in the caravan. The hook labelled "TUNNEL — MAINT." is empty. Doreen wears a ring of keys on her belt.' },
  tea_sign: { name: 'Tea Room Sign', icon: 'sign', text: '"Lighthouse Tea Room — Open 10am to 8pm SHARP. No exceptions. Yes, that means you." Nobody was eating scones there at ten o\'clock.' },
  reg_alibi: { name: 'Quiz Night Results', icon: 'quiz', text: 'Pinned to the pub door: "WINNERS — The Cephalo-Pods (R. Bellwether). Quiz ran 8pm–11pm." Underneath, scrawled: "M. Finch owes a round."' },
  borrowed_cutters: { name: 'Borrowed Cutters', icon: 'cutters', text: "Tobias's wire cutters are missing from his toolbox. He says Doreen borrowed them last week to \"fix the caravan aerial\" and never returned them." },
  pip_photo: { name: "Pip's Photograph", icon: 'photo', text: 'Taken at 21:41 from the boathouse. A figure stands in the tunnel doorway, lit from below by a lantern. Its shoulders are draped in a fringed shawl.' },
  // conclusions (earned through deductions)
  concl_key: { name: 'The Killer Had a Key', icon: 'key', conclusion: true, text: 'The killer left through a steel door that locks from the outside and was never forced. They did not break in. They let themselves out.' },
  concl_staged: { name: 'A Staged Haunting', icon: 'ghost', conclusion: true, text: 'Fog on a timer, lights cut on purpose. The scene was dressed to look like the Marsh Wraith — by someone who needed the legend to be believed.' },
  concl_motive: { name: 'A Motive to Stay', icon: 'money', conclusion: true, text: 'Selling the fair would have killed the Wraith attraction and everything it brought in. Someone had every reason to stop the sale — permanently.' },
  concl_alibi: { name: 'A Broken Alibi', icon: 'clock', conclusion: true, text: 'Doreen claims she was at the tea room until ten. It shuts at eight. She was free at the time of the murder — and "D" was expected in the tunnel at nine.' },
  concl_glass: { name: 'Covering the Blow', icon: 'glass', conclusion: true, text: 'The lantern glass shattered when it struck Barty. Someone came back at dawn, with a key and a new pane, to make the weapon look untouched.' },
};

/* ---------------- SCENES ---------------- */
DATA.scenes = {
  entrance: {
    name: 'Fairground Entrance', mx: 160, my: 300, unlocked: true,
    intro: [
      N('Marshlight Fair. A seaside fairground clinging to the edge of Pellow Marsh like a barnacle that forgot to let go.'),
      N('Last night its owner, Bartholomew Quill, was found dead inside his own Ghost Train.'),
      N('The locals say the Marsh Wraith got him. You say: let\'s have a look.'),
      D('Right then. Nothing like a haunted fairground before breakfast.'),
    ],
    hotspots: [
      { id: 'sign', x: 350, y: 90, w: 260, h: 80, label: 'Fairground sign', act: () => [N('MARSHLIGHT FAIR. Half the bulbs are out. The other half are trying very hard.'), D('Family fun for the whole family. Presumably fewer families now.')] },
      { id: 'poster', x: 700, y: 235, w: 180, h: 105, label: 'Poster board', act: (s) => s.has('wraith_poster') ? [D('"See the Marsh Wraith." Doreen certainly knows how to sell a ghost.')] : [N('A brand-new poster, still smelling of paint.'), D('"SEE THE MARSH WRAITH! Nightly sightings in the Ghost Train!" And in the corner: "Attendance up 300%".'), D('Nothing brings in the crowds like a dead lamplighter. Or, now, a dead owner.'), clue('wraith_poster')] },
      { id: 'counter', x: 84, y: 338, w: 172, h: 34, label: 'Ticket counter', act: (s) => s.has('betting_slips') ? [D('Betting slips. Marigold\'s little hobby.')] : [N('Under the counter, behind the candy floss sticks, a wad of paper.'), D('Betting slips. Lots of them. All losers.'), D('Somebody here has expensive luck.'), clue('betting_slips')] },
      { id: 'bin', x: 892, y: 296, w: 60, h: 90, label: 'Litter bin', act: () => [N('Chip wrappers, a broken kazoo, and a leaflet for Bellwether\'s Aquarium with a moustache drawn on the octopus.'), D('Everyone\'s a critic.')] },
      { id: 'lamp', x: 6, y: 96, w: 46, h: 50, label: 'Lamppost', act: () => [D('Still on in daylight. Someone is not worried about the electric bill.'), D('Or someone is very worried about the dark.')] },
      { id: 'distant', x: 400, y: 240, w: 270, h: 95, label: 'The fair beyond', act: () => [N('Through the gate: the Ghost Train hunches over the rest of the fair like a bad thought.'), D('That\'s where he was found. Might as well start there.')] },
    ],
    characters: [{ id: 'marigold', x: 170, y: 366, scale: .5, facing: 1, behind: 'window', label: 'Talk to Marigold' }],
    exits: [{ to: 'ghosttrain', x: 480, y: 470, dir: 'up', label: 'To the Ghost Train', hx: 400, hy: 420, hw: 160, hh: 100 }, { to: 'pier', x: 920, y: 450, dir: 'right', label: 'To the pier', hx: 880, hy: 400, hw: 80, hh: 120 }],
  },

  ghosttrain: {
    name: 'The Ghost Train', mx: 480, my: 200, unlocked: true,
    intro: [N('A ride built to frighten children. This morning it did rather better than that.'), N('A constable guards the entrance with the posture of a man who has been asked to guard an entrance.')],
    hotspots: [
      { id: 'entrance', x: 400, y: 240, w: 160, h: 170, label: 'Tunnel entrance', act: (s) => s.flag('tunnel_access') ? [goto('tunnel')] : [D('Police tape. The universal sign for "something interesting happened here".'), N('The constable clears his throat meaningfully. You should probably talk to him first.')] },
      { id: 'toolbox', x: 790, y: 430, w: 120, h: 60, label: 'Toolbox', act: (s) => [N('A battered red toolbox. Spanners, tape, a thermos of something brown.'), s.has('cut_wire') ? D('There\'s a shaped gap in the foam where a pair of wire cutters should sit. Tobias might know where they went.') : D('Very orderly. Every tool has a shaped hole in the foam. One of the holes is empty.'), flag('saw_toolbox')] },
      { id: 'hut', x: 200, y: 296, w: 90, h: 106, label: 'Operator\'s hut', act: () => [N('The ride operator\'s hut. A stool, a lever, a crossword, half done.'), D('Seven across: "Spectre (5)". Someone\'s written "DOREEN". Doesn\'t fit.')] },
      { id: 'sign', x: 310, y: 45, w: 340, h: 80, label: 'Ghost Train sign', act: () => [D('GHOST TRAIN. The G flickers. So does the T. It mostly says "HOST RAIN".'), D('Accurate, actually.')] },
      { id: 'dare', x: 555, y: 320, w: 70, h: 45, label: 'Little sign', act: () => [D('"Dare you?" I do, as it happens. It\'s sort of the job.')] },
      { id: 'face', x: 340, y: 170, w: 280, h: 80, label: 'The ghost face', act: () => [N('The building leers. Its eyes glow a sickly green.'), D('Sixty years old and still got it. Unlike its owner.')] },
    ],
    characters: [
      { id: 'bramble', x: 330, y: 500, scale: .82, facing: 1, label: 'Talk to Constable Bramble' },
      { id: 'tobias', x: 720, y: 500, scale: .85, facing: -1, label: 'Talk to Tobias' },
    ],
    exits: [{ to: 'entrance', x: 40, y: 470, dir: 'left', label: 'Back to the entrance', hx: 0, hy: 400, hw: 90, hh: 140 }, { to: 'caravan', x: 920, y: 360, dir: 'right', label: 'Round the back to the caravan', hx: 870, hy: 300, hw: 90, hh: 110, requires: 'caravan' }],
  },

  tunnel: {
    name: 'Inside the Ghost Train', mx: 620, my: 200, unlocked: false, hidden: true,
    intro: [N('Damp. Dark. Cold enough to see your breath. The floor is a shallow lake of marsh water.'), N('Somewhere in the ceiling a speaker still whispers "boooo" on a loop, with no real conviction.'), D('Right. Where did you end up, Barty?')],
    hotspots: [
      { id: 'outline', x: 540, y: 420, w: 140, h: 110, label: 'Chalk outline', act: () => [N('The constable\'s chalk outline. It has, for some reason, been given a little hat.'), D('Barty fell here, face down. Right underneath the Wraith\'s outstretched arm.'), D('Like he\'d walked up to shake its hand.')] },
      { id: 'lantern', x: 660, y: 430, w: 60, h: 70, label: 'Brass lantern', act: (s) => s.has('brass_lantern') ? [D('The Wraith\'s lantern. Heavy enough to do the job, and dented like it did.')] : [N('A brass lantern lies in the mud beside the outline. It usually hangs from the Wraith\'s hand.'), D('Heavy. Dented on one side. And the glass...'), D('The glass is new. The putty hasn\'t even set. Somebody repaired a prop lantern in a flooded tunnel? Odd priorities.'), clue('brass_lantern')] },
      { id: 'shards', x: 645, y: 488, w: 80, h: 22, label: 'Glass shards', act: () => [N('A few slivers of old, yellowed glass glitter in a puddle.'), D('So the original pane did break. Somebody swept up — but not well enough.')] },
      { id: 'footprints', x: 720, y: 370, w: 120, h: 130, label: 'Footprints', act: (s) => s.has('muddy_footprints') ? [D('Small boots. Horseshoe heels. Straight to the maintenance door.')] : [N('Boot prints lead away from the body through the mud.'), D('Small. Narrow. With a heel shaped like a horseshoe. They go straight to the back door and stop.'), D('Barty\'s feet were considerably bigger than this.'), clue('muddy_footprints')] },
      { id: 'door', x: 788, y: 205, w: 96, h: 180, label: 'Maintenance door', act: (s) => s.has('maint_door') ? [D('Locked from outside. Not a scratch on it.')] : [N('A steel door marked MAINTENANCE. You try it. Locked.'), D('No marks around the lock. Nobody forced this.'), D('Whoever left this way locked it behind them. Politely.'), clue('maint_door')] },
      { id: 'panel', x: 145, y: 215, w: 100, h: 225, label: 'Control panel', act: (s) => s.has('cut_wire') ? [D('One clean cut through the lighting cable.')] : [N('The ride\'s control panel. A cable hangs loose, its end shining.'), D('Cut. Cleanly. That\'s the lighting circuit — the mechanic said the lights never go out.'), D('They didn\'t go out. They were put out.'), clue('cut_wire')] },
      { id: 'fog', x: 55, y: 395, w: 130, h: 70, label: 'Fog machine', act: (s) => s.has('fog_timer') ? [D('Timer set for half nine. On a night the fair was shut.')] : [N('The FOG-O-MATIC. Its little display reads 21:30.'), D('A timer. Set to start at half past nine last night. The fair was closed.'), D('Somebody wanted this tunnel full of fog at exactly the wrong time. Or exactly the right one.'), clue('fog_timer')] },
      { id: 'wraith', x: 610, y: 150, w: 180, h: 190, label: 'The Marsh Wraith', act: () => [N('The Wraith sways gently on its wire. Its arm reaches out for a lantern that isn\'t there.'), D('Don\'t look at me like that. I didn\'t take it.'), N('It says "BOO", quietly, without enthusiasm.')] },
      { id: 'cart', x: 370, y: 250, w: 130, h: 110, label: 'Ride cart', act: () => [D('Cart number thirteen. Of course it is.'), N('Someone has left a half-eaten toffee apple on the seat. It may predate the murder. It may predate the fair.')] },
      { id: 'small_sign', x: 640, y: 335, w: 120, h: 30, label: 'Warning sign', act: () => [D('"Do not touch the wraith." Noted. Firmly.')] },
    ],
    characters: [],
    exits: [{ to: 'ghosttrain', x: 480, y: 505, dir: 'down', label: 'Back outside', hx: 400, hy: 470, hw: 160, hh: 70 }],
  },

  pier: {
    name: 'Pellow Pier', mx: 700, my: 90, unlocked: true,
    intro: [N('The pier. Seagulls, salt, and a man in a top hat who very much wants you to notice the top hat.')],
    hotspots: [
      { id: 'pubdoor', x: 712, y: 288, w: 66, h: 104, label: 'Pub door', act: (s) => s.has('reg_alibi') ? [D('Quiz results. Reg won. Marigold lost. Nothing changes.')] : [N('Pinned to the door of the Drowned Duck: last night\'s quiz results.'), D('"WINNERS — The Cephalo-Pods (R. Bellwether). Quiz ran 8pm–11pm." And underneath: "M. Finch owes a round."'), D('So Reg and Marigold were both here till closing. Unless the landlord is in on it, which would be a very committed pub quiz.'), clue('reg_alibi')] },
      { id: 'teasign', x: 516, y: 256, w: 112, h: 90, label: 'Tea room sign', act: (s) => s.has('tea_sign') ? [D('Closes at eight. Sharp. Yes, that means you.')] : [N('A sign for the Lighthouse Tea Room.'), D('"Open 10am to 8pm SHARP. No exceptions. Yes, that means you."'), D('Friendly place. Let\'s remember that closing time.'), clue('tea_sign')] },
      { id: 'aquarium', x: 30, y: 60, w: 300, h: 330, label: 'Bellwether\'s Aquarium', act: () => [N('Seven tanks, one octopus. The octopus is watching you.'), D('A sign in the window: "COMING SOON — THE BELLWETHER MARINE EXPERIENCE. Now with 300% more land."'), D('Someone was very sure of that land.')] },
      { id: 'bench', x: 36, y: 326, w: 130, h: 70, label: 'Bench', act: () => [N('A memorial bench. "For Arthur Quill, who built the Ghost Train with his own hands and lost a thumb doing it."'), D('The Quills take that ride very personally.')] },
      { id: 'telescope', x: 866, y: 264, w: 76, h: 130, label: 'Telescope', act: () => [N('20p for a look. You don\'t have 20p. You look anyway; it\'s broken.'), D('Through the salt-smeared glass: the Ghost Train. The boathouse across the marsh. A very clear line of sight between the two.')] },
      { id: 'lighthouse', x: 840, y: 108, w: 60, h: 155, label: 'Lighthouse', act: () => [D('The lighthouse tea room. Famous for scones and for shutting in your face at eight o\'clock exactly.')] },
      { id: 'gull', x: 420, y: 280, w: 50, h: 40, label: 'Seagull', act: () => [N('The seagull regards you with the cold eye of a creature that has stolen a thousand chips.'), D('You didn\'t see anything, did you? No. Course not.')] },
    ],
    characters: [{ id: 'reg', x: 420, y: 500, scale: .85, facing: 1, label: 'Talk to Reginald' }],
    exits: [{ to: 'entrance', x: 40, y: 470, dir: 'left', label: 'Back to the fair', hx: 0, hy: 400, hw: 90, hh: 140 }],
  },

  caravan: {
    name: "The Quills' Caravan", mx: 380, my: 400, unlocked: false,
    intro: [N('The Quill family caravan doubles as the fair\'s office. It smells of tea, damp and forty years of paperwork.'), N('Doreen Quill stands in the middle of it like she is daring the furniture to move.')],
    hotspots: [
      { id: 'desk', x: 60, y: 270, w: 260, h: 130, label: 'Desk', act: (s) => s.has('sales_contract') ? [D('The sales contract. One signature short of a very different morning.')] : [N('Invoices, a broken stapler, and beneath a tin of biscuits — a thick document with a fancy letterhead.'), D('A contract. "Sale of Marshlight Fair and all lands to R. Bellwether, Esq." Signed by Barty, yesterday afternoon.'), D('Second signature line: "D. Quill, co-owner". Blank.'), D('Barty was selling. And he couldn\'t do it alone.'), clue('sales_contract')] },
      { id: 'bin', x: 552, y: 340, w: 60, h: 65, label: 'Waste bin', act: (s) => s.has('hardware_receipt') ? [D('The hardware receipt. Six fourteen this morning.')] : [N('Teabags, a torn envelope, and a crumpled receipt.'), D('Pellow Hardware, "open 6am for the fishing fleet". This morning, 06:14. One pane of lantern glass. One tin of putty.'), D('Somebody was up very early to mend a very particular lantern.'), clue('hardware_receipt')] },
      { id: 'boots', x: 862, y: 388, w: 96, h: 66, label: 'Muddy boots', act: (s) => s.has('doreen_boots') ? [D('Horseshoe heels. Fresh marsh mud.')] : s.has('muddy_footprints') ? [N('A pair of boots by the door, caked in fresh mud.'), D('Small. Narrow. And those heels — horseshoes. Exactly like the prints in the tunnel.'), D('Whose boots are these, I wonder. Doreen\'s feet look about right.'), clue('doreen_boots')] : [N('A pair of small boots by the door, thick with mud.'), D('Someone\'s been out in the marsh. Which, round here, is everyone.'), flag('saw_boots')] },
      { id: 'keys', x: 640, y: 165, w: 140, h: 100, label: 'Key board', act: (s) => s.has('key_hook') ? [D('One hook empty. TUNNEL — MAINT.')] : [N('A board of labelled hooks. "OFFICE" has a key. "TUNNEL — MAINT." does not.'), D('The spare maintenance key lives here. Or lived here.'), D('Doreen has a whole ring of keys jangling on her belt. Let\'s hope one of them is a coincidence.'), clue('key_hook')] },
      { id: 'photo', x: 118, y: 168, w: 134, h: 104, label: 'Framed photograph', act: () => [N('Barty and Doreen, 1987, in front of the brand-new Ghost Train. Barty is grinning. Doreen is glaring at the camera as if it owes her money.'), D('Some people never change. Some people never change their expression.')] },
      { id: 'coat', x: 806, y: 160, w: 80, h: 190, label: 'Coat rack', act: (s) => [N('A heavy shawl, purple with a long fringe, hangs on the rack.'), s.has('pip_photo') ? D('Fringed. Purple. Just like the shoulders in Pip\'s photograph.') : D('It smells faintly of fog machine. Well — of marsh. Probably marsh.')] },
      { id: 'kettle', x: 396, y: 286, w: 118, h: 116, label: 'Stove & kettle', act: () => [N('The kettle is still warm. Two cups laid out. Only one used.'), D('Habit. Grief. Or she just didn\'t fancy washing up.')] },
      { id: 'window', x: 360, y: 158, w: 240, h: 155, label: 'Window', act: () => [N('The window looks out over the marsh towards the boathouse.'), D('Anyone standing here at night with a lantern would be visible from there. And vice versa.')] },
      { id: 'poster2', x: 658, y: 278, w: 114, h: 74, label: 'Wraith poster', act: () => [D('Another Wraith poster. She\'s got them everywhere. This one has a coffee ring on it.')] },
    ],
    characters: [{ id: 'doreen', x: 700, y: 500, scale: .85, facing: -1, label: 'Talk to Doreen' }],
    exits: [{ to: 'ghosttrain', x: 40, y: 470, dir: 'left', label: 'Back to the Ghost Train', hx: 0, hy: 400, hw: 60, hh: 140 }],
  },

  boathouse: {
    name: 'The Old Boathouse', mx: 620, my: 440, unlocked: false,
    intro: [N('The marsh proper. Reeds, mist, and a boathouse that seems to be standing up out of stubbornness.'), N('Something rustles inside. Something with a headlamp.')],
    hotspots: [
      { id: 'door', x: 738, y: 216, w: 96, h: 126, label: 'Boathouse door', act: (s) => s.flag('pip_out') ? [D('The door hangs open. Pip is outside, so there\'s nobody left in there to hide from me.')] : [D('Hello? Detective Ashcombe. I\'m not the constable.'), say('pip', 'GO AWAY! I\'m not here! This is a recording!'), D('It really isn\'t. I can see your headlamp through the gap.'), say('pip', '...Is he with you? Bramble? He took my goggles.'), D('Just me. No goggles will be harmed.'), N('The door creaks open. A teenager in a beanie emerges, camera first.'), flag('pip_out')] },
      { id: 'tripod', x: 296, y: 336, w: 80, h: 140, label: 'Camera on a tripod', act: () => [N('A serious camera on a not-very-serious tripod, pointed straight across the marsh at the Ghost Train.'), D('Long lens. Timer. Whoever set this up was patient, and hoping for a ghost.')] },
      { id: 'map', x: 848, y: 206, w: 64, h: 78, label: 'Sightings map', act: () => [N('A hand-drawn map, dense with red crosses. "WRAITH SIGHTINGS". Nearly all of them cluster around the Ghost Train.'), D('And nearly all of them are dated after the new posters went up. Funny, that.')] },
      { id: 'boat', x: 118, y: 328, w: 150, h: 115, label: 'Rowing boat', act: () => [N('A rowing boat named "SCEPTIC". It has a leak.'), D('Fitting.')] },
      { id: 'wisps', x: 680, y: 400, w: 100, h: 60, label: 'Marsh lights', act: () => [N('Tiny green lights flicker over the water. Marsh gas, science says.'), D('Science can say what it likes. I\'m still not stepping in there.')] },
      { id: 'reeds', x: 700, y: 380, w: 240, h: 90, label: 'Reeds', act: () => [N('Reeds, mud, and a single lost welly. Nobody\'s.'), D('Every marsh has one.')] },
      { id: 'jetty', x: 420, y: 376, w: 200, h: 76, label: 'Jetty', act: () => [N('From the end of the jetty you can see the Ghost Train\'s back wall — and the little window above the maintenance door.'), D('A lantern in that window would look a lot like a ghost from here.')] },
    ],
    characters: [{ id: 'pip', x: 690, y: 520, scale: .72, facing: -1, label: 'Talk to Pip', requires: 'pip_out' }],
    exits: [{ to: 'entrance', x: 40, y: 470, dir: 'left', label: 'Back to the fair', hx: 0, hy: 400, hw: 90, hh: 140 }],
  },
};

/* ---------------- DIALOGUE ---------------- */
// Each character: greet(state) -> steps; topics[] with condition/ask/reply; present -> map clueId -> steps, default -> steps
DATA.dialogue = {
  bramble: {
    greet: (s) => s.flag('met_bramble') ? [say('bramble', 'Detective! Still here. Still guarding. Still standing up, mostly.')] : [
      say('bramble', 'HALT! Crime scene! Nobody— oh. You\'re the detective.'), say('bramble', 'Ashcombe, is it? They said you\'d have a hat. That is definitely a hat.'), D('Constable Bramble, I presume. What have we got?'), flag('met_bramble')],
    topics: [
      { id: 'body', ask: 'Tell me about the victim.', reply: [
        say('bramble', 'Bartholomew Quill, owner of the fair. Found this morning by the mechanic, face down in the tunnel next to the Wraith.'),
        say('bramble', 'Doctor reckons he died between nine and ten last night. Nasty knock to the head.'),
        say('bramble', 'Oh! He had this in his pocket. I bagged it. Very professional. The bag was for my sandwiches, but still.'),
        D('"D — meet me in the tunnel at 9. We need to talk about the future. — B."'), D('He was meeting someone. Someone beginning with D.'), clue('bartys_note'), note('barty', 'Died between 9 and 10pm from a blow to the head. Had arranged to meet "D" in the tunnel at nine.')] },
      { id: 'wraith', ask: 'What\'s this Marsh Wraith business?', reply: [
        say('bramble', 'Local legend. A drowned lamplighter who walks the marsh with a lantern, looking for his lost light. Very sad. Very good for tourism.'),
        say('bramble', 'Doreen — that\'s the sister — put it on all the posters. Business tripled. Then Barty turns up dead under the Wraith and now everyone\'s saying the legend\'s come true.'),
        say('bramble', 'Between you and me, I don\'t believe in ghosts. I believe in overtime.')] },
      { id: 'family', ask: 'Who else is around?', reply: [
        say('bramble', 'Barty ran the fair with his sister Doreen. She\'s in the family caravan, round the back of the Ghost Train. Took it badly.'),
        say('bramble', 'Well. Took it dramatically. Lot of shouting about the Wraith. Threw a teapot at the mechanic.'),
        say('bramble', 'Then there\'s Marigold on the tickets, Tobias the mechanic — that\'s him by the toolbox — and Mr. Bellwether from the aquarium, who keeps coming over to say how sorry he is and how much land there is.'),
        unlock('caravan'), note('doreen', 'The victim\'s sister and co-owner. Lives in the caravan behind the Ghost Train. Very loud about the Wraith.')] },
      { id: 'access', ask: 'Can I look inside the tunnel?', reply: (s) => s.flag('tunnel_access') ? [say('bramble', 'In you go. Mind the puddles. And the Wraith. And the smell.')] : [
        say('bramble', 'Inside? The tunnel? It\'s a crime scene. There\'s tape. I put the tape up myself.'),
        D('And I am a detective, and you would like to sit down.'),
        say('bramble', '...I would like to sit down.'),
        say('bramble', 'Go on then. Don\'t touch the Wraith. It\'s got a temper and a very loose arm.'), flag('tunnel_access')] },
    ],
    present: {
      bartys_note: [say('bramble', 'D, yes. Could be Doreen. Could be... David? Do we have a David?'), D('We do not have a David.'), say('bramble', 'Shame. Would have wrapped it up nicely.')],
      concl_alibi: [say('bramble', 'She said the tea room till ten? Mrs. Pargeter shuts that place at eight like it\'s a bank vault. I\'ve been thrown out mid-scone.')],
      doreen_boots: [say('bramble', 'Horseshoe heels! Like the prints! I noticed those prints. I put a little hat on the outline too, did you see?')],
      default: [say('bramble', 'I\'ll note that down. Do you have a pen? I\'ve lost my pen. I think the Wraith took it.')],
    },
  },

  marigold: {
    greet: (s) => s.flag('met_marigold') ? [say('marigold', 'Detective! Still no tickets, I\'m afraid. Still very much closed. Still very much a murder.')] : [
      say('marigold', 'Welcome to Marshlight Fair! Tickets are— oh. Oh no. We\'re closed. Because of the... you know.'), D('The murder.'), say('marigold', 'I was going to say "the dying" but yes. That.'), flag('met_marigold')],
    topics: [
      { id: 'lastnight', ask: 'Where were you last night?', reply: [
        say('marigold', 'I locked the booth at six and went straight to the Drowned Duck. Pub quiz night! I was there till they threw us out.'),
        say('marigold', 'Ask anyone. Ask Reg Bellwether — he was on the winning team. He always is. It\'s insufferable.'), flag('marigold_pub'), note('marigold', 'Says she was at the Drowned Duck pub quiz from six until closing.')] },
      { id: 'barty', ask: 'What was Barty like?', reply: [
        say('marigold', 'Barty was lovely. Scatterbrained, but lovely. He once gave a whole school trip free candy floss because a child said the Wraith looked "a bit sad".'),
        say('marigold', 'Lately he\'d been quiet, though. Kept having long chats with Mr. Bellwether. Doreen HATED that. You could hear her from the booth.'), note('doreen', 'Was furious about Barty\'s talks with Bellwether, according to Marigold.')] },
      { id: 'wraith', ask: 'Tell me about the Wraith.', reply: [
        say('marigold', 'Oh, the Wraith\'s been brilliant for business. Doreen\'s idea. Ever since the posters went up we\'ve had ghost hunters, school trips, a man from a magazine...'),
        say('marigold', 'And a kid. Pip something. Sneaks around the marsh at night with a camera, "documenting". Hangs about the old boathouse. I let them in the side gate. Doreen chases them off with a broom.'),
        D('A witness with a camera. My favourite kind.'), unlock('boathouse'), note('pip', 'A teenage ghost hunter who watches the Ghost Train at night from the old boathouse.')] },
      { id: 'slips', ask: 'About these betting slips...', condition: (s) => s.has('betting_slips'), reply: [
        say('marigold', 'Those are... mine. Yes. I have a small... hobby. A hobby that has cost me approximately one small car.'),
        say('marigold', 'Barty knew. He said he\'d help me sort it out, take it out of my wages a bit at a time. He was kind like that.'),
        D('And now he\'s gone, so is the debt?'), say('marigold', 'Detective! ...Well. Yes. But I\'d rather have Barty. I mean that.'), note('marigold', 'Has gambling debts. Barty knew and was quietly helping her.')] },
    ],
    present: {
      betting_slips: [say('marigold', 'Where did you— under the counter? I\'m an idiot. Yes, they\'re mine. I was at the pub all night losing MORE money if that helps.')],
      sales_contract: [say('marigold', 'He was SELLING? To Bellwether? Oh, Doreen must have gone absolutely spare. She\'d rather burn it down than sell it.')],
      reg_alibi: [say('marigold', '"M. Finch owes a round." I do, as well. I always do.')],
      pip_photo: [say('marigold', 'That\'s Pip\'s photo! Did they show you? They were SO excited. Is that... is that a shawl?')],
      default: [say('marigold', 'Hmm. I mostly sell tickets, Detective. And occasionally candy floss. This is neither.')],
    },
  },

  tobias: {
    greet: (s) => s.flag('met_tobias') ? [say('tobias', 'Detective.'), N('He nods. It is a whole conversation for Tobias.')] : [
      say('tobias', 'You the detective? I found him. Barty.'), say('tobias', 'I\'m not talking about that bit.'), D('Fair enough. Let\'s talk about the other bits.'), flag('met_tobias')],
    topics: [
      { id: 'found', ask: 'How did you find him?', reply: [
        say('tobias', 'Came in at seven to grease the rails. Lights were out. They never go out — I check \'em every night. Fog everywhere.'),
        say('tobias', 'And there he was. By the Wraith. Lantern on the floor next to him.'),
        say('tobias', 'That lantern hangs off the Wraith\'s arm on a hook. It doesn\'t fall by itself. Somebody took it down.'), note('tobias', 'Found the body at 7am. Says the lights never go out on their own.')] },
      { id: 'barty', ask: 'What was Barty like as a boss?', reply: [
        say('tobias', 'Good boss. Bad with money. Kept the rides running on hope and gaffer tape.'),
        say('tobias', 'Doreen\'s the one with the head for business. And the temper. Threw a teapot at me this morning. Full one.'), note('doreen', 'Runs the money side. Has a temper — threw a full teapot at Tobias.')] },
      { id: 'door', ask: 'About the maintenance door.', condition: (s) => s.has('maint_door'), reply: [
        say('tobias', 'That door\'s always locked. Two keys in the world.'), N('He jangles his belt.'), say('tobias', 'Mine. And the spare, in the office. On the hook by Doreen\'s desk.'),
        D('And your key was with you all night?'), say('tobias', 'On my belt. In my bed. With me. Ask my cat.'), note('tobias', 'Has one of two maintenance keys. The other lives on the hook in the caravan.')] },
      { id: 'cutters', ask: 'Your wire cutters are missing.', condition: (s) => s.has('cut_wire'), reply: [
        say('tobias', 'My cutters?'), N('He checks the toolbox. His face does something complicated.'),
        say('tobias', 'They\'re not in the box. Doreen borrowed \'em last week. Said the caravan aerial needed fixing.'),
        say('tobias', 'Never gave \'em back. I did ask. Got the look.'), clue('borrowed_cutters'), note('doreen', 'Borrowed Tobias\'s wire cutters last week and never returned them.')] },
      { id: 'fog', ask: 'Who set the fog machine timer?', condition: (s) => s.has('fog_timer'), reply: [
        say('tobias', 'Timer? I never set the timer. It\'s manual. I press the button, fog comes out. Simple.'),
        say('tobias', 'Someone had to open the panel and set it for half nine. On a night we were shut. That\'s just... theatrical.'), D('Somebody wanted a show.')] },
    ],
    present: {
      brass_lantern: [say('tobias', 'Glass is new. Fresh putty. See the fingerprints in it? Rushed job.'), say('tobias', 'I didn\'t do that. I\'d have used the proper stuff and it\'d be straight. That\'s a job done in the dark by someone in a hurry.'), flag('tobias_lantern')],
      hardware_receipt: [say('tobias', 'Pellow Hardware, six in the morning? That\'s the fishermen\'s hour. And Doreen\'s. She\'s up with the tide, always has been.')],
      doreen_boots: [say('tobias', 'Her horseshoe boots. Had \'em made special. "Lucky", she says.'), D('Not for everyone.')],
      borrowed_cutters: [say('tobias', 'Still not back. If you find \'em, they\'re the ones with the red handles.')],
      default: [say('tobias', 'Not my department.')],
    },
  },

  reg: {
    greet: (s) => s.flag('met_reg') ? [say('reg', 'Detective! Back again. The octopus asked after you.')] : [
      say('reg', 'Reginald Bellwether. Bellwether\'s Aquarium. Seven tanks, one octopus, no ghosts.'), say('reg', 'Terrible business, this. Terrible. Poor Barty. Wonderful man. Enormous plot of land.'), D('You got there quickly.'), say('reg', 'I\'m a businessman, Detective. I get everywhere quickly.'), flag('met_reg')],
    topics: [
      { id: 'lastnight', ask: 'Where were you last night?', reply: [
        say('reg', 'Quiz night at the Drowned Duck. My team, the Cephalo-Pods, won again. Naturally.'),
        say('reg', 'I was there from eight until they threw us out at eleven. The landlord will confirm it. Bitterly. He\'s on the losing team.'), note('reg', 'Says he was at the pub quiz from 8pm to 11pm. Results sheet on the pub door agrees.')] },
      { id: 'barty', ask: 'What was your business with Barty?', reply: [
        say('reg', 'The fair sits on prime land, Detective. Sea views. Drainage, eventually. I offered Barty a fair price to expand the aquarium onto it.'),
        say('reg', 'He was warming to it. Debts, you see. Doreen was not warming to it. Doreen was, if anything, cooling.'), note('reg', 'Wanted to buy the fair\'s land to expand the aquarium. Barty was tempted; Doreen refused.')] },
      { id: 'contract', ask: 'Tell me about the contract.', condition: (s) => s.has('sales_contract'), reply: [
        say('reg', 'Ah. You found it. Yes — Barty signed yesterday afternoon in my office. Shook my hand. Cried a bit. Ate four biscuits.'),
        say('reg', 'Doreen was meant to sign too — co-owner. She told me, and I quote, she\'d "sooner feed me to the octopus".'),
        say('reg', 'Barty said he\'d talk her round that evening. Take her somewhere quiet. Explain.'), D('Somewhere quiet. Like a tunnel.'), flag('reg_contract'), note('doreen', 'Refused to sign the sale. Barty planned to "talk her round" the evening he died.')] },
      { id: 'wraith', ask: 'Do you believe in the Wraith?', reply: [
        say('reg', 'A drowned lamplighter? Please. The only thing haunting this pier is Doreen\'s marketing budget.'),
        say('reg', 'Though I\'ll admit — every poster she puts up, the land gets more expensive. Ghosts are terrible for negotiations.')] },
      { id: 'marigold', ask: 'Was Marigold at the quiz?', condition: (s) => s.flag('marigold_pub'), reply: [
        say('reg', 'Marigold? Yes, all night. Lost badly. Bought a round anyway. Good sort, dreadful at geography.'), note('marigold', 'Reg confirms she was at the pub quiz all night.')] },
    ],
    present: {
      sales_contract: [say('reg', 'My contract! Well, Barty\'s. Well — half of Barty\'s. Without Doreen\'s signature it\'s a very expensive coaster.'), D('So his death doesn\'t help you.'), say('reg', 'Detective, his death is a catastrophe for me. She\'ll never sell now. She\'ll be buried in that Ghost Train.')],
      wraith_poster: [say('reg', '"Attendance up 300%." She wrote that herself. In felt tip. There was no attendance survey.')],
      betting_slips: [say('reg', 'Marigold\'s? Poor thing. She bet on the octopus to predict the football. The octopus has never once been right.')],
      default: [say('reg', 'I sell fish tickets, Detective. Not... whatever this is.')],
    },
  },

  doreen: {
    greet: (s) => s.flag('met_doreen') ? [say('doreen', 'You again. Have you arrested the Wraith yet?')] : [
      say('doreen', 'So you\'re the detective. Come to gawp at the grieving sister?'), say('doreen', 'My brother was taken by the Wraith. Everyone knows it. Put that in your little book.'), D('I\'ll put it next to the other things.'), flag('met_doreen')],
    topics: [
      { id: 'lastnight', ask: 'Where were you last night?', reply: [
        say('doreen', 'I was at the Lighthouse Tea Room until ten o\'clock. Scones. Then straight home to bed.'), say('doreen', 'I didn\'t see Barty at all. I wish I had.'), flag('doreen_alibi'), note('doreen', 'Claims she was at the Lighthouse Tea Room until 10pm.')] },
      { id: 'barty', ask: 'Tell me about your brother.', reply: [
        say('doreen', 'Barty was soft. Kind, if you like that sort of thing. He\'d have sold this fair to that fish-peddler for a handful of shells and a thank-you.'),
        say('doreen', 'This place is our family. Our father built the Ghost Train with his own hands. Lost a thumb doing it.'), say('doreen', 'You don\'t sell your father\'s thumb, Detective.')] },
      { id: 'wraith', ask: 'The Marsh Wraith.', reply: [
        say('doreen', 'The Wraith is real. My grandmother saw it. And ever since I put it on the posters, this fair has been ALIVE again.'),
        say('doreen', 'Forty years of history. Coach parties. A magazine. I won\'t have it turned into a fish tank.'), note('doreen', 'Created the Wraith campaign. Says it brought the fair back to life.')] },
      { id: 'lantern', ask: 'About the Wraith\'s lantern.', condition: (s) => s.has('brass_lantern'), reply: [
        say('doreen', 'The lantern? It\'s a prop. Sixty years old. If it broke, it broke.'), D('It didn\'t break. Somebody mended it. This morning.'), say('doreen', 'Then somebody is very handy. I wouldn\'t know.')] },
      { id: 'tearoom', ask: 'The tea room shuts at eight.', condition: (s) => s.has('tea_sign') && s.flag('doreen_alibi'), reply: [
        say('doreen', 'The tea room... closes at eight? Well. Perhaps I lost track of the time.'), say('doreen', 'Perhaps it was a different night. Are you accusing me of eating scones INACCURATELY?'), D('Among other things.'), note('doreen', 'Her tea room alibi collapses: the tea room shuts at eight.')] },
      { id: 'contract', ask: 'Barty signed a sales contract.', condition: (s) => s.has('sales_contract'), reply: [
        say('doreen', 'Where did you— that\'s PRIVATE.'), say('doreen', 'Barty signed nothing that counts. It needed BOTH signatures. Mine isn\'t on it and it never will be.'), D('And now it never needs to be.'), say('doreen', '...Get out of my caravan, Detective.'), N('You do not get out of her caravan.')] },
      { id: 'note', ask: 'Barty wrote a note to "D".', condition: (s) => s.has('bartys_note'), reply: [
        say('doreen', 'D could mean anything. Dad. Dog. Doorknob.'), D('Did you have a dog, Ms. Quill?'), say('doreen', 'We had a doorknob.')] },
    ],
    present: {
      hardware_receipt: [say('doreen', 'A receipt for lantern glass? Anyone could have dropped that in my bin. Do you know how many people come through this caravan?'), D('How many?'), say('doreen', '...Several.')],
      doreen_boots: [say('doreen', 'My boots are muddy because I live next to a MARSH, Detective. Everyone\'s boots are muddy.'), D('Everyone\'s heels aren\'t horseshoes.'), say('doreen', 'They\'re lucky.')],
      pip_photo: [say('doreen', 'That photograph shows nothing. A shadow. A... shawl? Half the county wears shawls.'), D('Half the county wasn\'t standing in your brother\'s Ghost Train at twenty to ten.')],
      bartys_note: [say('doreen', 'D could mean anything. Dad. Dog. Doorknob.')],
      key_hook: [say('doreen', 'The spare key? It\'s on my belt. Where it always is. I am the OWNER. I have keys to things.')],
      borrowed_cutters: [say('doreen', 'The aerial needed doing. I\'ll give them back when I\'m finished.'), D('Finished with what?'), say('doreen', 'The aerial.')],
      concl_alibi: [say('doreen', 'So I got my times wrong. Grief does that. Or so I\'m told.')],
      concl_key: [say('doreen', 'Two keys. Tobias has one. Perhaps you should be bothering Tobias.')],
      wraith_poster: [say('doreen', 'That poster paid for the new roof on the hook-a-duck. Don\'t sneer at it.')],
      sales_contract: [say('doreen', 'Half a contract is no contract. Now put it back in my desk.')],
      default: [say('doreen', 'Fascinating. Is there a point?')],
    },
  },

  pip: {
    greet: (s) => s.flag('met_pip') ? [say('pip', 'Detective! Any ghosts? Any leads? Any goggles?')] : [
      say('pip', 'You\'re not the constable. Good. He confiscated my night-vision goggles.'), say('pip', 'They were just swimming goggles with a torch taped on. But still. Principle.'), D('Pip Larkspur, I take it. Ghost hunter.'), say('pip', 'Paranormal investigator. It\'s on my business cards. I have four.'), flag('met_pip')],
    topics: [
      { id: 'lastnight', ask: 'Where were you last night?', reply: [
        say('pip', 'Here. All night. Camera on the tripod, pointed at the Ghost Train. Waiting for the Wraith.'), say('pip', 'And I GOT it. 9:41pm. A glowing figure in the tunnel doorway. Totally real. Totally spooky. Totally going on my blog.'), note('pip', 'Photographed a "glowing figure" in the tunnel doorway at 9:41pm.')] },
      { id: 'photo', ask: 'Can I see the photograph?', condition: (s) => !s.has('pip_photo'), reply: [
        say('pip', 'Absolutely not. It\'s an EXCLUSIVE. "Marsh Wraith: CONFIRMED." Fourteen subscribers are waiting.'),
        D('What if I told you the Wraith was a person?'), say('pip', 'I\'d say prove it, Detective. Bring me evidence and I\'ll think about it.'), flag('pip_wants_proof')] },
      { id: 'wraith', ask: 'Tell me about the Wraith.', reply: [
        say('pip', 'Drowned lamplighter. Walks the marsh with a lantern looking for his lost light. Everyone here is too scared to look for him.'), say('pip', 'Not me. I have a headlamp.'), D('Bold strategy.')] },
      { id: 'sneaking', ask: 'You\'ve been sneaking around.', reply: [
        say('pip', 'I\'m not sneaking. I\'m INVESTIGATING. Like you, but younger and with better equipment.'), say('pip', 'Marigold lets me in the side gate. Doreen chases me off with a broom. She\'s got a good arm for a woman who claims to be "very frail".')] },
    ],
    present: {
      fog_timer: 'proof', cut_wire: 'proof', concl_staged: 'proof', borrowed_cutters: 'proof',
      wraith_poster: [say('pip', 'I\'ve got three of those on my wall. The middle one is signed.')],
      pip_photo: [say('pip', 'It\'s a good photo, isn\'t it? Shame about the ghost being, you know. A person.')],
      brass_lantern: [say('pip', 'THE lantern. The Wraith\'s lantern. It\'s dented! Did the Wraith dent it? Do ghosts dent?')],
      default: [say('pip', 'Is that haunted? No? Then I\'m not interested.')],
    },
    proof: (s) => s.has('pip_photo') ? [say('pip', 'I know, I know. Fog machine. Wire cutters. My ghost is a fraud.')] : [
      say('pip', 'The fog was on a TIMER? And someone cut the lights on purpose?'), N('Pip\'s face goes through several stages of grief in about four seconds.'),
      say('pip', 'So my Wraith is... a person. With a lantern. In fancy dress.'), say('pip', 'Ugh. FINE. Take the photo. Look at it, though — see the shoulders? A shawl. Fringed. Wraiths don\'t wear fringe.'),
      D('Twenty to ten. A lantern. And a shawl.'), clue('pip_photo'), note('pip', 'Handed over the 9:41pm photograph once shown the haunting was staged.')],
  },
};

/* ---------------- DEDUCTIONS ---------------- */
// template: strings and slot indices; answers[i] = correct clue for slot i (array = any of)
DATA.deductions = [
  {
    id: 'd1', title: 'How did Barty die?', question: 'Put the crime scene back together.',
    requires: ['brass_lantern', 'muddy_footprints', 'maint_door'],
    template: ['Barty was struck down with the ', 0, '. The killer then walked away through the flooded floor, leaving ', 1, ', and slipped out through the ', 2, ' — which was locked behind them.'],
    answers: ['brass_lantern', 'muddy_footprints', 'maint_door'],
    result: 'The door was never forced. It locks from the outside. The killer didn\'t break in or out — they let themselves through. <b>The killer had a key.</b>',
    conclusion: 'concl_key',
  },
  {
    id: 'd2', title: 'Why did the tunnel look haunted?', question: 'Fog and darkness on a closed night. Coincidence?',
    requires: ['fog_timer', 'cut_wire'],
    template: ['The fog rolled in because of the ', 0, '. The darkness came from a ', 1, '. Put together, they turned a murder into a ghost story.'],
    answers: ['fog_timer', 'cut_wire'],
    result: 'Somebody set the stage before Barty even arrived. <b>The haunting was staged</b> — by someone who needed the Marsh Wraith to take the blame, and who knew exactly how the ride worked.',
    conclusion: 'concl_staged',
  },
  {
    id: 'd3', title: 'Who needed the Wraith?', question: 'Follow the money. Or the lack of it.',
    requires: ['wraith_poster', 'sales_contract'],
    template: ['The ', 0, ' would have ended Marshlight Fair for good. The ', 1, ' shows who had turned a ghost story into the fair\'s lifeline.'],
    answers: ['sales_contract', 'wraith_poster'],
    result: 'Bellwether wanted land, not a haunted ride — the sale would kill the Wraith attraction. <b>Someone had every reason to stop the sale permanently</b>, and only one person\'s signature stood in its way.',
    conclusion: 'concl_motive',
  },
  {
    id: 'd4', title: 'Who was Barty meeting?', question: 'A note, an alibi, and a closing time.',
    requires: ['bartys_note', 'tea_sign'], requiresFlag: 'doreen_alibi',
    template: ['', 0, ' asked "D" to the tunnel at nine. Doreen swears she was eating scones until ten — but the ', 1, ' says the tea room shut at eight.'],
    answers: ['bartys_note', 'tea_sign'],
    result: 'Doreen lied about where she was. <b>Her alibi is broken</b>, and "D" had an appointment in the tunnel at exactly the time Barty died.',
    conclusion: 'concl_alibi',
  },
  {
    id: 'd5', title: 'Why was the lantern repaired?', question: 'A prop lantern with a brand-new pane.',
    requires: ['brass_lantern', 'hardware_receipt'],
    template: ['The ', 0, ' has fresh glass and soft putty — fitted this morning with the pane on the ', 1, ', bought at 6:14am. Before the body was even found.'],
    answers: ['brass_lantern', 'hardware_receipt'],
    result: 'The old glass shattered when the lantern struck Barty. <b>The killer came back at dawn to hide the weapon in plain sight</b> — someone with a key, an early alarm, and a receipt in their bin.',
    conclusion: 'concl_glass',
  },
];

/* ---------------- ACCUSATION ---------------- */
DATA.accusation = {
  suspects: ['marigold', 'tobias', 'reg', 'doreen', 'pip'],
  culprit: 'doreen',
  wrongSuspect: {
    marigold: 'Marigold was at the pub quiz until eleven. Reg saw her, and the results sheet says she owes a round. Not her.',
    tobias: 'Tobias has a key, true. But he raised the alarm, he has no motive, and the boot prints are half the size of his feet.',
    reg: 'Reg wanted the fair — and Barty was about to hand it to him. Killing Barty is the one thing that ruins his deal.',
    pip: 'Pip was on the far side of the marsh with a camera, photographing the tunnel. The photo proves they were nowhere near it.',
  },
  questions: [
    { q: 'What was the murder weapon?', accept: ['brass_lantern'], wrong: 'No. Barty died from a blow to the head — with something heavy that was lying right beside him.' },
    { q: 'How did Doreen get in and out of a locked tunnel unseen?', accept: ['key_hook', 'concl_key', 'maint_door'], wrong: 'Think about the door at the back. Nobody forced it — so how did they get through?' },
    { q: 'What puts Doreen inside the tunnel that night?', accept: ['doreen_boots', 'pip_photo'], wrong: 'Something physical. Something she wore that matches what was left behind — or was caught on camera.' },
    { q: 'Why did she do it?', accept: ['sales_contract', 'concl_motive'], wrong: 'Follow the money. What was about to happen to the fair that Doreen could not allow?' },
    { q: 'Why did she go back at dawn?', accept: ['hardware_receipt', 'concl_glass'], wrong: 'Something was fixed in that tunnel this morning. What proves she was up early doing it?' },
  ],
  finale: [
    N('Doreen Quill stares at you for a long moment. Somewhere, the Ghost Train whispers "boo".'),
    say('doreen', '...Fine. FINE. He was going to sell it. Our father\'s fair. For a FISH TANK.'),
    say('doreen', 'He asked me to the tunnel to "explain". Explain! He stood there under the Wraith and said it was a silly story and the fair was a silly dream and it was time to grow up.'),
    say('doreen', 'The lantern was just... there. In its hand. And then it was in mine.'),
    D('And afterwards you made it look like the Wraith.'),
    say('doreen', 'Afterwards I thought: if the Wraith did it, people would come. They\'d always come. The fair would live.'),
    say('doreen', 'The glass had gone everywhere. I went back at first light with the spare key and fixed it. Nobody would look twice at a prop.'),
    D('I looked twice.'),
    say('doreen', 'Yes. You did.'),
    D('You killed your brother to save a ghost story, Doreen.'),
    say('doreen', 'I killed him to save the fair. The ghost story was just... marketing.'),
    say('bramble', 'Right! You\'re nicked! ...Is that how it goes? I\'ve never got to say it before.'),
    D('Close enough, Constable.'),
    N('Marshlight Fair reopened the following spring, under new management: a ticket clerk with a business plan and a teenager with fourteen subscribers.'),
    N('The Wraith stayed. It still hangs in the dark, arm outstretched, waiting for its lantern.'),
    N('Evidence, now. Bagged. In a sandwich bag.'),
  ],
};

/* ---------------- HINTS (soft nudges for the Case Notes tab) ---------------- */
DATA.hints = [
  { when: (s) => !s.flag('tunnel_access'), text: 'The constable at the Ghost Train is guarding the crime scene. He might let a detective through — if you ask.' },
  { when: (s) => !s.has('brass_lantern') || !s.has('muddy_footprints') || !s.has('maint_door') || !s.has('fog_timer') || !s.has('cut_wire'), text: 'The tunnel is full of details. Examine everything — the floor, the panel, the machinery, and the back door.' },
  { when: (s) => !s.unlocked('caravan'), text: 'Somebody mentioned the victim\'s family. Ask the constable who else is around.' },
  { when: (s) => !s.has('sales_contract') || !s.has('hardware_receipt') || !s.has('key_hook') || !s.has('doreen_boots'), text: 'The caravan is the fair\'s office. Desks, bins, key boards and doorways all tell stories.' },
  { when: (s) => !s.has('tea_sign') || !s.has('reg_alibi'), text: 'Alibis need checking. Signs and notices on the pier might confirm — or contradict — what people told you.' },
  { when: (s) => !s.unlocked('boathouse'), text: 'Someone with a camera has been watching the fair at night. Marigold knows who.' },
  { when: (s) => !s.has('pip_photo'), text: 'Pip won\'t hand over the photograph until you prove the haunting was faked. Show them what you found in the tunnel.' },
  { when: (s) => !s.has('borrowed_cutters'), text: 'The lighting wire was cut with a good pair of cutters. Ask the mechanic about his.' },
  { when: (s) => !s.flag('doreen_alibi'), text: 'You haven\'t asked Doreen where she was last night.' },
  { when: (s) => DATA.deductions.some(d => !s.solved(d.id)), text: 'Open the Deductions tab. Combine the clues you have to draw conclusions — each one brings you closer to the truth.' },
  { when: () => true, text: 'You have everything you need. Time to make an accusation.' },
];
