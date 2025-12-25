import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { Colors } from '@/constants/colors';
import { eventosService, StatusEvento } from '@/services/eventos';

interface Evento {
  id: number;
  nome: string;
  data: string;
  local: string;
  cidade: string;
  estado: string;
  inscricoesAbertas: boolean;
  status: StatusEvento;
}

export default function EventosOrganizadorScreen() {
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarCancelados, setMostrarCancelados] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEventos();
    }, [mostrarCancelados])
  );

  async function loadEventos() {
    try {
      const data = await eventosService.listar(mostrarCancelados);
      setEventos(data);
    } catch (error: any) {
      Alert.alert('Erro', 'Nao foi possivel carregar os eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function getFirstName(name: string | undefined): string {
    if (!name) return '';
    return name.split(' ')[0] || name;
  }

  function getDaysUntil(dateString: string): number {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getDateDisplay(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return { day, month: month.toUpperCase() };
  }

  function renderEvento({ item }: { item: Evento }) {
    const isPast = new Date(item.data) < new Date();
    const isCancelado = item.status === 'CANCELADO';
    const daysUntil = getDaysUntil(item.data);
    const { day, month } = getDateDisplay(item.data);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isPast && styles.cardPast,
          isCancelado && styles.cardCancelado,
        ]}
        onPress={() => router.push(`/evento/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.dateBox, isPast && styles.dateBoxPast, isCancelado && styles.dateBoxCancelado]}>
          <Text style={[styles.dateDay, (isPast || isCancelado) && styles.dateDayMuted]}>{day}</Text>
          <Text style={[styles.dateMonth, (isPast || isCancelado) && styles.dateMonthMuted]}>{month}</Text>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, (isPast || isCancelado) && styles.cardTitleMuted]} numberOfLines={1}>
              {item.nome}
            </Text>
            {isCancelado ? (
              <View style={styles.badgeCancelado}>
                <Text style={styles.badgeCanceladoText}>Cancelado</Text>
              </View>
            ) : isPast ? (
              <View style={styles.badgeEncerrado}>
                <Text style={styles.badgeEncerradoText}>Encerrado</Text>
              </View>
            ) : (
              <View style={[styles.badge, item.inscricoesAbertas ? styles.badgeAberto : styles.badgeFechado]}>
                <Text style={[styles.badgeText, { color: item.inscricoesAbertas ? Colors.success : Colors.error }]}>
                  {item.inscricoesAbertas ? 'Aberto' : 'Fechado'}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.cardLocation} numberOfLines={1}>
            {item.local} • {item.cidade}/{item.estado}
          </Text>

          {!isPast && !isCancelado && (
            <Text style={styles.cardCountdown}>
              {daysUntil === 0 ? 'Hoje' : daysUntil === 1 ? 'Amanha' : `Em ${daysUntil} dias`}
            </Text>
          )}
        </View>

        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const hoje = new Date();
  const eventosFuturos = eventos
    .filter(e => new Date(e.data) >= hoje)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  const eventosPassados = eventos
    .filter(e => new Date(e.data) < hoje)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openDrawer}
          activeOpacity={0.7}
        >
          <View style={styles.hamburgerIcon}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Ola, {getFirstName(user?.nome)}!</Text>
          <Text style={styles.subtitle}>Gerencie seus eventos</Text>
        </View>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => router.push('/evento/novo')}
          activeOpacity={0.8}
        >
          <Text style={styles.newButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>Incluir cancelados</Text>
        <Switch
          value={mostrarCancelados}
          onValueChange={setMostrarCancelados}
          trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
          thumbColor={mostrarCancelados ? Colors.primary : Colors.white}
        />
      </View>

      <FlatList
        data={[...eventosFuturos, ...eventosPassados]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvento}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadEventos();
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Nenhum evento</Text>
            <Text style={styles.emptyText}>
              Crie seu primeiro evento e comece a receber inscricoes
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/evento/novo')}
            >
              <Text style={styles.emptyButtonText}>Criar Evento</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  hamburgerIcon: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 24,
    height: 2.5,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.85,
    marginTop: 2,
  },
  newButton: {
    backgroundColor: Colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newButtonText: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: '400',
    marginTop: -2,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPast: {
    backgroundColor: '#fafafa',
  },
  cardCancelado: {
    backgroundColor: '#fef5f5',
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  dateBox: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBoxPast: {
    backgroundColor: Colors.textLight,
  },
  dateBoxCancelado: {
    backgroundColor: Colors.error + '30',
  },
  dateDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    lineHeight: 22,
  },
  dateDayMuted: {
    color: Colors.textSecondary,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
    opacity: 0.9,
  },
  dateMonthMuted: {
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  cardTitleMuted: {
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAberto: {
    backgroundColor: Colors.success + '15',
  },
  badgeFechado: {
    backgroundColor: Colors.error + '15',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeCancelado: {
    backgroundColor: Colors.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCanceladoText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.error,
  },
  badgeEncerrado: {
    backgroundColor: Colors.textLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeEncerradoText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  cardLocation: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardCountdown: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  cardArrow: {
    fontSize: 24,
    color: Colors.textLight,
    marginLeft: 8,
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
