var PIXI = require('pixi.js');
import { getHex } from 'apollo-utils/DOMUtil';
import { toRad } from 'apollo-utils/MathUtil';
import PIXILayer from './PIXILayer';
import TimelineConfig from '../TimelineConfig';

let parent = undefined;

export default class PIXIShape extends PIXILayer {
  constructor(json, timeline) {
    super(json, timeline);
    
    parent = this.item;
    createShape(json.content, timeline);
    parent = undefined;
  }
}

function drawPoly(radius, points) {
  var pts = [], i, total = points-1;
  for(i = 0; i < points; ++i) {
    var angle = (i / total) * (Math.PI*2);
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius;
    pts.push( new PIXI.Point(x, y) );
  }
  return pts;
}

function createShape(content, timeline) {
  const scale = window.devicePixelRatio;
  let i, totalC = content.length;
  for(i = 0; i < totalC; ++i) {
    let cLayer = content[i];
    let isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
    if(isShape) {
      let shape = new PIXI.Graphics();
      shape.name = cLayer.name;
      parent.addChild(shape);

      let n, nTotal;

      // Cycle through the content to find fill, stroke, and transform
      let fill, stroke, transform = {
        opacity: 1,
        rotation: 0,
        anchor: [0, 0],
        position: [0, 0],
        scale: [1, 1],
        timeline: []
      };
      nTotal = cLayer.content.length;
      for(n = 0; n < nTotal; ++n) {
        let nLayer = cLayer.content[n];
        switch(nLayer.type) {
          case 'fill':
            fill = {
              alpha: nLayer.value.opacity,
              color: getHex(nLayer.value.color[0], nLayer.value.color[1], nLayer.value.color[2])
            };
            break;

          case 'stroke':
            stroke = {
              alpha: nLayer.value.opacity,
              color: getHex(nLayer.value.color[0], nLayer.value.color[1], nLayer.value.color[2]),
              width: nLayer.value.width * scale
            }
            break;

          case 'transform':
            shape.alpha = nLayer.opacity;
            shape.pivot.x = nLayer.anchor[0];
            shape.pivot.y = nLayer.anchor[1];
            shape.position.x = nLayer.position[0] * scale;
            shape.position.y = nLayer.position[1] * scale;
            shape.scale.x = nLayer.scale[0];
            shape.scale.y = nLayer.scale[1];
            shape.rotation = toRad(nLayer.rotation[2]);
            PIXILayer.transform(shape, nLayer, timeline);
            break;
        }
      }

      if(stroke !== undefined) {
        shape.lineStyle(stroke.width, stroke.color, stroke.alpha);
      } else {
        shape.lineStyle(1, 0x000000, 0);
      }
      if(fill !== undefined) {
        shape.beginFill(fill.color, fill.alpha);
      }

      // Draw paths
      nTotal = cLayer.paths.length;

      for(n = 0; n < nTotal; ++n) {
        let angle, pt, pts, s, t, poly, totalPoints, path = cLayer.paths[n];

        switch(path.type) {
          case 'ellipse':
            // shape.drawRect(0, 0, 100, 100); // fill/stroke works
            // shape.drawRoundedRect(0, 0, 100, 100, 10); // fill/stroke works
            // shape.drawCircle(0, 0, 100); // stroke works
            // shape.drawEllipse(0, 0, 100, 100); // stroke works
            
            shape.drawEllipse(path.x * scale, path.y * scale, (path.width * scale) / 2, (path.height * scale) / 2);
            break;

          case 'rectangle':
            shape.drawRect((path.x - (path.width / 2)) * scale, (path.y - (path.height / 2)) * scale, path.width * scale, path.height * scale);
            break;

          case 'polygon':
            pts = [], totalPoints = path.points;
            for(s = 0; s < path.points + 1; ++s) {
              angle = (s / totalPoints) * (Math.PI * 2) - (Math.PI / 2); // - 90 degrees
              pt = new PIXI.Point(
                Math.cos(angle) * (path.radius * scale),
                Math.sin(angle) * (path.radius * scale)
              );
              pts.push(pt);
            }
            poly = new PIXI.Polygon(pts);
            poly.closed = path.closed;
            shape.drawShape(poly);
            break;

          case 'polystar':
            pts = [], totalPoints = path.points * 2;
            for(s = 0; s < path.points + 1; ++s) {
              angle = ((s * 2) / totalPoints) * (Math.PI * 2) + toRad(path.rotation) - (Math.PI / 2); // - 90 degrees
              pt = new PIXI.Point(
                Math.cos(angle) * (path.outRadius * scale),
                Math.sin(angle) * (path.outRadius * scale)
              );
              pts.push(pt);

              angle = ((s * 2 + 1) / totalPoints) * (Math.PI * 2) + toRad(path.rotation) - (Math.PI / 2); // - 90 degrees
              pt = new PIXI.Point(
                Math.cos(angle) * (path.inRadius * scale),
                Math.sin(angle) * (path.inRadius * scale)
              );
              pts.push(pt);
            }
            poly = new PIXI.Polygon(pts);
            poly.closed = path.closed;
            shape.drawShape(poly);
            break;

          case 'shape':
            totalPoints = path.vertices.length;
            shape.moveTo(path.vertices[0][0] * scale, path.vertices[0][1] * scale);
            for(s = 0; s < totalPoints; ++s) {
              t = s + 1;
              if(path.closed) t = t % totalPoints;
              else if(t >= totalPoints) break;
              shape.bezierCurveTo(
                (path.vertices[s][0] + path.outTangents[s][0]) * scale,
                (path.vertices[s][1] + path.outTangents[s][1]) * scale,
                (path.vertices[t][0] + path.inTangents[t][0]) * scale,
                (path.vertices[t][1] + path.inTangents[t][1]) * scale,
                (path.vertices[t][0]) * scale,
                path.vertices[t][1] * scale
              );
            }
            PIXILayer.morph(shape, path, timeline, path.closed);
            break;
        }
      }
      
      if(fill !== undefined) {
        shape.endFill();
      }
    } else {
      let group = new PIXI.Container();
      group.name = cLayer.name;
      parent.addChild(group);
      parent = group;
      createShape(cLayer.content, parent);
    }
  }
}

/*
function createShape(content, timeline) {
  const scale = window.devicePixelRatio;
  let i, totalC = content.length;
  for(i = 0; i < totalC; ++i) {
    let cLayer = content[i];
    let isShape = cLayer.paths !== undefined && cLayer.paths.length > 0;
    if(isShape) {
      let shape = new PIXI.Graphics();
      shape.name = cLayer.name;
      parent.addChild(shape);

      let n, nTotal;

      // Cycle through the content to find fill, stroke, and transform
      let fill, stroke, transform = {
        opacity: 1,
        rotation: 0,
        anchor: [0, 0],
        position: [0, 0],
        scale: [1, 1],
        timeline: []
      };
      nTotal = cLayer.content.length;
      for(n = 0; n < nTotal; ++n) {
        let nLayer = cLayer.content[n];
        switch(nLayer.type) {
          case 'fill':
            fill = {
              alpha: nLayer.value.opacity,
              color: getHex(nLayer.value.color[0], nLayer.value.color[1], nLayer.value.color[2])
            };
            break;

          case 'stroke':
            stroke = {
              alpha: nLayer.value.opacity,
              color: getHex(nLayer.value.color[0], nLayer.value.color[1], nLayer.value.color[2]),
              width: nLayer.value.width * scale
            }
            break;

          case 'transform':
            shape.alpha = nLayer.opacity;
            shape.pivot.x = nLayer.anchor[0];
            shape.pivot.y = nLayer.anchor[1];
            shape.position.x = nLayer.position[0] * scale;
            shape.position.y = nLayer.position[1] * scale;
            shape.scale.x = nLayer.scale[0];
            shape.scale.y = nLayer.scale[1];
            shape.rotation = toRad(nLayer.rotation[2]);
            PIXILayer.transform(shape, nLayer, timeline);
            break;
        }
      }

      if(stroke !== undefined) {
        shape.lineStyle(stroke.width, stroke.color, stroke.alpha);
      }
      if(fill !== undefined) {
        shape.beginFill(fill.color, fill.alpha);
      }

      // Draw paths
      nTotal = cLayer.paths.length;

      for(n = 0; n < nTotal; ++n) {
        let angle, pt, pts, s, t, poly, totalPoints, path = cLayer.paths[n];

        switch(path.type) {
          case 'ellipse':
            shape.drawEllipse(path.x * scale, path.y * scale, (path.width * scale) / 2, (path.height * scale) / 2);
            break;

          case 'rectangle':
            console.log('fill', fill, path);
            console.log((path.x - (path.width / 2)) * scale, (path.y - (path.height / 2)) * scale, path.width * scale, path.height * scale);
            shape.drawRect(0, 0, 100, 100);
            // shape.drawRect((path.x - (path.width / 2)) * scale, (path.y - (path.height / 2)) * scale, path.width * scale, path.height * scale);
            break;

          case 'polygon':
            pts = [], totalPoints = path.points;
            for(s = 0; s < path.points + 1; ++s) {
              angle = (s / totalPoints) * (Math.PI * 2) - (Math.PI / 2); // - 90 degrees
              pt = new PIXI.Point(
                Math.cos(angle) * (path.radius * scale),
                Math.sin(angle) * (path.radius * scale)
              );
              pts.push(pt);
            }
            poly = new PIXI.Polygon(pts);
            poly.closed = path.closed;
            shape.drawShape(poly);
            break;

          case 'polystar':
            pts = [], totalPoints = path.points * 2;
            for(s = 0; s < path.points + 1; ++s) {
              angle = ((s * 2) / totalPoints) * (Math.PI * 2) + toRad(path.rotation) - (Math.PI / 2); // - 90 degrees
              pt = new PIXI.Point(
                Math.cos(angle) * (path.outRadius * scale),
                Math.sin(angle) * (path.outRadius * scale)
              );
              pts.push(pt);

              angle = ((s * 2 + 1) / totalPoints) * (Math.PI * 2) + toRad(path.rotation) - (Math.PI / 2); // - 90 degrees
              pt = new PIXI.Point(
                Math.cos(angle) * (path.inRadius * scale),
                Math.sin(angle) * (path.inRadius * scale)
              );
              pts.push(pt);
            }
            poly = new PIXI.Polygon(pts);
            poly.closed = path.closed;
            shape.drawShape(poly);
            break;

          case 'shape':
            totalPoints = path.vertices.length;
            shape.moveTo(path.vertices[0][0] * scale, path.vertices[0][1] * scale);
            for(s = 0; s < totalPoints; ++s) {
              t = s + 1;
              if(path.closed) t = t % totalPoints;
              else if(t >= totalPoints) break;
              shape.bezierCurveTo(
                (path.vertices[s][0] + path.outTangents[s][0]) * scale,
                (path.vertices[s][1] + path.outTangents[s][1]) * scale,
                (path.vertices[t][0] + path.inTangents[t][0]) * scale,
                (path.vertices[t][1] + path.inTangents[t][1]) * scale,
                (path.vertices[t][0]) * scale,
                path.vertices[t][1] * scale
              );
            }
            PIXILayer.morph(shape, path, timeline, path.closed);
            break;
        }
      }
      
      if(fill !== undefined) {
        shape.endFill();
      }
    } else {
      let group = new PIXI.Container();
      group.name = cLayer.name;
      parent.addChild(group);
      parent = group;
      createShape(cLayer.content, parent);
    }
  }
}
*/