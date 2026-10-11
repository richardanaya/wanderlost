// One message-bar line at a time. Click the same place again for the next.
// Each line fits the bar (about 78 characters).

const WORLD = {
  grass: [
    "Long grass in green and gold, combed by a wind you can almost name.",
    "White flowers speckle the bank, like a sentence someone left unfinished.",
    "The ground is soft, damp, and entirely sure you should stay awhile."
  ],
  sky: [
    "The sky goes from deep blue down to peach, then a shy strip of rose.",
    "Stars prick through where the day has worn thin.",
    "It is the hour when the world looks finished and about to begin."
  ],
  moon: [
    "A thin moon, bright as a clipped fingernail, hangs in the blue.",
    "It is early for the moon, and the moon does not seem to mind."
  ],
  mountains: [
    "Mountains in layers of violet, each paler, as if remembering the last.",
    "The near ridge is sharp. The farthest is only a rumor of stone.",
    "Pink cloud lies across them like a sash someone forgot to tie."
  ],
  pines: [
    "Pines stand in dark ranks between the water and the mountains.",
    "Their tops take the last peach light. Their trunks are already night."
  ],
  waterfall: [
    "Water leaves the cliff in one white ribbon and never regrets it.",
    "Mist beads on the rock. The pool takes the gift without comment."
  ],
  pool: [
    "The pool is blue-black and bright only where the falls strike it.",
    "Reeds crowd the near stones. The far bank is nothing but pine."
  ],
  bridge: [
    "A short dock of pale planks on posts, crossing to no boat at all.",
    "The wood looks recently sure of itself, and slightly lonely."
  ],
  observatory: [
    "A cedar pavilion on posts, eaves wide, roof tiled against the weather.",
    "Lattice doors are shut. A faint warmth leaks through the squares.",
    "A carved face watches from the gable, calm and a little severe.",
    "Someone built this to watch the sky, then went inside and stayed."
  ],
  tree: [
    "An old tree leans over the well, bark ridged like folded cloth.",
    "One heavy limb keeps the well company. The crown is deep green."
  ],
  path: [
    "Flat blue-gray stones, set one after another through the long grass.",
    "They climb toward the pavilion as if they had an appointment.",
    "Dew is thinking about the edges. The flowers are already there."
  ],
  well: [
    "A round well of cut stone, moss in the joints, rope on the beam.",
    "The bucket is gone. The rope hangs in tired, careful knots.",
    "Ferns grip the rim. Below that, the dark smells like cold iron."
  ],
  mushrooms: [
    "Pale mushrooms stand in the grass, caps like little unlit lamps.",
    "They look edible in the way that dares you. The grass is wiser."
  ],
  roots: [
    "Roots cross the bank like slow lightning, bark split and gold.",
    "They hold the earth the way an old argument holds a family."
  ],
  house: [
    "The little house is quiet tonight.",
    "Cedar boards, warm from the lantern, hold the day's last dust.",
    "Nothing moves but the light, and even the light is patient."
  ],
  beams: [
    "The roof beams cross in dark cedar, high and unhurried.",
    "They have held this quiet longer than the lantern has been lit."
  ],
  jars: [
    "Jars of different heights crowd the high shelf, stoppered and still.",
    "Whatever is in them has agreed to wait."
  ],
  picture: [
    "A small picture hangs beside the lantern: a mountain in a few lines.",
    "It is the same mountain as the window, only older and flatter."
  ],
  lantern: [
    "A paper lantern hangs low, the color of steeped tea.",
    "Its glow stops at the window, where the night takes over."
  ],
  window: [
    "The same thin moon, seen now through a grid of wood.",
    "Pines and a violet mountain sit in the panes like a kept picture."
  ],
  scrolls: [
    "Rolled papers lean in a row, the color of old milk.",
    "One has begun to loosen. The rest are better behaved."
  ],
  chart: [
    "A pale chart hangs over the chest, marked with a wandering line.",
    "It might be a coast, or a thought someone did not finish."
  ],
  chest: [
    "Wooden chests sit along the wall, banded, latched, uncurious.",
    "The large one has a ring pull. It does not invite the hand."
  ],
  papers: [
    "A few loose sheets lie squared on the near chest.",
    "The top one has a drawing too small to be sure of."
  ],
  table: [
    "A low table holds a pale teapot and two small cups.",
    "Both cups are empty. Someone expected company, or remembered it."
  ],
  teapot: [
    "The teapot is round, blue-white, and slightly proud of itself.",
    "Steam is only a rumor. The quiet got here first."
  ],
  cups: [
    "Two cups, set apart, as if a conversation might sit between them."
  ],
  cushion: [
    "A cushion on the floor, pale cloth crossed with blue stitches.",
    "It faces the table the way a guest faces a story."
  ],
  mat: [
    "A straw mat lies by the right wall, gold in the lantern light.",
    "The boards around it are darker, and more walked on."
  ],
  doorway: [
    "The way you came in is behind you, where the night still is."
  ],
  south: [
    "The stones keep going, out of the grass and in among the cedars.",
    "South of here the path is narrower, and the sky has less to say."
  ],
  forest: [
    "Cedars stand close on both sides. The path is the only open thing.",
    "The same dusk is overhead, smaller now, held between the trees."
  ],
  canopy: [
    "The cedars go up in dark green rows, trunks already the color of night.",
    "Their branches nearly meet. A little of the pink sky still gets through."
  ],
  ridges: [
    "The violet mountains show again, farther off, between the trunks.",
    "They are the same ridges as the clearing, only deeper in the evening."
  ],
  southpath: [
    "The same blue-gray stones, set smaller as they run toward the trees.",
    "They came from the clearing. They have not decided where they end."
  ],
  flowers: [
    "A few white flowers in the long grass, the same as by the well.",
    "They look surprised to be this far from the water."
  ],
  return: [
    "Up the path the trees thin, and the clearing is that way."
  ]
};
