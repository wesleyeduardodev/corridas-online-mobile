import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/colors';
import { eventosService, Evento, Categoria } from '@/services/eventos';

export default function DetalhesEventoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [eventoData, categoriasData] = await Promise.all([
        eventosService.buscarPorId(Number(id)),
        eventosService.listarCategorias(Number(id)),
      ]);
      setEvento(eventoData);
      setCategorias(categoriasData);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar o evento');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  async function handleExcluir() {
    Alert.alert(
      'Excluir Evento',
      'Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventosService.excluir(Number(id));
              Alert.alert('Sucesso', 'Evento excluído com sucesso');
              router.replace('/(organizador)/eventos');
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível excluir o evento');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!evento) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalhes</Text>
        <TouchableOpacity onPress={() => router.push(`/evento/${id}/editar`)}>
          <Text style={styles.editButton}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadData();
          }} />
        }
      >
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.eventoNome}>{evento.nome}</Text>
            <View style={[
              styles.statusBadge,
              evento.inscricoesAbertas ? styles.statusAberto : styles.statusFechado
            ]}>
              <Text style={styles.statusText}>
                {evento.inscricoesAbertas ? 'Aberto' : 'Fechado'}
              </Text>
            </View>
          </View>

          {evento.descricao && (
            <Text style={styles.descricao}>{evento.descricao}</Text>
          )}

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data</Text>
              <Text style={styles.infoValue}>{formatDate(evento.data)}</Text>
            </View>
            {evento.horario && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Horário</Text>
                <Text style={styles.infoValue}>{evento.horario.slice(0, 5)}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Local</Text>
              <Text style={styles.infoValue}>{evento.local}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cidade</Text>
              <Text style={styles.infoValue}>{evento.cidade}/{evento.estado}</Text>
            </View>
            {evento.limiteInscricoes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Limite</Text>
                <Text style={styles.infoValue}>{evento.limiteInscricoes} vagas</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categorias ({categorias.length})</Text>
            <TouchableOpacity onPress={() => router.push(`/evento/${id}/categorias`)}>
              <Text style={styles.sectionLink}>Gerenciar</Text>
            </TouchableOpacity>
          </View>

          {categorias.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push(`/evento/${id}/categorias`)}
              >
                <Text style={styles.emptyButtonText}>Adicionar Categoria</Text>
              </TouchableOpacity>
            </View>
          ) : (
            categorias.map((categoria) => (
              <View key={categoria.id} style={styles.categoriaCard}>
                <View style={styles.categoriaHeader}>
                  <Text style={styles.categoriaNome}>{categoria.nome}</Text>
                  <Text style={styles.categoriaValor}>{formatCurrency(categoria.valor)}</Text>
                </View>
                <Text style={styles.categoriaInfo}>
                  {categoria.distanciaKm} km
                  {categoria.limiteVagas ? ` • ${categoria.limiteVagas} vagas` : ''}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Inscrições</Text>
            <TouchableOpacity onPress={() => router.push(`/evento/${id}/inscricoes`)}>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.inscricoesCard}
            onPress={() => router.push(`/evento/${id}/inscricoes`)}
          >
            <Text style={styles.inscricoesText}>Gerenciar inscrições do evento</Text>
            <Text style={styles.inscricoesArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleExcluir}>
          <Text style={styles.deleteButtonText}>Excluir Evento</Text>
        </TouchableOpacity>
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
    backgroundColor: Colors.white,
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventoNome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
  descricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
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
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriaCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoriaNome: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  categoriaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  categoriaInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  inscricoesCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inscricoesText: {
    fontSize: 16,
    color: Colors.text,
  },
  inscricoesArrow: {
    fontSize: 20,
    color: Colors.primary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
