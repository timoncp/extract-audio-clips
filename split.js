const { exec } = require('child_process');
const { exec_opts, video_folder, audio_folder, clip_folder } = require('./config');

const audio = (source, start, end, index) => {
  const length = (end - start).toFixed(2);
  const output = source.replace('.mp3', '') + '_clip' + index + '.mp3';

  const cmd = 'ffmpeg -y'
    + ' -ss ' + start
    + ' -t ' + length
    + ' -i ' + audio_folder + '/' + source
    + ' -acodec copy ' + audio_folder + '/' + output
  ;

  return exec(cmd, exec_opts, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    console.log(`Created file ${output}`);
  });
};

const video = (source, start, end, index) => {
  const length = end - start;
  const output = source.replace('.mp4', '') + '_clip' + index + '.mp4';

  const cmd = 'ffmpeg'
    + ' -ss ' + start.toFixed(2)
    + ' -t ' + length.toFixed(2)
    + ' -i ' + video_folder + '/' + source
    + ' -c copy -y ' + clip_folder + '/' + output
  ;

  return exec(cmd, exec_opts, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }

    console.log(`Created file ${output}`);
  });
};

module.exports = {
  audio,
  video
};
