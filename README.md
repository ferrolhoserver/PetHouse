# 🐾 PetHouse - Gestão Familiar de Pets

**Aplicativo PWA para gestão completa de saúde e cuidados dos seus pets em família.**

## 📋 Sobre o Projeto

PetHouse é um aplicativo web progressivo (PWA) desenvolvido para facilitar o gerenciamento familiar de pets. Toda a família pode acessar e atualizar as informações de todos os animais da casa, mantendo um histórico completo de saúde e cuidados.

### ✨ Características Principais

- ✅ **Gestão Familiar:** Todos da casa gerenciam todos os pets juntos
- ✅ **6 Módulos de Prontuário:** Peso, Vacinas, Vermífugo, Consultas, Cirurgias e Exames
- ✅ **100% Offline:** Funciona sem internet após instalação
- ✅ **Exportações:** Backup JSON e Calendário ICS com lembretes
- ✅ **PWA Instalável:** Funciona como app nativo no celular
- ✅ **Sem Dependências:** Código puro HTML/CSS/JavaScript
- ✅ **Responsivo:** Otimizado para mobile e desktop

## 🚀 Como Usar

### Opção 1: Uso Local (Simples)

1. Abra o arquivo `index.html` no navegador
2. Configure o nome da sua casa
3. Adicione seus pets
4. Comece a registrar informações!

### Opção 2: Servidor Web

```bash
# Python 3
python3 -m http.server 8080

# Acesse: http://localhost:8080
```

### Opção 3: Instalar como PWA

**No celular:**
- Chrome: Menu → "Adicionar à tela inicial"
- Safari: Compartilhar → "Adicionar à Tela de Início"

**No desktop:**
- Chrome/Edge: Ícone de instalação na barra de endereço

## 📱 Funcionalidades

### 1. Gestão de Pets

- Cadastro de múltiplos pets
- Informações básicas: nome, espécie, raça, data de nascimento
- Cálculo automático de idade

### 2. Prontuário Completo

#### ⚖️ Peso
- Registro de pesagens com data
- Observações sobre cada medição
- Histórico completo de evolução

#### 💉 Vacinas
- Nome da vacina
- Data de aplicação
- Próxima dose (com lembrete no calendário)
- Observações

#### 💊 Vermífugo
- Nome do produto
- Data de aplicação
- Próxima dose (com lembrete no calendário)
- Observações

#### 🏥 Consultas
- Data da consulta
- Nome do veterinário
- Motivo da consulta
- Observações

#### 🔬 Cirurgias
- Tipo de cirurgia
- Data de realização
- Nome do veterinário
- Observações

#### 📋 Exames
- Tipo de exame
- Data de realização
- Resultado
- Observações

### 3. Exportações

#### 💾 Backup JSON
- Exporta todos os dados em formato JSON
- Útil para backup e migração
- Pode ser importado novamente (recurso futuro)

#### 📅 Calendário ICS
- Gera arquivo de calendário com próximas vacinas e vermífugos
- Importável no Google Calendar, Outlook, Apple Calendar
- Inclui lembretes 1 dia antes de cada evento

## 🎯 Fluxo de Uso

1. **Primeira vez:**
   - Abra o aplicativo
   - Configure o nome da casa (ex: "Família Silva")
   - Clique em "Começar"

2. **Adicionar pets:**
   - Clique em "+ Adicionar Pet"
   - Preencha: nome, espécie, raça, data de nascimento
   - Clique em "Adicionar"

3. **Gerenciar prontuário:**
   - Clique no pet desejado
   - Escolha a aba (Peso, Vacinas, etc.)
   - Clique em "+ Adicionar"
   - Preencha as informações
   - Clique em "Adicionar"

4. **Exportar dados:**
   - Na tela inicial, clique em "💾 Backup" para exportar JSON
   - Clique em "📅 Calendário" para exportar ICS
   - Importe o arquivo ICS no seu aplicativo de calendário favorito

## 🔒 Privacidade e Segurança

- ✅ **100% Local:** Todos os dados ficam no seu dispositivo
- ✅ **Sem Servidor:** Não enviamos nada para a internet
- ✅ **Sem Cadastro:** Não precisa criar conta
- ✅ **Sem Rastreamento:** Zero analytics ou cookies de terceiros

## 📂 Estrutura do Projeto

```
pethouse_final/
├── index.html          # Página principal
├── manifest.json       # Configuração PWA
├── css/
│   └── style.css      # Estilos
├── js/
│   └── app.js         # Lógica da aplicação
├── icons/
│   ├── icon-192.png   # Ícone PWA 192x192
│   └── icon-512.png   # Ícone PWA 512x512
└── README.md          # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estrutura semântica
- **CSS3:** Estilização responsiva com variáveis CSS
- **JavaScript ES6+:** Lógica da aplicação (classes, arrow functions, etc.)
- **LocalStorage API:** Armazenamento local de dados
- **PWA:** Service Worker para funcionalidade offline
- **ICS:** Geração de arquivos de calendário

## 💡 Dicas de Uso

### Backup Regular
- Exporte o backup JSON regularmente
- Guarde em local seguro (nuvem, email, etc.)
- Em caso de perda de dados, você pode restaurar (recurso futuro)

### Calendário de Vacinas
- Exporte o calendário ICS após adicionar vacinas/vermífugos
- Importe no Google Calendar ou Outlook
- Receba notificações automáticas 1 dia antes

### Múltiplos Dispositivos
- Use o backup JSON para sincronizar entre dispositivos
- Exporte de um dispositivo, importe em outro (recurso futuro)

## 🐛 Solução de Problemas

### Dados não aparecem após recarregar
- Verifique se o navegador permite LocalStorage
- Não use modo anônimo/privado
- Limpe o cache se necessário

### PWA não instala
- Certifique-se de estar usando HTTPS ou localhost
- Verifique se o navegador suporta PWA
- Tente em outro navegador

### Exportação não funciona
- Verifique se o navegador permite downloads
- Desative bloqueadores de pop-up temporariamente
- Tente em outro navegador

## 📝 Formato dos Dados

### Estrutura JSON do Backup

```json
{
  "casaNome": "Família Silva",
  "pets": [
    {
      "id": "1234567890",
      "nome": "Rex",
      "especie": "Cachorro",
      "raca": "Labrador",
      "nascimento": "2020-05-15",
      "peso": [
        {
          "data": "2025-10-19",
          "peso": 32.5,
          "obs": "Peso ideal"
        }
      ],
      "vacinas": [
        {
          "data": "2025-09-15",
          "nome": "V10",
          "proxima": "2026-09-15",
          "obs": ""
        }
      ],
      "vermifugo": [],
      "consultas": [],
      "cirurgias": [],
      "exames": []
    }
  ],
  "membros": []
}
```

## 🔮 Recursos Futuros (Planejados)

- [ ] Importação de backup JSON
- [ ] Gráficos de evolução de peso
- [ ] Fotos dos pets
- [ ] Compartilhamento entre dispositivos
- [ ] Modo escuro
- [ ] Múltiplos idiomas
- [ ] Notificações push

## 📄 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas! Este é um projeto em constante evolução.

## 📞 Suporte

Para dúvidas ou problemas, consulte a seção de Solução de Problemas acima.

---

**Desenvolvido com ❤️ para os amantes de pets**

🐶 🐱 🐦 🐹 🐰 🐠

