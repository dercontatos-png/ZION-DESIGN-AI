export async function safeJsonResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  let parsed: any = null;

  try {
    if (text && text.trim()) {
      parsed = JSON.parse(text);
    }
  } catch (err) {
    // Retorno de HTML ou texto bruto do servidor
    if (!res.ok) {
      throw new Error(`Erro no servidor (${res.status} ${res.statusText}). O servidor não retornou JSON válido.`);
    }
    throw new Error(`Resposta inválida do servidor: Esperava-se JSON, mas recebeu texto/HTML: ${text.slice(0, 100)}...`);
  }

  if (!res.ok) {
    const errorMsg = parsed && typeof parsed === 'object' && parsed.error ? parsed.error : `Erro na requisição (Status ${res.status})`;
    throw new Error(errorMsg);
  }

  return parsed as T;
}
