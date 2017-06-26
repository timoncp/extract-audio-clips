const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { exec_opts, video_folder, audio_folder } = require('./config');

const toAudio = (video) => {
  const audio = video.replace('.mp4', '.mp3');

  const cmd = 'ffmpeg -y'
    + ' -i ' + video_folder + '/' + video
    + ' -q:a 0 -map a ' + audio_folder + '/' + audio
  ;

  return new Promise((res, rej) => {
    exec(cmd, exec_opts, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return rej(error);
      }

      console.log('Finished converting ' + video);
      return res(stdout);
    })
  });
};

const allToAudio = () => {
  const promises = fs.readdirSync(path.resolve(__dirname, video_folder)).filter(
    el => el.includes('mp4') && !el.includes('_clip')
  ).map(filename => toAudio(filename));

  return Promise.all(promises);
};

module.exports = {
  toAudio,
  allToAudio
};
