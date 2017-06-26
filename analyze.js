const path = require('path');
const { spawn, exec } = require('child_process');
const { exec_opts, gate, audio_folder } = require('./config');

const getLevels = (filename) => {
  const RMS_LEVELS = [];

  let args = '' +
    '-f lavfi ' +
    '-i amovie=' + audio_folder + '/' + filename + 
    ',astats=metadata=1:reset=5 ' +
    '-show_entries frame=pkt_pts_time:frame_tags=lavfi.astats.Overall.RMS_level'
  ;

  args = args.trim().split(' ');

  return new Promise((res, rej) => {
    const start = new Date();
    const task = spawn('ffprobe', args);

    task.stdout.on('data', (data) => {
      data = data.toString();

      const time = Number(data.substring(data.indexOf('=')+1, data.indexOf('TAG:')).trim());
      const level = Number(data.substr(data.lastIndexOf('=')+1, 10)) || -109.0;

      RMS_LEVELS.push({ time, level });
    });

    task.on('exit', (code) => {
      if (code === 1) {
        console.log(`Error: Child exited with code ${code}`);
        return rej();
      }

      const finish = new Date();
      const diff = (finish.getTime() - start.getTime()) / 1000;

      console.log(`Analysis of ${filename} finished in ${diff} seconds.`);

      return res(RMS_LEVELS);
    });
  });
};

const getAverageRMS = (filename) => {
  const cmd = 'ffmpeg'
    + ' -i ' + audio_folder + '/' + filename
    + ' -af "volumedetect"'
    + ' -f null /dev/null'
  ;

  return new Promise((res, rej) =>
    exec(cmd, exec_opts, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return rej(error);
      }

      const splitted = stderr.split('mean_volume:')[1];
      const rms = parseFloat(splitted.substring(1, splitted.indexOf('dB') - 1));

      console.log(`Average RMS for input is ${rms}`);
      return res(rms);
    })
  );
};

const findSegments = (data, avg = gate.AVG_RMS) => {
  const ranges = [];
  const threshold = avg + gate.THRESH_ADJUST;

  const filtered = data.filter(el => el.level < threshold);

  if (data[0].level > threshold) {
    filtered.unshift(data[0]);
  }

  filtered.map((el, index, arr) => {
    if (index === arr.length-1) return;

    const diff = (arr[index+1].time - el.time);

    if (diff > gate.TIME_INTERVAL) {
      ranges.push([el, arr[index+1]]);
    }
  });

  console.log(`Found ${ranges.length} segments.`);

  return ranges;
};

const findWhereToSplit = (file) =>
  new Promise((res, rej) =>
    Promise.all([
      getLevels(file),
      getAverageRMS(file)
    ])
    .then(
      result => {
        const [levels, rms] = result;
        const segments = findSegments(levels, rms);

        return res(segments);
      },
      error => rej(error)
    )
  );

module.exports = {
  getLevels,
  getAverageRMS,
  findSegments,
  findWhereToSplit
};
