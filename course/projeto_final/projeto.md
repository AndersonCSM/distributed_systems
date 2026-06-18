# Sistema de Achados e Perdidos do Campus

## Tarefa:

- Arquitetura de três camadas (apresentação, negócios e dados);
- Comunicação entre componentes utilizando APIs (estilo baseado em recursos);
- Configuração do DNS para acesso à aplicação via SEUNOME.grupo?.sd.ufersa.dev.br e à API via api.SEUNOME.grupo?.sd.ufersa.dev.br;
- Acesso via aplicativo móvel (para Android);
- Autenticação de usuário e autorização de chamadas à API.

## descrição:

Um aplicativo simples onde alunos podem reportar itens que encontraram ou procurar itens que perderam.

- Apresentação (Android) - Aplicativo Web Progressivo (PWA) : Tela de Login, Tela de Lista de Itens (Feed) e Tela para Cadastrar um Item.
- Dados: Tabela usuarios e tabela itens (id, foto, nome, descricao, local_encontrado, status).

Negócios (API REST):
- POST /auth/login (Autenticação)
- GET /itens (Aberto para usuários autenticados)
- POST /itens (Autorização: qualquer usuário logado pode postar)
- PUT /itens/{id} (Autorização: apenas o usuário que postou ou usuário adm pode marcar como "Devolvido").

##  requisitos técnicos:

- Utilizar funcionalidade da AWS para construção do projeto
- Autenticação e Autorização: Use JWT (JSON Web Tokens). O usuário faz login, a API devolve o token, e o app Android manda esse token no cabeçalho (Authorization: Bearer <token>) em todas as outras requisições.
- DNS: Você vai apontar o api.SEUNOME.grupoX.sd.ufersa.dev.br para o IP público da sua máquina virtual (EC2 ou similar) onde o backend está rodando, e o SEUNOME.grupoX... pode apontar para uma página web simples (caso precise da camada de apresentação web) ou apenas servir como base.
- Mobile: O app Android pode ser feito rapidamente usando Aplicativo Web Progressivo (PWA).