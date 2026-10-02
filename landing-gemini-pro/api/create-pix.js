export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, cpf } = req.body || {};

  const token = process.env.MERCADO_PAGO_TOKEN || 'APP_USR-3283164120038875-082803-df06c7e3e75ffa3bbfed15f09237411b-262565007';

  try {
    const cleanCpf = (cpf || '').replace(/\D/g, '');
    const names = (name || 'Cliente').trim().split(' ');
    const firstName = names[0] || 'Cliente';
    const lastName = names.slice(1).join(' ') || 'Google AI';

    const paymentData = {
      transaction_amount: 59.90, // Valor oficial de R$ 59,90
      description: 'Google Gemini Pro 18 Meses - Acesso Completo',
      payment_method_id: 'pix',
      payer: {
        email: email || 'cliente@gmail.com',
        first_name: firstName,
        last_name: lastName
      }
    };

    if (cleanCpf && cleanCpf.length === 11) {
      paymentData.payer.identification = {
        type: 'CPF',
        number: cleanCpf
      };
    }

    const idempotencyKey = 'pix-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(paymentData)
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Mercado Pago Error:', data);
      return res.status(mpResponse.status).json({ error: data.message || 'Erro ao gerar Pix', details: data });
    }

    const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;

    return res.status(200).json({
      paymentId: data.id,
      status: data.status,
      qrCode: qrCode,
      qrCodeBase64: qrCodeBase64,
      amount: data.transaction_amount
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erro interno ao processar pagamento', message: error.message });
  }
}
