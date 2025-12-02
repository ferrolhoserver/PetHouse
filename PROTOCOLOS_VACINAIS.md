# 📋 Sistema Inteligente de Protocolos Veterinários

## 🎯 Objetivo

Calcular automaticamente as próximas doses de vacinas e vermífugos baseado em **protocolos veterinários oficiais**, garantindo que os alertas e cards do sistema reflitam a realidade e sigam as boas práticas da medicina veterinária.

---

## 📚 Base Científica

O sistema foi desenvolvido baseado em:

- **WSAVA 2024** (World Small Animal Veterinary Association) - Diretrizes globais de vacinação
- **AAHA 2022** (American Animal Hospital Association) - Guidelines caninos
- **Protocolos Zoetis** e outros fabricantes de vacinas
- **Boas práticas veterinárias brasileiras**

---

## 💉 Protocolos Implementados

### **VACINAS ESSENCIAIS (CORE)**

#### 1. V10 / V8 (Polivalente)
- **Primeira vacinação:**
  - 3 doses com 21-30 dias de intervalo
  - Início: 6-8 semanas de idade
- **Reforço:** Anual
- **Aliases:** `v10`, `v8`, `vanguard`, `vanguard plus`, `déctupla`, `óctupla`

#### 2. Antirrábica
- **Primeira vacinação:**
  - 1 dose única aos 3-4 meses (12-16 semanas)
- **Reforço:** Anual (obrigatório por lei)
- **Aliases:** `raiva`, `antirrábica`, `anti-rábica`

---

### **VACINAS NÃO-ESSENCIAIS (NON-CORE)**

#### 3. Giárdia
- **Primeira vacinação:**
  - 2 doses com 21-30 dias de intervalo
  - Início: 8 semanas de idade
- **Reforço:** A cada 6 meses (semestral)
- **Aliases:** `giardia`, `giardiavax`, `giárdia`

#### 4. BronchiGuard (Tosse dos Canis)
- **Primeira vacinação:**
  - 2 doses com 21-30 dias de intervalo
  - Início: 8 semanas de idade
- **Reforço:** Anual
- **Aliases:** `bronchiguard`, `bronchi`, `tosse`, `traqueobronquite`

#### 5. Leishmaniose
- **Primeira vacinação:**
  - 3 doses com 21 dias de intervalo
  - Início: 4 meses de idade
- **Reforço:** Anual
- **Aliases:** `leish`, `leishmaniose`, `leishmania`

#### 6. Gripe Canina (KC)
- **Primeira vacinação:**
  - 2 doses com 21-30 dias de intervalo
  - Início: 8 semanas de idade
- **Reforço:** Anual
- **Aliases:** `gripe`, `kc`, `gripe canina`

---

### **VERMÍFUGOS**

#### Protocolo por Idade
- **Filhotes (até 3 meses):** A cada 15 dias
- **Adultos (após 3 meses):** A cada 3 meses (trimestral)
- **Aliases:** `vermifugo`, `vermífugo`, `drontal`, `endogard`, `milbemax`, `vetmax`

---

## 🔧 Como Funciona

### **1. Identificação Inteligente**

Quando o usuário adiciona uma vacina, o sistema:

```javascript
const protocolo = ProtocolosVacinais.identificarProtocolo("V10");
// Retorna: { key: 'v10', nome: 'V10 (Déctupla)', protocolo: {...} }
```

- Busca por nome exato ou aliases
- Agrupa variações (V10, Vanguard, Vanguard Plus = mesma vacina)
- Retorna protocolo completo

---

### **2. Cálculo Automático de Próximas Doses**

O sistema busca o histórico dessa vacina e calcula:

```javascript
// Exemplo: V10
// Histórico: 1ª dose em 07/11/2025

const proxima = ProtocolosVacinais.calcularProximaDose(
    "V10",                    // Nome da vacina
    "2025-11-07",            // Data da aplicação atual
    1,                        // Número da dose (1ª)
    []                        // Histórico (vazio = primeira)
);

// Resultado: 2025-11-28 (07/11 + 21 dias)
```

**Lógica:**
- Se está na **série inicial** (1ª, 2ª, 3ª dose): `+21 dias`
- Se completou a **série**: `+365 dias` (reforço anual) ou `+180 dias` (semestral)

---

### **3. Agrupamento por Protocolo**

O sistema agrupa vacinas da mesma família:

```javascript
const vacinas = [
    { nome: "V10 (1ª dose)", data: "2025-11-07" },
    { nome: "Vanguard Plus", data: "2025-11-28" },
    { nome: "V10", data: "2025-12-19" }
];

const agrupadas = ProtocolosVacinais.agruparVacinasPorNome(vacinas);

// Resultado: 1 grupo (V10) com 3 doses
// Considera apenas a ÚLTIMA: 2025-12-19
// Próxima: 2026-12-19 (reforço anual)
```

**Benefícios:**
- Não duplica alertas
- Conta apenas a última dose
- Cards sempre corretos

---

## 📊 Fluxo Completo

### **Exemplo Prático: Vacinação de Filhote**

#### **Dia 1: Primeira V10**
```
Usuário: Adiciona "V10" em 07/11/2025
Sistema:
  - Identifica protocolo V10
  - Busca histórico: vazio (primeira dose)
  - Calcula próxima: 28/11/2025 (+21 dias)
  - Salva no banco
Cards:
  - "1 Vacinas" (verde)
  - "0 Atrasados" (sem card vermelho)
```

#### **Dia 22: Segunda V10**
```
Usuário: Adiciona "V10" em 28/11/2025
Sistema:
  - Identifica protocolo V10
  - Busca histórico: 1 dose (07/11/2025)
  - Reconhece: 2ª dose
  - Calcula próxima: 19/12/2025 (+21 dias)
  - Salva no banco
Cards:
  - "2 Vacinas" (verde)
  - "0 Atrasados"
```

#### **Dia 43: Terceira V10**
```
Usuário: Adiciona "V10" em 19/12/2025
Sistema:
  - Identifica protocolo V10
  - Busca histórico: 2 doses
  - Reconhece: 3ª dose (última da série)
  - Calcula próxima: 19/12/2026 (+1 ano)
  - Salva no banco
Cards:
  - "3 Vacinas" (verde)
  - "0 Atrasados"
```

#### **Dia 365: Reforço Anual**
```
Hoje: 20/12/2026 (passou 1 dia do reforço)
Sistema:
  - Agrupa vacinas V10
  - Última dose: 19/12/2025
  - Próxima: 19/12/2026 (passou!)
  - Marca como atrasado
Cards:
  - "3 Vacinas" (verde)
  - "1 Atrasados" (vermelho) ← CORRETO!
```

---

## ✅ Benefícios

### **1. Automático**
- Usuário não precisa calcular datas
- Sistema faz tudo baseado em protocolos oficiais

### **2. Preciso**
- Segue boas práticas veterinárias
- Intervalos corretos para cada vacina
- Diferencia série inicial de reforços

### **3. Inteligente**
- Agrupa doses da mesma vacina
- Reconhece variações de nome
- Conta apenas a última dose

### **4. Escalável**
- Fácil adicionar novas vacinas
- Basta incluir no `protocolos` object
- Sistema se adapta automaticamente

### **5. Confiável**
- Cards sempre corretos
- Sem falsos positivos
- Atualização em tempo real

---

## 🔍 Logs e Debug

O sistema gera logs detalhados:

```javascript
console.log("✅ Próxima dose calculada automaticamente: 2025-11-28 (dose 1)");
```

Para ver os logs:
1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Adicione uma vacina
4. Veja o cálculo em tempo real

---

## 📝 Adicionar Nova Vacina

Para adicionar uma nova vacina ao sistema:

```javascript
// Em js/protocolos-vacinais.js

'nova_vacina': {
    nome: 'Nome da Vacina',
    aliases: ['alias1', 'alias2', 'alias3'],
    tipo: 'vacina',
    essencial: false,
    protocolo: {
        primeiraVacinacao: {
            idadeInicio: '8 semanas',
            doses: 2,
            intervalo: 21,
            descricao: '2 doses com 21 dias'
        },
        reforco: {
            aposUltimaDose: 365,
            frequencia: 'anual',
            descricao: 'Reforço anual'
        }
    }
}
```

---

## 🎯 Resultado Final

### **ANTES:**
- Usuário digitava próxima dose manualmente
- Cards mostravam doses antigas como atrasadas
- Duplicatas e falsos positivos
- Sem padrão veterinário

### **AGORA:**
- Sistema calcula automaticamente
- Cards mostram apenas última dose
- Sem duplicatas
- Baseado em protocolos oficiais WSAVA/AAHA
- Coerência visual perfeita
- Experiência profissional

---

## 📚 Referências

- [WSAVA Vaccination Guidelines 2024](https://wsava.org/wp-content/uploads/2024/07/WSAVA-VC-Guidelines-2024-Portuguese.pdf)
- [AAHA Canine Vaccination Guidelines 2022](https://www.aaha.org/resources/2022-aaha-canine-vaccination-guidelines/)
- [Protocolo Vacinal Zoetis](https://www.zoetis.com.br/_locale-assets/arquivos/animais-de-companhia/biblioteca/protocolos-vacinais-sugest%C3%B5es/protocolo-vacinal-_cao-e-gato_.pdf)

---

**Desenvolvido com ❤️ para o PetHouse**
