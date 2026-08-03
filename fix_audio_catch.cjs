const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `    } catch (error: any) {
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

const newCode = `    } catch (error: any) {
      console.error("Audio Generation Error:", error);
      let errorMessage = error.message || "Erro ao gerar áudio.";
      const errorString = String(error) + " " + JSON.stringify(error, Object.getOwnPropertyNames(error));
      if (errorString.includes("aiplatform.interactions.create") && errorString.includes("denied")) {
        errorMessage = "Erro de permissão no Google Cloud (403). A conta de serviço não possui a permissão 'aiplatform.interactions.create' no projeto ou a API não está habilitada para o Lyria. Certifique-se de que a API Agent Platform (Interactions) está ativada e a conta possui a role de Vertex AI User.";
      } else if (errorString.includes("403")) {
        errorMessage = "Erro 403 (Permissão Negada). Verifique se as permissões e APIs necessárias estão ativadas no Google Cloud.";
      } else if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "Cota excedida (429). O modelo Lyria (Music) não possui cota no plano gratuito do Google AI Studio. Você precisa inserir uma API Key de um projeto com faturamento ativo nas configurações.";
      }
      res.status(500).json({ error: errorMessage });
    }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
