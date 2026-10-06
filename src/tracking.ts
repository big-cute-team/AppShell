/**
 * iOS 앱 추적 투명성(ATT) 요청 + 결과를 Meta SDK에 전달.
 *
 * 인스타 앱 설치 광고의 설치 귀속을 위해 Meta SDK를 넣었고(ADR-0004), iOS에서는
 * 광고 식별자(IDFA)를 쓰기 전에 ATT 팝업으로 동의를 받아야 합니다.
 * 거부해도 앱은 그대로 동작합니다 — SDK가 식별자 없이 집계할 뿐입니다.
 *
 * iOS 17+ 와 Facebook SDK 17+ 조합에서는 SDK가 ATT 상태를 직접 읽어서
 * setAdvertiserTrackingEnabled 호출이 필수는 아니지만, iOS 14.5~16 사용자를 위해 넘겨 둡니다.
 * (https://developers.facebook.com/docs/app-events/guides/advertising-tracking-enabled)
 */
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Platform } from 'react-native';
import { Settings } from 'react-native-fbsdk-next';

let requested = false;

/** 앱 세션당 한 번만 요청합니다. 이미 결정된 상태면 OS가 팝업 없이 바로 결과를 돌려줍니다. */
export async function requestTrackingPermission(): Promise<void> {
  if (Platform.OS !== 'ios' || requested) return;
  requested = true;

  try {
    const { status } = await requestTrackingPermissionsAsync();
    await Settings.setAdvertiserTrackingEnabled(status === 'granted');
  } catch {
    // 추적 설정 실패가 앱 동작을 막아서는 안 됩니다 (SDK 미초기화·네이티브 모듈 예외 등).
  }
}
