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

interface Evento {
  id: number;
  nome: string;
  data: string;
  local: string;
  cidade: string;
  estado: string;
  inscricoesAbertas: boolean;
}

export default function EventosOrganizadorScreen() {
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
      const response = await api.get(ENDPOINTS.EVENTOS.BASE);
      setEventos(response.data);
    } catch (error: any) {
      Alert.alert('Erro', 'Nao foi possivel carregar os eventos');
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
      year: 'numeric',
    });
  }

  function renderEvento({ item }: { item: Evento }) {
    const isPast = new Date(item.data) < new Date();

    return (
      <TouchableOpacity
        style={[styles.eventoCard, isPast && styles.eventoCardPast]}
        onPress={() => router.push(`/evento/${item.id}`)}
      >
        <View style={styles.eventoHeader}>
          <Text style={[styles.eventoNome, isPast && styles.textoPassado]}>{item.nome}</Text>
          <View
            style={[
              styles.statusBadge,
              item.inscricoesAbertas ? styles.statusAberto : styles.statusFechado,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.inscricoesAbertas ? Colors.success : Colors.error },
              ]}
            >
              {item.inscricoesAbertas ? 'Aberto' : 'Fechado'}
            </Text>
          </View>
        </View>
        <View style={styles.eventoInfo}>
          <Text style={[styles.eventoData, isPast && styles.textoPassado]}>
            {formatDate(item.data)}
          </Text>
          <Text style={styles.eventoLocal}>
            {item.local} - {item.cidade}/{item.estado}
          </Text>
        </View>
        {isPast && (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>Evento encerrado</Text>
          </View>
        )}
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

  // Separar eventos futuros e passados
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
        <Text style={styles.title}>Meus Eventos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/evento/novo')}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...eventosFuturos, ...eventosPassados]}
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
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Nenhum evento</Text>
            <Text style={styles.emptyText}>
              Voce ainda nao criou nenhum evento
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
    backgroundColor: Colors.white,
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  eventoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventoCardPast: {
    opacity: 0.7,
    backgroundColor: Colors.background,
  },
  eventoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventoNome: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  textoPassado: {
    color: Colors.textSecondary,
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
  },
  eventoInfo: {
    gap: 4,
  },
  eventoData: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  eventoLocal: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pastBadge: {
    backgroundColor: Colors.textLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  pastBadgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
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
    marginBottom: 20,
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
