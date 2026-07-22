// Máscaras leves de formatação (sem dependências externas), usadas nos formulários.

// Telefone celular: (DD) 9XXXX-XXXX. Aceita só dígitos e formata progressivamente.
export function formatTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// CPF: XXX.XXX.XXX-XX. Aceita só dígitos e formata progressivamente.
export function formatCpf(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// Validação simples de e-mail: tem algo antes do @, um @, domínio e um ponto no domínio.
export function isEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
