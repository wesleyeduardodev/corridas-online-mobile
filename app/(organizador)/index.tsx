import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/colors';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';

interface Evento {
  id: number;
  nome: string;
  data: string;
  local: string;
  cidade: string;
  estado: string;
  inscricoesAbertas: boolean;
}

interface DashboardStats {
  totalEventos: number;
  eventosAtivos: number;
  totalInscritos: number;
}

export default function OrganizadorDashboard() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEventos: 0,
    eventosAtivos: 0,
    totalInscritos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  async function loadDashboard() {
    try {
      const response = await api.get(ENDPOINTS.EVENTOS.BASE);
      const eventosData: Evento[] = response.data;

      setEventos(eventosData);

      // Calcular estatisticas
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const eventosAtivos = eventosData.filter(e => {
        const dataEvento = new Date(e.data);
        return dataEvento >= hoje;
      });

      setStats({
        totalEventos: eventosData.length,
        eventosAtivos: eventosAtivos.length,
        totalInscritos: 0, // TODO: implementar endpoint para total de inscritos
      });
    } catch (error) {
      console.log('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  function formatFullDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  }

  function getDaysUntil(dateString: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dateString);
    data.setHours(0, 0, 0, 0);
    const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // Ordenar eventos por data e pegar os proximos
  const proximosEventos = eventos
    .filter(e => new Date(e.data) >= new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 3);

  const proximoEvento = proximosEventos[0];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Ola, {user?.nome?.split(' ')[0]}!</Text>
          <Text style={styles.subtitle}>Gerencie seus eventos</Text>
        </View>
        <TouchableOpacity
          style={styles.newEventButton}
          onPress={() => router.push('/evento/novo')}
        >
          <Text style={styles.newEventButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboard();
            }}
          />
        }
      >
        {/* Cards de estatisticas */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalEventos}</Text>
            <Text style={styles.statLabel}>Total de Eventos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.success }]}>
              {stats.eventosAtivos}
            </Text>
            <Text style={styles.statLabel}>Eventos Ativos</Text>
          </View>
        </View>

        {/* Proximo evento destacado */}
        {proximoEvento && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proximo Evento</Text>
            <TouchableOpacity
              style={styles.nextEventCard}
              onPress={() => router.push(`/evento/${proximoEvento.id}`)}
            >
              <View style={styles.nextEventHeader}>
                <View style={styles.nextEventDate}>
                  <Text style={styles.nextEventDay}>
                    {new Date(proximoEvento.data).getDate()}
                  </Text>
                  <Text style={styles.nextEventMonth}>
                    {new Date(proximoEvento.data).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.nextEventInfo}>
                  <Text style={styles.nextEventName}>{proximoEvento.nome}</Text>
                  <Text style={styles.nextEventLocation}>
                    {proximoEvento.cidade}/{proximoEvento.estado}
                  </Text>
                  <View style={styles.nextEventCountdown}>
                    {getDaysUntil(proximoEvento.data) === 0 ? (
                      <Text style={styles.countdownTextToday}>Hoje!</Text>
                    ) : getDaysUntil(proximoEvento.data) === 1 ? (
                      <Text style={styles.countdownText}>Amanha</Text>
                    ) : (
                      <Text style={styles.countdownText}>
                        Em {getDaysUntil(proximoEvento.data)} dias
                      </Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.nextEventFooter}>
                <View
                  style={[
                    styles.statusBadge,
                    proximoEvento.inscricoesAbertas ? styles.statusAberto : styles.statusFechado,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {proximoEvento.inscricoesAbertas ? 'Inscricoes Abertas' : 'Inscricoes Fechadas'}
                  </Text>
                </View>
                <Text style={styles.viewDetails}>Ver detalhes</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de eventos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seus Eventos</Text>
            <TouchableOpacity onPress={() => router.push('/(organizador)/eventos')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {eventos.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Nenhum evento criado</Text>
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
          ) : (
            <View style={styles.eventsList}>
              {eventos
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .slice(0, 5)
                .map((evento) => {
                  const isPast = new Date(evento.data) < new Date();
                  return (
                    <TouchableOpacity
                      key={evento.id}
                      style={[styles.eventCard, isPast && styles.eventCardPast]}
                      onPress={() => router.push(`/evento/${evento.id}`)}
                    >
                      <View style={styles.eventDateBadge}>
                        <Text style={[styles.eventDateText, isPast && styles.eventDateTextPast]}>
                          {formatDate(evento.data)}
                        </Text>
                      </View>
                      <View style={styles.eventCardContent}>
                        <Text style={[styles.eventCardName, isPast && styles.eventCardNamePast]}>
                          {evento.nome}
                        </Text>
                        <Text style={styles.eventCardLocation}>
                          {evento.cidade}/{evento.estado}
                        </Text>
                      </View>
                      <Text style={styles.eventCardArrow}>›</Text>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.8,
    marginTop: 4,
  },
  newEventButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newEventButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  nextEventCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  nextEventHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nextEventDate: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  nextEventDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  nextEventMonth: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  nextEventInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nextEventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  nextEventLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  nextEventCountdown: {
    marginTop: 4,
  },
  countdownText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  countdownTextToday: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: 'bold',
  },
  nextEventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAberto: {
    backgroundColor: Colors.success + '20',
  },
  statusFechado: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
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
  eventsList: {
    gap: 8,
  },
  eventCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  eventCardPast: {
    opacity: 0.6,
  },
  eventDateBadge: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  eventDateTextPast: {
    color: Colors.textSecondary,
  },
  eventCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  eventCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  eventCardNamePast: {
    color: Colors.textSecondary,
  },
  eventCardLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventCardArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
});
