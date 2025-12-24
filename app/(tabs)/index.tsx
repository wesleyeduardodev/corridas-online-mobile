import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const isOrganizador = user?.role === 'ORGANIZADOR' || user?.role === 'ADMIN';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0]}!</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.role === 'ORGANIZADOR' ? 'Organizador' : 'Atleta'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>

          <View style={styles.quickActions}>
            {isOrganizador ? (
              <>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/eventos')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.actionIconText}>E</Text>
                  </View>
                  <Text style={styles.actionTitle}>Meus Eventos</Text>
                  <Text style={styles.actionDescription}>Gerencie seus eventos</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/inscricoes')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
                    <Text style={styles.actionIconText}>I</Text>
                  </View>
                  <Text style={styles.actionTitle}>Inscrições</Text>
                  <Text style={styles.actionDescription}>Ver inscritos</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/eventos')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.actionIconText}>E</Text>
                  </View>
                  <Text style={styles.actionTitle}>Eventos</Text>
                  <Text style={styles.actionDescription}>Encontre corridas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => router.push('/(tabs)/inscricoes')}
                >
                  <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
                    <Text style={styles.actionIconText}>I</Text>
                  </View>
                  <Text style={styles.actionTitle}>Minhas Inscrições</Text>
                  <Text style={styles.actionDescription}>Acompanhe suas corridas</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isOrganizador ? 'Próximos Eventos' : 'Próximas Corridas'}
          </Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isOrganizador
                ? 'Você ainda não tem eventos cadastrados'
                : 'Você ainda não está inscrito em nenhuma corrida'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/eventos')}
            >
              <Text style={styles.emptyButtonText}>
                {isOrganizador ? 'Criar Evento' : 'Ver Eventos'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  roleBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
