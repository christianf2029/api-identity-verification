- Extrair a chave privada a partir do certificado .p12:

`openssl pkcs12 -in cert.p12 -nocerts -nodes > priv.pem`

- Extrair a chave pública a partir do certificado .p12:

`openssl pkcs12 -in cert.p12 -clcerts -nokeys > pub.pem`
