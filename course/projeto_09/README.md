# 🌹 Feliz Dia das Mães — Landing Page Comemorativa

Site landing page em formato de slideshow de fotos para comemoração do Dia das Mães, com animações de corações, pétalas flutuantes, player de música e design premium.

---

## 📋 Etapas de Desenvolvimento

### Etapa 1 — Planejamento e Design
- [x] Definição da paleta de cores (tons de vermelho)
- [x] Escolha da stack: HTML5 + CSS3 + JavaScript puro
- [x] Seleção de fontes: Playfair Display + Lato (Google Fonts)
- [x] Definição da estrutura de arquivos
- [x] Criação das mensagens carinhosas para cada slide

### Etapa 2 — Estrutura HTML (SEO)
- [x] Estrutura semântica com `<header>`, `<main>`, `<article>`, `<nav>`
- [x] Meta tags completas: title, description, Open Graph, Twitter Cards
- [x] Structured Data (JSON-LD) para indexação
- [x] Favicon SVG inline (emoji de rosa)
- [x] Atributos de acessibilidade (aria-label, roles, alt texts)
- [x] `robots.txt` e `sitemap.xml`

### Etapa 3 — Design System (CSS)
- [x] Design tokens com CSS Custom Properties
- [x] Glassmorphism nos cards de mensagens com shimmer dourado
- [x] Transições suaves de fade + scale nos slides
- [x] Imagens centralizadas com sombras premium e bordas arredondadas
- [x] Animação de corações flutuantes (`@keyframes floatHeart`)
- [x] Pétalas flutuantes ambientais (`@keyframes floatPetal`)
- [x] Orbs de brilho ambiente para profundidade visual
- [x] Player de música com efeito pulse, ring expand e equalizer
- [x] Barra de progresso animada com gradiente
- [x] Responsividade: Mobile-first com breakpoints 480px / 768px / landscape
- [x] Suporte a `prefers-reduced-motion`
- [x] Otimização para dispositivos touch

### Etapa 4 — Lógica JavaScript
- [x] **Slideshow**: Auto-play (6s), navegação por setas, dots e teclado
- [x] **Touch/Swipe**: Suporte a gestos no mobile
- [x] **Corações**: 18 corações animados por transição + burst inicial de boas-vindas
- [x] **Pétalas**: 8 pétalas flutuantes ambientais com respeito a prefers-reduced-motion
- [x] **Player**: Play/Mute com feedback visual (equalizer + pulse + ring)
- [x] **Loading screen**: Aguarda carregamento com animação de dots

### Etapa 5 — Conteúdo
- [x] 4 imagens temáticas do Dia das Mães
- [ ] Substituir por fotos pessoais (opcional)
- [ ] Inserir link da música (arquivo MP3 local ou URL)

### Etapa 6 — Deploy (AWS Amplify)
- [ ] Push para repositório Git
- [ ] Conectar repositório ao AWS Amplify
- [ ] Configurar domínio personalizado (opcional)
- [ ] Atualizar URL canônica no `index.html`, `robots.txt` e `sitemap.xml`
- [ ] Solicitar indexação no Google Search Console

---

## 🗂️ Estrutura do Projeto

```
projeto09/
├── index.html              # Página principal
├── css/
│   └── style.css           # Design system completo
├── js/
│   ├── slideshow.js        # Slideshow + corações + pétalas
│   └── player.js           # Player de música
├── assets/
│   ├── images/             # 4 imagens dos slides
│   │   ├── slide-1.jpg
│   │   ├── slide-2.jpg
│   │   ├── slide-3.jpg
│   │   └── slide-4.jpg
│   └── audio/              # Música (a ser adicionada)
│       └── link.txt        # Link de referência
├── robots.txt              # SEO
├── sitemap.xml             # SEO
└── README.md               # Este arquivo
```

---

## 🎨 Paleta de Cores

| Cor               | Hex       | Uso                     |
|-------------------|-----------|-------------------------|
| Vermelho escuro   | `#B71C1C` | Botões, destaques       |
| Vermelho médio    | `#E53935` | Hover, bordas           |
| Rosa claro        | `#FFCDD2` | Fundos suaves           |
| Vermelho vibrante | `#FF1744` | Corações, CTAs          |
| Fundo escuro      | `#1A0000` | Background principal    |
| Texto claro       | `#FFF5F5` | Textos                  |
| Dourado           | `#FFD700` | Títulos especiais       |

---

## 🔧 Como Personalizar

### Trocar as fotos
Substitua os arquivos em `assets/images/`:
- `slide-1.jpg`
- `slide-2.jpg`
- `slide-3.jpg`
- `slide-4.jpg`

### Adicionar a música
1. Abra `js/player.js`
2. Na linha com `const MUSIC_URL = '';`
3. Insira o caminho ou URL: `const MUSIC_URL = 'assets/audio/musica.mp3';`

### Alterar mensagens
Edite o array `MESSAGES` em `js/slideshow.js`.

---

## 🚀 Deploy no AWS Amplify

1. Faça push do projeto para o GitHub
2. No console do AWS Amplify, clique em **"Host web app"**
3. Conecte o repositório GitHub
4. O Amplify detecta automaticamente o projeto estático
5. Após deploy, atualize as URLs canônicas:
   - `index.html`: tag `<link rel="canonical">`
   - `robots.txt`: campo `Sitemap`
   - `sitemap.xml`: campo `<loc>`

---

## 📱 Responsividade

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (480px - 768px)
- ✅ Mobile pequeno (< 480px)
- ✅ Landscape mobile
- ✅ Suporte a touch/swipe

---

## 🔍 SEO Implementado

- Meta tags (title, description, keywords)
- Open Graph (Facebook, WhatsApp)
- Twitter Cards
- Structured Data (JSON-LD)
- Sitemap XML
- robots.txt
- HTML semântico
- Alt texts nas imagens
- Favicon
- URL canônica
