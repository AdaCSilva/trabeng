-- Script SQL para EXCLUIR e RE-CRIAR o banco de dados do Conselho Tutelar

-- 1. Excluir o banco de dados se ele já existir
DROP DATABASE IF EXISTS conselhotutelar;

-- 2. Criar um novo banco de dados com a codificação correta (UTF-8 para suportar todos os caracteres)
CREATE DATABASE conselhotutelar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 3. Usar o banco de dados recém-criado
USE conselhotutelar;

-- 4. Tabela para armazenar informações de endereço
CREATE TABLE Endereco (
    id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9)
);

-- 5. Tabela Crianca
CREATE TABLE Crianca (
    id_crianca INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    sexo ENUM('M', 'F', 'Outro'),
    escolaridade VARCHAR(50), -- Pode ser o nome da escola ou nível de escolaridade
    id_endereco INT, -- Opcional, se a criança tiver um endereço próprio diferente dos responsáveis
    FOREIGN KEY (id_endereco) REFERENCES Endereco(id_endereco)
);

-- 6. Tabela de Usuários com todos os perfis incluídos no ENUM
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL, -- Lembre-se de usar hashing para senhas em produção (ex: bcrypt)!
    perfil ENUM('Conselheiro', 'Assistente Social', 'Psicólogo', 'Administrador', 'Secretario') NOT NULL
);

-- 7. Tabela Caso (Atendimento)
CREATE TABLE Caso (
    id_caso INT PRIMARY KEY AUTO_INCREMENT,
    data_abertura DATE NOT NULL,
    status VARCHAR(50), -- Ex: 'Em Andamento', 'Finalizado', 'Arquivado'
    descricao_ocorrencia TEXT,
    medidas_adotadas TEXT,
    id_crianca INT NOT NULL,
    data_hora_registro DATETIME DEFAULT CURRENT_TIMESTAMP, -- Data e hora do registro do atendimento no sistema
    codigo_atendimento VARCHAR(50), -- Código preenchido pela conselheira (Ex: CT-2025-001)
    id_conselheira_atendimento INT, -- FK para o usuário conselheiro que está atendendo
    numero_procedimento VARCHAR(15), -- Campo para armazenar o formato '0000/YY'
    FOREIGN KEY (id_crianca) REFERENCES Crianca(id_crianca),
    FOREIGN KEY (id_conselheira_atendimento) REFERENCES Usuario(id_usuario)
);

-- 8. Tabela Responsavel
CREATE TABLE Responsavel (
    id_responsavel INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    grau_parentesco VARCHAR(50), -- Ex: 'Pai', 'Mãe', 'Avô(a)', 'Tutor(a)'
    telefone VARCHAR(20),
    id_endereco INT, -- FK para a tabela Endereco (endereço do responsável)
    id_caso INT, -- Relaciona o responsável a um caso específico
    FOREIGN KEY (id_endereco) REFERENCES Endereco(id_endereco),
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso)
);

-- 9. Tabela Documento
CREATE TABLE Documento (
    id_documento INT PRIMARY KEY AUTO_INCREMENT,
    tipo_documento VARCHAR(50),
    caminho_arquivo VARCHAR(255) NOT NULL, -- Onde o arquivo digitalizado será armazenado/referenciado
    data_envio DATE,
    id_caso INT NOT NULL,
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso)
);

-- 10. Tabela Relatorio
CREATE TABLE Relatorio (
    id_relatorio INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(50), -- Ex: 'Estatístico Mensal', 'Casos por Bairro'
    data_geracao DATE NOT NULL,
    filtro_utilizado TEXT, -- JSON ou texto para armazenar os filtros usados
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- 11. Tabela Orgao_Externo
CREATE TABLE Orgao_Externo (
    id_orgao INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50), -- Ex: 'Escola', 'Hospital', 'Delegacia', 'Ministério Público'
    contato VARCHAR(100) -- Telefone, E-mail ou Nome de contato
);

-- 12. Tabela Compartilhamento
CREATE TABLE Compartilhamento (
    id_compartilhamento INT PRIMARY KEY AUTO_INCREMENT,
    data_envio DATE NOT NULL,
    descricao TEXT, -- Detalhes sobre o que foi compartilhado
    id_caso INT NOT NULL,
    id_orgao INT NOT NULL,
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso),
    FOREIGN KEY (id_orgao) REFERENCES Orgao_Externo(id_orgao)
);


INSERT INTO Usuario (nome, login, senha, perfil) VALUES
('Admin Teste', 'admin', 'admin123', 'Administrador'),
('Conselheiro Teste', 'conselheiro', 'conselho123', 'Conselheiro'),
('Secretario Teste', 'secretario', 'secretario123', 'Secretario');

