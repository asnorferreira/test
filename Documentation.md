# Backend — Documentação Técnica (sistema condomonio)

# 

**Projeto:** Sistema de Controle de Acesso para Condomínio (Portarias 1 e 2)

**Objetivo:** Implementar um backend escalável, seguro e de baixa latência para operar dispositivos de acesso (catracas, cancelas, motores de portão), leitores (facial, biometria, UHF) e câmeras IP, com foco em separação de responsabilidades (Clean/Hexagonal Architecture), performance em histórico de eventos e módulo local (Edge) para operação em rede interna.

---

## 1) Visão de Arquitetura

### 1.1 Estilo Arquitetural

- **Clean/Hexagonal Architecture (Ports & Adapters)**
    - **Domínio/Use Cases** independentes de frameworks.
    - **Ports** (interfaces) definem contratos para DB, filas, drivers e integrações externas.
    - **Adapters** implementam ports (MySQL/PostgreSQL, RabbitMQ/Kafka, drivers ZKTeco/PPA/Imecontron/Control iD/Intelbras/Hikvision, storage S3, OIDC etc.).
    - **Edge Service** como nó local: baixa latência, operação offline-first, drivers nativos e sincronização confiável com a nuvem.

### 1.2 Componentes Principais

- **Core (Domínio + Casos de Uso)**
    - Entidades: Pessoa, Morador, Visitante, Credencial (facial, biometria, UHF, QR), PontoDeAcesso, Dispositivo, EventoDeAcesso, Autorização, Licença, Instalação, Portaria, Operador, PerfilAcesso.
    - Casos de Uso: CadastrarVisitante, VincularCredencial, ValidarAcesso, AcionarDispositivo (abrir/travar), RegistrarEvento, GerirDispositivo, SincronizarFace, ConsultarRelatórios, GerirLicença, GerirPerfis.
- **Application (Orquestração)**: Services transacionais, validação, políticas, coordenadores de caso de uso, publicadores de eventos (domain events → fila).
- **Adapters**
    - **Inbound**: REST/GraphQL Controllers (Admin Web, App de Portaria, Edge RPC), Webhooks.
    - **Outbound**: Repositórios (DB), Mensageria, Drivers (Device Connectors), Storage de snapshot (S3), Gateways Face/Vídeo (ONVIF/RTSP), Serviço de Licenças, Observabilidade.
- **Edge Service** (Local): Drivers nativos, fila local, cache de credenciais do dia, buffer de eventos, APIs locais autenticadas.

### 1.3 Macrofluxo Operacional

1. Dispositivo (catraca/cancela/leitor facial/UHF) emite leitura/solicitação → Driver (Edge) converte para **EventoDeLeitura**.
2. Edge valida políticas locais (cache do dia + lista de bloqueio) e/ou consulta o backend.
3. Decisão de **permitir/negado** → Edge aciona o dispositivo (open/deny) e registra **EventoDeAcesso**.
4. Snapshot (via Gateway de Câmera IP) é capturado e vinculado ao evento (URI S3/object storage).
5. Eventos são enfileirados para persistência e auditoria no backend; relatórios e dashboards consomem leituras otimizadas.

---

## 2) Módulos e Pacotes

### 2.1 Domínio (Puro)

- **Entities/**: `Pessoa`, `Credencial`, `Dispositivo`, `PontoDeAcesso`, `EventoDeAcesso`, `Autorizacao`, `Licenca`, `Instalacao`, `PerfilAcesso`.
- **Value Objects/**: `Documento`, `TemplateFacialId`, `PlacaUHF`, `CredencialId`, `HorarioAcesso`, `BoundInfo` (info de amarração da licença), `DeviceAddress` (ip:porta), `SnapshotUri`.
- **Services (Domain Services)/**: `PoliticaAcessoService` (horários, anti-passback, regras), `LicenciamentoService` (validação de licença e módulos), `EventoFactory`.
- **Events/**: `AcessoValidado`, `AcessoNegado`, `DispositivoAtuado`, `CadastroFacialVinculado`.
- **Repositories (Ports)/**: interfaces para leitura/gravação de entidades e eventos.

### 2.2 Application (Use Cases)

- **UseCases/**
    - `CadastrarVisitante`
    - `VincularCredencial` (facial/biometria/UHF/QR)
    - `ValidarAcesso`
    - `AcionarDispositivo`
    - `RegistrarEvento`
    - `GerirDispositivo` (CRUD, provisionamento, health)
    - `GerirLicenca` (ativar/renovar/verificar)
    - `ConsultarRelatorios`
    - `GerirPerfis`
- **Ports Outbound/** (interfaces): `PessoaRepository`, `CredencialRepository`, `EventoRepository`, `DispositivoRepository`, `LicencaRepository`, `MensagemBus`, `DeviceConnector`, `FaceGateway`, `CameraGateway`, `StorageGateway` (snapshots), `LicenseServerGateway`.
- **Ports Inbound/**: `AccessApi`, `AdminApi`, `EdgeApi`, `WebhookApi`.

### 2.3 Infra/Adapters

- **DB**: MySQL/PostgreSQL (particionado), Migrations.
- **Mensageria**: RabbitMQ/Redpanda/Kafka.
- **Drivers**: `ZKTecoAdapter`, `PPAAdapter`, `ImecontronAdapter`, `ControlIDAdapter`, `IntelbrasAdapter`, `HikvisionAdapter`, `IDFlexAdapter`, `IDUHFAdapter`, `IDFaceAdapter`.
- **Gateways**: `OnvifRtspCameraGateway`, `FaceSdkGateway` (cadastro/sincronização facial), `S3StorageGateway`, `OidcAuthGateway`, `LicenseServerGateway`.
- **Observability**: OpenTelemetry (traces/metrics/logs), Prometheus/Grafana.

---

## 3) Contratos (Ports) — Assinaturas

> Exemplos em TypeScript (Node.js) visando clareza e testabilidade.
> 

```tsx
// DeviceConnector.ts (port)
export interface DeviceConnector {
  connect(cfg: DeviceConfig): Promise<void>;
  health(): Promise<DeviceHealth>;
  listenEvents(onEvent: (evt: RawDeviceEvent) => void): Promise<void>;
  open(accessPointId: string, options?: ActuationOptions): Promise<ActuationResult>;
  enroll?(data: EnrollmentPayload): Promise<EnrollmentResult>; // facial/biometria, quando aplicável
}

// CameraGateway.ts (port)
export interface CameraGateway {
  snapshot(pointId: string, at: Date, hint?: SnapshotHint): Promise<SnapshotUri>;
  // opcional: startPreview/stopPreview via proxy do backend (nunca expor IP direto)
}

// FaceGateway.ts (port)
export interface FaceGateway {
  enrollFace(personId: string, imageOrStreamRef: StreamRef): Promise<TemplateFacialId>;
  syncToReader(faceId: TemplateFacialId, readers: string[]): Promise<void>;
}

// Mensageria
export interface MessageBus {
  publish(topic: string, payload: any, headers?: Record<string,string>): Promise<void>;
  subscribe(topic: string, handler: (msg: BusMessage) => Promise<void>): Promise<Unsubscribe>;
}

// Repositórios
export interface EventoRepository {
  append(evt: EventoDeAcesso): Promise<void>;
  query(filter: EventoFiltro, page: Page): Promise<Page<EventoDeAcesso>>;
}

```

---

## 4) API — Esqueleto (REST)

**Admin API**

- `POST /pessoas` — criar/atualizar pessoa
- `POST /pessoas/{id}/credenciais` — { tipo: facial|biometria|uhf|qr }
- `POST /pessoas/{id}/credenciais/facial:cadastrar` — orquestra gateway de câmera + FaceGateway
- `GET /dispositivos` | `POST /dispositivos` | `POST /dispositivos/{id}/comandos` (abrir/travar/reiniciar)
- `GET /pontos-acesso` | `POST /pontos-acesso`
- `GET /relatorios/eventos?de&ate&ponto&tipo`
- `POST /licencas/ativar` | `GET /licencas/status`

**Portaria API (Operação)**

- `POST /acessos/validar` — valida credencial + política (cache/online)
- `POST /acessos/acionar` — comando manual com justificativa
- `GET /turno/dashboard` — entradas/saídas recentes, alertas

**Edge API (Local)**

- `POST /edge/eventos` — ingestão de eventos locais
- `GET /edge/health` — status drivers e fila local
- `POST /edge/sync` — push/pull de cadastros/credenciais

> Autenticação: OIDC (Bearer) + RBAC/ABAC por rota; escopos distintos para Admin, Portaria, Integrador.
> 

---

## 5) Dados & Performance

### 5.1 Modelo de Dados (resumo)

- **Pessoa(id, tipo, unidade, documento, contatos)**
- **Credencial(id, pessoa_id, tipo, status, vigencia_inicio, vigencia_fim, meta)**
- **Dispositivo(id, fabricante, modelo, ip, porta, driver, status, portaria_id)**
- **PontoDeAcesso(id, tipo, direcao, dispositivo_id, portaria_id, politicas)**
- **EventoDeAcesso(id, pessoa_id?, credencial_id?, ponto_id, acao, resultado, data_hora, snapshot_uri, meta)**
- **Licenca(instalacao_id, chave, modulos, validade, bound_info, status)**
- **Operador(id, perfis, claims)**
- **Instalacao/Portaria** metadados

### 5.2 Particionamento e Armazenamento

- **Tabela do dia (quente)** + **Histórico particionado** por data para `EventoDeAcesso`.
- Índices compostos: `(data_hora, ponto_id, pessoa_id)` e variações por consultas.
- Snapshots/frames em **object storage** (S3-compatível) com política de ciclo de vida.

### 5.2.1 Exemplo de DDL (MySQL 8+)

```sql
CREATE TABLE evento_acesso (
  id BIGINT PRIMARY KEY,
  pessoa_id BIGINT NULL,
  credencial_id BIGINT NULL,
  ponto_id BIGINT NOT NULL,
  acao VARCHAR(32) NOT NULL,
  resultado VARCHAR(32) NOT NULL,
  data_hora DATETIME(3) NOT NULL,
  snapshot_uri VARCHAR(512) NULL,
  meta JSON NULL
) PARTITION BY RANGE (TO_DAYS(data_hora)) (
  PARTITION p2025_10_20 VALUES LESS THAN (TO_DAYS('2025-10-21')),
  PARTITION pmax VALUES LESS THAN MAXVALUE
);

CREATE INDEX ix_evt_dh_ponto ON evento_acesso (data_hora, ponto_id);
CREATE INDEX ix_evt_pessoa_dh ON evento_acesso (pessoa_id, data_hora);

```

> Estratégia: criar partições diárias (ou mensais conforme volumetria), mover partições antigas para histórico/arquivos e manter consultas do dia extremamente rápidas.
> 

### 5.3 Estratégia de ETL/Arquivamento

- **Job noturno**: fecha partição do dia (rotate), cria nova, move partições antigas para tablespace histórico ou base “cold”.
- **Relatórios** recentes leem da partição atual + últimas N; relatórios amplos usam agregações/ETL.

---

## 6) Segurança e Governança

- **Autenticação/Autorização**: OIDC (Keycloak/Auth0), MFA para administradores.
- **RBAC/ABAC**: Papéis (Portaria, Síndico, Admin TI, Integrador). Regras finas por recurso/rota.
- **Segregação de Funções**: Configuração de dispositivos e **câmeras IP** acessível apenas a Admin/Integrador; Portaria tem somente operações do dia.
- **Auditoria**: trilha completa de comandos manuais (quem/quando/qual justificativa), alterações de política, ativação/renovação de licenças.
- **Licenciamento**: serviço central + agent no Edge; amarração a parâmetros de hardware/domínio/nº dispositivos; bloqueio seletivo de módulos ao expirar; modo graça.
- **Criptografia**: TLS em trânsito; secrets/keys em cofre (Vault/KMS); hashes/assinat. para licenças.

---

## 7) Edge Service (Local)

### 7.1 Responsabilidades

- Operar **drivers nativos** sob rede local (latência mínima e alcance a IPs internos).
- **Fila local** (persistência) e **buffer offline** de eventos quando backend indisponível.
- **Cache de credenciais do dia** (moradores/visitantes e listas de bloqueio) com política de expiração.
- **APIs locais** autenticadas para o App de Portaria (acionamento, leitura de estado), sem expor IPs dos dispositivos ao browser.
- **Sincronização**: jobs incrementais (cadastros, credenciais, templates faciais) e push de eventos.

### 7.2 Configuração e Operação

- Serviço Windows/Linux (ou container), com console **somente** para Admin/Integrador (PIN + OIDC device login).
- Wizard de drivers (dispositivo → ponto de acesso), teste de comunicação, health/metrics.

---

## 8) Integrações com Dispositivos (Drivers)

### 8.1 Contratos por Categoria

- **Catraca/Cancela/Motor**: `connect`, `health`, `listenEvents`, `open`, `close`.
- **Leitor Facial/Biometria**: `enroll(template|imagem)`, `syncToReader`, `identify/verify` (conforme suporte do SDK), `listenEvents`.
- **UHF**: `listenReads`, `whitelistSync`.
- **Câmera IP (ONVIF/RTSP)**: `snapshot`, `streamProxy` (no backend), eventos de movimento opcional.

### 8.2 Drivers Iniciais

- ZKTeco TS1000 (catracas), PPA e Imecontron (cancelas/portões), iDFlex (biometria), iDUHF (UHF), iDFace/Intelbras/Hikvision/Control iD (facial/câmera IP).

### 8.3 Estratégia de Plugabilidade

- Registro por **tipo** + **fabricante/modelo** (ex.: `catraca:zkteco:TS1000`).
- Resolução em runtime via configurações (DB) carregadas pelo Edge/Device Manager.
- Versionamento de drivers; feature flags por instalação; capability discovery.

---

## 9) Observabilidade

- **Tracing** end-to-end (Edge → Backend) com OpenTelemetry.
- **Métricas**: tempo de validação, tempo de acionamento, taxa de sucesso por dispositivo, fila local, latência de snapshot, erros por driver.
- **Logs estruturados**: correlação por `correlationId` do evento.
- **Dashboards** operacionais e alertas.

---

## 10) Qualidade, Testes e Segurança

- **TDD/BDD** nos casos de uso.
- **Contract Tests** para Ports (DB/Mensageria/Drivers/Gateways).
- **Testes de Carga** focados em: pico de acessos (entrada/saída), consultas do dia, sincronização massiva de credenciais.
- **Pentest/Threat Modeling**: superfícies Edge e Admin.
- **Hardening**: least privilege, network policies, atualização de drivers/SDKs.

---

## 11) Deploy & Ambientes

- **Monorepo** (opcional) com apps: `backend`, `edge`, `infra-as-code` (Terraform), `migrations`.
- **Ambientes**: dev, staging, produção; **instalações** representam condomínios.
- **CI/CD**: lint, testes, build, containers, migrações automatizadas, versionamento semântico.
- **Edge**: pacote instalável (msi/deb) ou container com auto-update controlado; canal de distribuição autenticado.

---

## 12) Roadmap de Implementação (Backlog enxuto 90 dias)

**Fase 1 — Fundação (Semanas 1–2)**

- Projeto base (Node TS ou Java), configuração de módulos (domain/application/infra).
- OpenAPI/Contratos, RBAC inicial, migrations DB com **particionamento** de eventos.
- Infra: Message Bus (RabbitMQ/Redpanda), S3 local (MinIO) para snapshots.

**Fase 2 — Edge + Drivers MVP (Semanas 3–4)**

- Edge Service com heartbeat, fila local e `ZKTecoAdapter` + `PPAAdapter` + `ImecontronAdapter` (open/listenEvents).
- Pipeline de **EventoDeAcesso** end-to-end (Edge→API→DB part.).

**Fase 3 — Pessoas & Credenciais (Semanas 5–6)**

- CRUD Pessoas/Unidades; Credenciais (QR/UHF); sincronização whitelist UHF.

**Fase 4 — Câmeras & Facial (Semanas 7–8)**

- `OnvifRtspCameraGateway` (snapshot no evento) + `FaceGateway` (iDFace/Intelbras/Hikvision/Control iD) e tela/config restrita.

**Fase 5 — Licenças & Auditoria (Semanas 9–10)**

- Serviço de Licenças (ativar/renovar/verificar), agent no Edge, bloqueios de módulos.
- Auditoria de configuração/comandos.

**Fase 6 — Relatórios & Hardening (Semanas 11–12)**

- Relatórios operacionais, optimizações de índices/ETL, testes de carga e segurança, telemetria/dashboards.

---

## 13) Anexos — Exemplos de DTOs

```tsx
// EventoDeAcessoDTO
export interface EventoDeAcessoDTO {
  id: string;
  pessoaId?: string;
  credencialId?: string;
  pontoId: string;
  acao: 'ENTRADA'|'SAIDA'|'ACIONAMENTO_MANUAL';
  resultado: 'PERMITIDO'|'NEGADO'|'ERRO';
  dataHora: string; // ISO
  snapshotUri?: string;
  meta?: Record<string, any>;
}

// Comando de Abertura
export interface ComandoAbrirDTO {
  pontoId: string;
  justificativa?: string; // obrigatório para operação manual
}

```

---

## 14) Decisões Importantes

- **Separação de perfis** impede Portaria de acessar **câmeras IP e configurações**.
- **Particionamento** de eventos garante consultas rápidas do dia e histórico eficiente.
- **Edge Service** evita dependência de latência/Internet e permite drivers locais.
- **Drivers plugáveis** garantem integração com os fabricantes atuais e expansão futura.
- **Licenciamento** mitiga replicação indevida do módulo em outros condomínios.

> Este documento serve como guia de implementação para o backend, consolidando contratos, módulos e um roadmap pragmático para o primeiro release (MVP) e evoluções subsequentes.
>