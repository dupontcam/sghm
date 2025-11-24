/**
 * Utilitários para máscaras de formatação
 */

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export const maskCPF = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara
  return limited
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export const maskPhone = (value: string): string => {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limited = numbers.slice(0, 11);
  
  // Aplica a máscara dependendo da quantidade de dígitos
  if (limited.length <= 10) {
    // Formato: (00) 0000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // Formato: (00) 00000-0000
    return limited
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
};

/**
 * Remove a máscara e retorna apenas os números
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = unmask(cpf);
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) return false;
  
  return true;
};

/**
 * Valida telefone (mínimo 10 dígitos)
 */
export const validatePhone = (phone: string): boolean => {
  const numbers = unmask(phone);
  return numbers.length >= 10 && numbers.length <= 11;
};
