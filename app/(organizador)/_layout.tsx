import { Stack, Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { Drawer } from '@/components/Drawer';

export default function OrganizadorLayout() {
  const { user, signed } = useAuth();

  if (!signed) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === 'ATLETA') {
    return <Redirect href="/(atleta)" />;
  }

  return (
    <DrawerProvider>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="eventos" />
          <Stack.Screen name="perfil" />
        </Stack>
        <Drawer />
      </View>
    </DrawerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
