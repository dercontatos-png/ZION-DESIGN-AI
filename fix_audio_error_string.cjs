const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    } catch (error: any) {
      console.error("Audio Generation Error:", error);
      let errorMessage = error.message || "Erro ao gerar áudio.";
      if (errorMessage.includes("Permission 'aiplatform.interactions.create' denied")) {
        errorMessage = "Erro de permissão no Google Cloud (403). A conta de serviço não possui a permissão 'aiplatform.interactions.create' no projeto ou a API não está habilitada para o Lyria. Certifique-se de que a API Agent Platform (Interactions) está ativada e a conta possui a role de Vertex AI User.";
      }
      res.status(500).json({ error: errorMessage });
    }`;

const newCode = `    } catch (error: any) {
      console.error("Audio Generation Error:", error);
      let errorMessage = error.message || "Erro ao gerar áudio.";
      const errorString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errorString.includes("aiplatform.interactions.create") && errorString.includes("denied")) {
        errorMessage = "Erro de permissão no Google Cloud (403). A conta de serviço não possui a permissão 'aiplatform.interactions.create' no projeto ou a API não está habilitada para o Lyria. Certifique-se de que a API Agent Platform (Interactions) está ativada e a conta possui a role de Vertex AI User.";
      } else if (errorString.includes("403")) {
        errorMessage = "Erro 403 (Permissão Negada). Verifique se as permissões e APIs necessárias estão ativadas no Google Cloud.";
      }
      res.status(500).json({ error: errorMessage });
    }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
