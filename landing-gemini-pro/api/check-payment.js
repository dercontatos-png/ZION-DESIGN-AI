export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  const token = process.env.MERCADO_PAGO_TOKEN || 'APP_USR-3283164120038875-082803-df06c7e3e75ffa3bbfed15f09237411b-262565007';

  try {
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({ error: data.message || 'Erro ao consultar pagamento' });
    }

    return res.status(200).json({
      paymentId: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      isApproved: data.status === 'approved'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao consultar pagamento', message: error.message });
  }
}
