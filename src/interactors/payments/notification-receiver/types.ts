export type PaymentNotificationReceiverInput = {
  pix: [{
    endToEndId: string,
    txid: string,
    chave: string,
    valor: string,
    horario: string,
    infoPagador?: string,
    gnExtras?: {
      tarifa: string,
      pagador: {
        nome: string,
        cpf?: string,
        cnpj?: string
      }
    },
    devolucoes?: Array<{
      id: string,
      rtrId: string,
      valor: string,
      status: string,
      horario: {
        solicitacao: string,
        liquidacao?: string
      }
    }>
  }]
}

export type PaymentNotificationReceiverOutput = void;

export type Payment = {
  endToEndId: string,
  txid: string,
  key: string,
  value: string,
  effectiveDate: string,
  payerInfo?: string,
  extras?: {
    fee: string,
    payerName: string,
    payerDocument: string,
    payerDocumentIsMasked: boolean
  },

  returns?: PaymentReturn[]
}

export type PaymentReturn = {
  id: string,
  rtrId: string,
  value: string,
  status: string,
  requestDate: string,
  effectiveDate?: string
}
