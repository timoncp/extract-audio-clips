module.exports = {
  video_folder: 'video',
  audio_folder: 'audio',
  clip_folder: 'clips',
  exec_opts: {
    maxBuffer: 1024 * 1024 * 10
  },
  gate: {
    AVG_RMS: -25, // default average RMS level of sound if none was given, in dB
    THRESH_ADJUST: -20, // helps adjust threshold for filter, in dB
    TIME_INTERVAL: 2.5, // time after which we consider segment to be silence, in seconds
  }
};