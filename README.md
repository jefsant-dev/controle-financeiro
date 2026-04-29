# Controle Financeiro Doméstico

Um sistema de controle financeiro doméstico com front-end em HTML/CSS/JS e back-end em PHP puro, utilizando MySQL como banco de dados.

## Estrutura do Projeto

- `frontend/`: Arquivos do front-end (HTML, CSS, JS)
- `backend/`: Arquivos do back-end (PHP)
- `database/`: Scripts SQL para o banco de dados

## Configuração

1. Clone o repositório.
2. Configure as credenciais do banco em `backend/.env`.
3. Se estiver criando uma base nova, execute `database/schema.sql`.
4. Se estiver atualizando uma base antiga, aplique também as migrations em `database/` na ordem em que foram criadas.
5. Sirva a raiz do projeto em um servidor local com PHP e abra `index.html`.

## Funcionalidades

- Adicionar e editar receitas e despesas
- Categorias, fontes de receita e tipos de despesa
- Status de pagamento, duplicação de transações e filtros
- Recorrência, projeção de fluxo de caixa e orçamento por categoria
- Notas, etiquetas e exportação CSV

## Próximos Passos

- Relatórios mais completos
- Gráficos interativos
- Autenticação de usuários
