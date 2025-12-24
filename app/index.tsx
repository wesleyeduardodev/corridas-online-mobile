import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

export default function Index() {
  const { signed, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (signed) {
    // Redirecionar baseado no role do usuario
    if (user?.role === 'ORGANIZADOR' || user?.role === 'ADMIN') {
      return <Redirect href="/(organizador)" />;
    }
    return <Redirect href="/(atleta)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
