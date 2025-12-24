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
import { inscricoesService, InscricaoAtleta } from '@/services/inscricoes';

export default function AtletaDashboard() {
  const { user } = useAuth();
  const [inscricoes, setInscricoes] = useState<InscricaoAtleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  async function loadDashboard() {
    try {
      const data = await inscricoesService.minhasInscricoes();
      setInscricoes(data);
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

  function getDaysUntil(dateString: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(dateString);
    data.setHours(0, 0, 0, 0);
    const diff = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'PAGO':
        return Colors.success;
      case 'PENDENTE':
        return Colors.warning;
      case 'CANCELADO':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'PAGO':
        return 'Confirmado';
      case 'PENDENTE':
        return 'Pendente';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }

  // Filtrar inscricoes ativas e futuras
  const inscricoesAtivas = inscricoes
    .filter(i => i.status !== 'CANCELADO' && new Date(i.eventoData) >= new Date())
    .sort((a, b) => new Date(a.eventoData).getTime() - new Date(b.eventoData).getTime());

  const proximaInscricao = inscricoesAtivas[0];

  const totalConfirmadas = inscricoes.filter(i => i.status === 'PAGO').length;
  const totalPendentes = inscricoes.filter(i => i.status === 'PENDENTE').length;

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
          <Text style={styles.subtitle}>Bora correr?</Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => router.push('/(atleta)/eventos')}
        >
          <Text style={styles.searchButtonText}>Buscar Eventos</Text>
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
            <Text style={[styles.statNumber, { color: Colors.success }]}>{totalConfirmadas}</Text>
            <Text style={styles.statLabel}>Confirmadas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.warning }]}>{totalPendentes}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
        </View>

        {/* Proxima corrida destacada */}
        {proximaInscricao && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proxima Corrida</Text>
            <TouchableOpacity
              style={styles.nextRaceCard}
              onPress={() => router.push('/(atleta)/inscricoes')}
            >
              <View style={styles.nextRaceHeader}>
                <View style={styles.nextRaceDate}>
                  <Text style={styles.nextRaceDay}>
                    {new Date(proximaInscricao.eventoData).getDate()}
                  </Text>
                  <Text style={styles.nextRaceMonth}>
                    {new Date(proximaInscricao.eventoData).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.nextRaceInfo}>
                  <Text style={styles.nextRaceName}>{proximaInscricao.eventoNome}</Text>
                  <Text style={styles.nextRaceLocation}>
                    {proximaInscricao.eventoCidade}/{proximaInscricao.eventoEstado}
                  </Text>
                  <Text style={styles.nextRaceCategory}>
                    {proximaInscricao.categoriaNome} - {proximaInscricao.categoriaDistanciaKm} km
                  </Text>
                </View>
              </View>

              <View style={styles.nextRaceFooter}>
                <View style={styles.countdownContainer}>
                  {getDaysUntil(proximaInscricao.eventoData) === 0 ? (
                    <Text style={styles.countdownToday}>Hoje!</Text>
                  ) : getDaysUntil(proximaInscricao.eventoData) === 1 ? (
                    <Text style={styles.countdownText}>Amanha</Text>
                  ) : (
                    <Text style={styles.countdownText}>
                      Em {getDaysUntil(proximaInscricao.eventoData)} dias
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(proximaInscricao.status) + '20' },
                  ]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(proximaInscricao.status) }]}>
                    {getStatusLabel(proximaInscricao.status)}
                  </Text>
                </View>
              </View>

              {proximaInscricao.numeroInscricao && proximaInscricao.status === 'PAGO' && (
                <View style={styles.numeroContainer}>
                  <Text style={styles.numeroLabel}>Numero de Peito</Text>
                  <Text style={styles.numero}>#{proximaInscricao.numeroInscricao}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Minhas inscricoes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minhas Corridas</Text>
            <TouchableOpacity onPress={() => router.push('/(atleta)/inscricoes')}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {inscricoesAtivas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏃</Text>
              <Text style={styles.emptyTitle}>Nenhuma corrida inscrita</Text>
              <Text style={styles.emptyText}>
                Encontre eventos perto de voce e se inscreva!
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/(atleta)/eventos')}
              >
                <Text style={styles.emptyButtonText}>Explorar Eventos</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.racesList}>
              {inscricoesAtivas.slice(0, 3).map((inscricao) => (
                <TouchableOpacity
                  key={inscricao.id}
                  style={styles.raceCard}
                  onPress={() => router.push('/(atleta)/inscricoes')}
                >
                  <View style={styles.raceDateBadge}>
                    <Text style={styles.raceDateText}>{formatDate(inscricao.eventoData)}</Text>
                  </View>
                  <View style={styles.raceCardContent}>
                    <Text style={styles.raceCardName}>{inscricao.eventoNome}</Text>
                    <Text style={styles.raceCardCategory}>
                      {inscricao.categoriaNome} ({inscricao.categoriaDistanciaKm} km)
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.raceStatusDot,
                      { backgroundColor: getStatusColor(inscricao.status) },
                    ]}
                  />
                </TouchableOpacity>
              ))}
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
    backgroundColor: Colors.secondary,
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
  searchButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchButtonText: {
    color: Colors.secondary,
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
  nextRaceCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  nextRaceHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  nextRaceDate: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  nextRaceDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  nextRaceMonth: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  nextRaceInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nextRaceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  nextRaceLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  nextRaceCategory: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  nextRaceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  countdownContainer: {},
  countdownText: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '500',
  },
  countdownToday: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  numeroContainer: {
    backgroundColor: Colors.secondary + '10',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  numeroLabel: {
    fontSize: 14,
    color: Colors.secondary,
  },
  numero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
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
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  racesList: {
    gap: 8,
  },
  raceCard: {
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
  raceDateBadge: {
    backgroundColor: Colors.secondary + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  raceDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  raceCardContent: {
    flex: 1,
    marginLeft: 12,
  },
  raceCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  raceCardCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  raceStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
