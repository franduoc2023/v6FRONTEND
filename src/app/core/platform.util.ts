// src/app/core/platform.util.ts
import { Capacitor } from '@capacitor/core';

export const isNative = () =>
  Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios';

export const isWeb = () => !isNative();
