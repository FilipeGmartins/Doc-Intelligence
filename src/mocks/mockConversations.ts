import type { IntakeConversation } from '../types/conversation'

export const mockConversations: IntakeConversation[] = [
  {
    id: 'intake-maria-demo',
    phone: '+55 84 99999-1020',
    displayName: 'Maria (novo contato)',
    status: 'collecting_data',
    currentStep: 'identifier',
    completion: 20,
    draft: { name: 'Maria Oliveira', identifier: '', email: '', address: '', documents: [] },
    messages: [
      { id: 'msg-maria-1', sender: 'customer', content: 'Olá, gostaria de iniciar meu cadastro.', createdAt: '2026-08-31T11:00:00.000Z' },
      { id: 'msg-maria-2', sender: 'bot', content: 'Olá! Eu sou o assistente virtual do escritório. Para começar, qual é seu nome completo?', createdAt: '2026-08-31T11:00:04.000Z' },
      { id: 'msg-maria-3', sender: 'customer', content: 'Maria Oliveira', createdAt: '2026-08-31T11:00:24.000Z' },
      { id: 'msg-maria-4', sender: 'bot', content: 'Obrigado, Maria Oliveira. Informe um CPF fictício para esta demonstração.', createdAt: '2026-08-31T11:00:27.000Z' },
    ],
    createdAt: '2026-08-31T11:00:00.000Z',
    updatedAt: '2026-08-31T11:00:27.000Z',
  },
  {
    id: 'intake-gabriel-review',
    phone: '+55 84 98888-2030',
    displayName: 'Gabriel Martins',
    status: 'awaiting_internal_review',
    currentStep: 'complete',
    completion: 100,
    draft: {
      name: 'Gabriel Martins',
      identifier: '32100000009',
      email: 'gabriel.martins@exemplo.test',
      address: 'Rua do Sol, 45 · Natal/RN',
      documents: ['identidade_gabriel_demo.pdf'],
    },
    messages: [
      { id: 'msg-gabriel-1', sender: 'bot', content: 'Recebi suas informações e o documento. Seu pré-cadastro aguarda validação interna.', createdAt: '2026-08-31T10:42:00.000Z' },
    ],
    createdAt: '2026-08-31T10:35:00.000Z',
    updatedAt: '2026-08-31T10:42:00.000Z',
  },
  {
    id: 'intake-luana-new',
    phone: '+55 84 97777-3040',
    displayName: 'Contato não identificado',
    status: 'new_contact',
    currentStep: 'name',
    completion: 0,
    draft: { name: '', identifier: '', email: '', address: '', documents: [] },
    messages: [
      { id: 'msg-luana-1', sender: 'customer', content: 'Oi, preciso enviar meus documentos.', createdAt: '2026-08-31T10:18:00.000Z' },
      { id: 'msg-luana-2', sender: 'bot', content: 'Olá! Eu sou o assistente virtual do escritório. Para começar, qual é seu nome completo?', createdAt: '2026-08-31T10:18:03.000Z' },
    ],
    createdAt: '2026-08-31T10:18:00.000Z',
    updatedAt: '2026-08-31T10:18:03.000Z',
  },
]
