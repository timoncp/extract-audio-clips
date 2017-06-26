const fs = require('fs');
const path = require('path');
const convert = require('./convert');
const analyze = require('./analyze');
const split = require('./split');
const { audio_folder } = require('./config');

console.log('Starting extraction...\n');

convert.allToAudio().then(done => {
  fs.readdirSync(path.resolve(__dirname, audio_folder)).filter(
    el => el.includes('.mp3') && !el.includes('_clip')
  ).map(filename => {
    analyze.findWhereToSplit(filename).then(
      segments => segments.map((range, index) => {
        const video = filename.replace('.mp3', '.mp4');

        split.video(video, range[0].time, range[1].time, index);
      })
    );
  });
}).catch(err => console.log(err));
