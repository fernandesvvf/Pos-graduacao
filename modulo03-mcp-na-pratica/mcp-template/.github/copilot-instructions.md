# Copilot Instructions — MCP Template

Instruções para o GitHub Copilot ao gerar ou modificar MCP servers neste repo.
Leia antes de sugerir código.

## Contexto

Template para construir MCP servers, destilado das aulas 05, 06 e 07. Dois
presets + skills que ensinam a modificá-los.

```
mcp-template/
├── PATTERNS.md             padrões + regras (referência completa)
├── presets/
│   ├── standalone-tool/    flat, sem backend, tool pura (aula 05)
│   └── api-crud/           layered + auth + rate-limit (aulas 06+07)
└── skills/                 receitas markdown (tabela abaixo)
```

## Regras que o código gerado DEVE respeitar (completo em PATTERNS.md)

1. **stdout = protocolo.** Log só com `console.error`, NUNCA `console.log`.
2. **outputSchema estrito** — declare `isError` + `message` ou o SDK rejeita o caminho de erro (`data must NOT have additional properties`). Use `*MutationSchema.shape` largo.
3. **Sem TS parameter properties** (`constructor(private x)`) — strip-only TS do Node rejeita. Use campos `#private` atribuídos no corpo.
4. **Handlers finos** — tool chama o service, formata, captura erro. Lógica no service, não na tool nem no `server.ts`.
5. **Dependências fluem para dentro**: `mcp → application → infrastructure → domain`. Nunca importe para fora.
6. **MCP é adapter fino** — auth, rate-limit e dados reais vivem no backend.
7. **Token só via `env`** (`SERVICE_TOKEN`), nunca hardcoded.

## Shape obrigatório de retorno de tool

```ts
// sucesso
return { content: [{ type: "text", text }], structuredContent: {...} };
// falha — retorne, não lance
return { content: [{ type: "text", text: message }], structuredContent: { isError: true, message } };
```

## Skills disponíveis

Skills são markdown em `skills/`. Para aplicar: abra o arquivo e siga os passos.
**Comece sempre por `mcp-architecture`** — as outras assumem essas regras.

| Skill | Pra que serve | Quando usar | Path |
|-------|---------------|-------------|------|
| **mcp-architecture** | Regras e convenções centrais (primitivas, shape de retorno, layering, gotchas). A constituição. | SEMPRE primeiro, antes de qualquer outra skill ou mudança. | `skills/mcp-architecture.md` |
| **scaffold-new-mcp** | Bootstrap de um MCP novo a partir de um preset: flat vs layered, copiar, renomear entidade, ligar. | Ao começar um MCP do zero. | `skills/scaffold-new-mcp.md` |
| **add-tool** | Adicionar uma tool corretamente: schema, handler fino, caminho de erro, registro. | Ao adicionar/alterar uma tool. | `skills/add-tool.md` |
| **add-auth-and-rate-limit** | Bearer auth + rate-limit client-side e mapeamento de erros de segurança (aula 07). | Ao adicionar segurança, ou entender a do preset api-crud. | `skills/add-auth-and-rate-limit.md` |
| **testing-mcp** | Padrões de teste: unit (lógica pura) e e2e (server via cliente stdio real). | Ao escrever/ajustar testes. | `skills/testing-mcp.md` |

## Verificação

```bash
npm test
node --experimental-strip-types -e "import('./src/mcp/server.ts').then(()=>console.error('OK'))"
npm run mcp:inspect
```

Checklist completo de PR em `PATTERNS.md` §8.
