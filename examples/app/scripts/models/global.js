import { getID, getTag } from 'apollo-utils/DOMUtil';

export const BG_COLOR = 0x0F0C1A;

export const canvas = getID('world');

let outputContainer = getID('output');
export const output = {
  mode: getTag('p', outputContainer)[0],
  time: getTag('p', outputContainer)[1],
  bar : getID('bar')
};

export const assets = {
  json: [
    'json/atlas.json',
    'json/project.json'
  ],
  audio: [
  ],
  images: [
    'images/gradient.png',
    'images/lighting.png'
  ],
  video: [
    'video/big_buck_bunny.mp4'
  ]
};

