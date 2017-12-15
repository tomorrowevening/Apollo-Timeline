'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TimelineConfig = {
  compositions: {},
  files: {},
  json: {},
  images: {},
  textures: {},
  video: {},
  fileID: function fileID(path) {
    var id = path.split('/');
    id = id[id.length - 1];
    if (id.split('.').length > 1) {
      id = id.split('.');
      id.pop();
      id = id.join('');
    }
    return id;
  }
};

exports.default = TimelineConfig;