/*
  AI Widget configuration — constants, idle texts, placeholder pool.
  Populates the window.UbAI namespace consumed by ai-worker-fetch.js,
  ai-worker-typewriter.js, and ai-worker-client.js.
*/
(function () {
  var U = window.UbAI = window.UbAI || {};

  // Internal flag: controls whether model-returned source titles are rendered
  // under a "Related" heading as search links.
  U.SHOW_MODEL_SOURCES = true;

  // Hard cap on query length sent to the worker.
  U.MAX_QUERY_CHARS = 50;

  // Site root — reuse global __ub_base (always ends with '/').
  var _root = (window.__ub_base || '/').replace(/\/$/, '');
  U.SITE_ROOT = _root;
  U.WIKI_SEARCH_BASE = _root + '/wiki/';

  // Text shown while the worker is processing a query.
  U.LOADING_TEXT = 'Let me look into that real quick...';

  // Text shown when idle mode is active but the input is focused.
  U.IDLE_FOCUSED_TEXT = 'Gtreetings, curious soul. Ask me anything about the secrets of Hyrule. Will I share word or waffle? Tip or trick? Legend or lie? Who knows?';

  // Text shown immediately on blur (before the typewriter picks a new idle text).
  U.IDLE_BLUR_TEXT = 'I shall continue yapping nonsense then...';

  // Text shown immediately after a silence response clears.
  U.IDLE_SILENCE_TEXT = 'Back to nonsense!';

  // Idle texts shown in the output area before any query and after clearing.
  U.IDLE_TEXTS = [
    'So this happens if the Triforce of wisdom gets out of control...',
    'The oracle of secrets should now!',
    'A chosen hero wants to know how to break Hylias creation... What a plot twist!',
    'The flame of curiosity flares so brightly in you... Don\'t burn your Ultrafingers!',
    'The Purah Pad is indexing forbidden knowledge...',
    'Even the Great Deku Tree does not know everything.',
    'The Shiekah are not telling you the whole story...',
    'The Koroks are hiding more than just seeds, it seems.',
    'Somewhere, a Lynel sighs at the audacity of the question.',
    'The Upheaval shook more than just the land - it destabilised the entire collision engine.',
    'Rauru built his kingdom on solid ground. The physics engine, less so.',
    'Hestu rattles his maracas in quiet disapproval of your out-of-bounds vector.',
    'The Sages have convened. They are also confused.',
    'A Bubbulfrog watches from the ceiling, bewildered by your clip angle.',
    'Mineru\'s construct chassis was not stress-tested for these inputs.',
    'The Yiga Clan has stolen the patch notes. Again.',
    'Zelda\'s tears have been weaponised. Impressively.',
    'Ganondorf did not anticipate speedrunners when drafting his evil plan.',
    'Somewhere in the depths, a Construct is still processing your last query.',
    'The ancient Zonai engineers left no documentation. We wrote our own.',
    'A Hinox stirs. It mistakes your Ultrafingers for a threat.',
    'Link has clipped through the floor. Again. He seems used to it.',
    'The Bargainer Statues accept Poes and, apparently, out-of-bounds coordinates.',
    'Josha\'s research notes mention a \'gravity anomaly\'. The community calls it Friday.',
    'Every Stable horse-keeper has witnessed inexplicable things. They stay quiet.',
    'A Talus pauses mid-animation to contemplate your query.',
    'The King of Hyrule left behind six temples and one extremely buggy physics layer.',
    'Robbie\'s Skyview Tower logs contain entries he refuses to discuss.',
    'Underground, the gloom spreads. On the surface, the clipping begins.',
    'Your Ultrafingers are showing. The Great Sky Island trembles.',
    'Sidon offers you a pep talk. It does not resolve the collision mesh.',
    'Tulin rides the wind. You ride the undefined behaviour.',
    'A Silver Moblin has inexplicably been launched into the stratosphere. Business as usual.',
    'The Temple of Time has seen you before. It is not impressed.',
    'Bolson has declined to build a structure capable of withstanding your techniques.',
    'Even the White-Maned Lynel acknowledges: this one hits different.',
    'The Zonai survey team logged this exact anomaly. Filed under \'do not ship\'.',
    'Hudson & Sons Ltd. accepts no liability for constructions used in glitch discovery.',
    'Lurelin Village was rebuilt. The physics budget was not.',
    'The Calamity never dreamed of anything this broken.',
    'A Horriblin clings to the wall and watches your every frame-perfect input.'
  ];

  U.idleText = function () {
    return U.IDLE_TEXTS[Math.floor(Math.random() * U.IDLE_TEXTS.length)];
  };

  // Placeholder pool — randomly sampled each time the widget initialises.
  U.PLACEHOLDERS = [
    'What is Wacko Boingo?',
    'How to trigger a Zuggle?',
    'Where is the Grimoire of Glitchcraft?',
    'Fastest way to Tulin pump?',
    'Explain Recall-Clip simply',
    'How to perform Jump-Slash?',
    'How to do Long Jump?',
    'What causes OOB glitches?',
    'How to trigger Save-Load dupe?',
    'What is Weapon Stacking?',
    'How to Autobuild Cancel?',
    'How to perform Dive Cancel?',
    'How to do Bow Sprinting?',
    'What is Midair Transmutation?',
    'Reproduce Message-Not-Found?',
    'How to trigger Zuggle Overload?',
    'How to do double Tulin boost?',
    'What is Ascend Storage?',
    'How to perform Recall Launch?',
    'How to Weapon State Transfer?',
    'How to cause Infinite Damage?',
    'What is Anti-Gravity Glitch?',
    'How to Scope Render Cancel?',
    'Fix Midair Duplication?',
    'How to Duplicate Equipment?',
    'What breaks minecart rails?',
    'How to trigger Animation Swap?',
    'What is Jumpslash Cancel?',
    'How to cause Collision Launch?',
    'How to avoid Fall Damage?',
    'What is Throw-Tap Sprinting?',
    'How to stack weapons safely?',
    'Use Recall-Clip reliably?',
    'Reproduce Storage Ascend?',
    'What is Bthrow Sprint Trick?',
    'How to trigger Mozdor Jump?',
    'How to perform Air Dupes?',
    'How to transmute Midair Items?',
    'Where to report glitches?'
  ];
})();
