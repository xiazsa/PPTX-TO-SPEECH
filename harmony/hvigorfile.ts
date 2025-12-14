import { appTask, moduleTask, hvigor } from '@ohos/hvigor';

export default {
  // HarmonyOS NEXT / 6.0 SDK uses ArkTS compiler v4
  system: { compiler: 4 },
  tasks: [appTask, moduleTask]
} as hvigor.HvigorConfig;
