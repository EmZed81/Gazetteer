import React from 'react';
import { Composition } from 'remotion';
import { WhatYouSave, DURATION } from './WhatYouSave.jsx';

// 1920×1080 landscape (LinkedIn), 30 frames per second.
export const Root = () => (
  <Composition id="WhatYouSave" component={WhatYouSave} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
