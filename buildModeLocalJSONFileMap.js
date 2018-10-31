var path = require('path');
var fs = require('fs');
var dataPath = path.resolve(__dirname, './data');
const buildModeLocalJSONFileMap = () => {
    let modeLocalJSONFileMap = [];
    // if (dataPath) {
    try {
        modeLocalJSONFileMap = fs.readdirSync(dataPath)
            .filter(file => path.extname(file) === '.json')
            .map(file => ({
                from: path.join(dataPath, file),
                to: `datasets/${file}`,
            }));
    } catch(e) {
        console.warn(e);
    }
    // }
    return modeLocalJSONFileMap;
};
module.exports = buildModeLocalJSONFileMap;
