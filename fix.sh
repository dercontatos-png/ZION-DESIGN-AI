sed -i 's/       .resize/      pipeline = pipeline.resize/g' server.ts
sed -i '/\/\/ Apply denoising/d' server.ts
