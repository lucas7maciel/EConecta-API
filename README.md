Econecta API (Next.js)

API em Next.js para cadastro de focos de lixo e pontos de coleta, usando Prisma/PostgreSQL e NextAuth (JWT) com provider Google.

## Setup rapido
- Clone o projeto, instale deps (`npm install`) e configure `.env` com `DATABASE_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID/SECRET` e credenciais do Firebase (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`).
- Rode migrations/seed conforme necessario e inicie com `npm run dev`.

## Autenticacao
- Sessao gerenciada pelo NextAuth em `/api/auth/[...nextauth]` (provider Google, estrategia JWT).
- O callback de sessao inclui `sessionToken` (JWT) assinado com `NEXTAUTH_SECRET`.
- Endpoints protegidos exigem header `Authorization: Bearer <sessionToken>`.

## Modelos (schema.prisma)
- `User` com imagem (profilePic), contas OAuth e sessoes. Se relaciona a comentarios, confirmacoes e registros de spots.
- `TrashSpot` e `CollectionSpots` compartilham `Location`, `Image[]`, `Comment[]`, `Confirmation[]` e referencia a `registeredBy` (User).
- `Location` guarda latitude/longitude e dados de endereco.
- `Comment` pertence a `User` e a um `TrashSpot` ou `CollectionSpots`.
- `Confirmation` liga `User` a um spot (trash ou collection) e e unica por usuario/spot.
- `Image` pode estar ligada a um `User`, `TrashSpot` ou `CollectionSpots` (foto de perfil e unica por usuario).
- Enums: `StayDuration (UP_TO_5_DAYS | SEVERAL_WEEKS | SEVERAL_MONTHS)`, `Vegetation (NONE | LOW | TALL)`, `Water (ABUNDANT | FRESH | BRACKISH | NONE)`, `Soil (FERTILE | ROCKY | COMPACT)`, `Terrain (FLAT | STEEP | INACCESSIBLE)`, `Animal (VARIOUS | FLIES | HORSES | PIGS)`, `Climate (TROPICAL | TEMPERATE | ARCTIC | UNKNOWN | NO_RESPONSE)`, `Disposal (TRASH_BINS_AVAILABLE)`.

## Endpoints
`GET /api/users/me`  
Retorna usuario logado (`id`, `name`, `email`, `image`) e contagens de `trashSpots`, `confirmations`, `comments`. Requer Bearer.

`GET /api/spots/me?city=<str>&name=<str>&type=trash|collection`  
Lista spots registrados pelo usuario autenticado, filtrando por cidade/nome e opcionalmente tipo. Requer Bearer.

`GET /api/trashspots`  
Lista focos de lixo com `location`. Sem filtros ainda.

`POST /api/trashspots`  
Cria foco de lixo. Requer Bearer. Body JSON:
```json
{
  "name": "Lixao X",
  "description": "opcional",
  "stayDuration": "UP_TO_5_DAYS",
  "vegetation": "LOW",
  "terrain": "FLAT",
  "climate": "TROPICAL",
  "water": ["FRESH"],
  "soil": ["FERTILE"],
  "animals": ["VARIOUS"],
  "disposal": ["TRASH_BINS_AVAILABLE"],
  "location": {
    "latitude": -23.5,
    "longitude": -46.6,
    "city": "Sao Paulo",
    "state": "SP",
    "country": "BR",
    "district": "Centro",
    "postalCode": "00000-000",
    "formattedAddr": "Rua X, 123"
  }
}
```

`PATCH /api/trashspots/:id`  
Atualiza foco de lixo do proprio registrante. Requer Bearer. Body com ao menos um campo de `spotSchema` (pode incluir `location` parcial).

`DELETE /api/trashspots/:id`  
Remove foco de lixo, apenas pelo registrante. Requer Bearer.

`POST /api/trashspots/:id/confirm`  
Cria `Confirmation` para o foco de lixo. Requer Bearer. 409 se ja existir para o usuario.

`DELETE /api/trashspots/:id/confirm`  
Remove confirmacao do usuario para o foco de lixo. Requer Bearer. 404 se nao existir.

`GET /api/trashspots/:id/comments`  
Lista comentarios vinculados ao foco de lixo. Sem auth.

`POST /api/comments`  
Cria comentario em um foco de lixo. Requer Bearer. Body:
```json
{ "content": "texto", "trashSpotId": 1 }
```

`DELETE /api/comments/:id`  
Remove comentario (nao ha checagem de autenticacao/proprietario). 404 se nao encontrado.

`GET /api/collectionspots`  
Lista pontos de coleta com `location`.

`POST /api/collectionspots`  
Cria ponto de coleta. Requer Bearer. Body:
```json
{
  "name": "Ponto Y",
  "email": "contato@exemplo.com",
  "location": { "latitude": -23.5, "longitude": -46.6, "city": "Sao Paulo" }
}
```

`PATCH /api/collectionspots/:id`  
Atualiza ponto de coleta do proprio registrante. Requer Bearer. Body segue `collectionSpotUpdateSchema` (campos opcionais, `location` parcial).

`DELETE /api/collectionspots/:id`  
Remove ponto de coleta, apenas pelo registrante. Requer Bearer.

`POST /api/collectionspots/:id/confirm`  
Cria `Confirmation` para ponto de coleta. Requer Bearer. 409 se duplicado.

`DELETE /api/collectionspots/:id/confirm`  
Remove confirmacao do usuario para ponto de coleta. Requer Bearer.

`POST /api/mobile/auth`  
Troca um `code` (JWT do tipo `mobile_code`) por `{ token, user }`, validando exp. Body: `{ "code": "<jwt>" }`. Usa `NEXTAUTH_SECRET` para verificacao.

`GET /api/redirect?callbackUrl=<url>`  
Usado pelo NextAuth para apps moveis: injeta `token=<sessionToken>` ou `error=no_session` na callback e redireciona.

`POST /api/upload`  
Upload multipart para Firebase Storage. Campos: `image` (File), `target` (`user`|`trashspot`|`collectionspot`), `targetId` (id do alvo). Retorna `{ url, image }`. 404 se alvo nao existir, 409 se ja houver imagem para user. (Sem auth atualmente).

`GET/POST /api/auth/[...nextauth]`  
Handlers do NextAuth.

## Observacoes
- Validacoes de payload usam `zod`; campos opcionais ausentes sao ignorados na criacao/atualizacao.
- Confirmacoes sao unicas por usuario/spot (veja constraints em `Confirmation` no `schema.prisma`).
- Comentarios e uploads nao checam ownership/autenticacao em todas as rotas; avalie se precisa proteger antes de usar em prod.
