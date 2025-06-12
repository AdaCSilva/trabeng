
CREATE DATABASE conselhotutelar;

CREATE TYPE sexo_enum AS ENUM('M', 'F', 'Outro');
CREATE TYPE perfil_enum AS ENUM('Conselheiro', 'Assistente Social', 'Psicólogo', 'Administrador', 'Secretario');
CREATE TYPE orgao_tipo_enum AS ENUM('Escola', 'Hospital', 'Delegacia', 'Ministério Público');

-- 5. Tabela para armazenar informações de endereço
CREATE TABLE Endereco (
    id_endereco SERIAL PRIMARY KEY, -- SERIAL para auto-incremento no PostgreSQL
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9)
);

-- 6. Tabela Crianca
CREATE TABLE Crianca (
    id_crianca SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    sexo sexo_enum, -- Usando o tipo ENUM criado
    escolaridade VARCHAR(50),
    id_endereco INT,
    FOREIGN KEY (id_endereco) REFERENCES Endereco(id_endereco)
);

-- 7. Tabela de Usuários
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil perfil_enum NOT NULL -- Usando o tipo ENUM criado
);

-- 8. Tabela Caso (Atendimento)
CREATE TABLE Caso (
    id_caso SERIAL PRIMARY KEY,
    data_abertura DATE NOT NULL,
    status VARCHAR(50),
    descricao_ocorrencia TEXT,
    medidas_adotadas TEXT,
    id_crianca INT NOT NULL,
    data_hora_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- TIMESTAMP para data e hora
    codigo_atendimento VARCHAR(50),
    id_conselheira_atendimento INT,
    numero_procedimento VARCHAR(15),
    FOREIGN KEY (id_crianca) REFERENCES Crianca(id_crianca),
    FOREIGN KEY (id_conselheira_atendimento) REFERENCES Usuario(id_usuario)
);

-- 9. Tabela Responsavel
CREATE TABLE Responsavel (
    id_responsavel SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    grau_parentesco VARCHAR(50),
    telefone VARCHAR(20),
    id_endereco INT,
    id_caso INT,
    FOREIGN KEY (id_endereco) REFERENCES Endereco(id_endereco),
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso)
);

-- 10. Tabela Documento
CREATE TABLE Documento (
    id_documento SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(50),
    caminho_arquivo VARCHAR(255) NOT NULL,
    data_envio DATE,
    id_caso INT NOT NULL,
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso)
);

-- 11. Tabela Relatorio
CREATE TABLE Relatorio (
    id_relatorio SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    data_geracao DATE NOT NULL,
    filtro_utilizado TEXT,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- 12. Tabela Orgao_Externo
CREATE TABLE Orgao_Externo (
    id_orgao SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo orgao_tipo_enum, -- Usando o tipo ENUM criado
    contato VARCHAR(100)
);

-- 13. Tabela Compartilhamento
CREATE TABLE Compartilhamento (
    id_compartilhamento SERIAL PRIMARY KEY,
    data_envio DATE NOT NULL,
    descricao TEXT,
    id_caso INT NOT NULL,
    id_orgao INT NOT NULL,
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso),
    FOREIGN KEY (id_orgao) REFERENCES Orgao_Externo(id_orgao)
);

-- 14. Inserção de usuários de teste (opcional)
INSERT INTO Usuario (nome, login, senha, perfil) VALUES
('Admin Teste', 'admin', '$2b$10$dDqmE4lsm7kbpPg2LzLgCe0QQ5GuVdDEKBAyTLA0BbICpK5228gU2', 'Administrador'),
('Conselheiro Teste', 'conselheiro', '$2b$10$z5kWLB3AdMfar6nuPAssge90Z3kEswG6tzDnuZ1.qf7pkY1YTcdnK', 'Conselheiro'),
('Secretario Teste', 'secretario', '$2b$10$erPEzgaPVSiQaa5POiamge9iQ8pFw6G1uTgQVcGEOrM8HKQ0y1hwq', 'Secretario'),
('Ana Conselheira', 'ana', '$2b$10$EMIZ.XSqfqjAN2JXsrMSA.mSS7UkfAFgQXEqa0xR14inpbNHlIef6', 'Conselheiro'),
('Bruno Assistente', 'bruno', '$2b$10$EMIZ.XSqfqjAN2JXsrMSA.mSS7UkfAFgQXEqa0xR14inpbNHlIef6', 'Assistente Social'),
('Carla Psicologa', 'carla', '$2b$10$EMIZ.XSqfqjAN2JXsrMSA.mSS7UkfAFgQXEqa0xR14inpbNHlIef6', 'Psicólogo');

-- Atualiza a senha do usuário 'admin'
UPDATE Usuario SET senha = '$2b$10$P.8Fj7j1Wr1jYmolRIU.DegCDv96bzxVrtA.q/P0HwrPXhem63bT.' WHERE login = 'admin';

-- Atualiza a senha do usuário 'conselheiro'
UPDATE Usuario SET senha = '$2b$10$z5kWLB3AdMfar6nuPAssge90Z3kEswG6tzDnuZ1.qf7pkY1YTcdnK' WHERE login = 'conselheiro';

-- Atualiza a senha do usuário 'secretario'
UPDATE Usuario SET senha = '$2b$10$erPEzgaPVSiQaa5POiamge9iQ8pFw6G1uTgQVcGEOrM8HKQ0y1hwq' WHERE login = 'secretario';

-- Atualiza a senha do usuário 'ana'
UPDATE Usuario SET senha = '$2b$10$EMIZ.XSqfqjAN2JXsrMSA.mSS7UkfAFgQXEqa0xR14inpbNHlIef6' WHERE login = 'ana';

-- Atualiza a senha do usuário 'bruno'
UPDATE Usuario SET senha = '$2b$10$EMIZ.XSqfqjAN2JXsrMSA.mSS7UkfAFgQXEqa0xR14inpbNHlIef6' WHERE login = 'bruno';

-- Atualiza a senha do usuário 'carla'
UPDATE Usuario SET senha = '$2b$10$EMIZ.XSqfqjAN2JXsrMSA.mSS7UkfAFgQXEqa0xR14inpbNHlIef6' WHERE login = 'carla';

SELECT login, senha FROM Usuario WHERE login = 'admin';