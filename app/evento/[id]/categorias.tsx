import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { eventosService, Categoria, CriarCategoriaRequest } from '@/services/eventos';

export default function CategoriasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  const [valor, setValor] = useState('');
  const [limiteVagas, setLimiteVagas] = useState('');
  const [idadeMinima, setIdadeMinima] = useState('');
  const [idadeMaxima, setIdadeMaxima] = useState('');

  const loadCategorias = useCallback(async () => {
    try {
      const data = await eventosService.listarCategorias(Number(id));
      setCategorias(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCategorias();
  }, [loadCategorias]);

  function resetForm() {
    setNome('');
    setDescricao('');
    setDistanciaKm('');
    setValor('');
    setLimiteVagas('');
    setIdadeMinima('');
    setIdadeMaxima('');
    setEditando(null);
  }

  function openModal(categoria?: Categoria) {
    if (categoria) {
      setEditando(categoria);
      setNome(categoria.nome);
      setDescricao(categoria.descricao || '');
      setDistanciaKm(categoria.distanciaKm.toString());
      setValor(categoria.valor.toString());
      setLimiteVagas(categoria.limiteVagas?.toString() || '');
      setIdadeMinima(categoria.idadeMinima?.toString() || '');
      setIdadeMaxima(categoria.idadeMaxima?.toString() || '');
    } else {
      resetForm();
    }
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    resetForm();
  }

  async function handleSalvar() {
    if (!nome.trim() || !distanciaKm || !valor) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios');
      return;
    }

    const categoriaData: CriarCategoriaRequest = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      distanciaKm: parseFloat(distanciaKm),
      valor: parseFloat(valor),
      limiteVagas: limiteVagas ? parseInt(limiteVagas) : undefined,
      idadeMinima: idadeMinima ? parseInt(idadeMinima) : undefined,
      idadeMaxima: idadeMaxima ? parseInt(idadeMaxima) : undefined,
    };

    setSaving(true);
    try {
      if (editando) {
        await eventosService.atualizarCategoria(Number(id), editando.id, categoriaData);
        Alert.alert('Sucesso', 'Categoria atualizada!');
      } else {
        await eventosService.criarCategoria(Number(id), categoriaData);
        Alert.alert('Sucesso', 'Categoria criada!');
      }
      closeModal();
      loadCategorias();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao salvar categoria';
      Alert.alert('Erro', message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluir(categoria: Categoria) {
    Alert.alert(
      'Excluir Categoria',
      `Deseja excluir a categoria "${categoria.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventosService.excluirCategoria(Number(id), categoria.id);
              Alert.alert('Sucesso', 'Categoria excluída!');
              loadCategorias();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a categoria');
            }
          },
        },
      ]
    );
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Categorias</Text>
        <TouchableOpacity onPress={() => openModal()}>
          <Text style={styles.addButton}>+ Nova</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {categorias.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma categoria cadastrada</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => openModal()}>
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
              {categoria.descricao && (
                <Text style={styles.categoriaDescricao}>{categoria.descricao}</Text>
              )}
              <View style={styles.categoriaInfo}>
                <Text style={styles.categoriaInfoText}>
                  {categoria.distanciaKm} km
                </Text>
                {categoria.limiteVagas && (
                  <Text style={styles.categoriaInfoText}>
                    • {categoria.limiteVagas} vagas
                  </Text>
                )}
                {(categoria.idadeMinima || categoria.idadeMaxima) && (
                  <Text style={styles.categoriaInfoText}>
                    • {categoria.idadeMinima || '0'}-{categoria.idadeMaxima || '∞'} anos
                  </Text>
                )}
              </View>
              <View style={styles.categoriaActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openModal(categoria)}
                >
                  <Text style={styles.actionButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDanger]}
                  onPress={() => handleExcluir(categoria)}
                >
                  <Text style={styles.actionButtonTextDanger}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editando ? 'Editar Categoria' : 'Nova Categoria'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nome *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 5km, 10km, Maratona"
                  placeholderTextColor={Colors.textLight}
                  value={nome}
                  onChangeText={setNome}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Descrição da categoria"
                  placeholderTextColor={Colors.textLight}
                  value={descricao}
                  onChangeText={setDescricao}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Distância (km) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="5"
                    placeholderTextColor={Colors.textLight}
                    value={distanciaKm}
                    onChangeText={setDistanciaKm}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.label}>Valor (R$) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50.00"
                    placeholderTextColor={Colors.textLight}
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Limite de vagas</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Deixe vazio para ilimitado"
                  placeholderTextColor={Colors.textLight}
                  value={limiteVagas}
                  onChangeText={setLimiteVagas}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Text style={styles.label}>Idade mínima</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="16"
                    placeholderTextColor={Colors.textLight}
                    value={idadeMinima}
                    onChangeText={setIdadeMinima}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1, marginLeft: 12 }]}>
                  <Text style={styles.label}>Idade máxima</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="99"
                    placeholderTextColor={Colors.textLight}
                    value={idadeMaxima}
                    onChangeText={setIdadeMaxima}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.buttonDisabled]}
                onPress={handleSalvar}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
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
  categoriaCard: {
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
  categoriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoriaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  categoriaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  categoriaDescricao: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  categoriaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoriaInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  categoriaActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionButtonDanger: {
    borderColor: Colors.error,
  },
  actionButtonTextDanger: {
    color: Colors.error,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.textSecondary,
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
