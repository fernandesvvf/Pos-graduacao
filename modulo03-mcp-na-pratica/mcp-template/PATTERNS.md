# Software Patterns & Rules — MCP Template

Padrões de engenharia de software e regras que TODO MCP construído com este
template deve seguir. Destilado das aulas 05, 06 e 07. Este documento é a
referência; as `skills/` operacionalizam cada parte.

---

## 1. Arquitetura

### 1.1 Clean Architecture (preset `api-crud`)

Dependências apontam SEMPRE para dentro:

```
mcp  →  application  →  infrastructure  →  domain
```

| Camada | Responsabilidade | Pode importar | NUNCA importa |
|--------|------------------|---------------|---------------|
| `domain/` | schemas (Zod), types, errors, auth interface | nada | application, infra, mcp |
| `application/` | regra de negócio, orquestração (service) | domain, infra | mcp |
| `infrastructure/` | ÚNICO lugar com HTTP/fetch; mapeia status→erro de domínio | domain | application, mcp |
| `mcp/` | server (composition root), tools, resources, prompts, middleware | todas | — |
| `index.ts` | só o transporte (stdio) | mcp | — |

**Regra**: nunca importar "para fora". `domain` não conhece ninguém.

### 1.2 Flat (preset `standalone-tool`)

Sem backend e com poucas tools → arquivo único. `service.ts` (lógica pura) +
`mcp.ts` (wiring) + `index.ts` (transporte). Comece flat; gradue para layered
quando doer (backend, auth, muitas tools).

### 1.3 Composition Root

`mcp/server.ts` é o ÚNICO lugar que monta dependências
(`config → auth → limiter → service`) e registra primitivas. Mantenha-o
declarativo: zero lógica de negócio.

---

## 2. Padrões de projeto aplicados

| Padrão | Onde | Por quê |
|--------|------|---------|
| **Dependency Injection** | service recebe `baseUrl, auth, limiter`; tools recebem `(server, service)` | testável, sem singletons escondidos |
| **Strategy** | `AuthProvider` (`BearerAuth` / `NoAuth`) | trocar auth sem tocar no client |
| **Adapter** | `infrastructure/*-http-client.ts` | isola o backend; trocar transporte sem mexer no resto |
| **Registry / Factory function** | `registerXTool(server, service)` por arquivo | uma tool por arquivo, composição explícita |
| **Token Bucket** | `mcp/middleware/rate-limiter.ts` | rate-limit client-side previsível |
| **Error translation** | `#assertOk` mapeia HTTP→erro de domínio | modelo recebe mensagem legível, não stack trace |

---

## 3. Regras inquebráveis

1. **stdout = protocolo.** stdio carrega JSON-RPC. Log SÓ em `console.error`.
   `console.log` corrompe o stream.
2. **outputSchema é estrito.** Toda chave em `structuredContent` (sucesso E erro)
   tem que estar declarada, ou o SDK rejeita: `data must NOT have additional
   properties`. Use um `*MutationSchema.shape` largo, com `isError` + `message`.
3. **Shape de retorno da tool é fixo:**
   ```ts
   // sucesso
   return { content: [{ type: "text", text }], structuredContent: {...} };
   // falha — retorne, não lance
   return { content: [{ type: "text", text: message }], structuredContent: { isError: true, message } };
   ```
4. **Sem TS parameter properties** (`constructor(private x)`). O modo strip-only
   do Node (`--experimental-strip-types`) rejeita com `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`.
   Declare campos `#private` e atribua no corpo.
5. **Handlers finos.** Tool handler chama o service, formata, captura erro. Lógica
   mora no service, nunca no handler nem no `server.ts`.
6. **MCP é adapter fino.** Auth, rate-limit e dados reais vivem no BACKEND. O MCP
   traduz intenção→ação e erro→mensagem. Rate-limit client-side é guarda, não fonte da verdade.

---

## 4. Segurança (aula 07)

- **Auth**: token vem do `env` (`SERVICE_TOKEN`), NUNCA hardcoded. `BearerAuth`
  injeta `Authorization: Bearer`. Sem token → `NoAuth` (só dev).
- **Rate-limit**: token bucket no MCP (`RATE_LIMIT_BURST`, `RATE_LIMIT_PER_SEC`)
  protege o backend antes da rede. Backend 429 também é tratado.
- **Mapeamento de erro**: 401→`UnauthorizedError`, 403→`ForbiddenError`,
  429→`RateLimitError`. Tools expõem via `isError + message`.

---

## 5. Convenções de nomes

- Tools: `snake_case`, verbo primeiro — `create_order`, `cancel_subscription`.
- Toda field de input com `.describe()` — o modelo lê isso para decidir.
- `description` da tool clara e específica: é a única dica de QUANDO chamar.
- Arquivos: `kebab-case`. Uma tool por arquivo, nome = `<verbo>-<entidade>.ts`.

---

## 6. Testes (aula 07)

- **Unit** (`*.unit.test.ts`): lógica pura (service, middleware). Sem backend.
  CI sempre roda. É o sinal barato.
- **E2E** (`*.e2e.test.ts`): sobe o MCP via `StdioClientTransport`, o teste age
  como agente, chama tools, asserta. Precisa do backend (`BASE_URL`).
- Sempre testar: happy path, token inválido (`isError`+"unauthorized"),
  rate-limit (loop até `isError`), input inválido.
- `afterEach` → `client.close()` para não vazar processos stdio.

---

## 7. Stack

Node ≥22 com TS nativo (`--experimental-strip-types`, sem build) ·
`@modelcontextprotocol/sdk` · Zod · transporte stdio · `node:test`.

---

## 8. Checklist de PR

- [ ] Nenhum `console.log` (só `console.error`)
- [ ] Todo `outputSchema` aceita `isError` + `message`
- [ ] Nenhum `constructor(private …)`
- [ ] Handlers finos; lógica no service
- [ ] Imports respeitam o fluxo para dentro
- [ ] Token só via `env`
- [ ] `npm test` verde; server sobe
- [ ] Resource `api-info` reflete a API real
