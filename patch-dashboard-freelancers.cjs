const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                  </div>
                </div>
              </div>
            </motion.div>
          )}`;

const newContent = `                  </div>
                </div>

                {/* Freelancers & Equipe Pendentes */}
                <div className="bg-[#070708] border border-white/5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] rounded-xl p-4 sm:p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Contas a Pagar: Equipe & Freelancers
                    </h3>
                    <button
                      onClick={() => openTransactionModal()}
                      className="text-[#c5a880] hover:text-[#c5a880] text-xs font-bold"
                    >
                      + Registrar Custo
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase text-zinc-500 font-bold">
                          <th className="pb-2 font-semibold">Profissional / Serviço</th>
                          <th className="pb-2 font-semibold">Cliente Vinculado</th>
                          <th className="pb-2 font-semibold">Data / Vencimento</th>
                          <th className="pb-2 font-semibold text-right">Valor</th>
                          <th className="pb-2 font-semibold text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {transactions
                          .filter((t) => t.type === "despesa" && t.category === "Freelancers" && t.status === "pendente")
                          .length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-xs text-zinc-500">
                                Nenhum pagamento pendente para freelancers.
                              </td>
                            </tr>
                          ) : (
                            transactions
                              .filter((t) => t.type === "despesa" && t.category === "Freelancers" && t.status === "pendente")
                              .map((t) => (
                                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors group">
                                  <td className="py-3 pr-4 text-xs font-semibold text-zinc-100">{t.description}</td>
                                  <td className="py-3 pr-4 text-xs text-zinc-400">
                                    {t.client ? (
                                      <span className="bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-[10px]">
                                        {t.client}
                                      </span>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="py-3 pr-4 text-xs text-zinc-400 font-mono">{t.date.split("-").reverse().join("/")}</td>
                                  <td className="py-3 pr-4 text-xs font-bold text-red-400 font-mono text-right">
                                    R$ {t.amount.toLocaleString("pt-BR")}
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => handleToggleTransactionStatus(t.id)}
                                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 px-2 py-1 rounded text-[10px] font-bold transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                    >
                                      Pagar Agora
                                    </button>
                                  </td>
                                </tr>
                              ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </motion.div>
          )}`;

if (code.includes(target)) {
  code = code.replace(target, newContent);
  fs.writeFileSync('src/App.tsx', code);
  console.log('App dashboard patched with Freelancers board');
} else {
  console.log('Target not found in App.tsx');
}
