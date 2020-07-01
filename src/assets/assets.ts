import redAtlas from './red/Red.atlas';

import background from './images/magic_forest_bg.jpg';
import button from './images/magic_forest_button.png';

import coinBig from './images/magic_forest_coin_icon_big.png';
import coinSmall from './images/magic_forest_coin_icon_small.png';
import dollar from './images/magic_forest_dollar_icon.png';
import question from './images/magic_forest_question_icon.png';

import itemFrame from './images/magic_forest_frame.png';
import winFrame from './images/magic_forest_frame1.png';
import startFrame from './images/magic_forest_frame2.png';
import textFrame from './images/magic_forest_frame_for_text.png';
import scratchFrameBig from './images/magic_forest_scratch_frame_big.png';
import scratchFrameSmall from './images/magic_forest_scratch_frame.png'
import bonusFrame from './images/magic_forest_winner_frame.png';

import bonfire from './images/magic_forest_bonfire.png';
import bow from './images/magic_forest_bow.png';
import leaf from './images/magic_forest_leaf.png';
import rope from './images/magic_forest_rope.png'
import tent from './images/magic_forest_tent.png';

import motivation from './images/magic_forest_win_up_to_100.png';

export const animationData = redAtlas;

export interface SpritesInterface {
  background: string | PIXI.Sprite
  button: string | PIXI.Sprite
  coinBig: string | PIXI.Sprite
  coinSmall: string | PIXI.Sprite
  dollar: string | PIXI.Sprite
  question: string | PIXI.Sprite
  itemFrame: string | PIXI.Sprite
  winFrame: string | PIXI.Sprite
  startFrame: string | PIXI.Sprite
  textFrame: string | PIXI.Sprite
  scratchFrameSmall: string | PIXI.Sprite
  scratchFrameBig: string | PIXI.Sprite
  bonusFrame: string | PIXI.Sprite
  bonfireItem: string | PIXI.Sprite
  bowItem: string | PIXI.Sprite
  leafItem: string | PIXI.Sprite
  ropeItem: string | PIXI.Sprite
  tentItem: string | PIXI.Sprite
  motivation: string | PIXI.Sprite
}

export const sprites: SpritesInterface = {
  background,
  button,
  coinBig,
  coinSmall,
  dollar,
  question,
  itemFrame,
  winFrame,
  startFrame,
  textFrame,
  scratchFrameSmall,
  scratchFrameBig,
  bonusFrame,
  bonfireItem: bonfire,
  bowItem: bow,
  leafItem: leaf,
  ropeItem: rope,
  tentItem: tent,
  motivation
};

export const lootForRandom = {
  bonfire: 10,
  bow: 8,
  leaf: 6,
  rope: 4,
  tent: 2
}
