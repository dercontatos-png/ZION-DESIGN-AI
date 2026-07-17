const fs = require('fs');
let code = fs.readFileSync('src/components/ChatAssistente.tsx', 'utf8');

const regex = /if \(configJson\.cores && Object\.keys\(configJson\.cores\)\.length > 0\) \{/;

const insertCode = `
        if (typeof configJson.desativarSujeito === "boolean") updates.desativarSujeito = configJson.desativarSujeito;
        if (typeof configJson.noPeople === "boolean") updates.noPeople = configJson.noPeople;
        if (typeof configJson.useEnvRef === "boolean") updates.useEnvRef = configJson.useEnvRef;
        if (typeof configJson.useLogo === "boolean") updates.useLogo = configJson.useLogo;
        if (typeof configJson.coresAutomaticas === "boolean") updates.coresAutomaticas = configJson.coresAutomaticas;
        if (typeof configJson.useCorDominante === "boolean") updates.useCorDominante = configJson.useCorDominante;
        if (typeof configJson.enableTypography === "boolean") updates.enableTypography = configJson.enableTypography;
        if (typeof configJson.degradeLeitura === "boolean") updates.degradeLeitura = configJson.degradeLeitura;
        if (typeof configJson.enableBlur === "boolean") updates.enableBlur = configJson.enableBlur;
        if (typeof configJson.lateralGradient === "boolean") updates.lateralGradient = configJson.lateralGradient;
        
        if (configJson.floatingElementsMode) updates.floatingElementsMode = configJson.floatingElementsMode;
        if (configJson.gender) updates.gender = configJson.gender;
        if (configJson.poseDescription) updates.poseDescription = configJson.poseDescription;
        if (configJson.positioning) updates.positioning = configJson.positioning;

        `;

code = code.replace(regex, insertCode + `if (configJson.cores && Object.keys(configJson.cores).length > 0) {`);

fs.writeFileSync('src/components/ChatAssistente.tsx', code);
console.log("ChatAssistente JSON extraction patched!");
