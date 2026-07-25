const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>`;

const newCode = `<button
                            onClick={() => openTransactionModal(t)}
                            className="text-zinc-600 hover:text-[#c5a880] transition-colors p-1"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>`;

code = code.replace(target, newCode);
fs.writeFileSync('src/App.tsx', code);
console.log('Added Edit button to recent transactions');
