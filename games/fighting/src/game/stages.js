// games/fighting/src/game/stages.js
import { CANVAS_HEIGHT, STAGE_WIDTH } from './constants.js';

const FLOOR_Y = CANVAS_HEIGHT - 60;

export const STAGES = {
  ryu:     { name: 'Suzaku Castle',      bg: '/sprites/stages/ryu.png',     floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  ken:     { name: "Ken's Arena",        bg: '/sprites/stages/ken.png',     floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  chunli:  { name: "Chun-Li's Market",   bg: '/sprites/stages/chunli.png',  floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  guile:   { name: "Guile's Airbase",    bg: '/sprites/stages/guile.png',   floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  blanka:  { name: 'Brazil Jungle',      bg: '/sprites/stages/blanka.png',  floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  zangief: { name: 'Russia Factory',     bg: '/sprites/stages/zangief.png', floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  dhalsim: { name: 'India Temple',       bg: '/sprites/stages/dhalsim.png', floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  honda:   { name: 'Japan Bathhouse',    bg: '/sprites/stages/honda.png',   floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  balrog:  { name: 'Las Vegas Ring',     bg: '/sprites/stages/balrog.png',  floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  vega:    { name: 'Spain Cage',         bg: '/sprites/stages/vega.png',    floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  sagat:   { name: 'Thailand Temple',    bg: '/sprites/stages/sagat.png',   floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
  bison:   { name: 'Psycho Drive Base',  bg: '/sprites/stages/bison.png',   floorY: FLOOR_Y, width: STAGE_WIDTH, foreground: null },
};
