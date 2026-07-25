const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<td className="py-3 text-right">
                                    <button
                                      onClick={() => handleToggleTransactionStatus(t.id)}
                                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 px-2 py-1 rounded text-[10px] font-bold transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                    >
                                      Pagar Agora
                                    </button>
                                  </td>`;

const newCode = `<td className="py-3 text-right flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openTransactionModal(t)}
                                      className="text-zinc-500 hover:text-[#c5a880] p-1 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                      title="Editar"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleToggleTransactionStatus(t.id)}
                                      className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-zinc-950 px-2 py-1 rounded text-[10px] font-bold transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                                    >
                                      Pagar Agora
                                    </button>
                                  </td>`;

code = code.replace(target, newCode);
fs.writeFileSync('src/App.tsx', code);
console.log('Added Edit button to freelancer list');
