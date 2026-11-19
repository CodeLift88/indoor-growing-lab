import { Config } from '@remotion/cli/config';

// usa o Chromium já instalado na máquina; em outro computador, apague esta linha
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setCrf(18);
