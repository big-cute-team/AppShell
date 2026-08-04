import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BACKGROUND_COLOR } from '../config';

type Props = {
  /** 네트워크 자체가 끊긴 경우와 서버/페이지 오류를 구분해 안내합니다. */
  offline: boolean;
  retrying: boolean;
  onRetry: () => void;
};

/** 웹 로드가 실패했을 때 흰 화면 대신 보여주는 재시도 화면. */
export function ErrorView({ offline, retrying, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {offline ? '인터넷에 연결되어 있지 않아요' : '페이지를 불러오지 못했어요'}
      </Text>
      <Text style={styles.description}>
        {offline
          ? '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
          : '잠시 후 다시 시도해 주세요. 문제가 계속되면 앱을 종료 후 재실행해 주세요.'}
      </Text>

      <Pressable
        accessibilityRole="button"
        disabled={retrying}
        onPress={onRetry}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        {retrying ? (
          <ActivityIndicator color="#111111" />
        ) : (
          <Text style={styles.buttonLabel}>다시 시도</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: BACKGROUND_COLOR,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#9BA1AC',
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    minWidth: 140,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
});
