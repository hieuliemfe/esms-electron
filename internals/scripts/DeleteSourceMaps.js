import path from 'path';
import rimraf from 'rimraf';
// import fs from 'fs';

export default function deleteSourceMaps() {
  rimraf.sync(path.join(__dirname, '../../app/dist/*.js.map'));
  rimraf.sync(path.join(__dirname, '../../app/*.js.map'));
  // const srcMapExist = fs.existsSync(
  //   path.join(__dirname, '../../app/renderer.prod.js.map')
  // );
  // if (srcMapExist) {
  //   rimraf.sync(path.join(__dirname, '../../app/renderer.prod.js.map'));
  // }
  // const distSrcMapExist = fs.existsSync(
  //   path.join(__dirname, '../../app/dist/renderer.prod.js.map')
  // );
  // if (distSrcMapExist) {
  //   fs.copyFile(
  //     path.join(__dirname, '../../app/dist/renderer.prod.js.map'),
  //     path.join(__dirname, '../../app/renderer.prod.js.map'),
  //     (err) => {
  //       if (err) throw err;
  //       console.log('Source map added successfully!');
  //     }
  //   );
  // }
}
