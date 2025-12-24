import { useState, useEffect, useCallback } from 'react';
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

export default function EventosScreen() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOrganizador = user?.role === 'ORGANIZADOR' || user?.role === 'ADMIN';

  useFocusEffect(
    useCallback(() => {
      loadEventos();
    }, [])
  );

  async function loadEventos() {
    try {
      const endpoint = isOrganizador
        ? ENDPOINTS.EVENTOS.BASE
        : ENDPOINTS.EVENTOS.PUBLICOS;
      const response = await api.get(endpoint);
      setEventos(response.data);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os eventos');
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

  function handleEventoPress(evento: Evento) {
    if (isOrganizador) {
      router.push(`/evento/${evento.id}`);
    } else {
      router.push(`/evento/${evento.id}/inscricao`);
    }
  }

  function renderEvento({ item }: { item: Evento }) {
    return (
      <TouchableOpacity style={styles.eventoCard} onPress={() => handleEventoPress(item)}>
        <View style={styles.eventoHeader}>
          <Text style={styles.eventoNome}>{item.nome}</Text>
          <View
            style={[
              styles.statusBadge,
              item.inscricoesAbertas ? styles.statusAberto : styles.statusFechado,
            ]}
          >
            <Text style={styles.statusText}>
              {item.inscricoesAbertas ? 'Aberto' : 'Fechado'}
            </Text>
          </View>
        </View>
        <View style={styles.eventoInfo}>
          <Text style={styles.eventoData}>{formatDate(item.data)}</Text>
          <Text style={styles.eventoLocal}>
            {item.local} - {item.cidade}/{item.estado}
          </Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isOrganizador ? 'Meus Eventos' : 'Eventos Disponíveis'}
        </Text>
        {isOrganizador && (
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/evento/novo')}>
            <Text style={styles.addButtonText}>+ Novo</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={eventos}
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
            <Text style={styles.emptyText}>
              {isOrganizador
                ? 'Você ainda não criou nenhum evento'
                : 'Nenhum evento disponível no momento'}
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
