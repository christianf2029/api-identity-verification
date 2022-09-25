# API Identity Verification

Este projeto propõe uma API para facilitar a verificação de identidade de pessoas, utilizando o Pix.

_Em construção_

## Ajustes e Setup

_Em construção_

### Integração com a API Pix Gerencianet

- Extrair a chave privada a partir do certificado .p12:

`openssl pkcs12 -in cert.p12 -nocerts -nodes > priv.pem`

- Extrair a chave pública a partir do certificado .p12:

`openssl pkcs12 -in cert.p12 -clcerts -nokeys > pub.pem`
