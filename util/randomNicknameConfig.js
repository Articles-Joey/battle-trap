
import generateRandomNickname from '@articles-media/articles-dev-box/generateRandomNickname';

const randomNicknameConfig = {
  type: 'Basic',
  parts: [
    [
      'Quantum', 'Neon', 'Binary', 'Pixel', 'Nano', 'Cyber', 'Glitch', 'Viral', 'Crypto', 'Turbo', 'Robo', 'Virtual', 'Cloud', 'Circuit', 'Data', 'AI', 'Meta', 'Hyper', 'Logic', 'Vector'
    ],
    [
      'Bot', 'Byte', 'Core', 'Node', 'Script', 'Stack', 'Array', 'Cache', 'Kernel', 'Matrix', 'Packet', 'Pixel', 'Proxy', 'Pulse', 'Synth', 'Terminal', 'Wire', 'Drive', 'Chip', 'Loop'
    ]
  ]
};

export default () => generateRandomNickname(randomNicknameConfig);