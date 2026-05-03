# Projeto 08 - Portfolio Pessoal

## 📋 Descrição

Projeto de portfolio pessoal com design moderno e responsivo. Apresenta projetos, habilidades, experiência profissional e informações de contato em uma aplicação web otimizada para SEO e performance.

## 🎯 Objetivos

- Criar portfolio pessoal profissional
- Implementar design responsivo e acessível
- Otimizar para SEO e performance
- Publicar online com domínio próprio
- Demonstrar habilidades técnicas
- Facilitar contato com oportunidades

## 💻 Tecnologias & Ferramentas

- **Frontend:** React 18+, TypeScript, Tailwind CSS
- **Build:** Vite
- **Hosting:** AWS Amplify ou Vercel
- **SEO:** Next.js meta tags ou React Helmet
- **Analytics:** Google Analytics
- **CMS:** Contentful ou Markdown (estático)
- **Email:** Formspree ou SendGrid

## 🏗️ Arquitetura

```
┌──────────────────────────────────┐
│    Portfolio Website             │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │  Header/Navigation         │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Hero Section              │  │
│  │  - Profile Image           │  │
│  │  - Bio/Intro               │  │
│  │  - CTA Buttons             │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Projects Section          │  │
│  │  - Project Cards           │  │
│  │  - Filters/Categories      │  │
│  │  - Links (Github, Demo)    │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Skills Section            │  │
│  │  - Skill Tags/Badges       │  │
│  │  - Proficiency Levels      │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Experience Timeline       │  │
│  │  - Jobs                    │  │
│  │  - Certifications          │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Contact Section           │  │
│  │  - Contact Form            │  │
│  │  - Social Links            │  │
│  │  - Email/Phone             │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │  Footer                    │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Git
- Conta AWS Amplify ou Vercel (para deploy)

### Estrutura do Projeto

```
portfolio/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Projects.tsx
│   │   ├── Skills.tsx
│   │   ├── Experience.tsx
│   │   ├── Contact.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   └── Contact.tsx
│   ├── data/
│   │   ├── projects.ts
│   │   ├── skills.ts
│   │   └── experience.ts
│   ├── styles/
│   │   ├── App.css
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── images/
│   ├── resume.pdf
│   └── favicon.ico
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── amplify.yml
```

### Instalação

#### 1. Criar Projeto

```bash
npm create vite@latest portfolio -- --template react
cd portfolio

npm install

# Adicionar Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 2. Estrutura de Componentes

**src/data/projects.ts:**
```typescript
export interface Project {
  id: string
  title: string
  description: string
  image: string
  technologies: string[]
  github?: string
  demo?: string
  featured: boolean
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Dominó Online',
    description: 'Aplicação multiplayer de dominó com WebSockets',
    image: '/images/domino.jpg',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    github: 'https://github.com/anderson/domino-online',
    demo: 'https://domino-online.example.com',
    featured: true
  },
  // ... mais projetos
]
```

**src/components/Projects.tsx:**
```typescript
import React from 'react'
import { projects } from '../data/projects'

export function Projects() {
  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Projetos Destacados
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {project.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Código →
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Demo →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

#### 3. Componente de Contato

**src/components/Contact.tsx:**
```typescript
import React, { useState } from 'react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Usar Formspree ou SendGrid
    const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    }
  }

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-4xl font-bold mb-12 text-center">
          Entre em Contato
        </h2>

        {submitted && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-6">
            Mensagem enviada com sucesso!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Nome
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Mensagem
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
          >
            Enviar
          </button>
        </form>
      </div>
    </section>
  )
}
```

#### 4. Deploy em AWS Amplify

**amplify.yml:**
```yaml
version: 1

frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*

appRoot: /
```

```bash
# Instalar Amplify CLI
npm install -g @aws-amplify/cli

# Inicializar projeto
amplify init

# Adicionar hosting
amplify add hosting

# Deploy
amplify publish
```

#### 5. Otimizações

**Lighthouse Score Improvements:**
```typescript
// 1. Lazy load images
import { lazy, Suspense } from 'react'

const ProjectCard = lazy(() => import('./ProjectCard'))

// 2. Add meta tags
import { Helmet } from 'react-helmet'

export function App() {
  return (
    <>
      <Helmet>
        <title>Anderson | Desenvolvedor Full Stack</title>
        <meta name="description" content="Portfolio de Anderson..." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      {/* ... */}
    </>
  )
}

// 3. Code splitting
const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
```

## 📚 Seções Recomendadas

- **Header:** Navegação simples e logo
- **Hero:** Impactante com CTA destacado
- **Sobre:** Breve sobre você
- **Projetos:** 3-5 projetos destacados
- **Skills:** Tecnologias e competências
- **Experiência:** Timeline de trabalho
- **Contato:** Formulário + social links
- **Footer:** Copyright e links rápidos

## 🎯 SEO Best Practices

```typescript
// Structured Data (JSON-LD)
<script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Anderson Carlos",
    "jobTitle": "Full Stack Developer",
    "email": "seu-email@example.com",
    "url": "https://seu-portfolio.com",
    "sameAs": [
      "https://github.com/anderson",
      "https://linkedin.com/in/anderson"
    ]
  }}
</script>

// Open Graph
<meta property="og:title" content="Anderson - Portfolio" />
<meta property="og:description" content="Portfólio profissional..." />
<meta property="og:image" content="https://seu-portfolio.com/og-image.jpg" />
```

## ✅ Checklist de Validação

- [ ] Design responsivo em mobile, tablet e desktop
- [ ] Todos os links funcionam
- [ ] Formulário de contato envia emails
- [ ] Performance otimizada (Lighthouse 90+)
- [ ] SEO bem configurado
- [ ] Acessibilidade validada
- [ ] Deploy em produção funcionando
- [ ] Domínio personalizado configurado
- [ ] HTTPS ativado
- [ ] Analytics configurado

## 👤 Autor

Anderson Carlos da Silva Morais - 2024011327

## 📝 Notas Importantes

- Atualizar portfolio regularmente
- Manter links e contatos atualizados
- Usar imagens de alta qualidade
- Considerar blog para SEO
- Monitorar analytics
- Responder mensagens de contato rapidamente
