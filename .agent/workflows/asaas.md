---
description: # Asaas API v3 - Contexto de Integração
---

# Asaas API v3 - Contexto de Integração

## 1. Visão Geral e Configuração
A API do Asaas é uma plataforma financeira completa para gestão de cobranças, subcontas (marketplace), antecipações e pagamentos.

### Base URLs
*   **Produção:** `https://api.asaas.com/api/v3`
*   **Sandbox (Testes):** `https://sandbox.asaas.com/api/v3`

### Autenticação
Todas as requisições devem conter o header HTTP:
`access_token: $API_KEY`

### Formato
*   **Request/Response:** JSON
*   **Paginação:** As listagens utilizam `offset` e `limit`.

---

## 2. Endpoints Principais (Mapeamento de Rotas)

### 2.1. Gestão de Clientes (Core)
*O cadastro do cliente é obrigatório antes de gerar cobranças.*
*   **Criar Cliente:** `POST /customers` (Campos: `name`, `cpfCnpj` obrigatórios)
*   **Listar Clientes:** `GET /customers` (Filtrar por `cpfCnpj` ou `email`)
*   **Atualizar Cliente:** `PUT /customers/{id}`
*   **Deletar Cliente:** `DELETE /customers/{id}`
*   **Notificações:** `GET /customers/{id}/notifications`

### 2.2. Cobranças (Payments)
*Gera cobranças via Boleto, Cartão de Crédito ou Pix "Cobrança".*
*   **Criar Cobrança:** `POST /payments`
    *   *Tipos (`billingType`):* `BOLETO`, `CREDIT_CARD`, `PIX`.
*   **Listar Cobranças:** `GET /payments`
*   **Status da Cobrança:** `GET /payments/{id}/status`
*   **Linha Digitável (Boleto):** `GET /payments/{id}/identificationField`
*   **QR Code (Pix da Cobrança):** `GET /payments/{id}/pixQrCode`
*   **Simular Vendas:** `POST /payments/simulate` (Calcula taxas líquidas)
*   **Confirmar em Dinheiro:** `POST /payments/{id}/receiveInCash`

### 2.3. Gestão de Assinaturas (Recorrência)
*   **Criar Assinatura:** `POST /subscriptions`
    *   *Ciclos (`cycle`):* `MONTHLY`, `WEEKLY`, `YEARLY`, etc.
*   **Listar Assinaturas:** `GET /subscriptions`
*   **Atualizar Assinatura:** `PUT /subscriptions/{id}`
*   **Listar Cobranças da Assinatura:** `GET /subscriptions/{id}/payments`

### 2.4. Parcelamentos (Installments)
*Usado para vendas parceladas onde o valor total é dividido.*
*   **Criar Parcelamento:** `POST /installments`
*   **Listar Parcelamentos:** `GET /installments`
*   **Gerar Carnê:** `GET /installments/{id}/booklet`

### 2.5. Links de Pagamento
*Páginas de checkout hospedadas pelo Asaas.*
*   **Criar Link:** `POST /paymentLinks`
*   **Adicionar Imagem:** `POST /paymentLinks/{id}/images`
*   **Atualizar Link:** `PUT /paymentLinks/{id}`

---

## 3. Pix (Funcionalidades Nativas)
*Diferente do "Pix de Cobrança", estes endpoints gerenciam chaves e transações diretas.*

### 3.1. Chaves e QR Codes
*   **Criar Chave Pix:** `POST /pix/addressKeys` (EVP, Email, CPF, Phone)
*   **Listar Chaves:** `GET /pix/addressKeys`
*   **Criar QR Code Estático:** `POST /pix/qrCodes/static` (Útil para PDV/Balcão)
*   **Decodificar QR Code:** `POST /pix/qrCodes/decode` (Ler QR Code de terceiros)

### 3.2. Transações e Recorrência Pix
*   **Pagar via Pix:** `POST /pix/transactions` (Enviar dinheiro)
*   **Pix Recorrente:** `GET /pix/recurrence`
*   **Pix Automático (Autorizações):** `POST /pix/automatic/authorizations`

---

## 4. Marketplace e Subcontas (White Label)
*Para dividir pagamentos e gerenciar contas de parceiros.*

### 4.1. Gestão de Contas
*   **Criar Subconta:** `POST /accounts`
*   **Listar Subcontas:** `GET /accounts`
*   **Dados da Conta:** `GET /myAccount/commercialInfo`
*   **Envio de Documentos:** `POST /myAccount/documents` (KYC)

### 4.2. Splits de Pagamento
*   **Configurar Split na Cobrança:** No `POST /payments`, enviar objeto `split`.
*   **Listar Splits Recebidos:** `GET /splits/received`
*   **Listar Splits Pagos:** `GET /splits/paid`

---

## 5. Gestão Financeira (Saídas e Saldo)
*   **Saldo:** `GET /finance/balance`
*   **Extrato:** `GET /financialTransactions`
*   **Transferências (TED/Pix):** `POST /transfers`
*   **Pagamento de Contas (Boletos):** `POST /bill`
    *   *Simular Pagamento:* `POST /bill/simulate`
*   **Recarga de Celular:** `POST /mobilePhoneRecharges`

---

## 6. Fiscal e Risco
*   **Notas Fiscais (NFS-e):**
    *   *Configurar:* `POST /invoices/municipal/configuration`
    *   *Emitir:* `POST /invoices`
    *   *Listar:* `GET /invoices`
*   **Negativação (Serasa):**
    *   *Negativar:* `POST /paymentDunnings`
    *   *Histórico:* `GET /paymentDunnings/history`
*   **Consulta de Crédito:** `POST /creditBureauReport`

---

## 7. Webhooks e Notificações
*Evite polling. Use Webhooks para atualizar status no sistema.*

*   **Criar Webhook:** `POST /webhooks`
*   **Listar Webhooks:** `GET /webhooks`
*   **Tipos de Evento:**
    *   `PAYMENT_CONFIRMED`: Pagamento recebido.
    *   `PAYMENT_OVERDUE`: Venceu e não foi pago.
    *   `PAYMENT_REFUNDED`: Estornado.

---

## 8. Utilitários de Sandbox (Apenas Testes)
*Use estes endpoints para simular cenários sem transação financeira real.*

*   **Aprovar Conta (Sandbox):** `POST /sandbox/accounts/approval`
*   **Confirmar Pagamento:** `POST /payments/{id}/receiveInCash` (Simula o sucesso)
*   **Forçar Vencimento:** `POST /sandbox/payments/{id}/overdue`