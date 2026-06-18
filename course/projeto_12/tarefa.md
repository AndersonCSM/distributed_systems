# Descrição da Atividade 
Você será responsável pelo monitoramento da temperatura de uma câmara fria de supermercado. No monitoramento, você precisará proteger os acessos às operações de leitura e escrita de dados. Sendo assim:

Etapas:

1. Use o simulador de ESP32 https://wokwi.com/projects/396539481159420929
    
    1.1. Já há marcações no código para inserir o método POST

2. Criar um banco de dados relacional RDS do tipo Aurora (compatível com PostgreSQL), ou RDS PostgreSQL, onde o sensor deverá enviar dados;
    
    2.1. Usar o nome do banco de dados seguindo o padrão SEUNOME
3. Fazer uma função Lambda que leia e escreva no banco de dados RDS;
    
    3.1. Enviar o print demonstrando a execução de uma escrita;
    
    3.2. Enviar o print demonstrando a execução de uma leitura;

4. Use o token de autorização com o valor “SEUNOME”. Utilize um cliente HTTP (por exemplo, curl ou PostMan) e teste rotas autorizadas e não autorizadas para o API Gateway do tipo HTTP com Lambda Authorizer:
    
    4.1. Enviar o print de uma rota autorizada com um token para envio de dados com o POST;
    
    4.2. Enviar o print de uma rota  POST, mas a rota com o token não autorizado (como realizado em sala de aula).
    
5. Desenvolva um front-end para testes. Abra o seu navegador, acesse o front-end no formato DNS frio-SEU-NOME.grupo?.sd.ufersa.dev.br, abra a aba de network (rede) na inspeção do seu navegador e:

    5.1. Enviar o print de uma rota autorizada com um token para envio de dados com o GET;
    
    5.2. Enviar o print de uma rota  GET, mas a rota com o token não autorizado (como realizado em sala de aula).
    
    5.3. Pode usar um front-end para mostrar os dados que estão vindo do sensor.
