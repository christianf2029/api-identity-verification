export type PaymentReceiverInput = {
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

export type Payment = {
  endToEndId: string,
  txid: string,
  key: string,
  value: string,
  effectiveDate: string,
  payerInfo?: string,
  extras: {
    fee?: string,
    payerName?: string,
    payerDocument?: string
  },

  devolutions?: Devolution[]
}

export type Devolution = {
  id: string,
  rtrId: string,
  value: string,
  status: string,
  requestDate: string,
  effectiveDate?: string
}
