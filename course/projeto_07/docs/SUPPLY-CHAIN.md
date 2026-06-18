# 📦 Política de Versões e Cadeia de Suprimentos

## Objetivo

Garantir **reproduzibilidade**, **segurança** e **rastreabilidade** do projeto através de versões fixas de dependências até janeiro de 2026.

## Princípios

1. **✅ Versões Exatas**: Nunca usar `^` ou `~`
   - ❌ Ruim: `"express": "^4.18.0"`
   - ✅ Bom: `"express": "4.18.2"`

2. **✅ Lock Files Versionados**: `package-lock.json` sempre commitado
   - Garante consistência entre desenvolvedores
   - Reproduzibilidade 100%

3. **✅ Sem Atualização Automática**: Atualizações apenas quando necessário
   - Mudanças deliberadas via PR
   - Review antes de mesclar

4. **✅ Auditoria de Segurança**: `npm audit` antes de fazer push
   - Vulnerabilidades críticas: corrigir imediatamente
   - Vulnerabilidades moderadas: planejar atualização

## Fluxo de Atualização

### Quando atualizar?

- **Crítico**: Vulnerabilidade de segurança crítica
- **Importante**: Vulnerabilidade de segurança moderada
- **Opcional**: Novas features, bug fixes, performance

### Como atualizar?

1. **Criar branch**: `git checkout -b chore/update-express`

2. **Atualizar dependência**:
   ```bash
   npm install express@4.19.0  # Versão exata!
   ```

3. **Testar completamente**:
   ```bash
   npm ci                    # Instalar lock file exato
   npm run type-check        # Verificar tipos
   npm run build             # Build
   npm run dev               # Rodar em dev
   # Testar manualmente...
   ```

4. **Commitar com clareza**:
   ```bash
   git add package*.json
   git commit -m "chore: update express to 4.19.0 for security"
   ```

5. **Submeter PR**:
   - Descrever por que atualizar
   - Listar mudanças de breaking changes
   - Confirmar que testes passam

6. **Review e Merge**:
   - Verificar `npm audit`
   - Verificar testes CI/CD
   - Aprovar e mesclar

## Versionamento de Dependências

### Data de Congelamento

**📅 Até: 31 de janeiro de 2026**

Após essa data, avaliar se continua com mesma estratégia ou atualiza.

### Dependências Críticas

```json
{
  "dependencies": {
    "express": "4.18.2",           // Segurança, estabilidade
    "socket.io": "4.7.2",          // Realtime crítico
    "react": "18.2.0",             // UI framework principal
    "typescript": "5.3.3"          // Type safety
  }
}
```

### Dependências DevDependencies

Mesma política de versões exatas.

## Ferramentas

### `.npmrc`
Configuração global do npm para o projeto:
```
save-exact=true        # npm install --save instala versão exata
audit-level=moderate   # Falhar se vulnerabilidade >= moderate
```

### `.nvmrc`
Especifica versão do Node.js (usa nvm):
```bash
nvm use  # Usa Node 20
```

### `package-lock.json`
Sempre commitado no Git para garantir reproduzibilidade:
```bash
git add package-lock.json
```

## Verificação

### Antes de fazer commit

```bash
# 1. Auditoria de segurança
npm audit

# 2. Validar tipos
npm run type-check

# 3. Build
npm run build

# 4. Rodar em dev
npm run dev

# 5. Confirmar package-lock.json está atualizado
git status  # Não deve ter node_modules/
```

### Antes de fazer push

```bash
# CI/CD rodará novamente, mas verifique localmente:
npm ci                  # Clean install com lock file
npm audit
npm run type-check
npm run build
```

## FAQ

**P: Posso fazer `npm update`?**
R: Não. Use `npm install package@version` com versão exata.

**P: E se houver vulnerabilidade crítica depois de janeiro/2026?**
R: Corrigir imediatamente, independente da data.

**P: Posso usar `npm outdated`?**
R: Sim, para verificar. Mas não execute `npm update`.

**P: O que é `npm ci`?**
R: Clean Install - instala exatamente o que está em package-lock.json. Use em CI/CD.

**P: Por que versões fixas?**
R: Reproduzibilidade, segurança rastreada, evitar bugs surpresa.

## Histórico de Versões

| Data | Versão | Notas |
|------|--------|-------|
| 2026-04-23 | 0.1.0 | Initial supply chain lock |

---

**Mantido por**: @anderson-carlos  
**Última atualização**: 2026-04-23  
**Próxima revisão**: 2026-01-31
