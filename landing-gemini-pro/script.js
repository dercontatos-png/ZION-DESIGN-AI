// Google Gemini Pro 18 Meses - Interações & Animações

document.addEventListener('DOMContentLoaded', () => {
  // 1. GERAR ESTRELAS DE FUNDO
  const starsContainer = document.getElementById('starsContainer');
  if (starsContainer) {
    const starCount = 45;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star-particle';
      const size = Math.random() * 2.5 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      starsContainer.appendChild(star);
    }
  }

  // 2. MODAL DE DEMO / PLAY BUTTON
  const openDemoBtn = document.getElementById('openDemoBtn');
  if (openDemoBtn) {
    openDemoBtn.addEventListener('click', () => {
      const ofertaSection = document.getElementById('oferta');
      if (ofertaSection) {
        ofertaSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 3. EFEITO TILT NOS CARDS AO PASSAR O MOUSE
  const cards = document.querySelectorAll('.product-feature-card, .pricing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
});
