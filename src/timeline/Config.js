const Config = {
    compositions: {},
    images: {},
    textures: {},
    video: {},
    fileID: function(path) {
        var id = path.split('/');
        id = id[id.length-1];
        if( id.split('.').length > 1 ) {
            id = id.split('.');
            id.pop();
            id = id.join('');
        }
        return id;
    }
};

module.exports = Config;
