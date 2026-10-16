import { Config } from '@remotion/cli/config';

// Use the browser already installed in this workspace instead of downloading one.
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
