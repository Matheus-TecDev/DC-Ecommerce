export interface DadosPessoais {
  nome: string;
  cpf: string;
  email: string;
  celular: string;
  senha: string;
}

export interface DadosEntrega {
  endereco: string;
  bairro: string;
  cidade: string;
  cep: string;
  complemento: string;
}

export interface CampoFormulario<T> {
  chave: keyof T;
  titulo: string;
  placeholder: string;
  tipo?: 'text' | 'password' | 'email';
}
