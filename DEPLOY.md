# 🚀 Guia de Deploy - GitHub Pages

## ❌ Problema Identificado
Você está recebendo um erro **404** porque o GitHub Pages ainda não foi habilitado no repositório.

## ✅ Solução: Configuração Manual (2 minutos)

Siga estas etapas para ativar o GitHub Pages:

---

### **Passo 1: Acesse as Configurações do Repositório**

1. Abra seu repositório no GitHub:
   ```
   https://github.com/romulorasec/Hello
   ```

2. Clique na aba **"Settings"** (Configurações) no topo da página

---

### **Passo 2: Configure o GitHub Pages**

1. No menu lateral esquerdo, role até encontrar **"Pages"**
2. Clique em **"Pages"**

3. Na seção **"Build and deployment"**:
   - **Source**: Selecione **"GitHub Actions"**

4. Clique em **"Save"** (se disponível)

---

### **Passo 3: Execute o Workflow**

1. Acesse a aba **"Actions"** no topo do repositório:
   ```
   https://github.com/romulorasec/Hello/actions
   ```

2. Você verá o workflow **"Deploy to GitHub Pages"**

3. Clique no workflow mais recente

4. Se necessário, clique em **"Re-run all jobs"** ou **"Run workflow"**

---

### **Passo 4: Aguarde o Deploy (1-2 minutos)**

O GitHub Actions irá:
- ✅ Fazer build dos arquivos
- ✅ Fazer deploy no GitHub Pages
- ✅ Disponibilizar o site

Você pode acompanhar o progresso na aba Actions.

---

### **Passo 5: Acesse Seu Site**

Após o workflow completar com sucesso (✅ green check), acesse:

```
https://romulorasec.github.io/Hello/
```

---

## 🔄 Alternativa: Deploy via Branch Main

Se a abordagem acima não funcionar, você pode fazer deploy diretamente da branch main:

### **Opção A: Merge para Main (Recomendado)**

1. Crie um Pull Request da branch `claude/prd-generator-saas-aI1r7` para `main`
2. Faça o merge do PR
3. Configure GitHub Pages para usar a branch `main`:
   - Settings → Pages → Source: **"Deploy from a branch"**
   - Branch: **main**
   - Folder: **/ (root)**

### **Opção B: Criar Branch gh-pages Manualmente**

1. **No terminal local**, execute:
   ```bash
   # Certifique-se de estar na branch correta
   git checkout claude/prd-generator-saas-aI1r7

   # Crie a branch gh-pages
   git checkout -b gh-pages

   # Remova o workflow (não é necessário para gh-pages)
   rm -rf .github/workflows
   git add -A
   git commit -m "Deploy via gh-pages"

   # Force push para criar a branch no GitHub
   git push origin gh-pages --force
   ```

2. O GitHub detectará automaticamente a branch `gh-pages` e habilitará o Pages

3. Acesse: https://romulorasec.github.io/Hello/

---

## 🔍 Verificação de Permissões

Se os workflows não estiverem executando, verifique as permissões:

1. **Settings** → **Actions** → **General**
2. Role até **"Workflow permissions"**
3. Selecione: **"Read and write permissions"**
4. Marque: ✅ **"Allow GitHub Actions to create and approve pull requests"**
5. Clique em **"Save"**

---

## 📊 Status de Deploy

Após configurar, você pode monitorar o status em:

- **Actions**: https://github.com/romulorasec/Hello/actions
- **Deployments**: https://github.com/romulorasec/Hello/deployments

---

## ❓ Troubleshooting

### **Erro 404 persiste?**
- Aguarde 2-5 minutos após o primeiro deploy
- Limpe o cache do navegador (Ctrl+F5 ou Cmd+Shift+R)
- Tente acessar em modo anônimo/privado

### **Workflow não executa?**
- Verifique se GitHub Actions está habilitado (Settings → Actions)
- Verifique permissões de workflow (Settings → Actions → General)

### **Deploy falha?**
- Verifique logs em Actions para ver o erro específico
- Confirme que index.html, app.js e styles.css estão na raiz do repositório

---

## 🎯 URLs Importantes

- **Repositório**: https://github.com/romulorasec/Hello
- **Settings**: https://github.com/romulorasec/Hello/settings
- **Pages Config**: https://github.com/romulorasec/Hello/settings/pages
- **Actions**: https://github.com/romulorasec/Hello/actions
- **Site (após deploy)**: https://romulorasec.github.io/Hello/

---

## ✅ Checklist de Deploy

- [ ] GitHub Pages habilitado em Settings → Pages
- [ ] Source configurado como "GitHub Actions"
- [ ] Workflow executado com sucesso (check verde em Actions)
- [ ] Aguardado 2-5 minutos após o deploy
- [ ] Site acessível em https://romulorasec.github.io/Hello/

---

## 💡 Dica

Após o primeiro deploy bem-sucedido, **todos os futuros pushes** para a branch `claude/prd-generator-saas-aI1r7` ou `main` farão deploy automático! 🎉

---

**Precisa de ajuda?** Compartilhe prints da tela de Settings → Pages ou da aba Actions para diagnóstico!
