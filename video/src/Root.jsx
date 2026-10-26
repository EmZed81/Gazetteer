import React from 'react';
import { Composition } from 'remotion';
import { WhatYouSave, DURATION } from './WhatYouSave.jsx';
import { Walkthrough, WalkthroughWithMockups, WALK_DURATION, WALK_FPS, INTRO_DURATION } from './Walkthrough.jsx';

// 1920×1080 landscape (LinkedIn), 30 frames per second.
export const Root = () => (
  <>
    <Composition id="WhatYouSave" component={WhatYouSave} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
    <Composition id="Walkthrough" component={Walkthrough} durationInFrames={WALK_DURATION} fps={WALK_FPS} width={1920} height={1080} defaultProps={{ type: 'steps' }} />
    <Composition id="WalkthroughWithMockups" component={WalkthroughWithMockups} durationInFrames={INTRO_DURATION} fps={WALK_FPS} width={1920} height={1080} />
  </>
);
