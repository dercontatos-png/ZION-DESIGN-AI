const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    } catch (error) {
      console.error("Audio Generation Error:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar áudio." });
    }`;

const newCode = `    } catch (error: any) {
      console.error("Audio Generation Error:", error);
      let errorMessage = error.message || "Erro ao gerar áudio.";
      if (errorMessage.includes("Permission 'aiplatform.interactions.create' denied")) {
        errorMessage = "Erro de permissão no Google Cloud (403). A conta de serviço não possui a permissão 'aiplatform.interactions.create' no projeto ou a API não está habilitada para o Lyria. Certifique-se de que a API Agent Platform (Interactions) está ativada e a conta possui a role de Vertex AI User.";
      }
      res.status(500).json({ error: errorMessage });
    }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
