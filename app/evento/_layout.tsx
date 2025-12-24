import { Stack } from 'expo-router';

export default function EventoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="novo" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/editar" />
      <Stack.Screen name="[id]/categorias" />
      <Stack.Screen name="[id]/inscricoes" />
      <Stack.Screen name="[id]/inscricao" />
    </Stack>
  );
}
