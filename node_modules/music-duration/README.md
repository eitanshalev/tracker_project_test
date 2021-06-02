# music-duration ![Travis-Build](https://travis-ci.org/necraidan/music-duration.svg?branch=master)

> Calculate duration of a music file

> Only .mp3 at this moment

### TODO

- FLAC
- WAV
- OGG

## Install

```sh
npm i music-duration
```

## Usage

1. JavaScript

```javascript
let musicDuration = require('music-duration');

musicDuration('file.mp3')
  .then(duration => {
    console.log(`Your file is ${duration} seconds long`);
  })
  .catch(e => {
    console.err(e);
  });
```

2. TypeScript

```typescript
import musicDuration = require('music-duration');

musicDuration('file.mp3')
  .then(duration => {
    console.log(`Your file is ${duration} seconds long`);
  })
  .catch(e => {
    console.err(e);
  });
```

## API

## musicDuration(filePathOrBuffer [, fileType, cbrEstimate])

### filePathOrBuffer

Type: `string | Buffer`

Path to the file or a buffer with the file's contents

### fileType

Type: `string`

Defaults to '.mp3'.

### cbrEstimate

Type: `boolean`

Defaults to `false`. When set to `true`, will estimate the length of a
constant-bitrate mp3. This speeds up the calculation a lot but isn't
guaranteed to be accurate.

### Return value

`musicDuration` returns a Promise that resolves to the duration of the fileType in `second` or rejects with some error.

## License

MIT Licence
