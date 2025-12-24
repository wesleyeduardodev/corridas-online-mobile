# Corridas Mobile

Aplicativo mobile para o sistema de gerenciamento de corridas de rua.

## Tecnologias

- React Native / Expo SDK 54
- Expo Router (navegação)
- TypeScript
- Axios
- TanStack Query

## Pré-requisitos

- Node.js 18+
- Expo Go instalado no celular

## Instalação

```bash
npm install
```

## Executando

```bash
npm start
```

Escaneie o QR code com o Expo Go (Android) ou Camera (iOS).

## Configurando a API

### Desenvolvimento Local

Para testar com a API rodando localmente, é necessário usar o ngrok para expor a API.

### 1. Criar conta no ngrok

Acesse [ngrok.com](https://ngrok.com) e crie uma conta gratuita.

### 2. Instalar o ngrok

```bash
# Windows (com chocolatey)
choco install ngrok

# Ou baixe diretamente do site
```

### 3. Autenticar o ngrok

Após criar a conta, copie seu authtoken do dashboard e execute:

```bash
ngrok config add-authtoken SEU_AUTH_TOKEN
```

### 4. Expor a API

Com a API rodando na porta 8080:

```bash
ngrok http 8080
```

### 5. Atualizar a URL no app

Copie a URL gerada pelo ngrok (ex: `https://xxxx-xxx-xxx.ngrok-free.app`) e atualize o arquivo:

**constants/api.ts**
```typescript
export const API_URL = 'https://xxxx-xxx-xxx.ngrok-free.app';
```

### 6. Recarregar o app

Pressione `r` no terminal do Expo para recarregar o app com a nova URL.

## Estrutura do Projeto

```
corridas-mobile/
├── app/                    # Telas (Expo Router)
│   ├── (auth)/            # Telas de autenticação
│   │   ├── login.tsx
│   │   ├── registro.tsx
│   │   ├── registro-organizador.tsx
│   │   └── registro-atleta.tsx
│   └── (tabs)/            # Telas principais (tabs)
│       ├── index.tsx      # Home
│       ├── eventos.tsx    # Eventos
│       ├── inscricoes.tsx # Inscrições
│       └── perfil.tsx     # Perfil
├── constants/             # Constantes
│   ├── api.ts            # URLs da API
│   └── colors.ts         # Paleta de cores
├── contexts/              # Contextos React
│   └── AuthContext.tsx   # Autenticação
├── services/              # Serviços
│   ├── api.ts            # Configuração Axios
│   └── auth.ts           # Serviços de auth
└── assets/               # Imagens e fontes
```

## Funcionalidades

### Atleta
- Login e registro
- Visualizar eventos disponíveis
- Inscrever-se em eventos
- Acompanhar inscrições

### Organizador
- Login e registro
- Criar e gerenciar eventos
- Criar categorias
- Visualizar inscritos
