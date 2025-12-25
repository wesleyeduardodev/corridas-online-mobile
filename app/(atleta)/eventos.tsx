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
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/api';
import { parseLocalDate, getDateParts, getCountdownText, getToday, getDaysUntil } from '@/utils/dateHelpers';

interface Evento {
  id: number;
  nome: string;
  data: string;
  local: string;
  cidade: string;
  estado: string;
  inscricoesAbertas: boolean;
}

export default function EventosAtletaScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEventos();
    }, [])
  );

  async function loadEventos() {
    try {
      const response = await api.get(ENDPOINTS.EVENTOS.PUBLICOS);
      setEventos(response.data);
    } catch (error: any) {
      Alert.alert('Erro', 'Nao foi possivel carregar os eventos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function renderEvento({ item }: { item: Evento }) {
    const { day, month } = getDateParts(item.data);
    const daysUntil = getDaysUntil(item.data);
    const isToday = daysUntil === 0;

    return (
      <TouchableOpacity
        style={styles.eventoCard}
        onPress={() => router.push(`/evento/${item.id}/inscricao`)}
      >
        <View style={styles.eventoDateContainer}>
          <Text style={styles.eventoDay}>{day}</Text>
          <Text style={styles.eventoMonth}>{month}</Text>
        </View>

        <View style={styles.eventoContent}>
          <Text style={styles.eventoNome}>{item.nome}</Text>
          <Text style={styles.eventoLocal}>
            {item.cidade}/{item.estado}
          </Text>
          <View style={styles.eventoFooter}>
            <Text style={isToday ? styles.eventoDaysToday : styles.eventoDays}>
              {getCountdownText(item.data)}
            </Text>
          </View>
        </View>

        <View style={styles.eventoAction}>
          {item.inscricoesAbertas ? (
            <View style={styles.inscricaoAberta}>
              <Text style={styles.inscricaoAbertaText}>Inscrever</Text>
            </View>
          ) : (
            <View style={styles.inscricaoFechada}>
              <Text style={styles.inscricaoFechadaText}>Fechado</Text>
            </View>
          )}
        </View>
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

  const hoje = getToday();
  const eventosOrdenados = eventos
    .filter(e => parseLocalDate(e.data) >= hoje)
    .sort((a, b) => {
      if (a.inscricoesAbertas && !b.inscricoesAbertas) return -1;
      if (!a.inscricoesAbertas && b.inscricoesAbertas) return 1;
      return parseLocalDate(a.data).getTime() - parseLocalDate(b.data).getTime();
    });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Eventos Disponiveis</Text>
        <Text style={styles.subtitle}>{eventosOrdenados.length} eventos encontrados</Text>
      </View>

      <FlatList
        data={eventosOrdenados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvento}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadEventos();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏃</Text>
            <Text style={styles.emptyTitle}>Nenhum evento disponivel</Text>
            <Text style={styles.emptyText}>
              Nao ha eventos com inscricoes abertas no momento
            </Text>
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
    backgroundColor: Colors.white,
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  eventoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventoDateContainer: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    minWidth: 50,
  },
  eventoDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  eventoMonth: {
    fontSize: 10,
    color: Colors.white,
    opacity: 0.9,
  },
  eventoContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  eventoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  eventoLocal: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  eventoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventoDays: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500',
  },
  eventoDaysToday: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: 'bold',
  },
  eventoAction: {
    justifyContent: 'center',
  },
  inscricaoAberta: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inscricaoAbertaText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  inscricaoFechada: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  inscricaoFechadaText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
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
  },
});
