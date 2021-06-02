var assert = require('assert'),
  musicDuration = require('../index.js'),
  fs = require('fs');

describe('musicDuration', function() {
  it('returns a correct value for VBR duration', async () => {
    const length = await musicDuration('./tests/Good God.mp3');
    console.log(length);
    assert.equal(length, 100.336, 'Length not as expected ');
  });
});
