import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: 'H',
    eventos: 'E',
    inscricoes: 'I',
    perfil: 'P',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
        {icons[name] || '?'}
      </Text>
    </View>
  );
}

export default function AtletaLayout() {
  const { user, signed } = useAuth();

  if (!signed) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user?.role === 'ORGANIZADOR' || user?.role === 'ADMIN') {
    return <Redirect href="/(organizador)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          title: 'Eventos',
          tabBarIcon: ({ focused }) => <TabBarIcon name="eventos" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="inscricoes"
        options={{
          title: 'Inscricoes',
          tabBarIcon: ({ focused }) => <TabBarIcon name="inscricoes" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => <TabBarIcon name="perfil" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  iconContainerFocused: {
    backgroundColor: Colors.primary,
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  iconTextFocused: {
    color: Colors.white,
  },
});
