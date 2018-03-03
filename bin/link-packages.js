const fs   = require('fs');
const path = require('path');

const core = path.resolve(__dirname, '../dist/core');
const libs = path.resolve(__dirname, '../dist/libs');
const model = path.resolve(__dirname, '../dist/model');
const node_modules_path = path.resolve(__dirname, '../node_modules');

const links = {
    '@app-core' : core,
    '@app-libs' : libs,
    '@app-model': model 
};

// create symlinks if they not exists allready
for(let key in links ) {
    const linkName = `${node_modules_path}/${key}`;

    try {
        fs.symlinkSync(links[key] , linkName , 'dir');
    } catch ( error ) {
        continue;
    }
}