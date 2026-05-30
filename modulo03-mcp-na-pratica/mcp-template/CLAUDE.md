# CLAUDE.md — MCP Template

Guia para agentes (Claude Code) operando neste template. Leia antes de gerar ou
modificar qualquer MCP aqui.

## O que é este repo

Template para construir MCP servers, destilado das aulas 05, 06 e 07. Dois
presets + skills que ensinam a modificá-los.

```
mcp-template/
├── PATTERNS.md             ← padrões + regras (leia junto deste)
├── presets/
│   ├── standalone-tool/    flat, sem backend, tool pura (aula 05)
│   └── api-crud/           layered + auth + rate-limit (aulas 06+07)
└── skills/                 receitas markdown (tabela abaixo)
```

## Regras que você DEVE seguir (resumo; completo em PATTERNS.md)

1. **stdout = protocolo.** Log só em `console.error`, nunca `console.log`.
2. **outputSchema estrito** — declare `isError` + `message` ou o SDK rejeita o caminho de erro.
3. **Sem `constructor(private x)`** — strip-only TS rejeita; use campos `#private`.
4. **Handlers finos** — lógica no service, não na tool nem no `server.ts`.
5. **Deps fluem para dentro**: `mcp → application → infrastructure → domain`.
6. **MCP é adapter fino** — auth/rate-limit/dados reais vivem no backend.
7. **Token só via `env`**, nunca hardcoded.

## Skills disponíveis

Skills são markdown em `skills/`. Para usar: leia o arquivo e siga os passos.
**Sempre leia `mcp-architecture` primeiro** — as outras assumem essas regras.

| Skill | Pra que serve | Quando usar | Path |
|-------|---------------|-------------|------|
| **mcp-architecture** | As regras e convenções centrais (primitivas, shape de retorno, layering, gotchas). A constituição. | SEMPRE primeiro, antes de qualquer outra skill ou mudança. | `skills/mcp-architecture.md` |
| **scaffold-new-mcp** | Bootstrap de um MCP novo a partir de um preset: escolher flat vs layered, copiar, renomear a entidade, ligar tudo. | Ao começar um MCP do zero. | `skills/scaffold-new-mcp.md` |
| **add-tool** | Adicionar uma tool corretamente: schema, handler fino, caminho de erro, registro. | Ao adicionar/alterar uma tool em um MCP existente. | `skills/add-tool.md` |
| **add-auth-and-rate-limit** | Ligar bearer auth + rate-limit client-side e mapear erros de segurança do backend (aula 07). | Ao adicionar segurança a um MCP, ou entender a do preset api-crud. | `skills/add-auth-and-rate-limit.md` |
| **testing-mcp** | Padrões de teste: unit (lógica pura) e e2e (dirige o server via cliente stdio real). | Ao escrever/ajustar testes de um MCP. | `skills/testing-mcp.md` |

## Fluxo típico

1. Ler `skills/mcp-architecture.md`.
2. MCP novo → `skills/scaffold-new-mcp.md`. MCP existente → pular para a tarefa.
3. Nova tool → `skills/add-tool.md`. Segurança → `skills/add-auth-and-rate-limit.md`.
4. Testar → `skills/testing-mcp.md`.

## Verificar antes de concluir

```bash
npm test                                                   # testes
node --experimental-strip-types -e "import('./src/mcp/server.ts').then(()=>console.error('OK'))"
npm run mcp:inspect                                        # inspeção manual
```

Checklist completo de PR em `PATTERNS.md` §8.
