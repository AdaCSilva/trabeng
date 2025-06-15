CREATE DATABASE conselhotutelar;

-- CRIAÇÃO DOS TIPOS ENUMERADOS (ENUMS)
CREATE TYPE sexo_enum AS ENUM('M', 'F', 'Outro');
CREATE TYPE perfil_enum AS ENUM('Conselheiro', 'Assistente Social', 'Psicólogo', 'Administrador', 'Secretario');
CREATE TYPE orgao_tipo_enum AS ENUM('Escola', 'Hospital', 'Delegacia', 'Ministério Público');

-- Tabela para armazenar informações de endereço
CREATE TABLE Endereco (
    id_endereco SERIAL PRIMARY KEY,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9)
);

-- Tabela Crianca
CREATE TABLE Crianca (
    id_crianca SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    sexo sexo_enum,
    escolaridade VARCHAR(50),
    id_endereco INT,
    FOREIGN KEY (id_endereco) REFERENCES Endereco(id_endereco)
);

-- Tabela de Usuários
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil perfil_enum NOT NULL
);

-- Tabela Caso (Atendimento) -- MODIFICADA
CREATE TABLE Caso (
    id_caso SERIAL PRIMARY KEY,
    data_abertura DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Em andamento', -- VALOR PADRÃO ADICIONADO
    descricao_ocorrencia TEXT,
    medidas_adotadas TEXT,
    id_crianca INT NOT NULL,
    data_hora_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_finalizacao TIMESTAMP, -- COLUNA ADICIONADA
    codigo_atendimento VARCHAR(50),
    id_conselheira_atendimento INT,
    numero_procedimento VARCHAR(15),
    FOREIGN KEY (id_crianca) REFERENCES Crianca(id_crianca),
    FOREIGN KEY (id_conselheira_atendimento) REFERENCES Usuario(id_usuario)
);

-- Tabela Responsavel
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

-- Tabela Documento
CREATE TABLE Documento (
    id_documento SERIAL PRIMARY KEY,
    tipo_documento VARCHAR(50),
    caminho_arquivo VARCHAR(255) NOT NULL,
    data_envio DATE,
    id_caso INT NOT NULL,
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso)
);

-- Tabela Relatorio
CREATE TABLE Relatorio (
    id_relatorio SERIAL PRIMARY KEY,
    tipo VARCHAR(50),
    data_geracao DATE NOT NULL,
    filtro_utilizado TEXT,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- Tabela Orgao_Externo
CREATE TABLE Orgao_Externo (
    id_orgao SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo orgao_tipo_enum,
    contato VARCHAR(100)
);

-- Tabela Compartilhamento
CREATE TABLE Compartilhamento (
    id_compartilhamento SERIAL PRIMARY KEY,
    data_envio DATE NOT NULL,
    descricao TEXT,
    id_caso INT NOT NULL,
    id_orgao INT NOT NULL,
    FOREIGN KEY (id_caso) REFERENCES Caso(id_caso),
    FOREIGN KEY (id_orgao) REFERENCES Orgao_Externo(id_orgao)
); 
